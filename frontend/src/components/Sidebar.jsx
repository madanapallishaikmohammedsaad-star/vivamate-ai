import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Sparkles,
  BookOpen,
  FileText,
  Mic,
  User,
  Settings,
} from "lucide-react";

const links = [
  {
    name: "Dashboard",
    icon: LayoutDashboard,
    path: "/dashboard",
  },
  {
    name: "AI Answer",
    icon: Sparkles,
    path: "/ai-answer",
  },
  {
    name: "Subjects",
    icon: BookOpen,
    path: "/subjects",
  },
  {
    name: "Previous Papers",
    icon: FileText,
    path: "/papers",
  },
  {
    name: "AI Viva",
    icon: Mic,
    path: "/viva",
  },
  {
    name: "Profile",
    icon: User,
    path: "/profile",
  },
  {
    name: "Settings",
    icon: Settings,
    path: "/settings",
  },
];

export default function Sidebar() {
  return (
    <aside className="w-64 h-screen bg-white shadow-lg border-r p-6">
      <h1 className="text-3xl font-bold text-blue-600 mb-8">
        VivaMate AI
      </h1>

      <nav className="space-y-3">
        {links.map((item) => {
          const Icon = item.icon;

          return (
            <NavLink
              key={item.name}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3 p-3 rounded-xl transition-all duration-200 ${
                  isActive
                    ? "bg-blue-600 text-white shadow-md"
                    : "text-gray-700 hover:bg-gray-100"
                }`
              }
            >
              <Icon size={20} />
              <span>{item.name}</span>
            </NavLink>
          );
        })}
      </nav>
    </aside>
  );
}
