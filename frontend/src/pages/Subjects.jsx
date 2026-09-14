import { useEffect, useState } from "react";
import { getSchemes, getBranches, getSemesters, getSubjects } from "../services/syllabus";
import { BookOpen, FileText, ExternalLink, RefreshCw } from "lucide-react";

export default function Subjects() {
  const [scheme, setScheme] = useState("");
  const [branch, setBranch] = useState("");
  const [semester, setSemester] = useState("");
  const [subjects, setSubjects] = useState([]);
  const [schemes, setSchemes] = useState([]);
  const [branches, setBranches] = useState([]);
  const [semesters, setSemesters] = useState([]);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [error, setError] = useState("");
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let active = true;
    async function load() {
      setInitialLoading(true);
      setError("");
      try {
        const [s, b] = await Promise.all([getSchemes(), getBranches()]);
        if (active) {
          setSchemes(Array.isArray(s) ? s : []);
          setBranches(Array.isArray(b) ? b : []);
        }
      } catch (err) {
        if (active) setError(err.message || "Unable to load syllabus options.");
      } finally {
        if (active) setInitialLoading(false);
      }
    }
    load();
    return () => { active = false; };
  }, [reloadKey]);

  useEffect(() => {
    let active = true;
    async function loadSemesters() {
      if (!scheme || !branch) {
        setSemesters([]);
        setSemester("");
        return;
      }
      setError("");
      try {
        const data = await getSemesters(scheme, branch);
        if (active) {
          setSemesters(Array.isArray(data) ? data : []);
          setSemester("");
        }
      } catch (err) {
        if (active) setError(err.message || "Unable to load semesters.");
      }
    }
    loadSemesters();
    return () => { active = false; };
  }, [scheme, branch]);

  useEffect(() => {
    let active = true;
    async function loadSubjects() {
      if (!scheme || !branch || !semester) {
        setSubjects([]);
        return;
      }
      setLoading(true);
      setError("");
      try {
        const data = await getSubjects(scheme, branch, semester);
        if (active) setSubjects(Array.isArray(data) ? data : []);
      } catch (err) {
        if (active) {
          setSubjects([]);
          setError(err.message || "Unable to load subjects.");
        }
      } finally {
        if (active) setLoading(false);
      }
    }
    loadSubjects();
    return () => { active = false; };
  }, [scheme, branch, semester]);

  const validUrl = (value) => {
    try {
      const url = new URL(value);
      return url.protocol === "http:" || url.protocol === "https:";
    } catch {
      return false;
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 min-w-0">
      <h1 className="text-2xl sm:text-3xl font-bold mb-2">📚 Subjects</h1>
      <p className="text-gray-500 mb-6">Browse VTU syllabus by scheme, branch and semester</p>

      {error && (
        <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-red-700" role="alert">
          <p>{error}</p>
          <button type="button" onClick={() => setReloadKey((value) => value + 1)} className="mt-3 inline-flex items-center gap-2 rounded-xl bg-red-600 px-4 py-2 text-white hover:bg-red-700">
            <RefreshCw size={16} /> Try again
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-4 mb-6">
        <select disabled={initialLoading} value={scheme} onChange={(e) => setScheme(e.target.value)} className="border rounded-xl p-3 bg-white disabled:opacity-60" aria-label="Select scheme">
          <option value="">Select Scheme</option>
          {schemes.map((item) => <option key={item} value={item}>{item}</option>)}
        </select>
        <select disabled={initialLoading} value={branch} onChange={(e) => setBranch(e.target.value)} className="border rounded-xl p-3 bg-white disabled:opacity-60" aria-label="Select branch">
          <option value="">Select Branch</option>
          {branches.map((item) => <option key={item.code} value={item.code}>{item.name}</option>)}
        </select>
        <select disabled={!scheme || !branch || semesters.length === 0} value={semester} onChange={(e) => setSemester(e.target.value)} className="border rounded-xl p-3 bg-white disabled:opacity-60" aria-label="Select semester">
          <option value="">Select Semester</option>
          {semesters.map((sem) => <option key={sem} value={sem}>Semester {sem}</option>)}
        </select>
        <div className="flex items-center justify-center rounded-xl border border-blue-200 bg-blue-50 p-3 text-center font-semibold text-blue-700" aria-live="polite">
          {loading ? "Loading..." : `${subjects.length} subjects`}
        </div>
      </div>

      {loading ? (
        <div className="bg-white rounded-3xl shadow p-8 sm:p-16 text-center" role="status">
          <BookOpen className="mx-auto animate-pulse text-blue-300" size={64} />
          <p className="text-gray-500 mt-4">Loading subjects...</p>
        </div>
      ) : subjects.length === 0 ? (
        <div className="bg-white rounded-3xl shadow p-8 sm:p-16 text-center">
          <BookOpen className="mx-auto text-gray-300" size={64} />
          <h2 className="text-xl sm:text-2xl font-bold mt-4 text-gray-400">Select Scheme, Branch and Semester</h2>
          <p className="text-gray-400 mt-2">Subjects will appear here</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
          {subjects.map((subject, index) => (
            <div key={subject.code || subject.course_code || index} className="bg-white rounded-2xl p-4 sm:p-6 shadow hover:shadow-xl transition min-w-0">
              <div className="flex items-start justify-between gap-3">
                <div className="break-words bg-blue-100 text-blue-700 px-3 py-1 rounded-lg font-mono font-bold text-sm">{subject.code || subject.course_code || subject.name}</div>
                <FileText size={20} className="text-gray-300 shrink-0" />
              </div>
              <h3 className="font-bold text-lg mt-4 break-words">{subject.name || "Unnamed subject"}</h3>
              {Array.isArray(subject.documents) && subject.documents.length > 0 && (
                <div className="mt-4 space-y-2">
                  {subject.documents.map((doc, i) => {
                    const url = typeof doc.url === "string" && validUrl(doc.url) ? doc.url : "";
                    const title = doc.title || doc.filename || `Document ${i + 1}`;
                    return url ? (
                      <a key={`${url}-${i}`} href={url} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-blue-600 text-sm hover:underline break-words">
                        <ExternalLink size={14} className="shrink-0" /> {title}
                      </a>
                    ) : <span key={i} className="text-sm text-gray-400">{title} — unavailable</span>;
                  })}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
