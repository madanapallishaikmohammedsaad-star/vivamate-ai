import { useEffect, useState } from "react";
import { RefreshCw } from "lucide-react";
import { getDashboard } from "../services/dashboard";

import Hero from "../components/Hero";
import QuickActions from "../components/QuickActions";
import StudyPlan from "../components/StudyPlan";
import RecentActivity from "../components/RecentActivity";
import LearningOverview from "../components/LearningOverview";
import RightPanel from "../components/RightPanel";

export default function Dashboard() {
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadDashboard() {
    setLoading(true);
    setError("");
    try {
      const data = await getDashboard();
      setDashboard(data);
    } catch (err) {
      console.error(err);
      setError("We couldn't load your dashboard. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadDashboard(); }, []);

  if (loading) return <div className="p-6 sm:p-10 text-xl font-semibold">Loading VivaMate...</div>;

  if (error) {
    return (
      <div className="p-6 sm:p-10">
        <div className="max-w-xl rounded-2xl border border-red-200 bg-red-50 p-6 text-red-800">
          <h1 className="text-xl font-bold">Dashboard unavailable</h1>
          <p className="mt-2">{error}</p>
          <button onClick={loadDashboard} className="mt-4 inline-flex items-center gap-2 rounded-xl bg-red-600 px-4 py-2 font-semibold text-white hover:bg-red-700">
            <RefreshCw size={16} /> Try again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <Hero />
      <section className="rounded-2xl bg-blue-600 p-5 text-white shadow sm:p-6">
        <h2 className="text-2xl font-bold sm:text-3xl">Welcome {dashboard.student}</h2>
        <p className="mt-2">{dashboard.semester}</p>
        <div className="mt-5 grid grid-cols-2 gap-5 sm:grid-cols-4 sm:gap-8">
          <div><h3 className="text-xl font-bold">{dashboard.cgpa}</h3><p>CGPA</p></div>
          <div><h3 className="text-xl font-bold">{dashboard.studyHours}</h3><p>Hours</p></div>
          <div><h3 className="text-xl font-bold">{dashboard.dayStreak}</h3><p>Streak</p></div>
          <div><h3 className="text-xl font-bold">{dashboard.aiAnswers}</h3><p>AI Answers</p></div>
        </div>
      </section>
      <div className="grid grid-cols-1 gap-8 xl:grid-cols-3">
        <div className="min-w-0 space-y-8 xl:col-span-2">
          <QuickActions />
          <StudyPlan />
          <RecentActivity />
        </div>
        <div className="min-w-0 space-y-8">
          <LearningOverview />
          <RightPanel />
        </div>
      </div>
    </div>
  );
}
