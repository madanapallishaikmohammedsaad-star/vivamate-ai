import { useState } from "react";
import { Sparkles, Copy, Trash2 } from "lucide-react";
import { generateAnswer } from "../services/ai";

export default function AIAnswer() {
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleGenerate() {
    if (!question.trim()) return;

    setLoading(true);
    setAnswer("");

    try {
      const result = await generateAnswer(question);
      setAnswer(result);
    } catch (error) {
      console.error(error);
      setAnswer("❌ Failed to generate answer.");
    } finally {
      setLoading(false);
    }
  }

  function copyAnswer() {
    navigator.clipboard.writeText(answer);
    alert("Answer copied!");
  }

  function clearAll() {
    setQuestion("");
    setAnswer("");
  }

  return (
    <div className="max-w-5xl mx-auto p-8">

      <h1 className="text-4xl font-bold mb-2">
        AI Answer Generator
      </h1>

      <p className="text-gray-500 mb-8">
        Ask any engineering question and VivaMate AI will generate an exam-ready answer.
      </p>

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

      {answer && (
        <div className="mt-10 bg-white shadow-xl rounded-2xl p-8">

          <div className="flex justify-between items-center mb-6">

            <h2 className="text-2xl font-bold">
              Generated Answer
            </h2>

            <button
              onClick={copyAnswer}
              className="flex items-center gap-2 bg-gray-100 px-4 py-2 rounded-lg hover:bg-gray-200"
            >
              <Copy size={18} />
              Copy
            </button>

          </div>

          <div className="whitespace-pre-wrap leading-8 text-gray-700">
            {answer}
          </div>

        </div>
      )}

    </div>
  );
}
