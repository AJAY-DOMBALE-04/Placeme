import React from 'react';
import { Link } from 'react-router-dom';

const StudentDashboard = () => {
  return (
    <div className="container">
      <h2 className="my-4 text-primary">🎓 Student Dashboard</h2>
      <div className="row g-4">

        <div className="col-md-4">
          <div className="card h-100 shadow-sm">
            <div className="card-body">
              <h5 className="card-title">🧑 My Profile</h5>
              <p className="card-text">View and update your personal profile and academic details.</p>
              <Link to="/profile" className="btn btn-outline-primary btn-sm">Go to Profile</Link>
            </div>
          </div>
        </div>

        <div className="col-md-4">
          <div className="card h-100 shadow-sm">
            <div className="card-body">
              <h5 className="card-title">📄 Resume Analyzer</h5>
              <p className="card-text">Upload your resume and get instant feedback and score.</p>
              <Link to="/resume-analyzer" className="btn btn-outline-primary btn-sm">Analyze Resume</Link>
            </div>
          </div>
        </div>

        <div className="col-md-4">
          <div className="card h-100 shadow-sm">
            <div className="card-body">
              <h5 className="card-title">💡 Opportunity Recommendations</h5>
              <p className="card-text">Find the best job/internship matches based on your resume and skills.</p>
              <Link to="/opportunities" className="btn btn-outline-primary btn-sm">View Opportunities</Link>
            </div>
          </div>
        </div>

        <div className="col-md-4">
          <div className="card h-100 shadow-sm">
            <div className="card-body">
              <h5 className="card-title">🎤 Interview Practice</h5>
              <p className="card-text">Practice with AI-based mock interviews and get feedback.</p>
              <Link to="/interview-practice" className="btn btn-outline-primary btn-sm">Start Practice</Link>
            </div>
          </div>
        </div>

        <div className="col-md-4">
          <div className="card h-100 shadow-sm">
            <div className="card-body">
              <h5 className="card-title">📚 Learning Path</h5>
              <p className="card-text">Personalized roadmap to improve your skills based on gap analysis.</p>
              <Link to="/learning-path" className="btn btn-outline-primary btn-sm">View Path</Link>
            </div>
          </div>
        </div>

        <div className="col-md-4">
          <div className="card h-100 shadow-sm">
            <div className="card-body">
              <h5 className="card-title">🔍 Skill Gap Checker</h5>
              <p className="card-text">Identify missing skills required for your dream job role.</p>
              <Link to="/skill-gap" className="btn btn-outline-primary btn-sm">Check Skills</Link>
            </div>
          </div>
        </div>

        <div className="col-md-4">
          <div className="card h-100 shadow-sm">
            <div className="card-body">
              <h5 className="card-title">📈 Placement Status</h5>
              <p className="card-text">Track your application progress and placement history.</p>
              <Link to="/placement-status" className="btn btn-outline-primary btn-sm">View Status</Link>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default StudentDashboard;
