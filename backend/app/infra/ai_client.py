"""
Infrastructure layer: talks to the Gemini AI API via the
google-genai SDK (the current, unified Google GenAI library).
The rest of the app calls summarize_code() and doesn't care
which provider is behind it.
"""
import os
from google import genai
from dotenv import load_dotenv

# Load variables from the .env file into the environment.
load_dotenv()

# Read the key we stored in .env. Never hardcode it here.
_API_KEY = os.getenv("GEMINI_API_KEY")

if not _API_KEY:
    raise RuntimeError(
        "GEMINI_API_KEY not found. Did you create backend/.env with your key?"
    )

# Create the client once, when this module is first imported.
_client = genai.Client(api_key=_API_KEY)

# Flash models are fast and free-tier friendly — ideal for short summaries.
_MODEL_NAME = "gemini-2.5-flash-lite"


def summarize_code(filename: str, code: str) -> str:
    """
    Ask Gemini to explain a file's code in a few plain-English sentences.

    Args:
        filename: the file's name, for context in the prompt.
        code: the full text content of the file.

    Returns:
        A short plain-English explanation as a string.
    """
    prompt = (
        f"You are explaining code to a developer onboarding to a new project.\n"
        f"Explain what the file '{filename}' does in 3 simple sentences.\n"
        f"Be concise and avoid jargon.\n\n"
        f"Code:\n{code}"
    )

    response = _client.models.generate_content(
        model=_MODEL_NAME,
        contents=prompt,
    )
    return response.text