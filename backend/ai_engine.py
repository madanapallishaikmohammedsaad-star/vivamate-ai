import requests
import os

API_URL = "https://openrouter.ai/api/v1/chat/completions"


def call_ai(api_key, system_prompt, user_prompt):
    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json",
    }

    data = {
        "model": "openrouter/free",
        "messages": [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_prompt},
        ],
    }

    try:
        response = requests.post(
            API_URL,
            headers=headers,
            json=data,
            timeout=60,
        )

        if response.status_code == 200:
            result = response.json()
            return result["choices"][0]["message"]["content"]

        print(response.text)
        return None

    except requests.exceptions.RequestException as error:
        print(error)
        return None


def ask_vivamate(question):
    api_key = os.getenv("OPENROUTER_API_KEY")

    if not api_key:
        return "Error: OPENROUTER_API_KEY is not set."

    generator_prompt = """
You are VivaMate AI, an expert engineering professor.

Generate ONLY the final exam answer.

Rules:
- Never explain your reasoning.
- Never say "This answer should include..."
- Never talk to the student.
- Return only the final answer.

Format:

# Topic

## Definition

## Explanation

## Key Points

## Advantages (if applicable)

## Disadvantages (if applicable)

## Applications (if applicable)

Use proper engineering terminology.
"""

    draft_answer = call_ai(
        api_key,
        generator_prompt,
        question,
    )

    if draft_answer is None:
        return "VivaMate could not generate an answer."

    reviewer_prompt = """
You are a strict engineering professor.

Review the answer.

Correct technical mistakes.

Return ONLY the corrected final answer.
"""

    review_input = f"""
QUESTION:

{question}

ANSWER:

{draft_answer}
"""

    final_answer = call_ai(
        api_key,
        reviewer_prompt,
        review_input,
    )

    if final_answer is None:
        return draft_answer

    return final_answer
