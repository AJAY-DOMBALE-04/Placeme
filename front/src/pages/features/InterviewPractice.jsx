// front/src/pages/features/InterviewPractice.jsx
import React, { useState, useRef } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { jsPDF } from "jspdf"; // optional, if installed

export default function InterviewPractice() {
  const [mode, setMode] = useState("record");
  const [recording, setRecording] = useState(false);
  const [mediaBlobUrl, setMediaBlobUrl] = useState(null);
  const [file, setFile] = useState(null);
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);
  const streamRef = useRef(null);

  // Start recording
  const startRecording = async () => {
    setAnalysis(null);
    setMediaBlobUrl(null);
    setRecording(true);
    chunksRef.current = [];

    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        alert("Your browser does not support recording.");
        return;
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        audio: { echoCancellation: true, noiseSuppression: true },
        video: true
      });

      streamRef.current = stream;

      const mr = new MediaRecorder(stream, {
        mimeType: "video/webm;codecs=vp8,opus"
      });

      mr.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) chunksRef.current.push(e.data);
      };

      mr.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: "video/webm" });
        const url = URL.createObjectURL(blob);
        setMediaBlobUrl(url);
        setFile(new File([blob], "recording.webm", { type: "video/webm" }));
        stream.getTracks().forEach(track => track.stop());
      };

      mr.start();
      mediaRecorderRef.current = mr;
    } catch (err) {
      console.error(err);
      alert("Error starting recording. Please allow microphone and camera access.");
      setRecording(false);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current = null;
    }
    setRecording(false);
  };

  const handleUploadFile = (e) => {
    setAnalysis(null);
    setMediaBlobUrl(null);
    const f = e.target.files[0];
    setFile(f);
  };

  const submitFile = async () => {
    if (!file) {
      alert("Please record or choose a file first.");
      return;
    }
    setLoading(true);
    setAnalysis(null);
    const fd = new FormData();
    fd.append("file", file);

    try {
      const res = await fetch("http://localhost:5000/api/interview/analyze", {
        method: "POST",
        body: fd
      });
      const json = await res.json();
      if (json.status === "ok") {
        setAnalysis(json.analysis);
      } else {
        alert("Server error: " + (json.message || "unknown"));
      }
    } catch (e) {
      alert("Upload error: " + String(e));
    } finally {
      setLoading(false);
    }
  };

  const downloadPDF = () => {
    if (!analysis) return;
    try {
      const doc = new jsPDF();
      doc.setFontSize(14);
      doc.text("Interview Analysis Report", 14, 20);
      doc.setFontSize(11);
      doc.text(`Transcript (first 800 chars):`, 14, 34);
      let txt = analysis.transcript || "";
      if (txt.length > 800) txt = txt.slice(0, 800) + "...";
      doc.text(txt, 14, 42, { maxWidth: 180 });
      doc.text(`\n\nWPM: ${analysis.wpm}   Duration: ${analysis.duration_sec}s   Fluency: ${analysis.fluency_score}`, 14, 130);
      doc.save("interview_analysis.pdf");
    } catch (e) {
      console.warn("PDF error", e);
      alert("PDF export requires jspdf installed.");
    }
  };

  return (
    <div className="container py-5">
      <h2 className="mb-4">🎙️ Interview Practice</h2>

      <div className="card p-3 mb-4">
        <div className="d-flex gap-2 mb-3">
          <button className={`btn ${mode === "record" ? "btn-primary" : "btn-outline-primary"}`} onClick={() => setMode("record")}>Record</button>
          <button className={`btn ${mode === "upload" ? "btn-primary" : "btn-outline-primary"}`} onClick={() => setMode("upload")}>Upload</button>
        </div>

        {mode === "record" && (
          <div>
            <p>Record your answer/introduction. Allow camera/mic when prompted.</p>
            <div className="mb-3">
              {!recording ? (
                <button className="btn btn-success me-2" onClick={startRecording}>Start Recording</button>
              ) : (
                <button className="btn btn-danger me-2" onClick={stopRecording}>Stop Recording</button>
              )}
              <button className="btn btn-secondary" onClick={() => { setFile(null); setMediaBlobUrl(null); }}>Clear</button>
            </div>

            {mediaBlobUrl && (
              <div className="mb-3">
                <video src={mediaBlobUrl} controls style={{ maxWidth: "100%" }} />
                <div className="mt-2">
                  <button className="btn btn-primary" onClick={submitFile} disabled={loading}>{loading ? "Analyzing..." : "Analyze Recording"}</button>
                </div>
              </div>
            )}
          </div>
        )}

        {mode === "upload" && (
          <div>
            <p>Upload a pre-recorded interview/video or audio (mp4 / webm / wav / mp3).</p>
            <input type="file" accept="video/*,audio/*" onChange={handleUploadFile} className="form-control mb-2" />
            <div>
              <button className="btn btn-primary" onClick={submitFile} disabled={loading || !file}>{loading ? "Analyzing..." : "Analyze Upload"}</button>
            </div>
            {file && <div className="mt-2"><strong>Selected:</strong> {file.name}</div>}
          </div>
        )}
      </div>

      {analysis && (
        <div className="card p-4">
          <div className="d-flex justify-content-between">
            <h4>Analysis Summary</h4>
            <div>
              <button className="btn btn-outline-secondary me-2" onClick={downloadPDF}>Download PDF</button>
            </div>
          </div>

          <div className="mt-3">
            <strong>Fluency Score:</strong> <span className="badge bg-success">{analysis.fluency_score}</span>
            <div><strong>WPM:</strong> {analysis.wpm} &nbsp; <strong>Duration:</strong> {analysis.duration_sec}s</div>
            <div><strong>Avg pause (s):</strong> {analysis.avg_pause_sec ?? "N/A"}</div>
          </div>

          <hr />

          <h5>Transcript</h5>
          <div className="p-3 border rounded" style={{ whiteSpace: "pre-wrap" }}>{analysis.transcript}</div>

          <hr />
          <h5>Grammar & Corrections</h5>
          {analysis.grammar_matches && analysis.grammar_matches.length ? (
            <ul>
              {analysis.grammar_matches.map((g, i) => (
                <li key={i}>
                  <strong>{g.message}</strong>
                  <div style={{ fontSize: 13, color: "#555" }}>{g.snippet}</div>
                  {g.replacements && g.replacements.length ? (
                    <div style={{ fontSize: 13, color: "#0066cc" }}>Suggestion: {g.replacements.slice(0,3).join(", ")}</div>
                  ) : null}
                </li>
              ))}
            </ul>
          ) : <div>No grammar issues detected (or grammar tool not available).</div>}

          <hr />
          <h5>Filler Words</h5>
          <div>
            <strong>Total fillers:</strong> {analysis.filler_counts?.total ?? 0}
            <div>
              {Object.entries(analysis.filler_counts ?? {})
                .filter(([k,v]) => k !== "total" && v>0)
                .map(([k,v]) => <span key={k} className="badge bg-warning me-1">{k}: {v}</span>)}
            </div>
          </div>

          <hr />
          <h5>Quick Suggestions</h5>
          <ul>
            {analysis.synonym_suggestions && analysis.synonym_suggestions.length ? analysis.synonym_suggestions.map((s,i)=> <li key={i}>{s}</li>) : <li>No vocabulary suggestions.</li>}
            <li>Try to reduce filler words and aim for WPM around 110-140 for clear speech.</li>
            <li>Shorten long sentences and prefer active voice. Practice the suggested replacements above.</li>
          </ul>
        </div>
      )}
    </div>
  );
}
