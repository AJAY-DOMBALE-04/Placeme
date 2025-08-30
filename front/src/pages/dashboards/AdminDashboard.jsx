import React from 'react';
import { Link } from 'react-router-dom';

const AdminDashboard = () => {
  return (
    <div className="container">
      <h2 className="my-4 text-primary">👨‍🏫 Admin Dashboard</h2>
      <div className="row g-4">
        <div className="col-md-4">
          <div className="card h-100 shadow-sm">
            <div className="card-body">
              <h5 className="card-title">👥 Manage Students</h5>
              <p className="card-text">View, edit, or delete student profiles and their details.</p>
              <Link to="/admin/manage-students" className="btn btn-outline-primary btn-sm">Manage Students</Link>
            </div>
          </div>
        </div>

        <div className="col-md-4">
          <div className="card h-100 shadow-sm">
            <div className="card-body">
              <h5 className="card-title">🏢 Upload Company Information</h5>
              <p className="card-text">Add and manage companies offering jobs and internships.</p>
              <Link to="/admin/upload-company" className="btn btn-outline-primary btn-sm">Upload Info</Link>
            </div>
          </div>
        </div>

        <div className="col-md-4">
          <div className="card h-100 shadow-sm">
            <div className="card-body">
              <h5 className="card-title">📊 View Placement Analytics</h5>
              <p className="card-text">Analyze placement trends and student success metrics.</p>
              <Link to="/admin/placement-analytics" className="btn btn-outline-primary btn-sm">View Analytics</Link>
            </div>
          </div>
        </div>

        <div className="col-md-4">
          <div className="card h-100 shadow-sm">
            <div className="card-body">
              <h5 className="card-title">🎯 Auto-Shortlist Students</h5>
              <p className="card-text">Automatically shortlist students based on predefined criteria.</p>
              <Link to="/admin/auto-shortlist" className="btn btn-outline-primary btn-sm">Shortlist Students</Link>
            </div>
          </div>
        </div>

        <div className="col-md-4">
          <div className="card h-100 shadow-sm">
            <div className="card-body">
              <h5 className="card-title">🔧 Skill Gap Analysis</h5>
              <p className="card-text">Check skill gaps across student batches and suggest improvements.</p>
              <Link to="/admin/skill-gap-analysis" className="btn btn-outline-primary btn-sm">Analyze Skill Gaps</Link>
            </div>
          </div>
        </div>

        <div className="col-md-4">
          <div className="card h-100 shadow-sm">
            <div className="card-body">
              <h5 className="card-title">🤖 AI Model Monitoring</h5>
              <p className="card-text">Monitor the performance and accuracy of AI-based models.</p>
              <Link to="/admin/ai-models" className="btn btn-outline-primary btn-sm">View AI Models</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
