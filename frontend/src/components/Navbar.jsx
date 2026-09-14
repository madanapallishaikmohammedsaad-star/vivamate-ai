import { Bell, Search } from "lucide-react";

export default function Navbar() {
  return (
    <header className="flex min-h-16 flex-wrap items-center justify-between gap-3 border-b bg-white px-4 py-3 shadow-sm sm:px-6 lg:px-8">
      <div className="min-w-0 flex-1 sm:max-w-md">
        <label htmlFor="global-search" className="sr-only">
          Search VivaMate
        </label>
        <div className="flex items-center gap-3 rounded-xl bg-gray-100 px-3 py-2 sm:px-4">
          <Search size={18} className="shrink-0 text-gray-500" aria-hidden="true" />
          <input
            id="global-search"
            type="search"
            placeholder="Search subjects, notes, papers..."
            className="w-full min-w-0 bg-transparent text-sm outline-none"
          />
        </div>
      </div>

      <div className="flex items-center gap-3 sm:gap-5">
        <button
          type="button"
          aria-label="Notifications"
          className="rounded-lg p-2 text-gray-600 transition hover:bg-gray-100 hover:text-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <Bell size={22} aria-hidden="true" />
        </button>

        <div className="flex items-center gap-2 sm:gap-3">
          <img
            src="https://i.pravatar.cc/150?img=12"
            alt="Saad profile"
            className="h-9 w-9 rounded-full sm:h-10 sm:w-10"
          />
          <div className="hidden sm:block">
            <h3 className="font-semibold text-gray-900">Saad</h3>
            <p className="text-sm text-gray-500">CSE Student</p>
          </div>
        </div>
      </div>
    </header>
  );
}
