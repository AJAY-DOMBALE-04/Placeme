import React from 'react';

const PostJob = () => {
  return (
    <div className="container">
      <h2>📢 Post Job or Internship</h2>
      <form>
        <input type="text" placeholder="Role" className="form-control mb-2" />
        <input type="text" placeholder="Company" className="form-control mb-2" />
        <input type="text" placeholder="Location" className="form-control mb-2" />
        <button className="btn btn-primary">Submit</button>
      </form>
    </div>
  );
};

export default PostJob;
