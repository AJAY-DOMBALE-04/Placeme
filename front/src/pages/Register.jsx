const Register = () => {
  return (
    <div className="col-md-6 offset-md-3">
      <h2>Register</h2>
      <form>
        <div className="mb-3">
          <label>Full Name</label>
          <input type="text" className="form-control" placeholder="Enter name" />
        </div>
        <div className="mb-3">
          <label>Email</label>
          <input type="email" className="form-control" placeholder="Enter email" />
        </div>
        <div className="mb-3">
          <label>Password</label>
          <input type="password" className="form-control" placeholder="Enter password" />
        </div>
        <button type="submit" className="btn btn-success">Register</button>
      </form>
    </div>
  );
};

export default Register;
