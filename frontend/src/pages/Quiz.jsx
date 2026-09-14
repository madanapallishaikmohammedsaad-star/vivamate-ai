import { useState, useEffect } from "react";
import { Brain, CheckCircle, XCircle, RotateCcw } from "lucide-react";
import { getSchemes, getBranches, getSemesters, getSubjects } from "../services/syllabus";
import { generateQuiz } from "../services/ai";

function parseQuiz(raw) {
  if (Array.isArray(raw)) return raw;
  if (raw && Array.isArray(raw.questions)) return raw.questions;

  const text = String(raw || "").replace(/```json|```/gi, "").trim();
  try {
    const parsed = JSON.parse(text);
    if (Array.isArray(parsed)) return parsed;
    if (Array.isArray(parsed.questions)) return parsed.questions;
  } catch {
    // Fall back to parsing common numbered AI output.
  }

  const blocks = text.split(/\n(?=\s*(?:Question\s*)?\d+[.)])/i).filter(Boolean);
  return blocks.map((block, index) => {
    const lines = block.split("\n").map((line) => line.trim()).filter(Boolean);
    const questionLine = lines.find((line) => /^(?:Question\s*)?\d+[.)]/i.test(line)) || lines[0] || `Question ${index + 1}`;
    const question = questionLine.replace(/^(?:Question\s*)?\d+[.)]\s*/i, "").trim();
    const options = lines
      .filter((line) => /^[A-D][.)]\s+/i.test(line))
      .map((line) => line.replace(/^[A-D][.)]\s+/i, "").trim());
    const answerLine = lines.find((line) => /^(?:correct answer|answer)\s*:/i.test(line));
    const answerText = answerLine ? answerLine.replace(/^(?:correct answer|answer)\s*:\s*/i, "").trim() : "";
    const answerIndex = answerText.match(/^([A-D])/i)?.[1]?.toUpperCase().charCodeAt(0) - 65;
    return {
      question,
      options,
      answer: Number.isInteger(answerIndex) && answerIndex >= 0 && answerIndex < options.length ? answerIndex : answerText,
      explanation: lines.find((line) => /^explanation\s*:/i.test(line))?.replace(/^explanation\s*:\s*/i, "") || "",
    };
  }).filter((item) => item.question && item.options.length >= 2);
}

function getCorrectIndex(question) {
  if (typeof question.answer === "number") return question.answer;
  const answer = String(question.correctAnswer ?? question.answer ?? "").trim();
  const letter = answer.match(/^([A-D])/i)?.[1];
  if (letter) return letter.toUpperCase().charCodeAt(0) - 65;
  return question.options?.findIndex((option) => option.toLowerCase() === answer.toLowerCase()) ?? -1;
}

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
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => { (async () => { try { const [s, b] = await Promise.all([getSchemes(), getBranches()]); setSchemes(Array.isArray(s) ? s : []); setBranches(Array.isArray(b) ? b : []); } catch (e) { console.error(e); setError("Could not load syllabus options."); } })(); }, []);
  useEffect(() => { if (!scheme || !branch) { setSemesters([]); setSemester(""); return; } (async () => { try { const d = await getSemesters(scheme, branch); setSemesters(Array.isArray(d) ? d : []); setSemester(""); setSubjects([]); setSubject(""); setSubjectId(null); } catch (e) { console.error(e); } })(); }, [scheme, branch]);
  useEffect(() => { if (!scheme || !branch || !semester) { setSubjects([]); setSubject(""); setSubjectId(null); return; } (async () => { try { const d = await getSubjects(scheme, branch, semester); setSubjects(Array.isArray(d) ? d : []); } catch (e) { console.error(e); } })(); }, [scheme, branch, semester]);

  async function startQuiz() {
    if (!subjectId) { setError("Select a subject first."); return; }
    setLoading(true); setError("");
    try {
      const result = await generateQuiz(subjectId, numQ);
      const parsed = parseQuiz(result).slice(0, numQ);
      if (!parsed.length) throw new Error("No usable questions returned");
      setQuestions(parsed); setAnswers({}); setSubmitted(false); setStarted(true);
    } catch (e) { console.error(e); setError("The quiz could not be generated. Please try again."); }
    finally { setLoading(false); }
  }

  function restart() { setStarted(false); setQuestions([]); setAnswers({}); setSubmitted(false); setError(""); }
  const score = questions.reduce((total, question, index) => total + (answers[index] === getCorrectIndex(question) ? 1 : 0), 0);
  const answeredCount = Object.keys(answers).length;

  if (started && !submitted) return (
    <div className="p-4 sm:p-8 max-w-5xl mx-auto">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6"><div><h1 className="text-3xl font-bold">🧠 Quiz — {subject}</h1><p className="text-gray-500 mt-1">{answeredCount} of {questions.length} answered</p></div><button onClick={restart} className="text-gray-500 hover:text-red-500 flex items-center gap-1"><RotateCcw size={16} /> Restart</button></div>
      <div className="space-y-5">{questions.map((question, index) => <div key={`${index}-${question.question}`} className="bg-white rounded-2xl shadow p-5 sm:p-7"><h2 className="font-bold text-lg mb-4">{index + 1}. {question.question}</h2><div className="grid gap-3">{question.options.map((option, optionIndex) => <button key={optionIndex} onClick={() => setAnswers((previous) => ({ ...previous, [index]: optionIndex }))} className={`text-left rounded-xl border p-3 transition ${answers[index] === optionIndex ? "border-blue-600 bg-blue-50 text-blue-900" : "border-gray-200 hover:border-blue-300"}`}><span className="font-semibold mr-2">{String.fromCharCode(65 + optionIndex)}.</span>{option}</button>)}</div></div>)}</div>
      <button onClick={() => setSubmitted(true)} disabled={answeredCount !== questions.length} className="mt-6 bg-blue-600 text-white px-8 py-3 rounded-xl font-semibold disabled:opacity-40">Finish Quiz</button>
      {answeredCount !== questions.length && <p className="text-sm text-gray-500 mt-2">Answer every question to finish.</p>}
    </div>
  );

  if (started && submitted) return (
    <div className="p-4 sm:p-8 max-w-4xl mx-auto"><div className="bg-white rounded-3xl shadow p-6 sm:p-10 text-center"><Brain className="mx-auto text-blue-500 mb-4" size={64} /><h1 className="text-3xl font-bold">Quiz Complete!</h1><p className="text-gray-500 mt-2">{subject}</p><div className="text-5xl font-bold text-blue-600 mt-6">{score} / {questions.length}</div><p className="mt-2 text-gray-600">{Math.round((score / questions.length) * 100)}% correct</p><div className="text-left mt-8 space-y-4">{questions.map((question, index) => { const correct = getCorrectIndex(question); const right = answers[index] === correct; return <div key={index} className={`rounded-xl border p-4 ${right ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}`}><div className="flex gap-2 items-start">{right ? <CheckCircle className="text-green-600 shrink-0" size={20} /> : <XCircle className="text-red-600 shrink-0" size={20} />}<div><p className="font-semibold">{index + 1}. {question.question}</p><p className="text-sm mt-1">Your answer: {question.options[answers[index]] || "Not answered"}</p><p className="text-sm font-semibold mt-1">Correct answer: {question.options[correct] || "Not provided"}</p>{question.explanation && <p className="text-sm mt-2 text-gray-600">{question.explanation}</p>}</div></div></div>; })}</div><button onClick={restart} className="mt-8 bg-blue-600 text-white px-8 py-3 rounded-xl flex items-center gap-2 mx-auto hover:bg-blue-700"><RotateCcw size={18} /> New Quiz</button></div></div>
  );

  return <div className="p-4 sm:p-8"><h1 className="text-3xl font-bold mb-2">🧠 Quiz</h1><p className="text-gray-500 mb-6">AI-generated multiple-choice quiz based on VTU syllabus</p>{error && <div className="mb-4 rounded-xl bg-red-50 text-red-700 p-3">{error}</div>}<div className="bg-white rounded-2xl shadow p-5 sm:p-6 mb-6"><h3 className="font-bold mb-3">Select Subject</h3><div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-4"><select value={scheme} onChange={(e) => setScheme(e.target.value)} className="border rounded-xl p-2.5 text-sm"><option value="">Scheme</option>{schemes.map((s) => <option key={s} value={s}>{s}</option>)}</select><select value={branch} onChange={(e) => setBranch(e.target.value)} className="border rounded-xl p-2.5 text-sm"><option value="">Branch</option>{branches.map((b) => <option key={b.code} value={b.code}>{b.name}</option>)}</select><select value={semester} onChange={(e) => setSemester(e.target.value)} className="border rounded-xl p-2.5 text-sm"><option value="">Semester</option>{semesters.map((s) => <option key={s} value={s}>Sem {s}</option>)}</select><select value={subject} onChange={(e) => { const s = subjects.find((x) => x.name === e.target.value); setSubject(e.target.value); setSubjectId(s ? s.id : null); }} className="border rounded-xl p-2.5 text-sm"><option value="">Subject</option>{subjects.map((s) => <option key={s.id} value={s.name}>{s.code} — {s.name}</option>)}</select></div><div className="flex items-center gap-4"><label className="font-semibold text-sm">Number of questions:</label><select value={numQ} onChange={(e) => setNumQ(Number(e.target.value))} className="border rounded-xl px-3 py-1.5 text-sm"><option value={5}>5</option><option value={10}>10</option><option value={15}>15</option></select></div></div><div className="bg-white rounded-3xl shadow p-8 sm:p-12 text-center max-w-2xl mx-auto"><Brain className="mx-auto text-purple-500 mb-4" size={64} /><h2 className="text-2xl font-bold mb-4">Generate Quiz</h2><p className="text-gray-500 mb-8">AI will create multiple-choice questions with answer choices and a final score.</p><button onClick={startQuiz} disabled={loading || !subjectId} className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-10 py-4 rounded-xl text-lg font-semibold hover:scale-105 transition disabled:opacity-50">{loading ? "Generating Quiz..." : "Start Quiz"}</button></div></div>;
}
