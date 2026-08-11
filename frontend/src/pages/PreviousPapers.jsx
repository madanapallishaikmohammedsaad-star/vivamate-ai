import { useState } from "react";
import { FileText, Download, Search, Filter } from "lucide-react";

export default function PreviousPapers() {
  const [query, setQuery] = useState("");
  const [branch, setBranch] = useState("");
  const [papers, setPapers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const branches = ["CSE", "ECE", "EEE", "ME", "CE", "ISE", "AIML"];

  async function searchPapers() {
    setLoading(true);
    setSearched(true);
    try {
      const params = new URLSearchParams();
      if (query.trim()) params.append("query", query.trim());
      if (branch) params.append("branch", branch);
      const res = await fetch(`/api/papers/search?${params}`);
      const data = await res.json();
      setPapers(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      setPapers([]);
    } finally {
      setLoading(false);
    }
  }

  async function loadRecent() {
    setLoading(true);
    setSearched(true);
    setQuery(""); setBranch("");
    try {
      const res = await fetch("/api/papers/recent?limit=30");
      const data = await res.json();
      setPapers(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      setPapers([]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-2">📄 Previous Year Papers</h1>
      <p className="text-gray-500 mb-6">Official VTU question papers — scraped live from vtu.ac.in</p>

      {/* Search */}
      <div className="bg-white rounded-2xl shadow p-6 mb-6">
        <div className="flex gap-4 mb-4">
          <div className="flex-1 flex items-center gap-3 border rounded-xl px-4 py-3">
            <Search size={18} className="text-gray-400" />
            <input
              type="text" value={query} onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && searchPapers()}
              placeholder="Search by course code (e.g. BCS301) or subject name..."
              className="flex-1 outline-none"
            />
          </div>
          <button onClick={searchPapers} disabled={loading}
            className="bg-blue-600 text-white px-8 py-3 rounded-xl font-semibold hover:bg-blue-700 transition disabled:opacity-50">
            {loading ? "Searching..." : "Search"}
          </button>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Filter size={14} className="text-gray-500" />
            <span className="text-sm text-gray-500">Filter by branch:</span>
          </div>
          {branches.map((b) => (
            <button key={b} onClick={() => { setBranch(branch === b ? "" : b); }}
              className={`px-3 py-1 rounded-lg text-sm font-medium transition ${branch === b ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}>
              {b}
            </button>
          ))}
          <button onClick={loadRecent} className="ml-auto text-blue-600 text-sm font-medium hover:underline">
            View Recent
          </button>
        </div>
      </div>

      {/* Results */}
      {!searched ? (
        <div className="bg-white rounded-3xl shadow p-16 text-center">
          <FileText className="mx-auto text-gray-300" size={64} />
          <h2 className="text-2xl font-bold mt-4 text-gray-400">Find VTU Question Papers</h2>
          <p className="text-gray-400 mt-2">Search by course code or browse by branch</p>
          <button onClick={loadRecent} className="mt-4 text-blue-600 font-medium hover:underline">
            Or view recent papers →
          </button>
        </div>
      ) : loading ? (
        <div className="bg-white rounded-3xl shadow p-16 text-center">
          <div className="text-4xl animate-pulse">🔍</div>
          <p className="text-gray-500 mt-4">Searching VTU papers...</p>
        </div>
      ) : papers.length === 0 ? (
        <div className="bg-white rounded-3xl shadow p-16 text-center">
          <p className="text-gray-500 text-lg">No papers found</p>
          <p className="text-gray-400 mt-2">Try a different search term or branch filter</p>
        </div>
      ) : (
        <>
          <p className="text-gray-500 mb-4">{papers.length} papers found</p>
          <div className="space-y-3">
            {papers.map((paper, index) => (
              <div key={index}
                className="bg-white rounded-2xl shadow p-4 hover:shadow-lg transition flex items-center justify-between gap-4">
                <div className="flex items-start gap-4 flex-1 min-w-0">
                  <div className="bg-blue-100 text-blue-700 w-12 h-12 rounded-xl flex items-center justify-center font-bold text-xs shrink-0">
                    {paper.scheme || "?"}
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-semibold text-sm truncate">{paper.title || "Untitled"}</h3>
                    <div className="flex gap-2 mt-1 text-xs text-gray-500 flex-wrap">
                      {paper.course_code && <span className="bg-gray-100 px-2 py-0.5 rounded">{paper.course_code}</span>}
                      {paper.branch && <span className="bg-gray-100 px-2 py-0.5 rounded">{paper.branch}</span>}
                      {paper.year && <span className="bg-gray-100 px-2 py-0.5 rounded">{paper.year}</span>}
                      <span className="bg-green-50 text-green-700 px-2 py-0.5 rounded">Official VTU</span>
                    </div>
                  </div>
                </div>
                <a href={paper.url} target="_blank" rel="noreferrer"
                  className="flex items-center gap-1 bg-blue-600 text-white px-4 py-2 rounded-xl hover:bg-blue-700 transition text-sm shrink-0">
                  <Download size={14} /> PDF
                </a>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
