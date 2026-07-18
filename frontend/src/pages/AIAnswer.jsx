import ChatBubble from "../components/ChatBubble";
import { useState } from "react";
import { Sparkles, Copy, Trash2 } from "lucide-react";
import { generateAnswer } from "../services/ai";

export default function AIAnswer() {
  const [question, setQuestion] = useState("");
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState([]);

 async function handleGenerate() {
  if (!question.trim()) return;

  const userQuestion = question;

  setLoading(true);
  setQuestion("");

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
  function copyAnswer(text) {
  navigator.clipboard.writeText(text);
  alert("Answer copied!");
}
  function clearAll() {
  setQuestion("");
  setMessages([]);
}
  return (
   <div className="max-w-5xl mx-auto h-screen flex flex-col p-6">
     <div className="mb-6">
  <h1 className="text-4xl font-bold">
    🤖 VivaMate AI
  </h1>

  <p className="text-gray-500">
    Your Engineering AI Assistant
  </p>
</div>

      <textarea
        className="w-full h-44 border rounded-2xl p-5 text-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        placeholder="Example: Explain Operating System for 5 Marks..."
        value={question}
        onChange={(e) => setQuestion(e.target.value)}
      />

      <div className="flex gap-4 mt-6">

        <button
          onClick={handleGenerate}
          disabled={loading}
          className="bg-blue-600 text-white px-8 py-3 rounded-xl flex items-center gap-2 hover:bg-blue-700 transition"
        >
          <Sparkles size={20} />

          {loading ? "Generating..." : "Generate Answer"}
        </button>

        <button
          onClick={clearAll}
          className="border px-6 py-3 rounded-xl flex items-center gap-2"
        >
          <Trash2 size={18} />
          Clear
        </button>

      </div>

      {loading && (
        <div className="mt-10 bg-blue-50 p-6 rounded-2xl">
          🤖 VivaMate AI is thinking...
        </div>
      )}

      <div className="mt-10 space-y-6">

  <div className="mt-10 space-y-4">

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

</div>

</div>

    </div>
  );
}
