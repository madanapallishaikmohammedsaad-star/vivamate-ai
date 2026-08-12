"""
VivaMate AI Engine — VTU-aware with mark-based answer differentiation
"""
import os
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent))
from db import fetchone_db, query_db

import requests

API_URL = "https://openrouter.ai/api/v1/chat/completions"

FREE_MODELS = [
    "openai/gpt-oss-20b:free",
    "google/gemma-4-31b-it:free",
    "google/gemma-4-26b-a4b-it:free",
    "nvidia/nemotron-3-ultra-550b-a55b:free",
    "nvidia/nemotron-3-super-120b-a12b:free",
]

# === Mark-based answer instructions ===

MARK_INSTRUCTIONS = {
    2: """2 MARKS — Short Answer
- Give a brief definition (1-2 sentences)
- One key point
- Maximum 3-4 sentences total
- No diagrams, no examples needed""",

    5: """5 MARKS — Medium Answer
- Definition (1-2 sentences)
- Working/explanation (3-4 sentences)
- Key equations if relevant
- One practical point or example
- Keep concise — about 1 paragraph""",

    10: """10 MARKS — Detailed Answer
- Clear definition
- Principle/explanation with details
- Working mechanism or proof
- Relevant equations
- Advantages AND disadvantages (if applicable)
- Applications/examples
- Use proper headings
- About 2-3 paragraphs""",

    15: """15 MARKS — Full Exam Answer
Write a comprehensive answer with:
- Introduction (what it is, context)
- Detailed explanation with working/principle
- Diagrams described in text (e.g., "Diagram: Show a block diagram with X → Y → Z")
- Step-by-step process or algorithm
- Relevant equations with brief explanation
- Real-world example
- Advantages and disadvantages
- Applications
- Conclusion
Use proper headings and structure. This is a long-answer format.""",
}


def build_vtu_prompt(question, marks=5, subject_context=None):
    """Build an AI prompt enriched with VTU syllabus context."""
    mark_instruction = MARK_INSTRUCTIONS.get(marks, MARK_INSTRUCTIONS[5])

    system_prompt = f"""You are VivaMate AI — an expert VTU Engineering Professor with 20+ years of experience.

You generate university exam answers that are accurate, clear, and exam-ready.

STRICT RULES:
- Write ONLY the answer. Never explain your reasoning process.
- Never say "This answer should include..." or "A good answer is..."
- Use markdown formatting with proper headings
- Use standard engineering terminology
- Use simple, clear English suitable for university students
- If a diagram is needed, describe it in text (e.g., "Block Diagram: A → B → C")
- If formulas are needed, write them clearly

ANSWER LENGTH RULES:
{mark_instruction}"""

    # Add VTU context if available
    if subject_context:
        context_text = f"""
VTU SYLLABUS CONTEXT:
Course: {subject_context.get('course_code', '')} — {subject_context.get('course_title', '')}
Scheme: {subject_context.get('scheme', '')} | Branch: {subject_context.get('branch', '')} | Semester: {subject_context.get('semester', '')}

RELEVANT MODULES:
"""
        for mod in subject_context.get("modules", []):
                    context_text += f"\nModule {mod['module_number']}: {mod['title']}\n{mod['content'][:500]}\n"

        context_text += "\nUse the above syllabus context to make your answer relevant to the VTU curriculum."
        system_prompt += context_text

    return system_prompt, question


def call_ai(api_key, system_prompt, user_prompt):
    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json",
    }

    for model in FREE_MODELS:
        print(f"Trying model: {model}")
        data = {
            "model": model,
            "messages": [
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt},
            ],
        }
        try:
            response = requests.post(API_URL, headers=headers, json=data, timeout=90)
            if response.status_code == 200:
                result = response.json()
                print(f"✅ Using model: {model}")
                return result["choices"][0]["message"]["content"]
            else:
                print(f"❌ {model} failed: {response.status_code}")
        except requests.exceptions.RequestException as e:
            print(f"Connection Error ({model}): {e}")

    return None


def ask_vivamate(question, marks=5, subject_id=None, api_key=None):
    """Main AI entry point — VTU-aware with mark differentiation."""
    if not api_key:
        api_key = os.getenv("OPENROUTER_API_KEY")

    if not api_key:
        return "❌ API key missing. Open Settings and paste your OpenRouter API key (sk-or-v1-...), then try again."

    # Get subject context if subject_id provided
    subject_context = None
    if subject_id:
        subject_context = fetchone_db("SELECT * FROM subjects WHERE id=?", (subject_id,))
        if subject_context:
            modules = query_db(
                "SELECT module_number, title, content FROM modules WHERE subject_id=? ORDER BY module_number",
                (subject_id,)
            )
            subject_context["modules"] = modules

    system_prompt, user_prompt = build_vtu_prompt(question, marks, subject_context)
    answer = call_ai(api_key, system_prompt, user_prompt)

    if answer:
        return answer

    return """# VivaMate AI

❌ All free AI models are currently unavailable.

Possible reasons:
• Free models are temporarily offline
• Daily limit exceeded
• OpenRouter server issue

Please try again after a few minutes.
"""
