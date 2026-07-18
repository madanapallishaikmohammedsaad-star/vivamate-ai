import { useState } from "react";
import { Sparkles } from "lucide-react";
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
      setAnswer("Failed to generate answer.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="p-8">
      <h1 className="text-4xl font-bold mb-6">
        AI Answer Generator
      </h1>

      <textarea
        className="w-full h-40 border rounded-xl p-4"
        placeholder="Ask any engineering question..."
        value={question}
        onChange={(e) => setQuestion(e.target.value)}
      />

      <button
        onClick={handleGenerate}
        disabled={loading}
        className="mt-5 flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-xl"
      >
        <Sparkles size={18} />
        {loading ? "Generating..." : "Generate Answer"}
      </button>

      {answer && (
        <div className="mt-8 bg-white shadow rounded-xl p-6">
          <h2 className="text-xl font-bold mb-3">Answer</h2>
          <p className="whitespace-pre-wrap">{answer}</p>
        </div>
      )}
    </div>
  );
}
