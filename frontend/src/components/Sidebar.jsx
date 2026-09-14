import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Sparkles,
  BookOpen,
  FileText,
  Mic,
  Brain,
  StickyNote,
  Bell,
  User,
  Settings,
} from "lucide-react";

const links = [
  { name: "Dashboard", icon: LayoutDashboard, path: "/dashboard" },
  { name: "AI Answer", icon: Sparkles, path: "/ai-answer" },
  { name: "Subjects", icon: BookOpen, path: "/subjects" },
  { name: "Previous Papers", icon: FileText, path: "/papers" },
  { name: "VTU Updates", icon: Bell, path: "/updates" },
  { name: "AI Viva", icon: Mic, path: "/viva" },
  { name: "Quiz", icon: Brain, path: "/quiz" },
  { name: "Notes", icon: StickyNote, path: "/notes" },
  { name: "Profile", icon: User, path: "/profile" },
  { name: "Settings", icon: Settings, path: "/settings" },
];

export default function Sidebar() {
  return (
    <aside className="hidden min-h-screen w-56 shrink-0 border-r bg-white p-4 shadow-sm md:block lg:w-64 lg:p-6">
      <div className="mb-8 px-2">
        <h1 className="text-2xl font-bold tracking-tight text-blue-600 lg:text-3xl">
          VivaMate AI
        </h1>
        <p className="mt-1 text-xs text-gray-500">Your smart study companion</p>
      </div>

      <nav aria-label="Primary navigation" className="space-y-1">
        {links.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              aria-label={item.name}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 ${
                  isActive
                    ? "bg-blue-600 text-white shadow-sm"
                    : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                }`
              }
            >
              <Icon size={19} aria-hidden="true" />
              <span className="truncate">{item.name}</span>
            </NavLink>
          );
        })}
      </nav>
    </aside>
  );
}
