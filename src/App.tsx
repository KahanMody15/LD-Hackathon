import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import LandingPage from "@/pages/LandingPage";
import Dashboard from "@/pages/Dashboard";
import AuthPage from "@/pages/AuthPage";
import PublicDashboard from "@/pages/PublicDashboard";
import SarpanchDashboard from "@/pages/SarpanchDashboard";
import InspectorDashboard from "@/pages/InspectorDashboard";
import { getSession } from "@/backend/authStore";
import type { ReactNode } from "react";

function ProtectedRoute({ children, roles }: { children: ReactNode; roles?: string[] }) {
  const session = getSession();
  if (!session) return <Navigate to="/auth" replace />;
  if (roles && !roles.includes(session.role)) return <Navigate to="/auth" replace />;
  return <>{children}</>;
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/auth" element={<AuthPage />} />
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        } />
        <Route path="/public-dashboard" element={
          <ProtectedRoute roles={["Resident"]}>
            <PublicDashboard />
          </ProtectedRoute>
        } />
        <Route path="/sarpanch-dashboard" element={
          <ProtectedRoute roles={["Sarpanch"]}>
            <SarpanchDashboard />
          </ProtectedRoute>
        } />
        <Route path="/inspector-dashboard" element={
          <ProtectedRoute roles={["Inspector"]}>
            <InspectorDashboard />
          </ProtectedRoute>
        } />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
