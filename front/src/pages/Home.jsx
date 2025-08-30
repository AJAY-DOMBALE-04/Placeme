import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';

const Home = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Fetch jobs from backend
  const fetchJobs = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/jobs"); // Change to deployed URL
      if (!res.ok) {
        throw new Error("Failed to fetch jobs");
      }
      const data = await res.json();
      setJobs(data);
    } catch (error) {
      console.error("Error fetching jobs:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
    const interval = setInterval(fetchJobs, 30000); // Refresh every 30 sec
    return () => clearInterval(interval);
  }, []);

  // Redirect to login if user not logged in
  const handleProtectedRedirect = (dashboardPath) => {
    const token = localStorage.getItem("token"); // Assuming token is stored on login
    if (!token) {
      navigate(`/login?redirect=${dashboardPath}`);
    } else {
      navigate(dashboardPath);
    }
  };

  return (
    <div className="container mt-4">
      {/* Hero Section */}
      <div className="text-center py-5">
        <h1 className="display-4 fw-bold text-primary">
          Welcome to AI Placement Portal 🎓
        </h1>
        <p className="lead">
          Empowering Students, TPOs, and Recruiters with Smart AI Tools
        </p>
        <img
          src="https://img.freepik.com/free-vector/college-project-concept-illustration_114360-11001.jpg?w=1060"
          alt="hero"
          className="img-fluid my-4 rounded"
          style={{ maxHeight: '400px' }}
        />
        <div className="d-flex justify-content-center gap-3">
          <Link to="/register" className="btn btn-primary btn-lg">
            Get Started
          </Link>
          <Link to="/about" className="btn btn-outline-secondary btn-lg">
            Learn More
          </Link>
        </div>
      </div>

      {/* Latest Jobs Section */}
      <div className="mt-5">
        <h2 className="text-center mb-4">🚀 Latest Job Openings</h2>
        <div className="border p-2 bg-light rounded">
          {loading ? (
            <p className="text-center mb-0">Loading jobs...</p>
          ) : jobs.length > 0 ? (
            <marquee behavior="scroll" direction="left" scrollamount="6">
              {jobs.map((job) => (
                <span
                  key={job._id}
                  style={{
                    display: "inline-block",
                    marginRight: "40px",
                    fontWeight: "500",
                    cursor: "pointer",
                    color: "blue",
                  }}
                  onClick={() => handleProtectedRedirect(`/jobs/${job._id}`)}
                  title="Click to view details"
                >
                  {job.title} @ {job.company} ({job.location})
                </span>
              ))}
            </marquee>
          ) : (
            <p className="text-center mb-0">No job postings available right now.</p>
          )}
        </div>
      </div>

      {/* Features Section */}
      <div className="row text-center mt-5">
        <h2 className="mb-4">💡 Key Features</h2>

        {/* Student Features */}
        <div className="col-md-4 mb-4">
          <div className="card h-100 shadow-sm">
            <div className="card-body">
              <h5 className="card-title">🧑‍🎓 For Students</h5>
              <p>
                Resume Scoring, Interview Practice, Skill Gap Checker, and AI-Based Recommendations.
              </p>
              <button
                onClick={() => handleProtectedRedirect("/dashboard/student")}
                className="btn btn-sm btn-outline-primary"
              >
                Go to Student Dashboard
              </button>
            </div>
          </div>
        </div>

        {/* Admin/TPO Features */}
        <div className="col-md-4 mb-4">
          <div className="card h-100 shadow-sm border-success">
            <div className="card-body">
              <h5 className="card-title text-success">👨‍🏫 For Admin/TPO</h5>
              <p>
                Batch Analysis, Auto Shortlisting, Company Uploads, and AI Insights for Placements.
              </p>
              <button
                onClick={() => handleProtectedRedirect("/dashboard/admin")}
                className="btn btn-sm btn-success"
              >
                Go to Admin Dashboard
              </button>
            </div>
          </div>
        </div>

        {/* Recruiter Features */}
        <div className="col-md-4 mb-4">
          <div className="card h-100 shadow-sm border-warning">
            <div className="card-body">
              <h5 className="card-title text-warning">💼 For Recruiters</h5>
              <p>
                Post Jobs, Auto-Shortlist Candidates, View Resumes, and Download Reports.
              </p>
              <button
                onClick={() => handleProtectedRedirect("/dashboard/recruiter")}
                className="btn btn-sm btn-warning"
              >
                Go to Recruiter Dashboard
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="text-center py-4 mt-5 border-top">
        <p className="mb-0">© 2025 AI Placement Portal | All Rights Reserved</p>
      </footer>
    </div>
  );
};

export default Home;
