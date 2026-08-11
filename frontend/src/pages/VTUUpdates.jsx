import { useState, useEffect } from "react";
import { Bell, Clock, FileText, ExternalLink } from "lucide-react";

export default function VTUUpdates() {
  const [notices, setNotices] = useState([]);
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const url = filter === "all" ? "/api/notices" : `/api/notices?subcategory=${filter}`;
        const res = await fetch(url);
        const data = await res.json();
        setNotices(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error(err);
        setNotices([]);
      } finally { setLoading(false); }
    }
    load();
  }, [filter]);

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-2">📢 VTU Updates</h1>
      <p className="text-gray-500 mb-6">Official VTU circulars, timetables, and notices — live from vtu.ac.in</p>

      <div className="flex gap-3 mb-6">
        {[
          { key: "all", label: "All", icon: Bell },
          { key: "timetable", label: "Timetables", icon: Clock },
          { key: "circular", label: "Circulars", icon: FileText },
        ].map(({ key, label, icon: Icon }) => (
          <button key={key} onClick={() => setFilter(key)}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium transition ${filter === key ? "bg-blue-600 text-white" : "bg-white text-gray-600 shadow hover:bg-gray-50"}`}>
            <Icon size={16} /> {label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="bg-white rounded-3xl shadow p-16 text-center">
          <div className="text-4xl animate-pulse">📢</div>
          <p className="text-gray-500 mt-4">Loading VTU updates...</p>
        </div>
      ) : notices.length === 0 ? (
        <div className="bg-white rounded-3xl shadow p-16 text-center">
          <Bell className="mx-auto text-gray-300" size={64} />
          <h2 className="text-2xl font-bold mt-4 text-gray-400">No updates found</h2>
        </div>
      ) : (
        <div className="space-y-3">
          {notices.map((notice, i) => (
            <a key={i} href={notice.url} target="_blank" rel="noreferrer"
              className="bg-white rounded-2xl shadow p-5 hover:shadow-lg transition flex items-center justify-between gap-4 block">
              <div className="flex items-start gap-4 min-w-0">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                  notice.subcategory === "timetable" ? "bg-orange-100 text-orange-600" :
                  notice.subcategory === "circular" ? "bg-blue-100 text-blue-600" :
                  "bg-gray-100 text-gray-600"
                }`}>
                  {notice.subcategory === "timetable" ? <Clock size={18} /> : <FileText size={18} />}
                </div>
                <div className="min-w-0">
                  <h3 className="font-semibold truncate">{notice.title}</h3>
                  <span className={`text-xs px-2 py-0.5 rounded mt-1 inline-block ${
                    notice.subcategory === "timetable" ? "bg-orange-50 text-orange-700" :
                    notice.subcategory === "circular" ? "bg-blue-50 text-blue-700" :
                    "bg-gray-50 text-gray-600"
                  }`}>{notice.subcategory || notice.category}</span>
                </div>
              </div>
              <ExternalLink size={16} className="text-gray-400 shrink-0" />
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
