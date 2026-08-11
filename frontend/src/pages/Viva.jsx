import { useState, useEffect } from "react";
import { Mic, CheckCircle, XCircle, ArrowRight, RotateCcw, BookOpen } from "lucide-react";
import { getSchemes, getBranches, getSemesters, getSubjects } from "../services/syllabus";
import { generateVivaQuestion, checkVivaAnswer } from "../services/ai";

export default function Viva() {
  // Subject selection
  const [scheme, setScheme] = useState("");
  const [branch, setBranch] = useState("");
  const [semester, setSemester] = useState("");
  const [subject, setSubject] = useState("");
  const [subjectId, setSubjectId] = useState(null);

  const [schemes, setSchemes] = useState([]);
  const [branches, setBranches] = useState([]);
  const [semesters, setSemesters] = useState([]);
  const [subjects, setSubjects] = useState([]);

  // Viva state
  const [started, setStarted] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState("");
  const [userAnswer, setUserAnswer] = useState("");
  const [feedback, setFeedback] = useState(null);
  const [loading, setLoading] = useState(false);
  const [questionNum, setQuestionNum] = useState(0);
  const [score, setScore] = useState(0);
  const [totalQuestions] = useState(5);
  const [finished, setFinished] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const [s, b] = await Promise.all([getSchemes(), getBranches()]);
        setSchemes(Array.isArray(s) ? s : []);
        setBranches(Array.isArray(b) ? b : []);
      } catch (e) { console.error(e); }
    })();
  }, []);

  useEffect(() => {
    if (!scheme || !branch) { setSemesters([]); setSemester(""); return; }
    (async () => {
      try { const d = await getSemesters(scheme, branch); setSemesters(Array.isArray(d) ? d : []); setSemester(""); setSubjects([]); setSubject(""); setSubjectId(null); } catch (e) { console.error(e); }
    })();
  }, [scheme, branch]);

  useEffect(() => {
    if (!scheme || !branch || !semester) { setSubjects([]); setSubject(""); setSubjectId(null); return; }
    (async () => {
      try { const d = await getSubjects(scheme, branch, semester); setSubjects(Array.isArray(d) ? d : []); } catch (e) { console.error(e); }
    })();
  }, [scheme, branch, semester]);

  async function startViva() {
    if (!subject) { alert("Please select a subject"); return; }
    setLoading(true);
    try {
      const q = await generateVivaQuestion(subjectId, subject);
      setCurrentQuestion(q);
      setQuestionNum(1);
      setScore(0);
      setStarted(true);
      setFinished(false);
      setUserAnswer(""); setFeedback(null);
    } catch (e) { console.error(e); alert("Failed to generate question. Try again."); }
    finally { setLoading(false); }
  }

  async function checkAnswer() {
    if (!userAnswer.trim()) { alert("Please write an answer first"); return; }
    setLoading(true);
    try {
      const result = await checkVivaAnswer(currentQuestion, userAnswer, subjectId);
      const scoreMatch = result.match(/SCORE:\s*(\d+)/i);
      const earned = scoreMatch ? parseInt(scoreMatch[1]) : 5;
      setFeedback({ score: earned, text: result });
      setScore((p) => p + earned);
    } catch (e) {
      console.error(e);
      setFeedback({ score: 0, text: "Could not evaluate." });
    } finally { setLoading(false); }
  }

  async function nextQuestion() {
    if (questionNum >= totalQuestions) { setFinished(true); return; }
    setLoading(true);
    try {
      const q = await generateVivaQuestion(subjectId, subject);
      setCurrentQuestion(q);
      setQuestionNum((p) => p + 1);
      setUserAnswer(""); setFeedback(null);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }

  function restart() { setStarted(false); setCurrentQuestion(""); setScore(0); setQuestionNum(0); setFinished(false); setUserAnswer(""); setFeedback(null); }

  // === FINISHED SCREEN ===
  if (finished) {
    const max = totalQuestions * 10;
    const pct = max > 0 ? Math.round((score / max) * 100) : 0;
    return (
      <div className="p-8">
        <div className="bg-white rounded-3xl shadow p-16 text-center max-w-2xl mx-auto">
          <div className="text-6xl mb-6">{pct >= 80 ? "🎉" : pct >= 50 ? "👍" : "💪"}</div>
          <h1 className="text-3xl font-bold">Viva Complete!</h1>
          <p className="text-gray-500 mt-2">{subject} — {totalQuestions} questions</p>
          <div className="my-8"><div className="text-5xl font-bold text-blue-600">{score}/{max}</div><p className="text-gray-500 mt-2">{pct}%</p></div>
          <button onClick={restart} className="bg-blue-600 text-white px-8 py-3 rounded-xl flex items-center gap-2 mx-auto hover:bg-blue-700"><RotateCcw size={18} /> Try Again</button>
        </div>
      </div>
    );
  }

  // === START SCREEN ===
  if (!started) {
    return (
      <div className="p-8">
        <h1 className="text-3xl font-bold mb-2">🎤 AI Viva Practice</h1>
        <p className="text-gray-500 mb-6">Practice viva questions with AI feedback — VTU syllabus aware</p>

        <div className="bg-white rounded-2xl shadow p-6 mb-6">
          <h3 className="font-bold mb-3">Select Subject</h3>
          <div className="grid grid-cols-4 gap-3">
            <select value={scheme} onChange={(e) => setScheme(e.target.value)} className="border rounded-xl p-2.5 text-sm">
              <option value="">Scheme</option>
              {schemes.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
            <select value={branch} onChange={(e) => setBranch(e.target.value)} className="border rounded-xl p-2.5 text-sm">
              <option value="">Branch</option>
              {branches.map((b) => <option key={b.code} value={b.code}>{b.name}</option>)}
            </select>
            <select value={semester} onChange={(e) => setSemester(e.target.value)} className="border rounded-xl p-2.5 text-sm">
              <option value="">Semester</option>
              {semesters.map((s) => <option key={s} value={s}>Sem {s}</option>)}
            </select>
            <select value={subject} onChange={(e) => { const s = subjects.find((x) => x.name === e.target.value); setSubject(e.target.value); setSubjectId(s ? s.id : null); }} className="border rounded-xl p-2.5 text-sm">
              <option value="">Subject</option>
              {subjects.map((s) => <option key={s.id} value={s.name}>{s.code} — {s.name}</option>)}
            </select>
          </div>
        </div>

        <div className="bg-white rounded-3xl shadow p-12 text-center max-w-2xl mx-auto">
          <Mic className="mx-auto text-blue-500 mb-4" size={64} />
          <h2 className="text-2xl font-bold mb-4">Start a Mock Viva</h2>
          <p className="text-gray-500 mb-8">The AI will ask {totalQuestions} questions based on your selected VTU subject. You'll get scored and feedback on each answer.</p>
          <button onClick={startViva} disabled={loading || !subject} className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-10 py-4 rounded-xl text-lg font-semibold flex items-center gap-2 mx-auto hover:scale-105 transition disabled:opacity-50">
            {loading ? "Generating..." : "Start Viva"}
          </button>
        </div>
      </div>
    );
  }

  // === VIVA IN PROGRESS ===
  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">🎤 AI Viva Practice</h1>
          <p className="text-gray-500">{subject} — Running score: {score}/{questionNum * 10}</p>
        </div>
        <div className="bg-blue-100 text-blue-700 px-6 py-2 rounded-xl font-bold">
          Question {questionNum} / {totalQuestions}
        </div>
      </div>

      <div className="bg-white rounded-3xl shadow p-8 max-w-3xl mx-auto">
        <div className="bg-blue-50 border-l-4 border-blue-600 p-6 rounded-xl mb-6">
          <p className="text-gray-500 text-sm mb-2 font-semibold">VIVA QUESTION</p>
          <p className="text-lg font-bold">{currentQuestion}</p>
        </div>

        {!feedback ? (
          loading ? (
            <div className="text-center py-8"><div className="text-4xl animate-pulse">🤖</div><p className="text-gray-500 mt-4">Generating next question...</p></div>
          ) : (
            <>
              <textarea rows={4} value={userAnswer} onChange={(e) => setUserAnswer(e.target.value)}
                placeholder="Type your answer here..." className="w-full border rounded-xl p-4 mb-4 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500" />
              <button onClick={checkAnswer} disabled={loading || !userAnswer.trim()}
                className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-8 py-3 rounded-xl flex items-center gap-2 hover:scale-105 transition disabled:opacity-50">
                Check Answer
              </button>
            </>
          )
        ) : (
          <>
            <div className="bg-gray-50 rounded-xl p-6 mb-6">
              <div className="flex items-center gap-3 mb-3">
                {feedback.score >= 7 ? <CheckCircle className="text-green-500" size={24} /> : feedback.score >= 4 ? <CheckCircle className="text-yellow-500" size={24} /> : <XCircle className="text-red-500" size={24} />}
                <span className="font-bold text-xl">Score: {feedback.score} / 10</span>
              </div>
              <div className="text-sm text-gray-600 whitespace-pre-wrap">{feedback.text}</div>
            </div>
            <div className="flex justify-end">
              <button onClick={nextQuestion} className="bg-blue-600 text-white px-8 py-3 rounded-xl flex items-center gap-2 hover:bg-blue-700 transition">
                {questionNum >= totalQuestions ? "Finish" : "Next Question"} <ArrowRight size={18} />
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
