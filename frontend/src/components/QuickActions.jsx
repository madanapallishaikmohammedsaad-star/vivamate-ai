import {
  Sparkles,
  BookOpen,
  FileText,
  Mic,
  Notebook,
  Calculator,
} from "lucide-react";

const actions = [
  {
    title: "AI Answer Generator",
    desc: "Generate answers instantly",
    icon: Sparkles,
    color: "bg-blue-100 text-blue-600",
  },
  {
    title: "Subjects",
    desc: "Browse VTU syllabus",
    icon: BookOpen,
    color: "bg-purple-100 text-purple-600",
  },
  {
    title: "Previous Papers",
    desc: "5 Years Question Papers",
    icon: FileText,
    color: "bg-green-100 text-green-600",
  },
  {
    title: "AI Viva",
    desc: "Practice Viva Questions",
    icon: Mic,
    color: "bg-orange-100 text-orange-600",
  },
  {
    title: "Smart Notes",
    desc: "AI Generated Notes",
    icon: Notebook,
    color: "bg-pink-100 text-pink-600",
  },
  {
    title: "CGPA Calculator",
    desc: "Calculate Semester CGPA",
    icon: Calculator,
    color: "bg-cyan-100 text-cyan-600",
  },
];

export default function QuickActions() {
  return (
    <section>
      <h2 className="text-3xl font-bold mb-6">Quick Actions</h2>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {actions.map((item, index) => {
          const Icon = item.icon;

          return (
            <div
              key={index}
              className="bg-white rounded-2xl p-6 shadow hover:shadow-xl transition cursor-pointer hover:-translate-y-1"
            >
              <div
                className={`w-14 h-14 rounded-xl flex items-center justify-center ${item.color}`}
              >
                <Icon size={28} />
              </div>

              <h3 className="font-bold text-xl mt-5">
                {item.title}
              </h3>

              <p className="text-gray-500 mt-2">
                {item.desc}
              </p>
            </div>
          );
        })}
      </div>
    </section>
  );
}
