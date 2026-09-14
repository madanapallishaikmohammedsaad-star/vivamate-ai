import { useState, useEffect } from "react";
import { BookOpen, FileText, ChevronDown, ChevronRight, RefreshCw } from "lucide-react";
import {
  getSchemes,
  getBranches,
  getSemesters,
  getSubjects,
  getSubjectDetail,
} from "../services/syllabus";

export default function Notes() {
  const [scheme, setScheme] = useState("");
  const [branch, setBranch] = useState("");
  const [semester, setSemester] = useState("");
  const [subject, setSubject] = useState("");
  const [subjectId, setSubjectId] = useState(null);

  const [schemes, setSchemes] = useState([]);
  const [branches, setBranches] = useState([]);
  const [semesters, setSemesters] = useState([]);
  const [subjects, setSubjects] = useState([]);

  const [detail, setDetail] = useState(null);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [expandedModule, setExpandedModule] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    async function loadOptions() {
      setInitialLoading(true);
      setError("");
      try {
        const [schemeData, branchData] = await Promise.all([getSchemes(), getBranches()]);
        if (!active) return;
        setSchemes(Array.isArray(schemeData) ? schemeData : []);
        setBranches(Array.isArray(branchData) ? branchData : []);
      } catch (err) {
        if (active) setError(err?.message || "Unable to load syllabus options.");
      } finally {
        if (active) setInitialLoading(false);
      }
    }

    loadOptions();
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!scheme || !branch) {
      setSemesters([]);
      setSemester("");
      setSubjects([]);
      setSubject("");
      setSubjectId(null);
      setDetail(null);
      return;
    }

    let active = true;
    async function loadSemesters() {
      setError("");
      try {
        const data = await getSemesters(scheme, branch);
        if (!active) return;
        setSemesters(Array.isArray(data) ? data : []);
        setSemester("");
        setSubjects([]);
        setSubject("");
        setSubjectId(null);
        setDetail(null);
      } catch (err) {
        if (active) setError(err?.message || "Unable to load semesters.");
      }
    }

    loadSemesters();
    return () => {
      active = false;
    };
  }, [scheme, branch]);

  useEffect(() => {
    if (!scheme || !branch || !semester) {
      setSubjects([]);
      setSubject("");
      setSubjectId(null);
      setDetail(null);
      return;
    }

    let active = true;
    async function loadSubjects() {
      setError("");
      try {
        const data = await getSubjects(scheme, branch, semester);
        if (active) setSubjects(Array.isArray(data) ? data : []);
      } catch (err) {
        if (active) setError(err?.message || "Unable to load subjects.");
      }
    }

    loadSubjects();
    return () => {
      active = false;
    };
  }, [scheme, branch, semester]);

  useEffect(() => {
    if (!subjectId) {
      setDetail(null);
      return;
    }

    let active = true;
    async function loadDetail() {
      setLoading(true);
      setError("");
      setExpandedModule(null);
      try {
        const data = await getSubjectDetail(subjectId);
        if (active) setDetail(data);
      } catch (err) {
        if (active) {
          setDetail(null);
          setError(err?.message || "Unable to load subject notes.");
        }
      } finally {
        if (active) setLoading(false);
      }
    }

    loadDetail();
    return () => {
      active = false;
    };
  }, [subjectId]);

  const retry = () => window.location.reload();

  return (
    <div className="min-w-0 p-4 sm:p-6 lg:p-8">
      <h1 className="mb-2 text-2xl font-bold sm:text-3xl">📚 Notes & Revision</h1>
      <p className="mb-6 text-gray-500">VTU syllabus modules organized for study and revision</p>

      {error && (
        <div className="mb-6 flex flex-col gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-red-700 sm:flex-row sm:items-center sm:justify-between">
          <p role="alert" className="text-sm">{error}</p>
          <button
            type="button"
            onClick={retry}
            className="inline-flex w-fit items-center gap-2 rounded-xl border border-red-200 bg-white px-3 py-2 text-sm font-semibold hover:bg-red-100"
          >
            <RefreshCw size={16} /> Retry
          </button>
        </div>
      )}

      <div className="mb-6 rounded-2xl bg-white p-4 shadow sm:p-6">
        <h3 className="mb-3 font-bold">Select Subject</h3>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <select
            value={scheme}
            onChange={(event) => setScheme(event.target.value)}
            disabled={initialLoading}
            className="rounded-xl border p-2.5 text-sm"
          >
            <option value="">Scheme</option>
            {schemes.map((item) => <option key={item} value={item}>{item}</option>)}
          </select>

          <select
            value={branch}
            onChange={(event) => setBranch(event.target.value)}
            disabled={initialLoading}
            className="rounded-xl border p-2.5 text-sm"
          >
            <option value="">Branch</option>
            {branches.map((item) => <option key={item.code} value={item.code}>{item.name}</option>)}
          </select>

          <select
            value={semester}
            onChange={(event) => setSemester(event.target.value)}
            disabled={!scheme || !branch}
            className="rounded-xl border p-2.5 text-sm"
          >
            <option value="">Semester</option>
            {semesters.map((item) => <option key={item} value={item}>Sem {item}</option>)}
          </select>

          <select
            value={subject}
            onChange={(event) => {
              const selected = subjects.find((item) => item.name === event.target.value);
              setSubject(event.target.value);
              setSubjectId(selected?.id || null);
            }}
            disabled={!scheme || !branch || !semester}
            className="rounded-xl border p-2.5 text-sm"
          >
            <option value="">Subject</option>
            {subjects.map((item) => (
              <option key={item.id} value={item.name}>{item.code} — {item.name}</option>
            ))}
          </select>
        </div>
      </div>

      {loading && (
        <div className="rounded-3xl bg-white p-12 text-center shadow sm:p-16">
          <div className="text-4xl animate-pulse">📚</div>
          <p className="mt-4 text-gray-500">Loading subject modules...</p>
        </div>
      )}

      {!loading && detail && (
        <>
          <div className="mb-6 rounded-3xl bg-gradient-to-r from-blue-600 to-indigo-600 p-5 text-white sm:p-8">
            <div className="mb-2 flex items-center gap-3">
              <BookOpen size={24} />
              <h2 className="text-xl font-bold sm:text-2xl">{detail.course_code}</h2>
            </div>
            <p className="text-base text-blue-100 sm:text-lg">{detail.course_title}</p>
            <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-sm text-blue-200">
              <span>Scheme: {detail.scheme}</span>
              <span>Branch: {detail.branch}</span>
              <span>Semester: {detail.semester}</span>
              {detail.credits && <span>Credits: {detail.credits}</span>}
            </div>
          </div>

          {Array.isArray(detail.modules) && detail.modules.length > 0 ? (
            <div className="space-y-4">
              <h3 className="text-xl font-bold">📖 Modules ({detail.modules.length})</h3>
              {detail.modules.map((module, index) => (
                <div key={`${module.module_number}-${index}`} className="overflow-hidden rounded-2xl bg-white shadow">
                  <button
                    type="button"
                    onClick={() => setExpandedModule(expandedModule === index ? null : index)}
                    aria-expanded={expandedModule === index}
                    className="flex w-full items-center justify-between gap-4 p-4 text-left transition hover:bg-gray-50 sm:p-5"
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-100 font-bold text-blue-700">
                        {module.module_number}
                      </div>
                      <div className="min-w-0">
                        <p className="font-bold">Module {module.module_number}</p>
                        <p className="text-sm text-gray-500">{module.title}</p>
                      </div>
                    </div>
                    {expandedModule === index ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
                  </button>
                  {expandedModule === index && (
                    <div className="border-t px-4 pb-5 sm:px-5">
                      <div className="prose prose-sm mt-4 max-w-none whitespace-pre-wrap leading-relaxed text-gray-700">
                        {module.content || "No content available for this module."}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-3xl bg-white p-10 text-center shadow sm:p-12">
              <FileText className="mx-auto text-gray-300" size={48} />
              <p className="mt-4 text-gray-500">No module data available for this subject yet.</p>
              <p className="mt-1 text-sm text-gray-400">Module content is extracted from VTU syllabus PDFs.</p>
            </div>
          )}
        </>
      )}

      {!loading && !detail && !subject && !error && (
        <div className="rounded-3xl bg-white p-10 text-center shadow sm:p-16">
          <BookOpen className="mx-auto text-gray-300" size={64} />
          <h2 className="mt-4 text-xl font-bold text-gray-400 sm:text-2xl">Select a Subject</h2>
          <p className="mt-2 text-gray-400">Choose scheme, branch, semester and subject to view modules and revision notes.</p>
        </div>
      )}
    </div>
  );
}
