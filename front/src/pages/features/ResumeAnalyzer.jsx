// src/pages/features/ResumeAnalyzer.jsx

import React, { useState } from 'react';
import axios from 'axios';
import { FaFileAlt, FaSearch, FaCheckCircle, FaFilePdf, FaFileExcel } from 'react-icons/fa';

const ResumeAnalyzer = () => {
  const [file, setFile] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
    setError('');
    setResult(null);
  };

  const handleAnalyze = async () => {
    if (!file) {
      setError("Please select a PDF file.");
      return;
    }

    setLoading(true);
    setError('');
    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await axios.post("http://localhost:5000/api/analyze-resume", formData);
      setResult(response.data);
    } catch (err) {
      setError("Failed to analyze resume.");
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async (type) => {
    const endpoint = type === 'pdf' ? 'export-pdf' : 'export-excel';
    try {
      const response = await axios.post(`http://localhost:5000/api/${endpoint}`, result, {
        responseType: 'blob'
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `analysis.${type === 'pdf' ? 'pdf' : 'xlsx'}`);
      document.body.appendChild(link);
      link.click();
    } catch (err) {
      alert("Download failed.");
    }
  };

  return (
    <div className="container py-5">
      <div className="text-center mb-4">
        <FaFileAlt size={40} className="text-primary mb-2" />
        <h2 className="text-primary">Resume Analyzer</h2>
      </div>

      <div className="d-flex flex-column align-items-center mb-4">
        <input
          type="file"
          className="form-control w-50 mb-3"
          onChange={handleFileChange}
          accept="application/pdf"
        />
        <button
          onClick={handleAnalyze}
          className="btn btn-primary btn-lg animate__animated animate__pulse animate__infinite"
        >
          <FaSearch className="me-2" /> Analyze Resume
        </button>
      </div>

      {loading && <div className="alert alert-info text-center">Analyzing your resume...</div>}
      {error && <div className="alert alert-danger text-center">{error}</div>}

      {result && (
        <div className="card shadow p-4 animate__animated animate__fadeIn">
          <h4 className="text-success">
            <FaCheckCircle className="me-2" /> Analysis Summary
          </h4>
          <hr />
          <p><strong>Score:</strong> {result.score}/100</p>
          <p><strong>Summary:</strong> {result.summary}</p>

          <p><strong>Good Points:</strong></p>
          <ul>
            {result.good_points.map((item, i) => (
              <li key={i} className="text-success">{item}</li>
            ))}
          </ul>

          <p><strong className="text-warning">Suggestions for Improvement:</strong></p>
          <ul>
            {result.suggestions.map((item, i) => (
              <li key={i} className="text-warning">{item}</li>
            ))}
          </ul>

          <div className="mt-4 d-flex gap-2">
            <button className="btn btn-danger" onClick={() => handleExport('pdf')}>
              <FaFilePdf className="me-2" /> Export as PDF
            </button>
            <button className="btn btn-success" onClick={() => handleExport('excel')}>
              <FaFileExcel className="me-2" /> Export as Excel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ResumeAnalyzer;
