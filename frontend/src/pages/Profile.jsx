import { useEffect, useState } from "react";
import { User, Brain, Clock, Flame, GraduationCap, BookOpen, Star } from "lucide-react";

export default function Profile() {
  const [stats, setStats] = useState({
    name: "Mohammed Saad",
    semester: "3rd Semester",
    branch: "Computer Science Engineering",
    university: "Ajman University",
    location: "Bangalore, Karnataka, India",
    cgpa: 0,
    studyHours: 0,
    dayStreak: 0,
    aiAnswers: 0,
  });

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/dashboard");
        if (res.ok) {
          const data = await res.json();
          setStats((prev) => ({
            ...prev,
            cgpa: data.cgpa || 0,
            studyHours: data.studyHours || 0,
            dayStreak: data.dayStreak || 0,
            aiAnswers: data.aiAnswers || 0,
          }));
        }
      } catch (err) {
        console.error(err);
      }
    }
    load();
  }, []);

  const statCards = [
    { label: "Day Streak", value: stats.dayStreak, icon: Flame, color: "text-orange-500", bg: "bg-orange-100" },
    { label: "Study Hours", value: stats.studyHours, icon: Clock, color: "text-blue-500", bg: "bg-blue-100" },
    { label: "AI Answers", value: stats.aiAnswers, icon: Brain, color: "text-purple-500", bg: "bg-purple-100" },
    { label: "CGPA", value: stats.cgpa, icon: GraduationCap, color: "text-green-500", bg: "bg-green-100" },
  ];

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6">👤 Profile</h1>

      {/* Profile Card */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-3xl p-8 text-white mb-8">
        <div className="flex items-center gap-6">
          <div className="w-24 h-24 bg-white/20 rounded-full flex items-center justify-center">
            <User size={48} />
          </div>
          <div>
            <h2 className="text-3xl font-bold">{stats.name}</h2>
            <p className="text-blue-100 mt-1">{stats.branch}</p>
            <p className="text-blue-100">{stats.semester} · {stats.university}</p>
            <p className="text-blue-200 text-sm mt-1">📍 {stats.location}</p>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-4 gap-6 mb-8">
        {statCards.map((item, index) => {
          const Icon = item.icon;
          return (
            <div key={index} className="bg-white rounded-2xl shadow p-6 text-center">
              <div className={`w-14 h-14 ${item.bg} rounded-xl flex items-center justify-center mx-auto mb-4`}>
                <Icon className={item.color} size={28} />
              </div>
              <h3 className="text-3xl font-bold">{item.value}</h3>
              <p className="text-gray-500 mt-1">{item.label}</p>
            </div>
          );
        })}
      </div>

      {/* Progress */}
      <div className="grid grid-cols-2 gap-8">
        <div className="bg-white rounded-2xl shadow p-6">
          <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
            <BookOpen size={20} className="text-blue-600" />
            Learning Progress
          </h3>
          <div className="space-y-4">
            {[
              { name: "Python", progress: 80 },
              { name: "Web Development", progress: 25 },
              { name: "DSA", progress: 15 },
              { name: "AI / ML", progress: 20 },
            ].map((skill, i) => (
              <div key={i}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="font-medium">{skill.name}</span>
                  <span className="text-gray-500">{skill.progress}%</span>
                </div>
                <div className="bg-gray-200 rounded-full h-2">
                  <div className="bg-blue-600 h-2 rounded-full" style={{ width: `${skill.progress}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow p-6">
          <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
            <Star size={20} className="text-yellow-500" />
            Achievements
          </h3>
          <div className="space-y-3">
            {[
              { badge: "🐍", title: "Python Learner", desc: "Completed Python basics" },
              { badge: "🎯", title: "First AI Answer", desc: "Generated first AI response" },
              { badge: "📚", title: "VTU Explorer", desc: "Browsed VTU syllabus" },
              { badge: "🔥", title: "Streak Master", desc: "7+ day study streak" },
            ].map((achievement, i) => (
              <div key={i} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                <span className="text-2xl">{achievement.badge}</span>
                <div>
                  <p className="font-semibold">{achievement.title}</p>
                  <p className="text-gray-500 text-sm">{achievement.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
