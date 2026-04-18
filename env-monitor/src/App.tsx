import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LandingPage from "@/pages/LandingPage";
import Dashboard from "@/pages/Dashboard";
import AuthPage from "@/pages/AuthPage";
import PublicDashboard from "@/pages/PublicDashboard";
import SarpanchDashboard from "@/pages/SarpanchDashboard";
import InspectorDashboard from "@/pages/InspectorDashboard";

import { FloatingChatbot } from "@/components/chat/FloatingChatbot";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/auth" element={<AuthPage />} />
        <Route path="/public-dashboard" element={<PublicDashboard />} />
        <Route path="/sarpanch-dashboard" element={<SarpanchDashboard />} />
        <Route path="/inspector-dashboard" element={<InspectorDashboard />} />
      </Routes>
      <FloatingChatbot />
    </Router>
  );
}

export default App;
