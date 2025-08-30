import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import Navbar from './components/Navbar';
import Home from './pages/Home';
import About from './pages/About';
import Login from './pages/Login';
import Register from './pages/Register';

import StudentDashboard from './pages/dashboards/StudentDashboard';
import AdminDashboard from './pages/dashboards/AdminDashboard';
import RecruiterDashboard from './pages/dashboards/RecruiterDashboard';
import Footer from './components/Footer';
// Feature pages
import MyProfile from './pages/features/MyProfile';
import ResumeAnalyzer from './pages/features/ResumeAnalyzer';
import Opportunities from './pages/features/Opportunities';
import InterviewPractice from './pages/features/InterviewPractice';
import LearningPath from './pages/features/LearningPath';
import SkillGapChecker from './pages/features/SkillGapChecker';
import PlacementStatus from './pages/features/PlacementStatus';
// Admin pages
import ManageStudents from './pages/admin/ManageStudents';
import UploadCompany from './pages/admin/UploadCompany';
import PlacementAnalytics from './pages/admin/PlacementAnalytics';
import AutoShortlist from './pages/admin/AutoShortlist';
import SkillGapAnalysis from './pages/admin/SkillGapAnalysis';
import AIModelMonitor from './pages/admin/AIModelMonitor';

// Recruiter pages
import PostJob from './pages/recruiter/PostJob';
import ViewShortlisted from './pages/recruiter/ViewShortlisted';
import ViewResumes from './pages/recruiter/ViewResumes';
import Reports from './pages/recruiter/Reports';




function App() {
  return (
    <Router>
      <Navbar />
      <div className="container mt-4">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/dashboard/student" element={<StudentDashboard />} />
          <Route path="/dashboard/admin" element={<AdminDashboard />} />
          <Route path="/dashboard/recruiter" element={<RecruiterDashboard />} />
          <Route path="/profile" element={<MyProfile />} />
<Route path="/resume-analyzer" element={<ResumeAnalyzer />} />
<Route path="/opportunities" element={<Opportunities />} />
<Route path="/interview-practice" element={<InterviewPractice />} />
<Route path="/learning-path" element={<LearningPath />} />
<Route path="/skill-gap" element={<SkillGapChecker />} />
<Route path="/placement-status" element={<PlacementStatus />} />

<Route path="/admin/manage-students" element={<ManageStudents />} />
<Route path="/admin/upload-company" element={<UploadCompany />} />
<Route path="/admin/placement-analytics" element={<PlacementAnalytics />} />
<Route path="/admin/auto-shortlist" element={<AutoShortlist />} />
<Route path="/admin/skill-gap-analysis" element={<SkillGapAnalysis />} />
<Route path="/admin/ai-models" element={<AIModelMonitor />} />

<Route path="/recruiter/post-job" element={<PostJob />} />
<Route path="/recruiter/view-shortlisted" element={<ViewShortlisted />} />
<Route path="/recruiter/resumes" element={<ViewResumes />} />
<Route path="/recruiter/reports" element={<Reports />} />

        </Routes>
      </div>
      <Footer />  
    </Router>
  );
}

export default App;
