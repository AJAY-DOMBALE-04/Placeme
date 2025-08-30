import React from 'react';

const MyProfile = () => {
  return (
    <div className="container">
      <h2 className="mb-4">🧑 My Profile</h2>
      <form>
        <div className="mb-3">
          <label>Name</label>
          <input type="text" className="form-control" placeholder="Your full name" />
        </div>
        <div className="mb-3">
          <label>Email</label>
          <input type="email" className="form-control" placeholder="Your email address" />
        </div>
        <div className="mb-3">
          <label>Phone</label>
          <input type="tel" className="form-control" placeholder="Phone number" />
        </div>
        <div className="mb-3">
          <label>Department</label>
          <input type="text" className="form-control" placeholder="CSE, ECE, etc." />
        </div>
        <button className="btn btn-primary">Save Changes</button>
      </form>
    </div>
  );
};

export default MyProfile;
