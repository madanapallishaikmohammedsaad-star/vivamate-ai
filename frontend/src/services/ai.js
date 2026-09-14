import api from "./api";

function requireText(value, field) {
  const text = String(value ?? "").trim();
  if (!text) throw new Error(`${field} is required.`);
  return text;
}

export async function generateAnswer(question, marks = 5, subjectId = null) {
  const validQuestion = requireText(question, "Question");
  const validMarks = Number(marks);
  if (![2, 5, 10, 15].includes(validMarks)) throw new Error("Answer length must be 2, 5, 10, or 15 marks.");
  const res = await api.post("/api/generate-answer", { question: validQuestion, marks: validMarks, subject_id: subjectId });
  if (!res.data?.answer) throw new Error("The AI returned an empty answer.");
  return res.data.answer;
}

export async function generateVivaQuestion(subjectId, topic = "general") {
  if (!subjectId) throw new Error("Please select a subject first.");
  const res = await api.post("/api/viva/generate-question", { subject_id: subjectId, topic: requireText(topic, "Topic") });
  if (!res.data?.question) throw new Error("The AI returned no viva question.");
  return res.data.question;
}

export async function checkVivaAnswer(question, answer, subjectId) {
  if (!subjectId) throw new Error("Please select a subject first.");
  const res = await api.post("/api/viva/check-answer", { question: requireText(question, "Question"), answer: requireText(answer, "Answer"), subject_id: subjectId });
  if (!res.data?.evaluation) throw new Error("The AI returned no evaluation.");
  return res.data.evaluation;
}

export async function generateQuiz(subjectId, num = 5) {
  if (!subjectId) throw new Error("Please select a subject first.");
  const count = Number(num);
  if (!Number.isInteger(count) || count < 1 || count > 20) throw new Error("Quiz size must be between 1 and 20 questions.");
  const res = await api.post("/api/quiz/generate", { subject_id: subjectId, num: count });
  if (!res.data?.quiz) throw new Error("The AI returned no quiz.");
  return res.data.quiz;
}
