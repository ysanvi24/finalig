import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import ErrorBoundary from './components/ErrorBoundary';
import AdminLayout from './components/AdminLayout';
import Departments from './pages/admin/Departments';
import ScheduleMatch from './pages/admin/ScheduleMatch';
import LiveConsole from './pages/admin/LiveConsole';
import AwardPoints from './pages/admin/AwardPoints';
import LeaderboardManagement from './pages/admin/LeaderboardManagement';
import SeasonManagement from './pages/admin/SeasonManagement';
import ScoringPresets from './pages/admin/ScoringPresets';
import BracketManager from './pages/admin/BracketManager';
import StudentCouncilManagement from './pages/admin/StudentCouncilManagement';
import AboutManagement from './pages/admin/AboutManagement';
import AdminManagement from './pages/admin/AdminManagement';
import HighlightManagement from './pages/admin/HighlightManagement';
import Login from './pages/auth/Login';
import ProtectedRoute from './components/ProtectedRoute';
import Home from './pages/public/Home';
import Leaderboard from './pages/public/Leaderboard';
import MatchDetail from './pages/public/MatchDetail';
import Events from './pages/public/Events';
import EventDetail from './pages/public/EventDetail';
import About from './pages/public/About';
import StudentCouncil from './pages/public/StudentCouncil';
import AdminBlocker from './pages/public/AdminBlocker';
import EventManager from './pages/admin/EventManager';
import { Toaster } from 'react-hot-toast';
import './App.css';

import Dashboard from './pages/admin/Dashboard';

// Secret admin path — configured via environment variable
// In production, change this to a unique, hard-to-guess path
const ADMIN_SECRET_PATH = import.meta.env.VITE_ADMIN_SECRET_PATH || 'shashwatam-control-2026';

function App() {
  return (
    <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <Routes>
        {/* Public Routes — each wrapped in ErrorBoundary for crash isolation */}
        <Route path="/" element={<ErrorBoundary><Home /></ErrorBoundary>} />
        <Route path="/leaderboard" element={<ErrorBoundary><Leaderboard /></ErrorBoundary>} />
        <Route path="/match/:id" element={<ErrorBoundary><MatchDetail /></ErrorBoundary>} />
        <Route path="/matches/:id" element={<ErrorBoundary><MatchDetail /></ErrorBoundary>} />
        <Route path="/events" element={<ErrorBoundary><Events /></ErrorBoundary>} />
        <Route path="/events/:id" element={<ErrorBoundary><EventDetail /></ErrorBoundary>} />
        <Route path="/about" element={<ErrorBoundary><About /></ErrorBoundary>} />
        <Route path="/student-council" element={<ErrorBoundary><StudentCouncil /></ErrorBoundary>} />
        
        {/* Auth Routes — login is at the secret path */}
        <Route path={`/${ADMIN_SECRET_PATH}/login`} element={<Login />} />

        {/* ══════════════════════════════════════════════════════════
            HONEYPOT: /admin, /login, /auth/login → Blocker page
            Anyone trying obvious admin URLs gets the warning page.
           ══════════════════════════════════════════════════════════ */}
        <Route path="/admin" element={<AdminBlocker />} />
        <Route path="/admin/*" element={<AdminBlocker />} />
        <Route path="/auth/login" element={<AdminBlocker />} />
        <Route path="/login" element={<AdminBlocker />} />
        <Route path="/dashboard" element={<AdminBlocker />} />
        <Route path="/panel" element={<AdminBlocker />} />
        <Route path="/panel/*" element={<AdminBlocker />} />
        <Route path="/wp-admin" element={<AdminBlocker />} />
        <Route path="/wp-admin/*" element={<AdminBlocker />} />
        <Route path="/administrator" element={<AdminBlocker />} />
        <Route path="/administrator/*" element={<AdminBlocker />} />

        {/* ══════════════════════════════════════════════════════════
            REAL ADMIN — Protected by secret URL + JWT auth
            The actual admin panel lives at /${ADMIN_SECRET_PATH}
           ══════════════════════════════════════════════════════════ */}
        <Route element={<ProtectedRoute secretPath={ADMIN_SECRET_PATH} />}>
          <Route path={`/${ADMIN_SECRET_PATH}`} element={<AdminLayout secretPath={ADMIN_SECRET_PATH} />}>
            <Route index element={<Dashboard />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="departments" element={<Departments />} />
            <Route path="schedule" element={<ScheduleMatch />} />
            <Route path="live" element={<LiveConsole />} />
            <Route path="points" element={<AwardPoints />} />
            <Route path="leaderboard" element={<LeaderboardManagement />} />
            <Route path="seasons" element={<SeasonManagement />} />
            <Route path="scoring-presets" element={<ScoringPresets />} />
            <Route path="bracket-manager" element={<BracketManager />} />
            <Route path="users" element={<AdminManagement />} />
            <Route path="student-council" element={<StudentCouncilManagement />} />
            <Route path="events" element={<EventManager />} />
            <Route path="highlights" element={<HighlightManagement />} />
            <Route path="about" element={<AboutManagement />} />
            <Route path="*" element={<div className="text-[#fff8dc] p-4">Page not found</div>} />
          </Route>
        </Route>
      </Routes>
      <Toaster position="top-right" />
    </Router>
  );
}

export default App;
