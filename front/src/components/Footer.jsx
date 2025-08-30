import React from 'react';

const Footer = () => {
  return (
    <footer className="bg-dark text-white mt-5 py-3">
      <div className="container text-center">
        <p className="mb-0">© {new Date().getFullYear()} AI Placement Portal | All Rights Reserved</p>
        <small>Designed for Educational Project Use</small>
      </div>
    </footer>
  );
};

export default Footer;
