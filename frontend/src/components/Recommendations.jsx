import { Lightbulb, ArrowRight } from "lucide-react";

const recommendations = [
  {
    emoji: "📘",
    title: "Revise Data Structures",
    reason: "Your last quiz score was 60%",
    action: "Practice linked lists and trees",
  },
  {
    emoji: "🤖",
    title: "Practice Java Viva",
    reason: "Viva exam approaching",
    action: "Start mock viva session",
  },
  {
    emoji: "📝",
    title: "Solve DBMS Previous Papers",
    reason: "3 papers available",
    action: "Attempt 2025 model paper",
  },
  {
    emoji: "🎯",
    title: "Target 8.5 CGPA",
    reason: "You're currently at 8.4",
    action: "Study 2 hours daily this week",
  },
];

export default function Recommendations() {
  return (
    <section className="bg-white rounded-3xl shadow p-6">
      <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
        <Lightbulb className="text-yellow-500" size={20} />
        AI Recommendations
      </h2>
      <ul className="space-y-3">
        {recommendations.map((item, i) => (
          <li key={i} className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl hover:bg-blue-50 transition cursor-pointer">
            <span className="text-xl mt-0.5">{item.emoji}</span>
            <div className="flex-1">
              <p className="font-semibold text-sm">{item.title}</p>
              <p className="text-gray-500 text-xs">{item.reason}</p>
            </div>
            <ArrowRight size={16} className="text-gray-300 mt-1" />
          </li>
        ))}
      </ul>
    </section>
  );
}
