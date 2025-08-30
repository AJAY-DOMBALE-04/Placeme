import React from 'react';
import { Link } from 'react-router-dom';

const RecruiterDashboard = () => {
  return (
    <div className="container">
      <h2 className="my-4 text-primary">💼 Recruiter Dashboard</h2>
      <div className="row g-4">
        
        <div className="col-md-4">
          <div className="card h-100 shadow-sm">
            <div className="card-body">
              <h5 className="card-title">📢 Post Jobs / Internships</h5>
              <p className="card-text">Create job or internship listings and define requirements.</p>
              <Link to="/recruiter/post-job" className="btn btn-outline-primary btn-sm">Post New</Link>
            </div>
          </div>
        </div>
        
        <div className="col-md-4">
          <div className="card h-100 shadow-sm">
            <div className="card-body">
              <h5 className="card-title">✅ Auto-Shortlisted Students</h5>
              <p className="card-text">View AI-generated list of top-matching candidates for your jobs.</p>
              <Link to="/recruiter/view-shortlisted" className="btn btn-outline-primary btn-sm">View Shortlist</Link>
            </div>
          </div>
        </div>
        
        <div className="col-md-4">
          <div className="card h-100 shadow-sm">
            <div className="card-body">
              <h5 className="card-title">📄 View Candidate Resumes</h5>
              <p className="card-text">Browse resumes and profiles of applied students.</p>
              <Link to="/recruiter/resumes" className="btn btn-outline-primary btn-sm">View Resumes</Link>
            </div>
          </div>
        </div>
        
        <div className="col-md-4">
          <div className="card h-100 shadow-sm">
            <div className="card-body">
              <h5 className="card-title">📥 Download Reports</h5>
              <p className="card-text">Download student application reports and analytics.</p>
              <Link to="/recruiter/reports" className="btn btn-outline-primary btn-sm">Download</Link>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default RecruiterDashboard;
