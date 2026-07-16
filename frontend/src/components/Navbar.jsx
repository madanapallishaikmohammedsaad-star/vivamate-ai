export default function Navbar() {
  return (
    <header className="bg-white border-b shadow-sm px-8 py-4 flex items-center justify-between">
      {/* Search */}
      <div className="flex-1 max-w-xl">
        <input
          type="text"
          placeholder="Search for subjects, topics or papers..."
          className="w-full rounded-full border border-gray-300 px-5 py-3 outline-none focus:border-blue-500"
        />
      </div>

      {/* Right Side */}
      <div className="flex items-center gap-6">
        <button className="text-2xl">🔔</button>

        <button className="text-2xl">❓</button>

        <div className="flex items-center gap-3">
          <img
            src="https://i.pravatar.cc/150?img=8"
            alt="profile"
            className="w-10 h-10 rounded-full"
          />

          <div>
            <h3 className="font-semibold">Saad</h3>
            <p className="text-xs text-gray-500">Computer Science</p>
          </div>
        </div>
      </div>
    </header>
  );
}
