import { useState, useRef, useEffect } from "react";
import { Sparkles, Trash2 } from "lucide-react";
import ChatBubble from "../components/ChatBubble";
import { generateAnswer } from "../services/ai";

export default function AIAnswer() {
  const [question, setQuestion] = useState("");
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState([]);

  const bottomRef = useRef(null);
  useEffect(() => {
  bottomRef.current?.scrollIntoView({
    behavior: "smooth",
  });
}, [messages, loading]);
  async function handleGenerate() {
    if (!question.trim()) return;

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
    }
  }

  function clearChat() {
    setMessages([]);
    setQuestion("");
  }

  return (
    <div className="h-screen flex flex-col bg-gray-100">

      {/* Header */}

      <div className="bg-white shadow p-6">
        <h1 className="text-3xl font-bold">
          🤖 VivaMate AI
        </h1>

        <p className="text-gray-500">
          Your Engineering AI Assistant
        </p>
      </div>

      {/* Chat */}

      <div className="flex-1 overflow-y-auto p-6">

        {messages.length === 0 && (
          <div className="text-center text-gray-400 mt-20">
            <h2 className="text-2xl font-semibold">
              Welcome to VivaMate AI
            </h2>

            <p className="mt-3">
              Ask any engineering question to get started.
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
          <div className="bg-white rounded-2xl p-5 shadow w-fit">
            🤖 VivaMate AI is thinking...
          </div>
        )}

      </div>

      {/* Bottom Input */}

      <div className="bg-white border-t p-5">

        <div className="flex gap-3">

          <textarea
            rows={2}
            className="flex-1 border rounded-2xl p-4 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Ask any engineering question..."
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
          />

          <div className="flex flex-col gap-3">

            <button
              onClick={handleGenerate}
              disabled={loading}
              className="bg-blue-600 text-white px-6 py-3 rounded-xl flex items-center gap-2 hover:bg-blue-700"
            >
              <Sparkles size={18} />

              {loading ? "Generating..." : "Send"}
            </button>

            <button
              onClick={clearChat}
              className="border px-6 py-3 rounded-xl flex items-center gap-2 hover:bg-gray-100"
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
