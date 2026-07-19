import { useState, useRef, useEffect } from "react";
import { Sparkles, Trash2 } from "lucide-react";
import ChatBubble from "../components/ChatBubble";
import { generateAnswer } from "../services/ai";

export default function AIAnswer() {
  const [question, setQuestion] = useState("");
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState([]);

  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [messages, loading]);

  async function handleGenerate() {
    if (!question.trim() || loading) return;

    const userQuestion = question;

    setQuestion("");
    setLoading(true);

    try {
      const result = await generateAnswer(userQuestion);

      setMessages((prev) => [
        ...prev,
        {
          question: userQuestion,
          answer: result,
        },
      ]);
    } catch (error) {
      console.error(error);

      setMessages((prev) => [
        ...prev,
        {
          question: userQuestion,
          answer: "❌ Failed to generate answer.",
        },
      ]);
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  }

  function clearChat() {
    setMessages([]);
    setQuestion("");
    inputRef.current?.focus();
  }

  return (
    <div className="h-screen flex flex-col bg-gray-100">

      {/* Header */}

      <div className="sticky top-0 z-10 bg-white/90 backdrop-blur border-b p-5">

        <h1 className="text-3xl font-bold">
          🤖 VivaMate AI
        </h1>

        <p className="text-gray-500">
          Your Engineering AI Assistant
        </p>

      </div>

      {/* Chat */}

      <div className="flex-1 overflow-y-auto px-6 py-8 space-y-6">

        {messages.length === 0 && (

          <div className="flex flex-col items-center justify-center h-full text-center">

            <div className="text-7xl mb-6">
              🤖
            </div>

            <h2 className="text-4xl font-bold">
              Welcome to VivaMate AI
            </h2>

            <p className="text-gray-500 mt-4 max-w-xl">
              Ask engineering questions, solve previous papers,
              prepare for viva, and generate exam-ready answers.
            </p>

          </div>

        )}

        {messages.map((msg, index) => (

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

        ))}

        {loading && (

          <div className="bg-white rounded-3xl p-5 shadow-lg border w-fit animate-pulse">

            🤖 VivaMate AI is thinking...

          </div>

        )}

        <div ref={bottomRef}></div>

      </div>

      {/* Bottom Input */}

      <div className="bg-white border-t p-5">

        <div className="flex gap-4">

          <textarea
            ref={inputRef}
            disabled={loading}
            rows={2}
            value={question}
            placeholder="Ask any engineering question..."
            onChange={(e) => setQuestion(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleGenerate();
              }
            }}
            className="flex-1 bg-gray-50 border border-gray-200 rounded-3xl p-5 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
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
  );
}
