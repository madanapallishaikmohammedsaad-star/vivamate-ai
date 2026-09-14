import unittest

from app import app


class BackendSmokeTests(unittest.TestCase):
    def setUp(self):
        self.client = app.test_client()

    def test_health_endpoint(self):
        response = self.client.get("/health")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.get_json()["status"], "ok")

    def test_generate_answer_rejects_missing_json(self):
        response = self.client.post("/api/generate-answer")
        self.assertEqual(response.status_code, 400)
        self.assertIn("JSON object", response.get_json()["error"])

    def test_generate_answer_rejects_empty_question(self):
        response = self.client.post(
            "/api/generate-answer",
            json={"question": "   "},
        )
        self.assertEqual(response.status_code, 400)
        self.assertIn("enter a question", response.get_json()["error"])

    def test_viva_check_rejects_missing_answer(self):
        response = self.client.post(
            "/api/viva/check-answer",
            json={"question": "What is Python?", "answer": ""},
        )
        self.assertEqual(response.status_code, 400)
        self.assertIn("required", response.get_json()["error"])

    def test_quiz_rejects_invalid_question_count(self):
        response = self.client.post(
            "/api/quiz/generate",
            json={"num": 21},
        )
        self.assertEqual(response.status_code, 400)
        self.assertIn("between 1 and 20", response.get_json()["error"])


if __name__ == "__main__":
    unittest.main()
