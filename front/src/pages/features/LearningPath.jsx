// front/src/pages/features/LearningPath.jsx
import React, { useState } from "react";

export default function LearningPath() {
  const [goal, setGoal] = useState("");
  const [skillsText, setSkillsText] = useState("");
  const [hoursPerWeek, setHoursPerWeek] = useState(5);
  const [weeks, setWeeks] = useState(8);
  const [loading, setLoading] = useState(false);
  const [roadmap, setRoadmap] = useState(null);
  const [completedTasks, setCompletedTasks] = useState({}); // milestoneIndex -> set of completed tasks

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setRoadmap(null);
    const payload = {
      goal,
      current_skills: skillsText.split(",").map(s => s.trim()).filter(Boolean),
      hours_per_week: Number(hoursPerWeek),
      weeks: Number(weeks)
    };
    try {
      const res = await fetch("http://localhost:5000/api/learning-path", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const json = await res.json();
      if (json.status === "ok") {
        setRoadmap(json.roadmap);
        setCompletedTasks({});
      } else {
        alert("Server error: " + (json.message || "unknown"));
      }
    } catch (err) {
      alert("Network error: " + String(err));
    } finally {
      setLoading(false);
    }
  };

  const toggleTask = (milestoneIdx, taskIdx) => {
    setCompletedTasks(prev => {
      const copy = { ...prev };
      const setForM = new Set(copy[milestoneIdx] || []);
      if (setForM.has(taskIdx)) {
        setForM.delete(taskIdx);
      } else {
        setForM.add(taskIdx);
      }
      copy[milestoneIdx] = Array.from(setForM);
      return copy;
    });
  };

  return (
    <div className="container py-4">
      <div className="card mb-4">
        <div className="card-body">
          <h3 className="card-title">📚 Learning Path Generator</h3>
          <p className="text-muted">Enter your career goal and current skills to get a personalized study roadmap.</p>
          <form onSubmit={submit}>
            <div className="mb-3">
              <label className="form-label">Goal (e.g. Frontend Developer, Data Scientist)</label>
              <input className="form-control" value={goal} onChange={e => setGoal(e.target.value)} placeholder="Frontend Developer" required />
            </div>
            <div className="mb-3">
              <label className="form-label">Current Skills (comma separated)</label>
              <input className="form-control" value={skillsText} onChange={e => setSkillsText(e.target.value)} placeholder="HTML, CSS, JavaScript" />
              <div className="form-text">Example: HTML, CSS, Python</div>
            </div>

            <div className="row">
              <div className="col-md-4 mb-3">
                <label className="form-label">Hours per week</label>
                <input type="number" min="1" max="40" className="form-control" value={hoursPerWeek} onChange={e => setHoursPerWeek(e.target.value)} />
              </div>
              <div className="col-md-4 mb-3">
                <label className="form-label">Total weeks</label>
                <input type="number" min="2" max="52" className="form-control" value={weeks} onChange={e => setWeeks(e.target.value)} />
              </div>
              <div className="col-md-4 d-flex align-items-end mb-3">
                <button className="btn btn-primary w-100" type="submit" disabled={loading}>
                  {loading ? "Generating..." : "Generate Roadmap"}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>

      {roadmap && (
        <div className="mb-5">
          <div className="mb-3 d-flex justify-content-between align-items-center">
            <h4>Roadmap: {roadmap.goal}</h4>
            <div className="text-muted">Weeks: {roadmap.generated_for.total_weeks} • Hours/week: {roadmap.generated_for.hours_per_week}</div>
          </div>

          {roadmap.milestones.map((m, mi) => {
            const completed = new Set(completedTasks[mi] || []);
            const totalTasks = m.tasks.length;
            const doneCount = completed.size;
            const pct = Math.round((doneCount / totalTasks) * 100);
            return (
              <div className="card mb-3" key={mi}>
                <div className="card-body">
                  <div className="d-flex justify-content-between align-items-start">
                    <div>
                      <h5 className="card-title">{m.title} <small className="text-muted">({m.start_week}–{m.end_week})</small></h5>
                      <div className="text-muted">Est. hours/week: {m.estimated_hours_per_week}</div>
                    </div>
                    <div style={{ minWidth: 140 }}>
                      <div className="mb-1 text-end"><small>{doneCount}/{totalTasks} tasks</small></div>
                      <div className="progress" style={{ height: "10px" }}>
                        <div className="progress-bar" role="progressbar" style={{ width: `${pct}%` }}>{pct}%</div>
                      </div>
                    </div>
                  </div>

                  <hr />
                  <h6>Tasks</h6>
                  <ul className="list-group mb-3">
                    {m.tasks.map((t, ti) => (
                      <li className="list-group-item d-flex justify-content-between align-items-center" key={ti}>
                        <div>
                          <input type="checkbox" onChange={() => toggleTask(mi, ti)} checked={completed.has(ti)} className="me-2" />
                          {t}
                        </div>
                        <small className="text-muted">Week {m.start_week + Math.floor((m.duration_weeks * ti)/m.tasks.length)}</small>
                      </li>
                    ))}
                  </ul>

                  <h6>Resources</h6>
                  <div className="row">
                    {m.resources.map((r, ri) => (
                      <div className="col-md-6 mb-2" key={ri}>
                        <div className="card p-2">
                          <a href={r.url} target="_blank" rel="noreferrer" className="fw-semibold">{r.title}</a>
                          <div className="text-truncate">{r.url}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}

          <div className="card p-3">
            <h6>Advice</h6>
            <ul>
              {roadmap.advice.map((a, i) => <li key={i}>{a}</li>)}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
