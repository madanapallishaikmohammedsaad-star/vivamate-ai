import { NavLink } from "react-router-dom";

const menuItems = [
  { name: "Dashboard", path: "/dashboard" },
  { name: "AI Answer Generator", path: "/ai-answer" },
  { name: "Subjects", path: "/subjects" },
  { name: "Previous Papers", path: "/papers" },
  { name: "AI Viva", path: "/viva" },
  { name: "Profile", path: "/profile" },
  { name: "Settings", path: "/settings" },
];

export default function Sidebar() {
  return (
    <aside className="w-64 h-screen bg-white border-r shadow-sm p-6">
      <h1 className="text-3xl font-bold text-blue-600">
        VivaMate AI
      </h1>

      <p className="text-sm text-gray-500 mb-8">
        Premium Student Hub
      </p>

      <nav className="space-y-2">
        {menuItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `block rounded-lg px-4 py-3 transition ${
                isActive
                  ? "bg-blue-600 text-white"
                  : "hover:bg-gray-100"
              }`
            }
          >
            {item.name}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
