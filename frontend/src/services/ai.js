import api from "./api";

export async function generateAnswer(question, marks = 5, subjectId = null) {
  const res = await api.post("/api/generate-answer", {
    question,
    marks: Number(marks),
    subject_id: subjectId,
  });
  return res.data.answer;
}

export async function generateVivaQuestion(subjectId, topic = "general") {
  const res = await api.post("/api/viva/generate-question", {
    subject_id: subjectId,
    topic,
  });
  return res.data.question;
}

export async function checkVivaAnswer(question, answer, subjectId) {
  const res = await api.post("/api/viva/check-answer", {
    question,
    answer,
    subject_id: subjectId,
  });
  return res.data.evaluation;
}

export async function generateQuiz(subjectId, num = 5) {
  const res = await api.post("/api/quiz/generate", {
    subject_id: subjectId,
    num,
  });
  return res.data.quiz;
}
