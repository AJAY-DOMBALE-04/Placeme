// frontend/src/components/OpportunityRecommender.jsx
import React, { useState } from "react";

export default function OpportunityRecommender() {
  const [branch, setBranch] = useState("");
  const [cgpa, setCgpa] = useState("");
  const [skills, setSkills] = useState("");
  const [year, setYear] = useState(new Date().getFullYear());
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  const submit = async () => {
    setLoading(true);
    setError("");
    setResult(null);
    try {
      const res = await fetch("http://localhost:5000/api/recommend-from-trends", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ branch, cgpa, skills, year, top_k: 10 })
      });
      const data = await res.json();
      if (data.status === "ok") {
        setResult(data.result);
      } else {
        setError(data.message || "Server error");
      }
    } catch (e) {
      setError(String(e));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 1000, margin: "18px auto", padding: 20, fontFamily: "Arial, sans-serif" }}>
      <h2 style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <span role="img" aria-label="search">🔎</span> Opportunity Recommendation (Past Trends)
      </h2>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 120px", gap: 12 }}>
        <div>
          <label>Branch</label>
          <input value={branch} onChange={(e)=>setBranch(e.target.value)} placeholder="CSE" style={inputStyle} />
          <label>CGPA</label>
          <input type="number" step="0.01" value={cgpa} onChange={(e)=>setCgpa(e.target.value)} placeholder="8.5" style={inputStyle} />
        </div>
        <div>
          <label>Graduation Year</label>
          <input type="number" value={year} onChange={(e)=>setYear(e.target.value)} style={inputStyle} />
          <div style={{ height: 36 }} />
          <button onClick={submit} style={buttonStyle} disabled={loading}>{loading ? "Searching..." : "Get Recommendation"}</button>
        </div>
      </div>

      <label style={{ marginTop: 12 }}>Skills (comma separated)</label>
      <textarea rows={3} value={skills} onChange={(e)=>setSkills(e.target.value)} placeholder="python, sql, machine learning" style={{...inputStyle, minHeight:84}} />

      {error && <div style={{ color: "crimson", marginTop: 12 }}>{error}</div>}

      {result && (
        <div style={{ marginTop: 20 }}>
          {/* Predicted roles (skill-driven) */}
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            <div style={cardStyle}>
              <h3 style={{ marginTop: 0 }}>🎯 Predicted Roles (from skills)</h3>
              {result.roles_for_skills && result.roles_for_skills.length > 0 ? (
                <ul>
                  {result.roles_for_skills.map((r, i) => <li key={i}>{r}</li>)}
                </ul>
              ) : <div>No role found for these skills.</div>}
            </div>

            <div style={cardStyle}>
              <h3 style={{ marginTop: 0 }}>🏢 Companies hiring these skills</h3>
              {result.companies_for_skills && result.companies_for_skills.length > 0 ? (
                <ul>
                  {result.companies_for_skills.map((c,i) => <li key={i}>{c}</li>)}
                </ul>
              ) : <div>No companies found.</div>}
            </div>

            <div style={cardStyle}>
              <h3 style={{ marginTop: 0 }}>📈 Stats</h3>
              <div>Matched students: <strong>{result.stats.matched_count ?? 0}</strong> ({result.stats.matched_pct ?? 0}%)</div>
              <div>Avg package among matched: <strong>{result.stats.avg_package ?? 0} LPA</strong></div>
            </div>
          </div>

          {/* Top matched students table */}
          <div style={{ marginTop: 18 }}>
            <h3>Top matched students</h3>
            {(!result.matched_students || result.matched_students.length === 0) ? (
              <div>No matched students found.</div>
            ) : (
              <div style={{ overflowX: "auto", border: "1px solid #eee", borderRadius: 6 }}>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead style={{ background: "#f9f9f9" }}>
                    <tr>
                      <th style={th}>#</th>
                      <th style={th}>Name</th>
                      <th style={th}>Roll</th>
                      <th style={th}>Branch</th>
                      <th style={th}>Role</th>
                      <th style={th}>Company</th>
                      <th style={th}>Package</th>
                      <th style={th}>Skills</th>
                      <th style={th}>Year</th>
                      <th style={th}>Overlap</th>
                    </tr>
                  </thead>
                  <tbody>
                    {result.matched_students.map((s, i) => (
                      <tr key={i} style={{ borderTop: "1px solid #eee" }}>
                        <td style={td}>{i+1}</td>
                        <td style={td}>{s.StudentName}</td>
                        <td style={td}>{s.RollNumber}</td>
                        <td style={td}>{s.Branch}</td>
                        <td style={td}>{s.JobRole}</td>
                        <td style={td}>{s.Company}</td>
                        <td style={td}>{s.Package}</td>
                        <td style={td}>{s.Skills}</td>
                        <td style={td}>{s.Year}</td>
                        <td style={td}>{s.overlap}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

        </div>
      )}
    </div>
  );
}

const inputStyle = { width: "100%", padding: 10, marginTop: 6, borderRadius: 6, border: "1px solid #ccc", boxSizing: "border-box" };
const buttonStyle = { padding: "10px 14px", background: "#0d6efd", color: "#fff", border: "none", borderRadius: 6, cursor: "pointer" };
const cardStyle = { background: "#fff", border: "1px solid #e6e6e6", padding: 12, borderRadius: 8, minWidth: 220, flex: "1 1 240px" };
const th = { textAlign: "left", padding: "8px 12px", fontWeight: 600 };
const td = { padding: "8px 12px", verticalAlign: "top" };
