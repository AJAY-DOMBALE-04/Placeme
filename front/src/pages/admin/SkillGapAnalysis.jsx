import React from 'react';

const SkillGapAnalysis = () => {
  return (
    <div className="container">
      <h2>🔧 Skill Gap Across Batches</h2>
      <p>View batch-wise skill deficiencies to plan training sessions.</p>
      <ul className="list-group">
        <li className="list-group-item">Batch 2024: Cloud, DSA</li>
        <li className="list-group-item">Batch 2025: OS, DBMS</li>
      </ul>
    </div>
  );
};

export default SkillGapAnalysis;
