import { useState, useEffect } from "react";
import { Brain, CheckCircle, XCircle, RotateCcw, BookOpen } from "lucide-react";
import { getSchemes, getBranches, getSemesters, getSubjects } from "../services/syllabus";
import { generateQuiz } from "../services/ai";

export default function Quiz() {
  const [scheme, setScheme] = useState("");
  const [branch, setBranch] = useState("");
  const [semester, setSemester] = useState("");
  const [subject, setSubject] = useState("");
  const [subjectId, setSubjectId] = useState(null);
  const [numQ, setNumQ] = useState(5);

  const [schemes, setSchemes] = useState([]);
  const [branches, setBranches] = useState([]);
  const [semesters, setSemesters] = useState([]);
  const [subjects, setSubjects] = useState([]);

  const [started, setStarted] = useState(false);
  const [quiz, setQuiz] = useState("");
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => { (async () => { try { const [s, b] = await Promise.all([getSchemes(), getBranches()]); setSchemes(Array.isArray(s) ? s : []); setBranches(Array.isArray(b) ? b : []); } catch (e) { console.error(e); } })(); }, []);
  useEffect(() => { if (!scheme || !branch) { setSemesters([]); setSemester(""); return; } (async () => { try { const d = await getSemesters(scheme, branch); setSemesters(Array.isArray(d) ? d : []); setSemester(""); setSubjects([]); setSubject(""); setSubjectId(null); } catch (e) { console.error(e); } })(); }, [scheme, branch]);
  useEffect(() => { if (!scheme || !branch || !semester) { setSubjects([]); setSubject(""); setSubjectId(null); return; } (async () => { try { const d = await getSubjects(scheme, branch, semester); setSubjects(Array.isArray(d) ? d : []); } catch (e) { console.error(e); } })(); }, [scheme, branch, semester]);

  async function startQuiz() {
    if (!subject) { alert("Select a subject first"); return; }
    setLoading(true);
    try {
      const result = await generateQuiz(subjectId, numQ);
      setQuiz(result);
      setAnswers({});
      setSubmitted(false);
      setStarted(true);
    } catch (e) { console.error(e); alert("Failed to generate quiz."); }
    finally { setLoading(false); }
  }

  function restart() { setStarted(false); setQuiz(""); setAnswers({}); setSubmitted(false); }

  if (started && !submitted) {
    return (
      <div className="p-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold">🧠 Quiz — {subject}</h1>
          <button onClick={restart} className="text-gray-500 hover:text-red-500 flex items-center gap-1"><RotateCcw size={16} /> Restart</button>
        </div>
        <div className="bg-white rounded-3xl shadow p-8">
          <div className="prose max-w-none whitespace-pre-wrap">{quiz}</div>
          <button onClick={() => setSubmitted(true)} className="mt-6 bg-blue-600 text-white px-8 py-3 rounded-xl hover:bg-blue-700 font-semibold">
            Finish Quiz
          </button>
        </div>
      </div>
    );
  }

  if (started && submitted) {
    return (
      <div className="p-8">
        <div className="bg-white rounded-3xl shadow p-16 text-center max-w-2xl mx-auto">
          <Brain className="mx-auto text-blue-500 mb-4" size={64} />
          <h1 className="text-3xl font-bold">Quiz Complete!</h1>
          <p className="text-gray-500 mt-2">{subject} — {numQ} questions generated</p>
          <div className="bg-blue-50 rounded-xl p-6 mt-8 text-left">
            <p className="font-bold mb-2">Review your answers against the correct ones above.</p>
            <p className="text-gray-600">Use the AI Answer page to study any topics you got wrong.</p>
          </div>
          <button onClick={restart} className="mt-6 bg-blue-600 text-white px-8 py-3 rounded-xl flex items-center gap-2 mx-auto hover:bg-blue-700">
            <RotateCcw size={18} /> New Quiz
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-2">🧠 Quiz</h1>
      <p className="text-gray-500 mb-6">AI-generated quiz based on VTU syllabus</p>

      <div className="bg-white rounded-2xl shadow p-6 mb-6">
        <h3 className="font-bold mb-3">Select Subject</h3>
        <div className="grid grid-cols-4 gap-3 mb-4">
          <select value={scheme} onChange={(e) => setScheme(e.target.value)} className="border rounded-xl p-2.5 text-sm"><option value="">Scheme</option>{schemes.map((s) => <option key={s} value={s}>{s}</option>)}</select>
          <select value={branch} onChange={(e) => setBranch(e.target.value)} className="border rounded-xl p-2.5 text-sm"><option value="">Branch</option>{branches.map((b) => <option key={b.code} value={b.code}>{b.name}</option>)}</select>
          <select value={semester} onChange={(e) => setSemester(e.target.value)} className="border rounded-xl p-2.5 text-sm"><option value="">Semester</option>{semesters.map((s) => <option key={s} value={s}>Sem {s}</option>)}</select>
          <select value={subject} onChange={(e) => { const s = subjects.find((x) => x.name === e.target.value); setSubject(e.target.value); setSubjectId(s ? s.id : null); }} className="border rounded-xl p-2.5 text-sm"><option value="">Subject</option>{subjects.map((s) => <option key={s.id} value={s.name}>{s.code} — {s.name}</option>)}</select>
        </div>
        <div className="flex items-center gap-4">
          <label className="font-semibold text-sm">Number of questions:</label>
          <select value={numQ} onChange={(e) => setNumQ(Number(e.target.value))} className="border rounded-xl px-3 py-1.5 text-sm">
            <option value={5}>5</option><option value={10}>10</option><option value={15}>15</option>
          </select>
        </div>
      </div>

      <div className="bg-white rounded-3xl shadow p-12 text-center max-w-2xl mx-auto">
        <Brain className="mx-auto text-purple-500 mb-4" size={64} />
        <h2 className="text-2xl font-bold mb-4">Generate Quiz</h2>
        <p className="text-gray-500 mb-8">AI will create multiple-choice questions based on your selected VTU subject.</p>
        <button onClick={startQuiz} disabled={loading || !subject} className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-10 py-4 rounded-xl text-lg font-semibold flex items-center gap-2 mx-auto hover:scale-105 transition disabled:opacity-50">
          {loading ? "Generating Quiz..." : "Start Quiz"}
        </button>
      </div>
    </div>
  );
}
