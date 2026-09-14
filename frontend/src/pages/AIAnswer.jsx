import { useState, useRef, useEffect } from "react";
import { Sparkles, Trash2, Settings, AlertCircle } from "lucide-react";
import ChatBubble from "../components/ChatBubble";
import ChatSidebar from "../components/ChatSidebar";
import { generateAnswer } from "../services/ai";
import { getSchemes, getBranches, getSemesters, getSubjects } from "../services/syllabus";

function loadChats() {
  try {
    const saved = localStorage.getItem("vivamate_chats");
    const parsed = saved ? JSON.parse(saved) : null;
    return Array.isArray(parsed) && parsed.length ? parsed : [{ id: Date.now(), title: "New Chat", messages: [] }];
  } catch {
    return [{ id: Date.now(), title: "New Chat", messages: [] }];
  }
}

export default function AIAnswer() {
  const [question, setQuestion] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [scheme, setScheme] = useState("");
  const [branch, setBranch] = useState("");
  const [semester, setSemester] = useState("");
  const [subject, setSubject] = useState("");
  const [subjectId, setSubjectId] = useState(null);
  const [marks, setMarks] = useState("5");
  const [schemes, setSchemes] = useState([]);
  const [branches, setBranches] = useState([]);
  const [semesters, setSemesters] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [chats, setChats] = useState(loadChats);
  const [currentChat, setCurrentChat] = useState(() => Number(localStorage.getItem("vivamate_current")) || null);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);
  const activeChatId = currentChat || chats[0]?.id;
  const current = chats.find((c) => c.id === activeChatId) || chats[0];

  useEffect(() => {
    if (!currentChat && chats[0]) setCurrentChat(chats[0].id);
  }, [currentChat, chats]);

  useEffect(() => {
    (async () => {
      try {
        const [s, b] = await Promise.all([getSchemes(), getBranches()]);
        setSchemes(Array.isArray(s) ? s : []);
        setBranches(Array.isArray(b) ? b : []);
      } catch {
        setError("Unable to load VTU options. Please check that the backend is running.");
      }
    })();
  }, []);

  useEffect(() => {
    if (!scheme || !branch) { setSemesters([]); setSemester(""); return; }
    (async () => {
      try {
        const data = await getSemesters(scheme, branch);
        setSemesters(Array.isArray(data) ? data : []);
        setSemester(""); setSubjects([]); setSubject(""); setSubjectId(null);
      } catch { setError("Unable to load semesters for this branch."); }
    })();
  }, [scheme, branch]);

  useEffect(() => {
    if (!scheme || !branch || !semester) { setSubjects([]); setSubject(""); setSubjectId(null); return; }
    (async () => {
      try {
        const data = await getSubjects(scheme, branch, semester);
        setSubjects(Array.isArray(data) ? data : []);
      } catch { setError("Unable to load subjects for this semester."); }
    })();
  }, [scheme, branch, semester]);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [chats, loading]);
  useEffect(() => { localStorage.setItem("vivamate_chats", JSON.stringify(chats)); }, [chats]);
  useEffect(() => { if (activeChatId) localStorage.setItem("vivamate_current", activeChatId); }, [activeChatId]);

  function createNewChat() {
    const chat = { id: Date.now(), title: "New Chat", messages: [] };
    setChats((previous) => [...previous, chat]);
    setCurrentChat(chat.id);
    setQuestion("");
    setError("");
  }

  function deleteChat(id) {
    if (chats.length === 1) return;
    const updated = chats.filter((chat) => chat.id !== id);
    setChats(updated);
    if (activeChatId === id) setCurrentChat(updated[0].id);
  }

  function clearChat() {
    setChats((previous) => previous.map((chat) => chat.id === activeChatId ? { ...chat, messages: [] } : chat));
    setQuestion("");
    setError("");
  }

  async function handleGenerate() {
    if (!question.trim() || loading) return;
    if (!subject) { setError("Please select a subject first."); return; }
    const userQuestion = question.trim();
    setQuestion(""); setLoading(true); setError("");
    try {
      const result = await generateAnswer(userQuestion, marks, subjectId);
      setChats((previous) => previous.map((chat) => chat.id === activeChatId ? {
        ...chat,
        title: chat.title === "New Chat" ? userQuestion.slice(0, 30) : chat.title,
        messages: [...chat.messages, { question: userQuestion, answer: result }],
      } : chat));
    } catch (err) {
      setError(err?.message || "Unable to generate an answer. Please try again.");
      setQuestion(userQuestion);
    } finally { setLoading(false); inputRef.current?.focus(); }
  }

  return (
    <div className="flex min-h-[calc(100vh-6rem)] overflow-hidden rounded-2xl border bg-gray-100">
      <ChatSidebar chats={chats} currentChat={activeChatId} setCurrentChat={setCurrentChat} createNewChat={createNewChat} deleteChat={deleteChat} />
      <div className="flex min-w-0 flex-1 flex-col bg-white">
        <div className="border-b bg-white p-4 sm:p-5">
          <h1 className="text-2xl font-bold sm:text-3xl">🤖 VivaMate AI</h1>
          <p className="text-sm text-gray-500 sm:text-base">Your VTU Engineering AI Assistant</p>
        </div>

        <div className="border-b bg-white px-3 py-3 sm:px-6 sm:py-4">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <select value={scheme} onChange={(e) => setScheme(e.target.value)} className="min-w-0 rounded-xl border p-2.5 text-sm"><option value="">Scheme</option>{schemes.map((item) => <option key={item} value={item}>{item}</option>)}</select>
            <select value={branch} onChange={(e) => setBranch(e.target.value)} className="min-w-0 rounded-xl border p-2.5 text-sm"><option value="">Branch</option>{branches.map((item) => <option key={item.code} value={item.code}>{item.name}</option>)}</select>
            <select value={semester} onChange={(e) => setSemester(e.target.value)} className="min-w-0 rounded-xl border p-2.5 text-sm"><option value="">Semester</option>{semesters.map((item) => <option key={item} value={item}>Sem {item}</option>)}</select>
            <select value={subject} onChange={(e) => { const item = subjects.find((entry) => entry.name === e.target.value); setSubject(e.target.value); setSubjectId(item ? item.id : null); }} className="min-w-0 rounded-xl border p-2.5 text-sm"><option value="">Subject</option>{subjects.map((item) => <option key={item.id} value={item.name}>{item.code} — {item.name}</option>)}</select>
          </div>
          <div className="mt-3 flex flex-wrap items-center gap-3 sm:gap-4">
            <label className="flex items-center gap-2 text-sm font-semibold"><Settings size={14} /> Answer Length:</label>
            <select value={marks} onChange={(e) => setMarks(e.target.value)} className="rounded-xl border px-3 py-1.5 text-sm"><option value="2">2 Marks (Short)</option><option value="5">5 Marks (Medium)</option><option value="10">10 Marks (Detailed)</option><option value="15">15 Marks (Full Exam)</option></select>
            {subject && <span className="rounded-lg bg-green-50 px-2 py-1 text-xs text-green-600">✅ VTU-aware mode</span>}
          </div>
        </div>

        {error && <div role="alert" className="mx-3 mt-3 flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700 sm:mx-6"><AlertCircle size={18} className="mt-0.5 shrink-0" /><span>{error}</span></div>}

        <div className="flex-1 overflow-y-auto px-3 py-6 sm:px-6 sm:py-8">
          {current?.messages?.length === 0 ? <div className="flex min-h-full flex-col items-center justify-center text-center"><div className="mb-5 text-6xl sm:text-7xl">🤖</div><h2 className="text-2xl font-bold sm:text-4xl">Welcome to VivaMate AI</h2><p className="mt-4 max-w-xl text-sm text-gray-500 sm:text-base">Select your VTU scheme, branch, semester, subject and marks — then ask any engineering question.</p><div className="mt-6 flex flex-wrap justify-center gap-2"><span className="rounded-lg bg-blue-50 px-3 py-1 text-sm text-blue-600">2/5/10/15 mark answers</span><span className="rounded-lg bg-green-50 px-3 py-1 text-sm text-green-600">VTU syllabus aware</span><span className="rounded-lg bg-purple-50 px-3 py-1 text-sm text-purple-600">Module-level context</span></div></div> : current?.messages?.map((msg, index) => <div key={`${activeChatId}-${index}`}><ChatBubble type="user" text={msg.question} /><ChatBubble type="ai" text={msg.answer} /></div>)}
          {loading && <div className="w-fit rounded-3xl border bg-white p-5 shadow-lg" aria-live="polite">🤖 VivaMate AI is thinking...</div>}
          <div ref={bottomRef} />
        </div>

        <div className="border-t bg-white p-3 sm:p-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:gap-4">
            <textarea ref={inputRef} rows={2} disabled={loading} value={question} placeholder={subject ? `Ask a ${marks}-mark question about ${subject}...` : "Select a subject first, then ask..."} onChange={(e) => setQuestion(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleGenerate(); } }} className="min-w-0 flex-1 resize-none rounded-3xl border border-gray-300 bg-gray-50 p-4 focus:outline-none focus:ring-2 focus:ring-blue-500 sm:p-5" />
            <div className="flex flex-row gap-3 sm:flex-col"><button onClick={handleGenerate} disabled={loading || !subject || !question.trim()} className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 px-5 py-3 text-white transition hover:scale-[1.02] disabled:cursor-not-allowed disabled:opacity-50 sm:px-8"><Sparkles size={18} /> {loading ? "Generating..." : "Send"}</button><button onClick={clearChat} className="flex flex-1 items-center justify-center gap-2 rounded-2xl border px-5 py-3 transition hover:bg-gray-100 sm:px-8"><Trash2 size={18} /> Clear</button></div>
          </div>
        </div>
      </div>
    </div>
  );
}
