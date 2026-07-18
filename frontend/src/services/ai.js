import api from "./api";

export async function generateAnswer(question) {
  const res = await api.post("/api/generate-answer", {
    question,
  });

  return res.data.answer;
}
