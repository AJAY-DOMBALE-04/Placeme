# backend/resume_analyzer.py
import fitz  # PyMuPDF
import re
from fpdf import FPDF
import pandas as pd

def extract_text_and_styles(file_stream):
    doc = fitz.open(stream=file_stream.read(), filetype="pdf")
    text = ""
    fonts = []
    font_issues = []
    words = []

    for page in doc:
        blocks = page.get_text("dict")["blocks"]
        for b in blocks:
            if "lines" in b:
                for l in b["lines"]:
                    for s in l["spans"]:
                        content = s["text"].strip()
                        if content:
                            text += content + " "
                            fonts.append(s["font"])
                            words.append({
                                "text": content,
                                "size": s["size"],
                                "font": s["font"],
                                "flags": s["flags"]
                            })
    doc.close()
    return text.strip(), list(set(fonts)), words

def analyze_resume(file_stream):
    text, font_styles, word_info = extract_text_and_styles(file_stream)

    score = 100
    summary = f"The resume contains {len(text.split())} words."
    suggestions = []
    good_points = []

    # SECTION CHECKS
    required_sections = ["education", "experience", "skills", "projects"]
    present_sections = [s for s in required_sections if s in text.lower()]

    for section in present_sections:
        good_points.append(f"{section.capitalize()} section is included.")

    missing_sections = [s for s in required_sections if s not in present_sections]
    for ms in missing_sections:
        suggestions.append(f"Missing important section: {ms.capitalize()}.")

    # FONT SUGGESTIONS
    font_names = set([w['font'] for w in word_info])
    if len(font_names) > 2:
        suggestions.append("Too many font styles used. Use a consistent font (1–2 max).")
        score -= 5

    # FONT SIZE VALIDATION
    for w in word_info:
        if w['size'] < 9:
            suggestions.append(f"Text '{w['text']}' font size too small. Use at least 10pt.")
            score -= 1
        elif w['size'] > 15:
            suggestions.append(f"Text '{w['text']}' font size too large. Keep headings below 15pt.")
            score -= 1

    # CAPITALIZATION
    for word in word_info:
        if word['text'].isupper() and len(word['text']) > 5:
            suggestions.append(f"Text '{word['text']}' is all uppercase — avoid excessive capitalization.")

    # CONTENT LENGTH
    if len(text.split()) < 250:
        suggestions.append("Resume seems short — consider adding more content.")
        score -= 5

    # GOOD POINTS
    if "project" in text.lower():
        good_points.append("Includes project section.")
    if "internship" in text.lower() or "experience" in text.lower():
        good_points.append("Work experience is listed.")
    if "summary" in text.lower() or "objective" in text.lower():
        good_points.append("Professional summary included.")

    details = [
        f"Font styles used: {', '.join(font_names)}",
        f"Sections found: {', '.join(present_sections)}"
    ]

    # Deduplicate suggestions
    suggestions = list(set(suggestions))

    return {
        "score": max(score, 0),
        "summary": summary,
        "details": details,
        "good_points": good_points,
        "suggestions": suggestions
    }

def export_analysis_to_pdf(data):
    pdf = FPDF()
    pdf.add_page()
    pdf.set_font("Arial", size=12)

    pdf.cell(0, 10, "Resume Analysis Report", ln=True, align="C")
    pdf.ln(10)
    pdf.cell(0, 10, f"Score: {data['score']}/100", ln=True)
    pdf.multi_cell(0, 10, f"Summary: {data['summary']}")
    pdf.ln(5)

    pdf.set_font("Arial", style='B', size=12)
    pdf.cell(0, 10, "Good Points", ln=True)
    pdf.set_font("Arial", size=12)
    for point in data['good_points']:
        pdf.cell(0, 10, f"- {point}", ln=True)

    pdf.ln(5)
    pdf.set_font("Arial", style='B', size=12)
    pdf.cell(0, 10, "Suggestions", ln=True)
    pdf.set_font("Arial", size=12)
    for s in data['suggestions']:
        pdf.multi_cell(0, 10, f"- {s}")

    return pdf.output(dest='S').encode('latin-1')

def export_analysis_to_excel(data):
    df = pd.DataFrame({
        "Good Points": data['good_points'] + [''] * (max(len(data['suggestions']), 1) - len(data['good_points'])),
        "Suggestions": data['suggestions'] + [''] * (max(len(data['good_points']), 1) - len(data['suggestions']))
    })
    from io import BytesIO
    output = BytesIO()
    df.to_excel(output, index=False)
    return output.getvalue()
