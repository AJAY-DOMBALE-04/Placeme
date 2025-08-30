import React from 'react';

const PlacementStatus = () => {
  const status = [
    { company: 'Google', status: 'Interview Scheduled' },
    { company: 'Infosys', status: 'Selected' },
    { company: 'Wipro', status: 'Rejected' },
  ];

  return (
    <div className="container">
      <h2 className="mb-4">📈 Placement Status</h2>
      <table className="table table-bordered">
        <thead className="table-light">
          <tr>
            <th>Company</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {status.map((s, index) => (
            <tr key={index}>
              <td>{s.company}</td>
              <td>{s.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default PlacementStatus;
