import { Routes, Route, Navigate } from "react-router-dom";

import Dashboard from "./pages/Dashboard";
import AIAnswer from "./pages/AIAnswer";
import Subjects from "./pages/Subjects";
import PreviousPapers from "./pages/PreviousPapers";
import Viva from "./pages/Viva";
import Profile from "./pages/Profile";
import Settings from "./pages/Settings";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/ai-answer" element={<AIAnswer />} />
      <Route path="/subjects" element={<Subjects />} />
      <Route path="/papers" element={<PreviousPapers />} />
      <Route path="/viva" element={<Viva />} />
      <Route path="/profile" element={<Profile />} />
      <Route path="/settings" element={<Settings />} />
    </Routes>
  );
}

export default App;
