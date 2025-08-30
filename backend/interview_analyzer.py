# backend/interview_analyzer.py
import os
import subprocess
import tempfile
import uuid
import ffmpeg
import language_tool_python
from faster_whisper import WhisperModel

UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

# Load grammar checker
tool = language_tool_python.LanguageTool('en-US')

# ---- Whisper model config ----
# Read model name from environment variable, default to "tiny" for faster transcription
whisper_model_name = os.getenv("WHISPER_MODEL", "tiny")

# Auto-detect GPU
device = "cuda" if os.getenv("USE_CUDA", "false").lower() == "true" else "cpu"

# Load Whisper model
print(f"Loading Whisper model: {whisper_model_name} on {device}")
model = WhisperModel(whisper_model_name, device=device, compute_type="int8")

# --- Helper to save uploaded file ---
def save_upload(file_storage):
    """Save the uploaded file to disk and return path."""
    ext = os.path.splitext(file_storage.filename)[1]
    if not ext:
        ext = ".webm"
    file_id = str(uuid.uuid4()) + ext
    file_path = os.path.join(UPLOAD_DIR, file_id)
    file_storage.save(file_path)
    return file_path

# --- Extract audio from video ---
def extract_audio(video_path):
    """Extract audio track from video using ffmpeg."""
    audio_path = os.path.splitext(video_path)[0] + ".wav"
    try:
        (
            ffmpeg
            .input(video_path)
            .output(audio_path, ac=1, ar=16000)
            .overwrite_output()
            .run(quiet=True)
        )
        return audio_path
    except ffmpeg.Error as e:
        raise RuntimeError(f"ffmpeg failed extracting audio: {e.stderr.decode()}")

# --- Analyze uploaded file ---
def analyze_file(file_path):
    """Perform speech-to-text, filler detection, grammar check, and scoring."""
    # 1. Extract audio
    audio_path = extract_audio(file_path)

    # 2. Transcribe using Whisper
    segments, info = model.transcribe(audio_path)
    transcript_text = " ".join([seg.text.strip() for seg in segments]).strip()

    # 3. Calculate WPM & duration
    word_count = len(transcript_text.split())
    duration_sec = info.duration
    wpm = round((word_count / duration_sec) * 60) if duration_sec > 0 else 0

    # 4. Avg pause length
    pauses = []
    last_end = 0
    for seg in segments:
        pause = seg.start - last_end
        if pause > 0.3:
            pauses.append(pause)
        last_end = seg.end
    avg_pause_sec = round(sum(pauses) / len(pauses), 2) if pauses else 0

    # 5. Detect filler words
    filler_words = ["um", "uh", "like", "you know", "actually", "basically"]
    filler_counts = {fw: transcript_text.lower().split().count(fw) for fw in filler_words}
    filler_counts["total"] = sum(filler_counts.values())

    # 6. Grammar check
    matches = tool.check(transcript_text)
    grammar_matches = []
    for m in matches:
        grammar_matches.append({
            "message": m.message,
            "snippet": m.context,
            "replacements": m.replacements
        })

    # 7. Simple fluency scoring
    fluency_score = 100
    fluency_score -= filler_counts["total"] * 2
    fluency_score -= len(matches) * 1.5
    if wpm < 90 or wpm > 160:
        fluency_score -= 5
    fluency_score = max(0, min(100, round(fluency_score)))

    # 8. Suggest synonyms for repeated words
    synonym_suggestions = []
    words = transcript_text.lower().split()
    for word in set(words):
        if words.count(word) > 5 and word.isalpha() and len(word) > 3:
            synonym_suggestions.append(f"Consider replacing '{word}' with alternatives.")

    # 9. Return analysis result
    return {
        "fluency_score": fluency_score,
        "wpm": wpm,
        "duration_sec": round(duration_sec, 2),
        "avg_pause_sec": avg_pause_sec,
        "transcript": transcript_text,
        "grammar_matches": grammar_matches,
        "filler_counts": filler_counts,
        "synonym_suggestions": synonym_suggestions
    }
