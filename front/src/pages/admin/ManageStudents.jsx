import React from 'react';

const ManageStudents = () => {
  return (
    <div className="container">
      <h2>👥 Manage Students</h2>
      <p>View, edit or delete student profiles here.</p>
      <table className="table table-bordered">
        <thead>
          <tr>
            <th>Name</th><th>Email</th><th>Dept</th><th>Action</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Ajay</td><td>ajay@gmail.com</td><td>CSE</td>
            <td><button className="btn btn-danger btn-sm">Delete</button></td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};

export default ManageStudents;
