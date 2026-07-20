import os
import requests

API_URL = "https://openrouter.ai/api/v1/chat/completions"

# Models are tried in order until one succeeds
FREE_MODELS = [
    "openai/gpt-oss-20b:free",
    "google/gemma-4-31b-it:free",
    "google/gemma-4-26b-a4b-it:free",
    "nvidia/nemotron-3-ultra-550b-a55b:free",
    "nvidia/nemotron-3-super-120b-a12b:free",
]


def call_ai(api_key, system_prompt, user_prompt):

    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json",
    }

    last_error = None

    for model in FREE_MODELS:

        print(f"\nTrying model: {model}")

        data = {
            "model": model,
            "messages": [
                {
                    "role": "system",
                    "content": system_prompt,
                },
                {
                    "role": "user",
                    "content": user_prompt,
                },
            ],
        }

        try:

            response = requests.post(
                API_URL,
                headers=headers,
                json=data,
                timeout=90,
            )

            if response.status_code == 200:

                result = response.json()

                print(f"✅ Using model: {model}")

                return result["choices"][0]["message"]["content"]

            else:

                print(f"❌ {model} failed")
                print(response.text)

                last_error = response.text

        except requests.exceptions.RequestException as error:

            print(f"Connection Error ({model})")

            print(error)

            last_error = str(error)

    return None
