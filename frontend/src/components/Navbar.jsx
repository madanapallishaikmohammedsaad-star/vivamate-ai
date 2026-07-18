import { Bell, Search } from "lucide-react";

export default function Navbar() {
  return (
    <header className="h-16 bg-white shadow-sm border-b flex items-center justify-between px-8">
      {/* Search */}
      <div className="flex items-center gap-3 bg-gray-100 px-4 py-2 rounded-xl w-[400px]">
        <Search size={18} className="text-gray-500" />
        <input
          type="text"
          placeholder="Search subjects, notes, papers..."
          className="bg-transparent outline-none w-full"
        />
      </div>

      {/* Right Side */}
      <div className="flex items-center gap-5">
        <Bell
          className="cursor-pointer hover:text-blue-600 transition"
          size={22}
        />

        <div className="flex items-center gap-3">
          <img
            src="https://i.pravatar.cc/150?img=12"
            alt="profile"
            className="w-10 h-10 rounded-full"
          />

          <div>
            <h3 className="font-semibold">Saad</h3>
            <p className="text-sm text-gray-500">CSE Student</p>
          </div>
        </div>
      </div>
    </header>
  );
}
