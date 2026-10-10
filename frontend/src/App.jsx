import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext.jsx';
import Layout from './components/Layout.jsx';
import Login from './pages/Login.jsx';
import AdminDashboard from './pages/AdminDashboard.jsx';
import StudentsPage from './pages/StudentsPage.jsx';
import ElectionsPage from './pages/ElectionsPage.jsx';
import CandidatesPage from './pages/CandidatesPage.jsx';
import ResultsPage from './pages/ResultsPage.jsx';
import AuditPage from './pages/AuditPage.jsx';
import StudentDashboard from './pages/StudentDashboard.jsx';

import VotePage from './pages/VotePage.jsx';
import CandidateDashboard from './pages/CandidateDashboard.jsx';
import CandidateProfile from './pages/CandidateProfile.jsx';
import SignUp from './pages/SignUp.jsx';

function Protected({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading…</div>;
  if (!user) {
    const originalUrl = window.location.pathname + window.location.search;
    return <Navigate to={`/login?returnTo=${encodeURIComponent(originalUrl)}`} replace />;
  }
  return children;
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/signup" element={<SignUp />} />
      <Route element={<Protected><Layout /></Protected>}>
        {/* Admin */}
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/admin/students" element={<StudentsPage />} />
        <Route path="/admin/elections" element={<ElectionsPage />} />
        <Route path="/admin/candidates" element={<CandidatesPage />} />
        <Route path="/admin/results" element={<ResultsPage />} />
        <Route path="/admin/audit" element={<AuditPage />} />

        {/* Student */}
        <Route path="/student/dashboard" element={<StudentDashboard />} />
        <Route path="/student/vote" element={<VotePage />} />

        {/* Candidate */}
        <Route path="/candidate/dashboard" element={<CandidateDashboard />} />
        <Route path="/candidate/profile" element={<CandidateProfile />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}