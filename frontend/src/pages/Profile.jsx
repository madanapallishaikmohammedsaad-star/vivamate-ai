import { useEffect, useState } from "react";
import { User, Brain, Clock, Flame, GraduationCap, BookOpen, Star, RefreshCw } from "lucide-react";

const defaultStats = {
  name: "Mohammed Saad",
  semester: "3rd Semester",
  branch: "Computer Science Engineering",
  university: "Ajman University",
  location: "Bangalore, Karnataka, India",
  cgpa: 0,
  studyHours: 0,
  dayStreak: 0,
  aiAnswers: 0,
};

const skills = [
  { name: "Python", progress: 80 },
  { name: "Web Development", progress: 25 },
  { name: "DSA", progress: 15 },
  { name: "AI / ML", progress: 20 },
];

const achievements = [
  { badge: "🐍", title: "Python Learner", desc: "Completed Python basics" },
  { badge: "🎯", title: "First AI Answer", desc: "Generated first AI response" },
  { badge: "📚", title: "VTU Explorer", desc: "Browsed VTU syllabus" },
  { badge: "🔥", title: "Streak Master", desc: "7+ day study streak" },
];

export default function Profile() {
  const [stats, setStats] = useState(defaultStats);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let active = true;

    async function load() {
      setLoading(true);
      setError("");

      try {
        const res = await fetch("/dashboard");
        if (!res.ok) throw new Error(`Request failed (${res.status})`);

        const data = await res.json();
        if (active) {
          setStats((previous) => ({
            ...previous,
            cgpa: Number(data.cgpa) || 0,
            studyHours: Number(data.studyHours) || 0,
            dayStreak: Number(data.dayStreak) || 0,
            aiAnswers: Number(data.aiAnswers) || 0,
          }));
        }
      } catch (err) {
        if (active) setError(err.message || "Unable to load profile statistics.");
      } finally {
        if (active) setLoading(false);
      }
    }

    load();
    return () => {
      active = false;
    };
  }, [reloadKey]);

  const statCards = [
    { label: "Day Streak", value: stats.dayStreak, icon: Flame, color: "text-orange-500", bg: "bg-orange-100" },
    { label: "Study Hours", value: stats.studyHours, icon: Clock, color: "text-blue-500", bg: "bg-blue-100" },
    { label: "AI Answers", value: stats.aiAnswers, icon: Brain, color: "text-purple-500", bg: "bg-purple-100" },
    { label: "CGPA", value: stats.cgpa, icon: GraduationCap, color: "text-green-500", bg: "bg-green-100" },
  ];

  return (
    <div className="min-w-0 p-4 sm:p-6 lg:p-8">
      <h1 className="mb-6 text-2xl font-bold sm:text-3xl">👤 Profile</h1>

      <section className="mb-8 rounded-3xl bg-gradient-to-r from-blue-600 to-indigo-600 p-5 text-white sm:p-8">
        <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:gap-6">
          <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-white/20 sm:h-24 sm:w-24">
            <User size={42} />
          </div>
          <div className="min-w-0">
            <h2 className="break-words text-2xl font-bold sm:text-3xl">{stats.name}</h2>
            <p className="mt-1 break-words text-blue-100">{stats.branch}</p>
            <p className="break-words text-blue-100">{stats.semester} · {stats.university}</p>
            <p className="mt-1 break-words text-sm text-blue-200">📍 {stats.location}</p>
          </div>
        </div>
      </section>

      {error && (
        <div className="mb-6 flex flex-col gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-red-700 sm:flex-row sm:items-center sm:justify-between" role="alert">
          <p>{error}</p>
          <button type="button" onClick={() => setReloadKey((value) => value + 1)} className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-red-600 px-4 py-2 font-medium text-white hover:bg-red-700">
            <RefreshCw size={16} /> Try again
          </button>
        </div>
      )}

      <div className="mb-8 grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-4">
        {statCards.map(({ label, value, icon: Icon, color, bg }) => (
          <div key={label} className="rounded-2xl bg-white p-4 text-center shadow sm:p-6">
            <div className={`mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl sm:mb-4 sm:h-14 sm:w-14 ${bg}`}>
              <Icon className={color} size={26} />
            </div>
            <h3 className="text-2xl font-bold sm:text-3xl">{loading ? "—" : value}</h3>
            <p className="mt-1 text-sm text-gray-500 sm:text-base">{label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 lg:gap-8">
        <section className="rounded-2xl bg-white p-5 shadow sm:p-6">
          <h3 className="mb-4 flex items-center gap-2 text-lg font-bold">
            <BookOpen size={20} className="text-blue-600" /> Learning Progress
          </h3>
          <div className="space-y-4">
            {skills.map((skill) => (
              <div key={skill.name}>
                <div className="mb-1 flex justify-between text-sm">
                  <span className="font-medium">{skill.name}</span>
                  <span className="text-gray-500">{skill.progress}%</span>
                </div>
                <div className="h-2 rounded-full bg-gray-200" aria-label={`${skill.name}: ${skill.progress}%`} role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow={skill.progress}>
                  <div className="h-2 rounded-full bg-blue-600" style={{ width: `${skill.progress}%` }} />
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-2xl bg-white p-5 shadow sm:p-6">
          <h3 className="mb-4 flex items-center gap-2 text-lg font-bold">
            <Star size={20} className="text-yellow-500" /> Achievements
          </h3>
          <div className="space-y-3">
            {achievements.map((achievement) => (
              <div key={achievement.title} className="flex items-center gap-3 rounded-xl bg-gray-50 p-3">
                <span className="text-2xl" aria-hidden="true">{achievement.badge}</span>
                <div className="min-w-0">
                  <p className="font-semibold">{achievement.title}</p>
                  <p className="text-sm text-gray-500">{achievement.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
