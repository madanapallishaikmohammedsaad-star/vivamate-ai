import { useState } from "react";
import { Mic, CheckCircle, XCircle, ArrowRight, RotateCcw } from "lucide-react";
import { generateAnswer } from "../services/ai";

export default function Viva() {
  const [subject, setSubject] = useState("");
  const [started, setStarted] = useState(false);
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userAnswer, setUserAnswer] = useState("");
  const [feedback, setFeedback] = useState(null);
  const [loading, setLoading] = useState(false);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);

  async function startViva() {
    if (!subject.trim()) {
      alert("Please enter a subject name");
      return;
    }
    setLoading(true);
    try {
      const prompt = `Generate 5 short viva questions for the subject: ${subject}. Return ONLY a numbered list of 5 questions, nothing else. Keep questions concise and focused on core concepts.`;
      const result = await generateAnswer(prompt);
      const lines = result
        .split("\n")
        .map((l) => l.replace(/^\d+[\.\)]\s*/, "").trim())
        .filter((l) => l.length > 10);
      setQuestions(lines.slice(0, 5));
      setCurrentIndex(0);
      setScore(0);
      setStarted(true);
      setFinished(false);
      setUserAnswer("");
      setFeedback(null);
    } catch (err) {
      console.error(err);
      alert("Failed to generate questions. Try again.");
    } finally {
      setLoading(false);
    }
  }

  async function checkAnswer() {
    if (!userAnswer.trim()) {
      alert("Please write an answer first");
      return;
    }
    setLoading(true);
    try {
      const prompt = `You are an examiner. The student was asked: "${questions[currentIndex]}"
Their answer: "${userAnswer}"
Give brief feedback in this exact format:
SCORE: X/10
FEEDBACK: One or two sentences explaining if the answer was correct and what could be improved.`;
      const result = await generateAnswer(prompt);

      const scoreMatch = result.match(/SCORE:\s*(\d+)/i);
      const feedbackMatch = result.match(/FEEDBACK:\s*(.+)/i);
      const earned = scoreMatch ? parseInt(scoreMatch[1]) : 5;

      setFeedback({
        score: earned,
        text: feedbackMatch ? feedbackMatch[1] : result.slice(0, 200),
      });
      setScore((prev) => prev + earned);
    } catch (err) {
      console.error(err);
      setFeedback({ score: 0, text: "Could not evaluate. Try again." });
    } finally {
      setLoading(false);
    }
  }

  function nextQuestion() {
    if (currentIndex + 1 >= questions.length) {
      setFinished(true);
      return;
    }
    setCurrentIndex((prev) => prev + 1);
    setUserAnswer("");
    setFeedback(null);
  }

  function restartViva() {
    setStarted(false);
    setQuestions([]);
    setCurrentIndex(0);
    setUserAnswer("");
    setFeedback(null);
    setScore(0);
    setFinished(false);
  }

  const maxScore = questions.length * 10;

  if (finished) {
    const percentage = maxScore > 0 ? Math.round((score / maxScore) * 100) : 0;
    const emoji = percentage >= 80 ? "🎉" : percentage >= 50 ? "👍" : "💪";
    const message =
      percentage >= 80
        ? "Excellent! You're well prepared!"
        : percentage >= 50
        ? "Good effort! Review the weak areas."
        : "Keep practicing! You'll get better.";

    return (
      <div className="p-8">
        <div className="bg-white rounded-3xl shadow p-16 text-center max-w-2xl mx-auto">
          <div className="text-6xl mb-6">{emoji}</div>
          <h1 className="text-3xl font-bold">Viva Complete!</h1>
          <p className="text-gray-500 mt-2">Subject: {subject}</p>

          <div className="my-8">
            <div className="text-5xl font-bold text-blue-600">{score}/{maxScore}</div>
            <p className="text-gray-500 mt-2">Total Score ({percentage}%)</p>
          </div>

          <div className="bg-blue-50 rounded-xl p-6 mb-8">
            <p className="text-lg">{message}</p>
          </div>

          <button
            onClick={restartViva}
            className="bg-blue-600 text-white px-8 py-3 rounded-xl flex items-center gap-2 mx-auto hover:bg-blue-700"
          >
            <RotateCcw size={18} /> Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!started) {
    return (
      <div className="p-8">
        <h1 className="text-3xl font-bold mb-2">🎤 AI Viva Practice</h1>
        <p className="text-gray-500 mb-8">Practice viva questions with AI feedback</p>

        <div className="bg-white rounded-3xl shadow p-12 max-w-2xl mx-auto text-center">
          <Mic className="mx-auto text-blue-500 mb-4" size={64} />
          <h2 className="text-2xl font-bold mb-4">Start a Mock Viva</h2>
          <p className="text-gray-500 mb-8">
            Enter your subject and the AI will generate viva questions for you to practice.
          </p>

          <input
            type="text"
            placeholder="Enter subject (e.g. DBMS, Java, Computer Networks)"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") startViva();
            }}
            className="w-full border rounded-xl p-4 mb-6 text-center text-lg"
          />

          <button
            onClick={startViva}
            disabled={loading}
            className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-10 py-4 rounded-xl text-lg font-semibold flex items-center gap-2 mx-auto hover:scale-105 transition disabled:opacity-50"
          >
            {loading ? "Generating Questions..." : "Start Viva"}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">🎤 AI Viva Practice</h1>
          <p className="text-gray-500">Subject: {subject}</p>
        </div>
        <div className="bg-blue-100 text-blue-700 px-6 py-2 rounded-xl font-bold">
          Question {currentIndex + 1} / {questions.length}
        </div>
      </div>

      <div className="bg-white rounded-3xl shadow p-8 max-w-3xl mx-auto">
        <div className="bg-blue-50 border-l-4 border-blue-600 p-6 rounded-xl mb-6">
          <p className="text-gray-500 text-sm mb-2 font-semibold">VIVA QUESTION</p>
          <p className="text-lg font-bold">{questions[currentIndex]}</p>
        </div>

        {!feedback ? (
          <>
            <textarea
              rows={4}
              value={userAnswer}
              onChange={(e) => setUserAnswer(e.target.value)}
              placeholder="Type your answer here..."
              className="w-full border rounded-xl p-4 mb-4 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={checkAnswer}
              disabled={loading || !userAnswer.trim()}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-8 py-3 rounded-xl flex items-center gap-2 hover:scale-105 transition disabled:opacity-50"
            >
              {loading ? "Checking..." : "Check Answer"}
            </button>
          </>
        ) : (
          <>
            <div className="bg-gray-50 rounded-xl p-6 mb-6">
              <div className="flex items-center gap-3 mb-3">
                {feedback.score >= 7 ? (
                  <CheckCircle className="text-green-500" size={24} />
                ) : feedback.score >= 4 ? (
                  <CheckCircle className="text-yellow-500" size={24} />
                ) : (
                  <XCircle className="text-red-500" size={24} />
                )}
                <span className="font-bold text-xl">
                  Score: {feedback.score} / 10
                </span>
              </div>
              <p className="text-gray-700">{feedback.text}</p>
            </div>

            <div className="flex justify-between items-center">
              <div className="text-sm text-gray-500">
                Running score: {score + feedback.score} / {((currentIndex + 1) * 10)}
              </div>
              <button
                onClick={nextQuestion}
                className="bg-blue-600 text-white px-8 py-3 rounded-xl flex items-center gap-2 hover:bg-blue-700 transition"
              >
                {currentIndex + 1 >= questions.length ? "Finish" : "Next Question"}
                <ArrowRight size={18} />
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
