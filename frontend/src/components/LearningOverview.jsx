import { Flame, Clock3, Brain, GraduationCap } from "lucide-react";

export default function LearningOverview() {
  const stats = [
    {
      title: "Day Streak",
      value: "14",
      icon: Flame,
      color: "text-orange-500",
    },
    {
      title: "Hours Studied",
      value: "32",
      icon: Clock3,
      color: "text-blue-500",
    },
    {
      title: "AI Answers",
      value: "185",
      icon: Brain,
      color: "text-purple-500",
    },
    {
      title: "Estimated CGPA",
      value: "8.4",
      icon: GraduationCap,
      color: "text-green-500",
    },
  ];

  return (
    <section className="bg-white rounded-3xl shadow p-8">
      <h2 className="text-2xl font-bold mb-8">
        Learning Overview
      </h2>

      <div className="flex justify-center mb-10">
        <div className="relative w-44 h-44 rounded-full border-[12px] border-blue-600 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-5xl font-bold">72%</h1>
            <p className="text-gray-500">
              Weekly Goal
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-5">
        {stats.map((item, index) => {
          const Icon = item.icon;

          return (
            <div
              key={index}
              className="bg-gray-100 rounded-2xl p-5 text-center"
            >
              <Icon
                className={`mx-auto mb-3 ${item.color}`}
                size={30}
              />

              <h2 className="text-3xl font-bold">
                {item.value}
              </h2>

              <p className="text-gray-500">
                {item.title}
              </p>
            </div>
          );
        })}
      </div>
    </section>
  );
}
