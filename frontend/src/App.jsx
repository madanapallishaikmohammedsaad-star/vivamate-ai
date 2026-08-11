import { Routes, Route, Navigate } from "react-router-dom";
import Layout from "./components/Layout";

import Dashboard from "./pages/Dashboard";
import AIAnswer from "./pages/AIAnswer";
import Subjects from "./pages/Subjects";
import PreviousPapers from "./pages/PreviousPapers";
import Viva from "./pages/Viva";
import Quiz from "./pages/Quiz";
import Notes from "./pages/Notes";
import VTUUpdates from "./pages/VTUUpdates";
import Profile from "./pages/Profile";
import Settings from "./pages/Settings";

function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/ai-answer" element={<AIAnswer />} />
        <Route path="/subjects" element={<Subjects />} />
        <Route path="/papers" element={<PreviousPapers />} />
        <Route path="/viva" element={<Viva />} />
        <Route path="/quiz" element={<Quiz />} />
        <Route path="/notes" element={<Notes />} />
        <Route path="/updates" element={<VTUUpdates />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/settings" element={<Settings />} />
      </Route>
    </Routes>
  );
}

export default App;
