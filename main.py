"""CLI chatbot powered by Groq API with Meta Llama models."""

from __future__ import annotations

import os
import sys
from typing import Any

from dotenv import load_dotenv
from groq import Groq

DEFAULT_MODEL = "llama-3.3-70b-versatile"
META_MODELS = {
    "1": ("llama-3.3-70b-versatile", "Llama 3.3 70B — strong general chat"),
    "2": ("llama-3.1-8b-instant", "Llama 3.1 8B — fast, low latency"),
    "3": ("meta-llama/llama-4-scout-17b-16e-instruct", "Llama 4 Scout 17B — latest Meta model"),
}
SYSTEM_PROMPT = (
    "You are a helpful, concise assistant. "
    "Answer clearly and ask follow-up questions when the request is ambiguous."
)


def get_client() -> Groq:
    load_dotenv()
    api_key = os.getenv("GROQ_API_KEY")
    if not api_key:
        print(
            "Missing GROQ_API_KEY.\n"
            "1. Get a free key at https://console.groq.com/keys\n"
            "2. Copy .env.example to .env and paste your key"
        )
        sys.exit(1)
    return Groq(api_key=api_key)


def choose_model() -> str:
    print("\nAvailable Meta Llama models on Groq:")
    for key, (_, label) in META_MODELS.items():
        print(f"  [{key}] {label}")
    print(f"  [Enter] Default ({DEFAULT_MODEL})")

    try:
        choice = input("\nPick a model: ").strip()
    except (EOFError, KeyboardInterrupt):
        print(f"\nNo model selected. Using {DEFAULT_MODEL}.")
        return DEFAULT_MODEL
    if not choice:
        return DEFAULT_MODEL
    if choice in META_MODELS:
        return META_MODELS[choice][0]

    print(f"Unknown choice. Using {DEFAULT_MODEL}.")
    return DEFAULT_MODEL


def stream_reply(client: Groq, messages: list[dict[str, str]], model: str) -> str:
    chunks: list[str] = []
    stream = client.chat.completions.create(
        model=model,
        messages=messages,
        temperature=0.7,
        max_tokens=2048,
        stream=True,
    )

    print("Assistant: ", end="", flush=True)
    for chunk in stream:
        delta = chunk.choices[0].delta.content or ""
        if delta:
            print(delta, end="", flush=True)
            chunks.append(delta)
    print()
    return "".join(chunks)


def main() -> None:
    client = get_client()
    model = choose_model()
    messages: list[dict[str, Any]] = [{"role": "system", "content": SYSTEM_PROMPT}]

    print(f"\nGroq chatbot ready ({model}).")
    print("Commands: /clear  /model  /help  exit\n")

    while True:
        try:
            user_input = input("You: ").strip()
        except (EOFError, KeyboardInterrupt):
            print("\nGoodbye!")
            break

        if not user_input:
            continue

        lowered = user_input.lower()
        if lowered in {"exit", "quit", "q"}:
            print("Goodbye!")
            break

        if lowered == "/clear":
            messages = [{"role": "system", "content": SYSTEM_PROMPT}]
            print("Conversation cleared.\n")
            continue

        if lowered == "/model":
            model = choose_model()
            print(f"Switched to {model}.\n")
            continue

        if lowered == "/help":
            print(
                "Type your message and press Enter.\n"
                "/clear  — reset conversation\n"
                "/model  — switch Meta Llama model\n"
                "exit    — quit\n"
            )
            continue

        messages.append({"role": "user", "content": user_input})

        try:
            assistant_text = stream_reply(client, messages, model)
        except Exception as exc:
            messages.pop()
            print(f"\nError: {exc}\n")
            continue

        messages.append({"role": "assistant", "content": assistant_text})
        print()


if __name__ == "__main__":
    main()
