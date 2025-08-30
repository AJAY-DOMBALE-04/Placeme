import React, { useState } from 'react';

const UploadCompany = () => {
  const [companyName, setCompanyName] = useState('');
  const [jobRole, setJobRole] = useState('');
  const [location, setLocation] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();

    const jobData = {
      companyName,
      jobRole,
      location
    };

    try {
      const res = await fetch('http://localhost:5000/api/jobs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(jobData)
      });

      if (res.ok) {
        setMessage('✅ Company info uploaded successfully!');
        setCompanyName('');
        setJobRole('');
        setLocation('');
      } else {
        setMessage('❌ Failed to upload. Please try again.');
      }
    } catch (err) {
      console.error(err);
      setMessage('⚠️ Error connecting to the server.');
    }
  };

  return (
    <div className="container">
      <h2>🏢 Upload Company Information</h2>
      {message && <p>{message}</p>}
      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label>Company Name</label>
          <input
            type="text"
            className="form-control"
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
            required
          />
        </div>
        <div className="mb-3">
          <label>Job Role</label>
          <input
            type="text"
            className="form-control"
            value={jobRole}
            onChange={(e) => setJobRole(e.target.value)}
            required
          />
        </div>
        <div className="mb-3">
          <label>Location</label>
          <input
            type="text"
            className="form-control"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            required
          />
        </div>
        <button type="submit" className="btn btn-primary">Upload</button>
      </form>
    </div>
  );
};

export default UploadCompany;
