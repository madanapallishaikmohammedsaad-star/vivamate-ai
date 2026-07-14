import requests
import os


API_URL = "https://openrouter.ai/api/v1/chat/completions"


def call_ai(api_key, system_prompt, user_prompt):
    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json"
    }

    data = {
        "model": "openrouter/free",
        "messages": [
            {
                "role": "system",
                "content": system_prompt
            },
            {
                "role": "user",
                "content": user_prompt
            }
        ]
    }

    try:
        response = requests.post(
            API_URL,
            headers=headers,
            json=data,
            timeout=60
        )

        if response.status_code == 200:
            result = response.json()

            print("MODEL USED:", result["model"])

            return result["choices"][0]["message"]["content"]

        print(response.text)
        return None

    except requests.exceptions.RequestException as error:
        print("Connection error:", error)
        return None


def ask_vivamate(question):
    api_key = os.getenv("OPENROUTER_API_KEY")

    if not api_key:
        return "Error: OPENROUTER_API_KEY is not set."

    generator_prompt = """
You are VivaMate AI, an engineering university exam assistant.

Generate a technically accurate and exam-focused answer.

Rules:
- Use standard engineering terminology.
- Match the answer length to the marks requested.
- For 2 marks, give a definition and 2 to 3 key points.
- For 5 marks, give a concise definition, working, essential equations and key points.
- For 10 marks, give detailed explanation and derivation when required.
- Define symbols used in equations.
- Do not invent formulas.
- Avoid unnecessary advanced information.
- Do not mix languages.
- Do not generate corrupted words.
"""

    draft_answer = call_ai(
        api_key,
        generator_prompt,
        question
    )

    if draft_answer is None:
        return "VivaMate could not generate an answer."

    reviewer_prompt = """
You are a strict engineering professor and technical reviewer.

Review the engineering answer provided by the user.

Your task:
1. Detect incorrect definitions.
2. Detect incorrect equations.
3. Detect incorrect circuit descriptions.
4. Detect wrong component polarity or connections.
5. Detect misleading engineering statements.
6. Check whether the answer matches the requested marks.
7. Correct every technical mistake you find.

Return ONLY the corrected final exam answer.

Do not discuss the review process.
Do not say what was wrong.
Do not mention the original answer.
Do not add unnecessary advanced content.
"""

    review_input = f"""
QUESTION:

{question}

DRAFT ANSWER:

{draft_answer}
"""

    final_answer = call_ai(
        api_key,
        reviewer_prompt,
        review_input
    )

    if final_answer is None:
        return draft_answer

    return final_answer
