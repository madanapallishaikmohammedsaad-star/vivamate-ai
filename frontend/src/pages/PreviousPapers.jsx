import { useState } from "react";
import { FileText, Download, Search, Filter, RefreshCw } from "lucide-react";

const branches = ["CSE", "ECE", "EEE", "ME", "CE", "ISE", "AIML"];

export default function PreviousPapers() {
  const [query, setQuery] = useState("");
  const [branch, setBranch] = useState("");
  const [papers, setPapers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [error, setError] = useState("");

  async function requestPapers(url) {
    setLoading(true);
    setSearched(true);
    setError("");

    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error(`Request failed (${res.status})`);
      const data = await res.json();
      setPapers(Array.isArray(data) ? data : []);
    } catch (err) {
      setPapers([]);
      setError(err.message || "Unable to load papers. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  function searchPapers() {
    const params = new URLSearchParams();
    if (query.trim()) params.append("query", query.trim());
    if (branch) params.append("branch", branch);
    requestPapers(`/api/papers/search?${params}`);
  }

  function loadRecent() {
    setQuery("");
    setBranch("");
    requestPapers("/api/papers/recent?limit=30");
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 min-w-0">
      <h1 className="text-2xl sm:text-3xl font-bold mb-2">📄 Previous Year Papers</h1>
      <p className="text-gray-500 mb-6">Official VTU question papers — scraped live from vtu.ac.in</p>

      <div className="bg-white rounded-2xl shadow p-4 sm:p-6 mb-6">
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-4">
          <div className="flex-1 min-w-0 flex items-center gap-3 border rounded-xl px-4 py-3">
            <Search size={18} className="text-gray-400 shrink-0" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && searchPapers()}
              placeholder="Search course code or subject name..."
              className="flex-1 min-w-0 outline-none"
              aria-label="Search question papers"
            />
          </div>
          <button
            type="button"
            onClick={searchPapers}
            disabled={loading}
            className="bg-blue-600 text-white px-6 sm:px-8 py-3 rounded-xl font-semibold hover:bg-blue-700 transition disabled:opacity-50"
          >
            {loading ? "Searching..." : "Search"}
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          <div className="flex items-center gap-2 mr-1">
            <Filter size={14} className="text-gray-500" />
            <span className="text-sm text-gray-500">Branch:</span>
          </div>
          {branches.map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => setBranch(branch === item ? "" : item)}
              aria-pressed={branch === item}
              className={`px-3 py-1 rounded-lg text-sm font-medium transition ${
                branch === item
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {item}
            </button>
          ))}
          <button
            type="button"
            onClick={loadRecent}
            disabled={loading}
            className="text-blue-600 text-sm font-medium hover:underline disabled:opacity-50 sm:ml-auto"
          >
            View Recent
          </button>
        </div>
      </div>

      {!searched ? (
        <div className="bg-white rounded-3xl shadow p-8 sm:p-16 text-center">
          <FileText className="mx-auto text-gray-300" size={64} />
          <h2 className="text-xl sm:text-2xl font-bold mt-4 text-gray-400">Find VTU Question Papers</h2>
          <p className="text-gray-400 mt-2">Search by course code or browse by branch</p>
          <button type="button" onClick={loadRecent} className="mt-4 text-blue-600 font-medium hover:underline">
            Or view recent papers →
          </button>
        </div>
      ) : loading ? (
        <div className="bg-white rounded-3xl shadow p-8 sm:p-16 text-center" role="status">
          <div className="text-4xl animate-pulse">🔍</div>
          <p className="text-gray-500 mt-4">Searching VTU papers...</p>
        </div>
      ) : error ? (
        <div className="bg-white rounded-3xl shadow p-8 sm:p-16 text-center" role="alert">
          <FileText className="mx-auto text-red-300" size={56} />
          <h2 className="text-xl sm:text-2xl font-bold mt-4 text-gray-700">Couldn’t load papers</h2>
          <p className="text-gray-500 mt-2">{error}</p>
          <button type="button" onClick={searchPapers} className="mt-5 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 font-medium text-white hover:bg-blue-700">
            <RefreshCw size={16} /> Try again
          </button>
        </div>
      ) : papers.length === 0 ? (
        <div className="bg-white rounded-3xl shadow p-8 sm:p-16 text-center">
          <p className="text-gray-500 text-lg">No papers found</p>
          <p className="text-gray-400 mt-2">Try a different search term or branch filter</p>
        </div>
      ) : (
        <>
          <p className="text-gray-500 mb-4">{papers.length} papers found</p>
          <div className="space-y-3">
            {papers.map((paper, index) => {
              const url = typeof paper.url === "string" && /^https?:\/\//i.test(paper.url) ? paper.url : "";
              const title = paper.title || "Untitled paper";
              return (
                <div key={paper.id || paper.url || `${title}-${index}`} className="bg-white rounded-2xl shadow p-4 hover:shadow-lg transition flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-start gap-3 sm:gap-4 min-w-0">
                    <div className="bg-blue-100 text-blue-700 w-12 h-12 rounded-xl flex items-center justify-center font-bold text-xs shrink-0">
                      {paper.scheme || "?"}
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-semibold text-sm break-words">{title}</h3>
                      <div className="flex gap-2 mt-1 text-xs text-gray-500 flex-wrap">
                        {paper.course_code && <span className="bg-gray-100 px-2 py-0.5 rounded">{paper.course_code}</span>}
                        {paper.branch && <span className="bg-gray-100 px-2 py-0.5 rounded">{paper.branch}</span>}
                        {paper.year && <span className="bg-gray-100 px-2 py-0.5 rounded">{paper.year}</span>}
                        <span className="bg-green-50 text-green-700 px-2 py-0.5 rounded">Official VTU</span>
                      </div>
                    </div>
                  </div>
                  {url ? (
                    <a href={url} target="_blank" rel="noreferrer" className="inline-flex items-center justify-center gap-1 bg-blue-600 text-white px-4 py-2 rounded-xl hover:bg-blue-700 transition text-sm shrink-0">
                      <Download size={14} /> PDF
                    </a>
                  ) : (
                    <span className="text-xs text-gray-400 shrink-0">No PDF link</span>
                  )}
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
