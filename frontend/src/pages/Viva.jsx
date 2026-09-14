import { useState, useEffect } from "react";
import { Mic, CheckCircle, XCircle, ArrowRight, RotateCcw } from "lucide-react";
import { getSchemes, getBranches, getSemesters, getSubjects } from "../services/syllabus";
import { generateVivaQuestion, checkVivaAnswer } from "../services/ai";

export default function Viva() {
  const [scheme, setScheme] = useState("");
  const [branch, setBranch] = useState("");
  const [semester, setSemester] = useState("");
  const [subject, setSubject] = useState("");
  const [subjectId, setSubjectId] = useState(null);
  const [schemes, setSchemes] = useState([]);
  const [branches, setBranches] = useState([]);
  const [semesters, setSemesters] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [started, setStarted] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState("");
  const [userAnswer, setUserAnswer] = useState("");
  const [feedback, setFeedback] = useState(null);
  const [loading, setLoading] = useState(false);
  const [questionNum, setQuestionNum] = useState(0);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);
  const [error, setError] = useState("");
  const totalQuestions = 5;

  useEffect(() => {
    Promise.all([getSchemes(), getBranches()])
      .then(([s, b]) => { setSchemes(Array.isArray(s) ? s : []); setBranches(Array.isArray(b) ? b : []); })
      .catch(() => setError("Could not load syllabus options. Please refresh and try again."));
  }, []);

  useEffect(() => {
    if (!scheme || !branch) { setSemesters([]); setSemester(""); return; }
    getSemesters(scheme, branch)
      .then((d) => { setSemesters(Array.isArray(d) ? d : []); setSemester(""); setSubjects([]); setSubject(""); setSubjectId(null); })
      .catch(() => setError("Could not load semesters. Please try again."));
  }, [scheme, branch]);

  useEffect(() => {
    if (!scheme || !branch || !semester) { setSubjects([]); setSubject(""); setSubjectId(null); return; }
    getSubjects(scheme, branch, semester)
      .then((d) => setSubjects(Array.isArray(d) ? d : []))
      .catch(() => setError("Could not load subjects. Please try again."));
  }, [scheme, branch, semester]);

  async function startViva() {
    if (!subject) { setError("Please select a subject first."); return; }
    setError(""); setLoading(true);
    try {
      const q = await generateVivaQuestion(subjectId, subject);
      setCurrentQuestion(typeof q === "string" ? q : String(q || ""));
      setQuestionNum(1); setScore(0); setStarted(true); setFinished(false); setUserAnswer(""); setFeedback(null);
    } catch { setError("Failed to generate a question. Check the backend and try again."); }
    finally { setLoading(false); }
  }

  async function checkAnswer() {
    if (!userAnswer.trim()) { setError("Please write an answer first."); return; }
    setError(""); setLoading(true);
    try {
      const raw = await checkVivaAnswer(currentQuestion, userAnswer, subjectId);
      const result = typeof raw === "string" ? raw : String(raw || "Could not evaluate this answer.");
      const match = result.match(/SCORE:\s*(\d+)/i);
      const earned = Math.max(0, Math.min(10, match ? Number(match[1]) : 5));
      setFeedback({ score: earned, text: result });
      setScore((previous) => previous + earned);
    } catch { setError("Could not evaluate your answer. Please try again."); }
    finally { setLoading(false); }
  }

  async function nextQuestion() {
    if (questionNum >= totalQuestions) { setFinished(true); return; }
    setError(""); setLoading(true);
    try {
      const q = await generateVivaQuestion(subjectId, subject);
      setCurrentQuestion(typeof q === "string" ? q : String(q || ""));
      setQuestionNum((previous) => previous + 1); setUserAnswer(""); setFeedback(null);
    } catch { setError("Failed to generate the next question. Please try again."); }
    finally { setLoading(false); }
  }

  function restart() { setStarted(false); setCurrentQuestion(""); setScore(0); setQuestionNum(0); setFinished(false); setUserAnswer(""); setFeedback(null); setError(""); }

  if (finished) {
    const max = totalQuestions * 10;
    const pct = Math.round((score / max) * 100);
    return <div className="p-4 sm:p-6 lg:p-8"><div className="bg-white rounded-3xl shadow p-6 sm:p-10 lg:p-16 text-center max-w-2xl mx-auto"><div className="text-6xl mb-6">{pct >= 80 ? "🎉" : pct >= 50 ? "👍" : "💪"}</div><h1 className="text-3xl font-bold">Viva Complete!</h1><p className="text-gray-500 mt-2">{subject} — {totalQuestions} questions</p><div className="my-8"><div className="text-5xl font-bold text-blue-600">{score}/{max}</div><p className="text-gray-500 mt-2">{pct}%</p></div><button onClick={restart} className="bg-blue-600 text-white px-8 py-3 rounded-xl flex items-center gap-2 mx-auto hover:bg-blue-700"><RotateCcw size={18} /> Try Again</button></div></div>;
  }

  if (!started) return <div className="p-4 sm:p-6 lg:p-8"><h1 className="text-3xl font-bold mb-2">🎤 AI Viva Practice</h1><p className="text-gray-500 mb-6">Practice viva questions with AI feedback — VTU syllabus aware</p>{error && <div role="alert" className="mb-4 rounded-xl bg-red-50 text-red-700 p-3">{error}</div>}<div className="bg-white rounded-2xl shadow p-4 sm:p-6 mb-6"><h3 className="font-bold mb-3">Select Subject</h3><div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">{[[scheme,setScheme,"Scheme",schemes], [branch,setBranch,"Branch",branches], [semester,setSemester,"Semester",semesters], [subject,setSubject,"Subject",subjects]].map(([value,setValue,placeholder,items], index) => <select key={placeholder} value={value} onChange={(e) => { const next = e.target.value; setValue(next); if (index === 3) { const selected = subjects.find((item) => item.name === next); setSubjectId(selected ? selected.id : null); } }} className="border rounded-xl p-2.5 text-sm"><option value="">{placeholder}</option>{items.map((item) => { const val = typeof item === "string" ? item : index === 1 ? item.code : item.name; const label = typeof item === "string" ? (index === 2 ? `Sem ${item}` : item) : `${item.code} — ${item.name}`; return <option key={typeof item === "string" ? item : item.id || item.code} value={val}>{label}</option>; })}</select>)}</div></div><div className="bg-white rounded-3xl shadow p-6 sm:p-10 lg:p-12 text-center max-w-2xl mx-auto"><Mic className="mx-auto text-blue-500 mb-4" size={64} /><h2 className="text-2xl font-bold mb-4">Start a Mock Viva</h2><p className="text-gray-500 mb-8">The AI will ask {totalQuestions} questions based on your selected VTU subject. You'll get scored and feedback on each answer.</p><button onClick={startViva} disabled={loading || !subject} className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-10 py-4 rounded-xl text-lg font-semibold disabled:opacity-50">{loading ? "Generating..." : "Start Viva"}</button></div></div>;

  return <div className="p-4 sm:p-6 lg:p-8"><div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6"><div><h1 className="text-3xl font-bold">🎤 AI Viva Practice</h1><p className="text-gray-500">{subject} — Running score: {score}/{questionNum * 10}</p></div><div className="bg-blue-100 text-blue-700 px-6 py-2 rounded-xl font-bold w-fit">Question {questionNum} / {totalQuestions}</div></div>{error && <div role="alert" className="mb-4 rounded-xl bg-red-50 text-red-700 p-3">{error}</div>}<div className="bg-white rounded-3xl shadow p-4 sm:p-6 lg:p-8 max-w-3xl mx-auto"><div className="bg-blue-50 border-l-4 border-blue-600 p-4 sm:p-6 rounded-xl mb-6"><p className="text-gray-500 text-sm mb-2 font-semibold">VIVA QUESTION</p><p className="text-lg font-bold">{currentQuestion}</p></div>{!feedback ? <><textarea rows={4} value={userAnswer} onChange={(e) => setUserAnswer(e.target.value)} placeholder="Type your answer here..." className="w-full border rounded-xl p-4 mb-4 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500" disabled={loading} /><button onClick={checkAnswer} disabled={loading || !userAnswer.trim()} className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-8 py-3 rounded-xl disabled:opacity-50">{loading ? "Checking..." : "Check Answer"}</button></> : <><div className="bg-gray-50 rounded-xl p-4 sm:p-6 mb-6"><div className="flex items-center gap-3 mb-3">{feedback.score >= 7 ? <CheckCircle className="text-green-500" size={24} /> : feedback.score >= 4 ? <CheckCircle className="text-yellow-500" size={24} /> : <XCircle className="text-red-500" size={24} />}<span className="font-bold text-xl">Score: {feedback.score} / 10</span></div><div className="text-sm text-gray-600 whitespace-pre-wrap">{feedback.text}</div></div><div className="flex justify-end"><button onClick={nextQuestion} disabled={loading} className="bg-blue-600 text-white px-8 py-3 rounded-xl flex items-center gap-2 disabled:opacity-50">{loading ? "Loading..." : questionNum >= totalQuestions ? "Finish" : "Next Question"} <ArrowRight size={18} /></button></div></>}</div></div>;
}
