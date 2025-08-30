import React from 'react';

const About = () => {
  return (
    <div className="container mt-4">
      <h1 className="mb-4 text-primary">ℹ️ About AI Placement Portal</h1>
      
      <p>
        The AI Placement Portal is a smart and interactive web-based platform designed to streamline the placement process
        for colleges and universities using artificial intelligence. It provides dedicated dashboards for students, admins/TPOs,
        and recruiters to manage everything from resume analysis to offer generation.
      </p>

      <div className="row mt-5">
        <div className="col-md-6">
          <h4>🎓 For Students</h4>
          <ul>
            <li>Resume Analyzer & Score Generator</li>
            <li>AI-Powered Interview Practice</li>
            <li>Learning Path Recommendations</li>
            <li>Placement Status & Opportunity Tracker</li>
          </ul>
        </div>

        <div className="col-md-6">
          <h4>👨‍🏫 For Admin/TPO</h4>
          <ul>
            <li>Batch-Wise Skill Gap Analysis</li>
            <li>AI-Based Auto Shortlisting</li>
            <li>Placement Analytics Dashboard</li>
            <li>Company & Job Posting Management</li>
          </ul>
        </div>
      </div>

      <div className="row mt-4">
        <div className="col-md-12">
          <h4>💼 For Recruiters</h4>
          <ul>
            <li>Post Jobs/Internships Easily</li>
            <li>AI Shortlist Matching Candidates</li>
            <li>Download Candidate Reports & Resumes</li>
            <li>Track Hiring Analytics</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default About;
