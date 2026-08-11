import { useState, useEffect } from "react";
import { BookOpen, FileText, ChevronDown, ChevronRight } from "lucide-react";
import { getSchemes, getBranches, getSemesters, getSubjects, getSubjectDetail } from "../services/syllabus";

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
  const [expandedModule, setExpandedModule] = useState(null);

  useEffect(() => { (async () => { try { const [s, b] = await Promise.all([getSchemes(), getBranches()]); setSchemes(Array.isArray(s) ? s : []); setBranches(Array.isArray(b) ? b : []); } catch (e) { console.error(e); } })(); }, []);
  useEffect(() => { if (!scheme || !branch) { setSemesters([]); setSemester(""); return; } (async () => { try { const d = await getSemesters(scheme, branch); setSemesters(Array.isArray(d) ? d : []); setSemester(""); setSubjects([]); setSubject(""); setSubjectId(null); setDetail(null); } catch (e) { console.error(e); } })(); }, [scheme, branch]);
  useEffect(() => { if (!scheme || !branch || !semester) { setSubjects([]); setSubject(""); setSubjectId(null); setDetail(null); return; } (async () => { try { const d = await getSubjects(scheme, branch, semester); setSubjects(Array.isArray(d) ? d : []); } catch (e) { console.error(e); } })(); }, [scheme, branch, semester]);

  useEffect(() => {
    if (!subjectId) { setDetail(null); return; }
    (async () => {
      setLoading(true);
      try { const d = await getSubjectDetail(subjectId); setDetail(d); } catch (e) { console.error(e); }
      finally { setLoading(false); }
    })();
  }, [subjectId]);

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-2">📚 Notes & Revision</h1>
      <p className="text-gray-500 mb-6">VTU syllabus modules organized for study and revision</p>

      <div className="bg-white rounded-2xl shadow p-6 mb-6">
        <h3 className="font-bold mb-3">Select Subject</h3>
        <div className="grid grid-cols-4 gap-3">
          <select value={scheme} onChange={(e) => setScheme(e.target.value)} className="border rounded-xl p-2.5 text-sm"><option value="">Scheme</option>{schemes.map((s) => <option key={s} value={s}>{s}</option>)}</select>
          <select value={branch} onChange={(e) => setBranch(e.target.value)} className="border rounded-xl p-2.5 text-sm"><option value="">Branch</option>{branches.map((b) => <option key={b.code} value={b.code}>{b.name}</option>)}</select>
          <select value={semester} onChange={(e) => setSemester(e.target.value)} className="border rounded-xl p-2.5 text-sm"><option value="">Semester</option>{semesters.map((s) => <option key={s} value={s}>Sem {s}</option>)}</select>
          <select value={subject} onChange={(e) => { const s = subjects.find((x) => x.name === e.target.value); setSubject(e.target.value); setSubjectId(s ? s.id : null); }} className="border rounded-xl p-2.5 text-sm"><option value="">Subject</option>{subjects.map((s) => <option key={s.id} value={s.name}>{s.code} — {s.name}</option>)}</select>
        </div>
      </div>

      {loading && (
        <div className="bg-white rounded-3xl shadow p-16 text-center">
          <div className="text-4xl animate-pulse">📚</div>
          <p className="text-gray-500 mt-4">Loading subject modules...</p>
        </div>
      )}

      {!loading && detail && (
        <>
          {/* Subject Info Card */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-3xl p-8 text-white mb-6">
            <div className="flex items-center gap-3 mb-2">
              <BookOpen size={24} />
              <h2 className="text-2xl font-bold">{detail.course_code}</h2>
            </div>
            <p className="text-blue-100 text-lg">{detail.course_title}</p>
            <div className="flex gap-4 mt-3 text-sm text-blue-200">
              <span>Scheme: {detail.scheme}</span>
              <span>Branch: {detail.branch}</span>
              <span>Semester: {detail.semester}</span>
              {detail.credits && <span>Credits: {detail.credits}</span>}
            </div>
          </div>

          {/* Modules */}
          {detail.modules && detail.modules.length > 0 ? (
            <div className="space-y-4">
              <h3 className="text-xl font-bold">📖 Modules ({detail.modules.length})</h3>
              {detail.modules.map((mod, i) => (
                <div key={i} className="bg-white rounded-2xl shadow overflow-hidden">
                  <button
                    onClick={() => setExpandedModule(expandedModule === i ? null : i)}
                    className="w-full flex items-center justify-between p-5 hover:bg-gray-50 transition text-left"
                  >
                    <div className="flex items-center gap-3">
                      <div className="bg-blue-100 text-blue-700 w-10 h-10 rounded-xl flex items-center justify-center font-bold">{mod.module_number}</div>
                      <div>
                        <p className="font-bold">Module {mod.module_number}</p>
                        <p className="text-gray-500 text-sm">{mod.title}</p>
                      </div>
                    </div>
                    {expandedModule === i ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
                  </button>
                  {expandedModule === i && (
                    <div className="px-5 pb-5 border-t">
                      <div className="prose prose-sm max-w-none text-gray-700 whitespace-pre-wrap mt-4 leading-relaxed">
                        {mod.content}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-3xl shadow p-12 text-center">
              <FileText className="mx-auto text-gray-300" size={48} />
              <p className="text-gray-500 mt-4">No module data available for this subject yet.</p>
              <p className="text-gray-400 text-sm mt-1">Module content is extracted from VTU syllabus PDFs.</p>
            </div>
          )}
        </>
      )}

      {!loading && !detail && !subject && (
        <div className="bg-white rounded-3xl shadow p-16 text-center">
          <BookOpen className="mx-auto text-gray-300" size={64} />
          <h2 className="text-2xl font-bold mt-4 text-gray-400">Select a Subject</h2>
          <p className="text-gray-400 mt-2">Choose scheme, branch, semester and subject to view modules and revision notes</p>
        </div>
      )}
    </div>
  );
}
