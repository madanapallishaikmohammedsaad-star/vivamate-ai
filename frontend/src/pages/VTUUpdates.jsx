import { useState, useEffect } from "react";
import { Bell, Clock, FileText, ExternalLink, RefreshCw } from "lucide-react";

const filters = [
  { key: "all", label: "All", icon: Bell },
  { key: "timetable", label: "Timetables", icon: Clock },
  { key: "circular", label: "Circulars", icon: FileText },
];

export default function VTUUpdates() {
  const [notices, setNotices] = useState([]);
  const [filter, setFilter] = useState("all");
  const [reloadKey, setReloadKey] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    async function load() {
      setLoading(true);
      setError("");

      try {
        const url = filter === "all" ? "/api/notices" : `/api/notices?subcategory=${filter}`;
        const res = await fetch(url);
        if (!res.ok) throw new Error(`Request failed (${res.status})`);

        const data = await res.json();
        if (active) setNotices(Array.isArray(data) ? data : []);
      } catch (err) {
        if (active) {
          setNotices([]);
          setError(err.message || "Unable to load VTU updates. Please try again.");
        }
      } finally {
        if (active) setLoading(false);
      }
    }

    load();
    return () => {
      active = false;
    };
  }, [filter, reloadKey]);

  return (
    <div className="p-4 sm:p-6 lg:p-8 min-w-0">
      <h1 className="text-2xl sm:text-3xl font-bold mb-2">📢 VTU Updates</h1>
      <p className="text-gray-500 mb-6">
        Official VTU circulars, timetables, and notices — live from vtu.ac.in
      </p>

      <div className="flex flex-wrap gap-2 sm:gap-3 mb-6" aria-label="Filter updates">
        {filters.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            type="button"
            onClick={() => setFilter(key)}
            aria-pressed={filter === key}
            className={`flex items-center gap-2 px-4 sm:px-5 py-2.5 rounded-xl font-medium transition ${
              filter === key
                ? "bg-blue-600 text-white"
                : "bg-white text-gray-600 shadow hover:bg-gray-50"
            }`}
          >
            <Icon size={16} />
            {label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="bg-white rounded-3xl shadow p-8 sm:p-16 text-center" role="status">
          <div className="text-4xl animate-pulse">📢</div>
          <p className="text-gray-500 mt-4">Loading VTU updates...</p>
        </div>
      ) : error ? (
        <div className="bg-white rounded-3xl shadow p-8 sm:p-16 text-center" role="alert">
          <Bell className="mx-auto text-red-300" size={56} />
          <h2 className="text-xl sm:text-2xl font-bold mt-4 text-gray-700">Couldn’t load updates</h2>
          <p className="text-gray-500 mt-2">{error}</p>
          <button
            type="button"
            onClick={() => setReloadKey((value) => value + 1)}
            className="mt-5 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 font-medium text-white hover:bg-blue-700"
          >
            <RefreshCw size={16} />
            Try again
          </button>
        </div>
      ) : notices.length === 0 ? (
        <div className="bg-white rounded-3xl shadow p-8 sm:p-16 text-center">
          <Bell className="mx-auto text-gray-300" size={64} />
          <h2 className="text-xl sm:text-2xl font-bold mt-4 text-gray-500">No updates found</h2>
          <p className="text-gray-400 mt-2">Try another category or check again later.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {notices.map((notice, index) => {
            const title = notice.title || notice.name || "Untitled VTU notice";
            const url = typeof notice.url === "string" ? notice.url : "";
            const category = notice.subcategory || notice.category || "Notice";

            return (
              <div
                key={notice.id || notice.url || `${title}-${index}`}
                className="bg-white rounded-2xl shadow p-4 sm:p-5 flex items-center justify-between gap-4"
              >
                <div className="flex items-start gap-3 sm:gap-4 min-w-0">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                      notice.subcategory === "timetable"
                        ? "bg-orange-100 text-orange-600"
                        : notice.subcategory === "circular"
                          ? "bg-blue-100 text-blue-600"
                          : "bg-gray-100 text-gray-600"
                    }`}
                  >
                    {notice.subcategory === "timetable" ? <Clock size={18} /> : <FileText size={18} />}
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-semibold break-words">{title}</h3>
                    <span className="text-xs px-2 py-0.5 rounded mt-1 inline-block bg-gray-100 text-gray-600">
                      {category}
                    </span>
                  </div>
                </div>
                {url ? (
                  <a
                    href={url}
                    target="_blank"
                    rel="noreferrer"
                    aria-label={`Open ${title}`}
                    className="text-blue-600 hover:text-blue-800 shrink-0"
                  >
                    <ExternalLink size={18} />
                  </a>
                ) : (
                  <span className="text-xs text-gray-400 shrink-0">No link</span>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
