import { useState, useRef, useEffect } from "react";
import { Sparkles, Trash2 } from "lucide-react";
import ChatBubble from "../components/ChatBubble";
import ChatSidebar from "../components/ChatSidebar";
import { generateAnswer } from "../services/ai";

export default function AIAnswer() {
  const [question, setQuestion] = useState("");
  const [loading, setLoading] = useState(false);

  const [subject, setSubject] = useState("Operating Systems");
  const [marks, setMarks] = useState("5");

  const [chats, setChats] = useState(() => {
    const saved = localStorage.getItem("vivamate_chats");

    if (saved) {
      return JSON.parse(saved);
    }

    return [
      {
        id: Date.now(),
        title: "New Chat",
        messages: [],
      },
    ];
  });

  const [currentChat, setCurrentChat] = useState(() => {
    const saved = localStorage.getItem("vivamate_current");

    if (saved) {
      return Number(saved);
    }

    const first = JSON.parse(localStorage.getItem("vivamate_chats") || "[]");

    return first.length ? first[0].id : Date.now();
  });

  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  const current =
    chats.find((chat) => chat.id === currentChat) || chats[0];

  useEffect(() => {
    bottomRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [chats, loading]);

  useEffect(() => {
    localStorage.setItem(
      "vivamate_chats",
      JSON.stringify(chats)
    );
  }, [chats]);

  useEffect(() => {
    localStorage.setItem(
      "vivamate_current",
      currentChat
    );
  }, [currentChat]);

  useEffect(() => {
    if (!current && chats.length) {
      setCurrentChat(chats[0].id);
    }
  }, [current, chats]);

  function createNewChat() {
    const chat = {
      id: Date.now(),
      title: "New Chat",
      messages: [],
    };

    setChats((prev) => [...prev, chat]);
    setCurrentChat(chat.id);
    setQuestion("");

    setTimeout(() => {
      inputRef.current?.focus();
    }, 100);
  }

  function deleteChat(id) {
    if (chats.length === 1) return;

    const updated = chats.filter((chat) => chat.id !== id);

    setChats(updated);

    if (currentChat === id) {
      setCurrentChat(updated[0].id);
    }
  }

  function clearChat() {
    setChats((prev) =>
      prev.map((chat) =>
        chat.id === currentChat
          ? {
              ...chat,
              messages: [],
            }
          : chat
      )
    );

    setQuestion("");
  }

  async function handleGenerate() {
    if (!question.trim() || loading) return;

    const userQuestion = question;

    setQuestion("");
    setLoading(true);

    try {
      const fullPrompt = `
Subject: ${subject}

Marks: ${marks}

Question:

${userQuestion}
`;

      const result = await generateAnswer(fullPrompt);

      setChats((prev) =>
        prev.map((chat) => {
          if (chat.id !== currentChat) return chat;

          return {
            ...chat,
            title:
              chat.title === "New Chat"
                ? userQuestion.slice(0, 30)
                : chat.title,
            messages: [
              ...chat.messages,
              {
                question: userQuestion,
                answer: result,
              },
            ],
          };
        })
      );
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);

      inputRef.current?.focus();
    }
  }
    return (
    <div className="h-screen flex bg-gray-100">

      {/* Sidebar */}
      <ChatSidebar
        chats={chats}
        currentChat={currentChat}
        setCurrentChat={setCurrentChat}
        createNewChat={createNewChat}
        deleteChat={deleteChat}
      />

      {/* Main Area */}
      <div className="flex-1 flex flex-col">

        {/* Header */}
        <div className="sticky top-0 bg-white border-b shadow-sm p-5 z-10">

          <h1 className="text-3xl font-bold">
            🤖 VivaMate AI
          </h1>

          <p className="text-gray-500">
            Your Engineering AI Assistant
          </p>

        </div>

        {/* Subject + Marks */}
        <div className="bg-white border-b px-6 py-4 flex gap-4">

          <select
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            className="border rounded-xl px-4 py-2"
          >
            <option>Operating Systems</option>
            <option>DBMS</option>
            <option>Computer Networks</option>
            <option>Python</option>
            <option>Java</option>
            <option>Data Structures</option>
            <option>Artificial Intelligence</option>
            <option>Machine Learning</option>
            <option>Software Engineering</option>
          </select>

          <select
            value={marks}
            onChange={(e) => setMarks(e.target.value)}
            className="border rounded-xl px-4 py-2"
          >
            <option value="2">2 Marks</option>
            <option value="5">5 Marks</option>
            <option value="10">10 Marks</option>
            <option value="15">15 Marks</option>
          </select>

        </div>

        {/* Chat */}
        <div className="flex-1 overflow-y-auto px-6 py-8">

          {current.messages.length === 0 ? (

            <div className="flex flex-col items-center justify-center h-full text-center">

              <div className="text-7xl mb-6">
                🤖
              </div>

              <h2 className="text-4xl font-bold">
                Welcome to VivaMate AI
              </h2>

              <p className="text-gray-500 mt-4 max-w-xl">
                Choose a subject, select marks and ask any engineering question.
              </p>

            </div>

          ) : (

            current.messages.map((msg, index) => (

              <div key={index}>

                <ChatBubble
                  type="user"
                  text={msg.question}
                />

                <ChatBubble
                  type="ai"
                  text={msg.answer}
                />

              </div>

            ))

          )}

          {loading && (

            <div className="bg-white rounded-3xl p-5 shadow-lg border w-fit animate-pulse">

              🤖 VivaMate AI is thinking...

            </div>

          )}

          <div ref={bottomRef}></div>

        </div>

        {/* Input */}
        <div className="bg-white border-t p-5">

          <div className="flex gap-4">

            <textarea
              ref={inputRef}
              rows={2}
              disabled={loading}
              value={question}
              placeholder="Ask any engineering question..."
              onChange={(e) => setQuestion(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleGenerate();
                }
              }}
              className="flex-1 bg-gray-50 border border-gray-300 rounded-3xl p-5 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
            />

            <div className="flex flex-col gap-3">

              <button
                onClick={handleGenerate}
                disabled={loading}
                className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-8 py-3 rounded-2xl flex items-center gap-2 hover:scale-105 transition"
              >
                <Sparkles size={18} />

                {loading ? "Generating..." : "Send"}
              </button>

              <button
                onClick={clearChat}
                className="border px-8 py-3 rounded-2xl flex items-center gap-2 hover:bg-gray-100"
              >
                <Trash2 size={18} />

                Clear
              </button>

            </div>

          </div>

        </div>

      </div>

    </div>
  );
}
