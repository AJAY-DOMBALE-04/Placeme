// front/src/pages/features/SkillGapChecker.jsx
import React, { useEffect, useState } from "react";

export default function SkillGapChecker() {
  const [roles, setRoles] = useState([]);
  const [role, setRole] = useState("");
  const [skills, setSkills] = useState([]);
  const [quiz, setQuiz] = useState([]);
  const [answers, setAnswers] = useState({});
  const [result, setResult] = useState(null);
  const [loadingQuiz, setLoadingQuiz] = useState(false);
  const [scoring, setScoring] = useState(false);
  const API_ROOT = process.env.REACT_APP_API_ROOT || "http://localhost:5000";

  useEffect(() => {
    fetch(`${API_ROOT}/api/skill-gap/roles`)
      .then((r) => r.json())
      .then((j) => {
        if (j.status === "ok") {
          setRoles(j.roles || []);
        }
      })
      .catch((e) => console.error("roles fetch error", e));
  }, [API_ROOT]);

  useEffect(() => {
    if (!role) {
      setSkills([]);
      return;
    }
    const found = roles.find((r) => r.role === role);
    if (found) setSkills(found.skills || []);
    else setSkills([]);
    setQuiz([]);
    setAnswers({});
    setResult(null);
  }, [role, roles]);

  const startQuiz = async () => {
    if (!role) return alert("Please select a target role first.");
    setLoadingQuiz(true);
    try {
      const res = await fetch(`${API_ROOT}/api/skill-gap/quiz?role=${encodeURIComponent(role)}`);
      const j = await res.json();
      if (j.status === "ok") {
        setQuiz(j.questions || []);
        setAnswers({});
        setResult(null);
      } else {
        alert("Error fetching quiz: " + (j.message || "unknown"));
      }
    } catch (e) {
      alert("Network error: " + String(e));
    } finally {
      setLoadingQuiz(false);
    }
  };

  const setAnswer = (qid, idx) => {
    setAnswers((s) => ({ ...s, [qid]: idx }));
  };

  const submitAnswers = async () => {
    if (!quiz.length) return alert("No quiz to submit.");
    // Basic check that all questions answered
    for (const q of quiz) {
      if (answers[q.id] === undefined) {
        if (!window.confirm("Some questions are unanswered. Submit anyway?")) return;
        break;
      }
    }
    setScoring(true);
    try {
      const res = await fetch(`${API_ROOT}/api/skill-gap/score`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role, answers }),
      });
      const j = await res.json();
      if (j.status === "ok") {
        setResult(j);
      } else {
        alert("Scoring error: " + (j.message || "unknown"));
      }
    } catch (e) {
      alert("Network error: " + String(e));
    } finally {
      setScoring(false);
    }
  };

  const openLearningPath = () => {
    if (!result?.learning_path) return;
    // Show in-page (we already render it), but you could link to LearningPath page
    // Optionally save to localStorage to pre-fill Learning Path page:
    localStorage.setItem("prefill_learning_path", JSON.stringify(result.learning_path));
    alert("Learning Path saved to localStorage (prefill_learning_path). You can open Learning Path page to import it.");
  };

  return (
    <div className="container py-4">
      <h2 className="mb-3">🔎 Skill Gap Checker</h2>
      <div className="card p-3 mb-3">
        <div className="mb-2">
          <label className="form-label">Select your target role</label>
          <select className="form-select" value={role} onChange={(e) => setRole(e.target.value)}>
            <option value="">-- choose role --</option>
            {roles.map((r) => (
              <option key={r.role} value={r.role}>
                {r.role}
              </option>
            ))}
          </select>
        </div>

        {skills.length > 0 && (
          <div className="mb-3">
            <h6>Typical skills & benchmarks</h6>
            <ul>
              {skills.map((s) => (
                <li key={s.name}>
                  <strong>{s.name}</strong> — benchmark: {s.benchmark}%
                </li>
              ))}
            </ul>
            <div>
              <button className="btn btn-primary me-2" onClick={startQuiz} disabled={loadingQuiz}>
                {loadingQuiz ? "Loading quiz..." : "Take Quick Assessment"}
              </button>
              <button
                className="btn btn-outline-secondary"
                onClick={() => {
                  // Quick "self-check" fallback: assume user self-assessed as proficient for demonstration
                  setResult({
                    status: "ok",
                    role,
                    skill_scores: skills.map((s) => ({ skill: s.name, score_pct: 85, proficiency: "Intermediate", benchmark: s.benchmark })),
                    missing_skills: [],
                    quick_actions: [],
                    learning_path: [],
                  });
                }}
              >
                Quick self-evaluation (demo)
              </button>
            </div>
          </div>
        )}

        {quiz.length > 0 && (
          <div className="mb-3">
            <h5>Assessment</h5>
            <p>Answer the short multiple choice questions below.</p>
            {quiz.map((q, i) => (
              <div key={q.id} className="mb-3 p-3 border rounded">
                <div style={{ fontWeight: 600 }}>{i + 1}. ({q.skill}) {q.question}</div>
                <div className="mt-2">
                  {q.options.map((opt, idx) => (
                    <div key={idx} className="form-check">
                      <input
                        className="form-check-input"
                        type="radio"
                        id={`${q.id}_${idx}`}
                        name={q.id}
                        checked={answers[q.id] === idx}
                        onChange={() => setAnswer(q.id, idx)}
                      />
                      <label className="form-check-label" htmlFor={`${q.id}_${idx}`}>
                        {opt}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            ))}
            <div>
              <button className="btn btn-success me-2" onClick={submitAnswers} disabled={scoring}>
                {scoring ? "Scoring..." : "Submit Assessment"}
              </button>
              <button className="btn btn-outline-secondary" onClick={() => { setQuiz([]); setAnswers({}); }}>
                Cancel
              </button>
            </div>
          </div>
        )}

        {result && (
          <div className="mt-3">
            <h5>Results for {result.role}</h5>
            <div className="mb-2">
              <strong>Summary:</strong>
              <div>
                {result.skill_scores.map((s) => (
                  <div key={s.skill} className="mb-2">
                    <div className="d-flex justify-content-between">
                      <div><strong>{s.skill}</strong> — {s.proficiency}</div>
                      <div>{s.score_pct}% (benchmark {s.benchmark}%)</div>
                    </div>
                    <div className="progress" style={{ height: 10 }}>
                      <div
                        className={`progress-bar ${s.score_pct >= s.benchmark ? "bg-success" : s.score_pct >= 50 ? "bg-warning" : "bg-danger"}`}
                        role="progressbar"
                        style={{ width: `${Math.min(100, s.score_pct)}%` }}
                        aria-valuenow={s.score_pct}
                        aria-valuemin="0"
                        aria-valuemax="100"
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="mb-3">
              <h6>Missing / Weak Skills</h6>
              {result.missing_skills.length ? (
                <ul>
                  {result.missing_skills.map((m) => (
                    <li key={m.skill}>
                      <strong>{m.skill}</strong>: {m.score_pct}% — {m.proficiency}
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="text-success">No major gaps detected — nice!</div>
              )}
            </div>

            <div className="mb-3">
              <h6>Quick Actions</h6>
              {result.quick_actions.length ? (
                <ul>
                  {result.quick_actions.map((qa, i) => (
                    <li key={i}>{qa}</li>
                  ))}
                </ul>
              ) : (
                <div>No quick actions (you are mostly OK)</div>
              )}
            </div>

            <div className="mb-3">
              <h6>Generated Learning Path (preview)</h6>
              {result.learning_path.length ? (
                <div>
                  {result.learning_path.map((entry) => (
                    <div key={entry.skill} className="card mb-2">
                      <div className="card-body">
                        <h6 className="card-title">{entry.skill}</h6>
                        <ul>
                          {entry.modules.map((m, idx) => (
                            <li key={idx}>
                              <a href={m.resource} target="_blank" rel="noreferrer">{m.title}</a> — approx {Math.round(m.duration_mins / 60)} hr
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  ))}
                  <button className="btn btn-primary" onClick={openLearningPath}>Save Learning Path & Open Learning Path page</button>
                </div>
              ) : (
                <div>No generated path (no missing skills or nothing to suggest).</div>
              )}
            </div>
          </div>
        )}
      </div>

      <div className="text-muted">
        Tip: After finishing the assessment you can save the generated learning path and import it into the Learning Path feature for step-by-step tracking.
      </div>
    </div>
  );
}
