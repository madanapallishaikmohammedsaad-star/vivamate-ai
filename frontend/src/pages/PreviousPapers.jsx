import { useState } from "react";
import { FileText, Download, Search } from "lucide-react";

export default function PreviousPapers() {
  const [query, setQuery] = useState("");
  const [papers, setPapers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  async function searchPapers() {
    if (!query.trim()) {
      alert("Please enter a course code or subject name");
      return;
    }
    setLoading(true);
    setSearched(true);
    try {
      const res = await fetch(
        `/papers/search/?query=${encodeURIComponent(query.trim())}`
      );
      const data = await res.json();
      setPapers(Array.isArray(data.results) ? data.results : []);
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
      <p className="text-gray-500 mb-6">Search VTU previous year question papers by course code or subject</p>

      <div className="flex gap-4 mb-8">
        <div className="flex-1 flex items-center gap-3 bg-white border rounded-xl px-4 py-3">
          <Search size={18} className="text-gray-400" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && searchPapers()}
            placeholder="Search by course code (e.g. BCS301) or subject name..."
            className="flex-1 outline-none"
          />
        </div>
        <button
          onClick={searchPapers}
          disabled={loading}
          className="bg-blue-600 text-white px-8 py-3 rounded-xl font-semibold hover:bg-blue-700 transition disabled:opacity-50"
        >
          {loading ? "Searching..." : "Search"}
        </button>
      </div>

      {!searched ? (
        <div className="bg-white rounded-3xl shadow p-16 text-center">
          <FileText className="mx-auto text-gray-300" size={64} />
          <h2 className="text-2xl font-bold mt-4 text-gray-400">Find Previous Papers</h2>
          <p className="text-gray-400 mt-2">Enter a course code or subject name to search</p>
        </div>
      ) : loading ? (
        <div className="bg-white rounded-3xl shadow p-16 text-center">
          <div className="text-4xl animate-pulse">🔍</div>
          <p className="text-gray-500 mt-4">Searching VTU papers...</p>
        </div>
      ) : papers.length === 0 ? (
        <div className="bg-white rounded-3xl shadow p-16 text-center">
          <p className="text-gray-500 text-lg">No papers found for "{query}"</p>
          <p className="text-gray-400 mt-2">Try a different course code or keyword</p>
        </div>
      ) : (
        <>
          <p className="text-gray-500 mb-4">{papers.length} papers found</p>
          <div className="space-y-4">
            {papers.map((paper, index) => (
              <div
                key={index}
                className="bg-white rounded-2xl shadow p-6 hover:shadow-xl transition flex items-center justify-between"
              >
                <div className="flex items-start gap-4">
                  <div className="bg-blue-100 text-blue-700 w-12 h-12 rounded-xl flex items-center justify-center font-bold text-sm">
                    {paper.scheme || "?"}
                  </div>
                  <div>
                    <h3 className="font-bold text-lg">{paper.title || "Untitled"}</h3>
                    <div className="flex gap-3 mt-2 text-sm text-gray-500">
                      <span className="bg-gray-100 px-2 py-1 rounded">{paper.course_code}</span>
                      <span className="bg-gray-100 px-2 py-1 rounded">{paper.exam_type || "Question Paper"}</span>
                    </div>
                  </div>
                </div>

                <a
                  href={paper.url}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-2 bg-blue-600 text-white px-5 py-2 rounded-xl hover:bg-blue-700 transition"
                >
                  <Download size={16} />
                  Download
                </a>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
