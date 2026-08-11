import { useState, useRef, useEffect } from "react";
import { Sparkles, Trash2, Settings } from "lucide-react";
import ChatBubble from "../components/ChatBubble";
import ChatSidebar from "../components/ChatSidebar";
import { generateAnswer } from "../services/ai";
import { getSchemes, getBranches, getSemesters, getSubjects } from "../services/syllabus";

export default function AIAnswer() {
  const [question, setQuestion] = useState("");
  const [loading, setLoading] = useState(false);
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

  const [chats, setChats] = useState(() => {
    const saved = localStorage.getItem("vivamate_chats");
    return saved ? JSON.parse(saved) : [{ id: Date.now(), title: "New Chat", messages: [] }];
  });

  const [currentChat, setCurrentChat] = useState(() => {
    return Number(localStorage.getItem("vivamate_current")) || Date.now();
  });

  const bottomRef = useRef(null);
  const inputRef = useRef(null);
  const current = chats.find((c) => c.id === currentChat) || chats[0];

  // Load schemes & branches
  useEffect(() => {
    (async () => {
      try {
        const [s, b] = await Promise.all([getSchemes(), getBranches()]);
        setSchemes(Array.isArray(s) ? s : []);
        setBranches(Array.isArray(b) ? b : []);
      } catch (e) { console.error(e); }
    })();
  }, []);

  // Load semesters
  useEffect(() => {
    if (!scheme || !branch) { setSemesters([]); setSemester(""); return; }
    (async () => {
      try {
        const d = await getSemesters(scheme, branch);
        setSemesters(Array.isArray(d) ? d : []);
        setSemester(""); setSubjects([]); setSubject(""); setSubjectId(null);
      } catch (e) { console.error(e); }
    })();
  }, [scheme, branch]);

  // Load subjects
  useEffect(() => {
    if (!scheme || !branch || !semester) { setSubjects([]); setSubject(""); setSubjectId(null); return; }
    (async () => {
      try {
        const d = await getSubjects(scheme, branch, semester);
        setSubjects(Array.isArray(d) ? d : []);
      } catch (e) { console.error(e); }
    })();
  }, [scheme, branch, semester]);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [chats, loading]);
  useEffect(() => { localStorage.setItem("vivamate_chats", JSON.stringify(chats)); }, [chats]);
  useEffect(() => { localStorage.setItem("vivamate_current", currentChat); }, [currentChat]);

  function createNewChat() {
    const chat = { id: Date.now(), title: "New Chat", messages: [] };
    setChats((p) => [...p, chat]); setCurrentChat(chat.id); setQuestion("");
  }

  function deleteChat(id) {
    if (chats.length === 1) return;
    const updated = chats.filter((c) => c.id !== id);
    setChats(updated);
    if (currentChat === id) setCurrentChat(updated[0].id);
  }

  function clearChat() {
    setChats((p) => p.map((c) => c.id === currentChat ? { ...c, messages: [] } : c));
    setQuestion("");
  }

  async function handleGenerate() {
    if (!question.trim() || loading) return;
    if (!subject) { alert("Please select a subject first."); return; }

    const userQuestion = question;
    setQuestion(""); setLoading(true);

    try {
      const result = await generateAnswer(userQuestion, marks, subjectId);
      setChats((prev) =>
        prev.map((chat) => {
          if (chat.id !== currentChat) return chat;
          return {
            ...chat,
            title: chat.title === "New Chat" ? userQuestion.slice(0, 30) : chat.title,
            messages: [...chat.messages, { question: userQuestion, answer: result }],
          };
        })
      );
    } catch (e) { console.error(e); }
    finally { setLoading(false); inputRef.current?.focus(); }
  }

  return (
    <div className="h-screen flex bg-gray-100">
      <ChatSidebar chats={chats} currentChat={currentChat} setCurrentChat={setCurrentChat} createNewChat={createNewChat} deleteChat={deleteChat} />

      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b shadow-sm p-5 z-10">
          <h1 className="text-3xl font-bold">🤖 VivaMate AI</h1>
          <p className="text-gray-500">Your VTU Engineering AI Assistant</p>
        </div>

        {/* Subject Selector */}
        <div className="bg-white border-b px-6 py-4">
          <div className="grid grid-cols-4 gap-3 mb-3">
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
            <select
              value={subject}
              onChange={(e) => {
                const s = subjects.find((x) => x.name === e.target.value);
                setSubject(e.target.value);
                setSubjectId(s ? s.id : null);
              }}
              className="border rounded-xl p-2.5 text-sm"
            >
              <option value="">Subject</option>
              {subjects.map((s) => <option key={s.id} value={s.name}>{s.code} — {s.name}</option>)}
            </select>
          </div>
          <div className="flex items-center gap-4">
            <label className="font-semibold text-sm flex items-center gap-2">
              <Settings size={14} /> Answer Length:
            </label>
            <select value={marks} onChange={(e) => setMarks(e.target.value)} className="border rounded-xl px-3 py-1.5 text-sm">
              <option value="2">2 Marks (Short)</option>
              <option value="5">5 Marks (Medium)</option>
              <option value="10">10 Marks (Detailed)</option>
              <option value="15">15 Marks (Full Exam)</option>
            </select>
            {subject && <span className="text-xs text-green-600 bg-green-50 px-2 py-1 rounded-lg">✅ VTU-aware mode</span>}
          </div>
        </div>

        {/* Chat */}
        <div className="flex-1 overflow-y-auto px-6 py-8">
          {current.messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <div className="text-7xl mb-6">🤖</div>
              <h2 className="text-4xl font-bold">Welcome to VivaMate AI</h2>
              <p className="text-gray-500 mt-4 max-w-xl">Select your VTU scheme, branch, semester, subject and marks — then ask any engineering question.</p>
              <div className="mt-6 flex gap-2 flex-wrap justify-center">
                <span className="bg-blue-50 text-blue-600 px-3 py-1 rounded-lg text-sm">2/5/10/15 mark answers</span>
                <span className="bg-green-50 text-green-600 px-3 py-1 rounded-lg text-sm">VTU syllabus aware</span>
                <span className="bg-purple-50 text-purple-600 px-3 py-1 rounded-lg text-sm">Module-level context</span>
              </div>
            </div>
          ) : (
            current.messages.map((msg, i) => (
              <div key={i}>
                <ChatBubble type="user" text={msg.question} />
                <ChatBubble type="ai" text={msg.answer} />
              </div>
            ))
          )}
          {loading && <div className="bg-white rounded-3xl p-5 shadow-lg border w-fit animate-pulse">🤖 VivaMate AI is thinking...</div>}
          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <div className="bg-white border-t p-5">
          <div className="flex gap-4">
            <textarea ref={inputRef} rows={2} disabled={loading} value={question}
              placeholder={subject ? `Ask a ${marks}-mark question about ${subject}...` : "Select a subject first, then ask..."}
              onChange={(e) => setQuestion(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleGenerate(); } }}
              className="flex-1 bg-gray-50 border border-gray-300 rounded-3xl p-5 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <div className="flex flex-col gap-3">
              <button onClick={handleGenerate} disabled={loading || !subject}
                className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-8 py-3 rounded-2xl flex items-center gap-2 hover:scale-105 transition disabled:opacity-50">
                <Sparkles size={18} /> {loading ? "Generating..." : "Send"}
              </button>
              <button onClick={clearChat} className="border px-8 py-3 rounded-2xl flex items-center gap-2 hover:bg-gray-100">
                <Trash2 size={18} /> Clear
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
