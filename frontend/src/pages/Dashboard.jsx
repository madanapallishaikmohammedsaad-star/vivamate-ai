import { useEffect, useState } from "react";
import { getDashboard } from "../services/dashboard";

import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import Hero from "../components/Hero";
import QuickActions from "../components/QuickActions";
import StudyPlan from "../components/StudyPlan";
import RecentActivity from "../components/RecentActivity";
import LearningOverview from "../components/LearningOverview";
import RightPanel from "../components/RightPanel";

export default function Dashboard() {

  const [dashboard, setDashboard] = useState(null);

  useEffect(() => {
    async function loadDashboard() {
      const data = await getDashboard();
      setDashboard(data);
    }

    loadDashboard();
  }, []);

  if (!dashboard) {
    return (
      <h1 className="text-3xl p-10">
        Loading VivaMate...
      </h1>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-100">

      <Sidebar />

      <div className="flex-1">

        <Navbar />

        <main className="p-8">

          <Hero />

          <div className="my-8 bg-blue-600 text-white rounded-2xl p-6 shadow">

            <h2 className="text-3xl font-bold">
              Welcome {dashboard.student}
            </h2>

            <p className="mt-2">
              {dashboard.semester}
            </p>

            <div className="mt-4 flex gap-8">

              <div>
                <h3 className="text-xl font-bold">
                  {dashboard.cgpa}
                </h3>
                <p>CGPA</p>
              </div>

              <div>
                <h3 className="text-xl font-bold">
                  {dashboard.studyHours}
                </h3>
                <p>Hours</p>
              </div>

              <div>
                <h3 className="text-xl font-bold">
                  {dashboard.dayStreak}
                </h3>
                <p>Streak</p>
              </div>

              <div>
                <h3 className="text-xl font-bold">
                  {dashboard.aiAnswers}
                </h3>
                <p>AI Answers</p>
              </div>

            </div>

          </div>

          <div className="grid grid-cols-3 gap-8">

            <div className="col-span-2 space-y-8">

              <QuickActions />

              <StudyPlan />

              <RecentActivity />

            </div>

            <div className="space-y-8">

              <LearningOverview />

              <RightPanel />

            </div>

          </div>

        </main>

      </div>

    </div>
  );
}
