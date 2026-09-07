#!/usr/bin/env python3
"""
ai_router.py — routes a prompt to the cheapest/best-fit model across
multiple AI providers (Anthropic, OpenAI, Google Gemini, Groq, OpenRouter).

Usage:
    python router.py "Write a Python function to reverse a linked list"
    python router.py --task creative "Write a short poem about the monsoon"
    python router.py --interactive

Setup:
    1. pip install -r requirements.txt
    2. cp .env.example .env   and fill in whichever API keys you have.
       You do NOT need all of them — the router only uses models whose
       keys are present, and skips/falls back for the rest.
"""

import os
import re
import sys
import json
import argparse
import requests
from dotenv import load_dotenv

load_dotenv()

# ---------------------------------------------------------------------------
# 1. MODEL REGISTRY
#    cost_in / cost_out are USD per 1M tokens (list price, edit as prices
#    change — always double check the provider's pricing page before
#    relying on these for real budgeting).
#    tags describe what each model is good/cheap for; the router matches
#    a task's required tags against this list and picks the cheapest fit.
# ---------------------------------------------------------------------------

MODELS = {
    # --- Anthropic ---
    "claude-haiku-4-5-20251001": {
        "provider": "anthropic", "cost_in": 1.0, "cost_out": 5.0,
        "tags": {"simple", "chat", "code", "cheap", "fast"},
    },
    "claude-sonnet-5": {
        "provider": "anthropic", "cost_in": 2.0, "cost_out": 10.0,
        "tags": {"code", "reasoning", "chat", "long_context", "vision"},
    },
    "claude-opus-5": {
        "provider": "anthropic", "cost_in": 5.0, "cost_out": 25.0,
        "tags": {"reasoning", "code", "agentic", "long_context", "vision"},
    },

    # --- OpenAI (edit model names/prices if OpenAI has updated their lineup) ---
    "gpt-4o-mini": {
        "provider": "openai", "cost_in": 0.15, "cost_out": 0.6,
        "tags": {"simple", "chat", "code", "cheap", "fast", "vision"},
    },
    "gpt-4o": {
        "provider": "openai", "cost_in": 2.5, "cost_out": 10.0,
        "tags": {"reasoning", "code", "chat", "vision"},
    },

    # --- Google Gemini ---
    "gemini-1.5-flash": {
        "provider": "google", "cost_in": 0.075, "cost_out": 0.3,
        "tags": {"simple", "chat", "code", "cheap", "fast", "vision"},
    },
    "gemini-1.5-pro": {
        "provider": "google", "cost_in": 1.25, "cost_out": 5.0,
        "tags": {"reasoning", "code", "chat", "long_context", "vision"},
    },

    # --- Groq (fast open-weight inference; very cheap, no vision) ---
    "openai/gpt-oss-20b": {
        "provider": "groq", "cost_in": 0.05, "cost_out": 0.08,
        "tags": {"simple", "chat", "cheap", "fast"},
    },
    "openai/gpt-oss-120b": {
        "provider": "groq", "cost_in": 0.59, "cost_out": 0.79,
        "tags": {"reasoning", "code", "chat", "cheap"},
    },
}

# ---------------------------------------------------------------------------
# 2. TASK CLASSIFICATION
#    Simple keyword heuristics. Swap this out for an LLM-based classifier
#    later if you want something smarter — this is deliberately cheap/fast
#    since it runs on every request before we even pick a model.
# ---------------------------------------------------------------------------

TASK_RULES = [
    ("vision", [r"\bimage\b", r"\bphoto\b", r"\bscreenshot\b", r"\bpicture\b"]),
    ("code", [r"\bcode\b", r"\bfunction\b", r"\bbug\b", r"\bscript\b", r"\bpython\b",
              r"\bjava\b", r"\balgorithm\b", r"\bdebug\b"]),
    ("creative", [r"\bpoem\b", r"\bstory\b", r"\bwrite a\b.*\b(blog|essay|caption)\b",
                  r"\bcreative\b"]),
    ("reasoning", [r"\bwhy\b", r"\bexplain\b", r"\banalyz", r"\bcompare\b",
                   r"\bstrategy\b", r"\bplan\b"]),
    ("long_context", [r"\bsummari[sz]e this (document|file|pdf|report)\b"]),
]


def classify_task(prompt: str) -> set:
    """Return a set of required/preferred tags for a prompt."""
    text = prompt.lower()
    tags = set()
    for tag, patterns in TASK_RULES:
        if any(re.search(p, text) for p in patterns):
            tags.add(tag)

    # Default: short prompts with no special need -> "simple" (cheap models ok)
    if not tags and len(prompt.split()) < 40:
        tags.add("simple")
    if not tags:
        tags.add("reasoning")  # long, unclassified prompt -> assume it needs a capable model

    return tags


# ---------------------------------------------------------------------------
# 3. MODEL SELECTION
# ---------------------------------------------------------------------------

def available_models():
    """Only models whose provider has an API key set in the environment."""
    key_present = {
        "anthropic": bool(os.getenv("ANTHROPIC_API_KEY")),
        "openai": bool(os.getenv("OPENAI_API_KEY")),
        "google": bool(os.getenv("GOOGLE_API_KEY")),
        "groq": bool(os.getenv("GROQ_API_KEY")),
    }
    return {mid: cfg for mid, cfg in MODELS.items() if key_present.get(cfg["provider"])}


def pick_model(required_tags: set, avoid: set = None) -> str:
    """Pick the cheapest available model whose tags cover the required tags."""
    avoid = avoid or set()
    candidates = [
        (mid, cfg) for mid, cfg in available_models().items()
        if mid not in avoid and required_tags.issubset(cfg["tags"])
    ]
    if not candidates:
        # relax: just require ANY overlap instead of full coverage
        candidates = [
            (mid, cfg) for mid, cfg in available_models().items()
            if mid not in avoid and required_tags & cfg["tags"]
        ]
    if not candidates:
        # last resort: any available model at all
        candidates = [(mid, cfg) for mid, cfg in available_models().items() if mid not in avoid]
    if not candidates:
        raise RuntimeError(
            "No API keys found. Set at least one of ANTHROPIC_API_KEY, "
            "OPENAI_API_KEY, GOOGLE_API_KEY, GROQ_API_KEY in your .env file."
        )
    # cheapest by blended cost (rough: 1 part input, 3 parts output, output is usually longer)
    candidates.sort(key=lambda kv: kv[1]["cost_in"] + 3 * kv[1]["cost_out"])
    return candidates[0][0]


# ---------------------------------------------------------------------------
# 4. PROVIDER CALL FUNCTIONS
#    Each returns plain text, or raises an exception on failure.
# ---------------------------------------------------------------------------

def call_anthropic(model, prompt, max_tokens=1000):
    resp = requests.post(
        "https://api.anthropic.com/v1/messages",
        headers={
            "x-api-key": os.environ["ANTHROPIC_API_KEY"],
            "anthropic-version": "2023-06-01",
            "content-type": "application/json",
        },
        json={
            "model": model,
            "max_tokens": max_tokens,
            "messages": [{"role": "user", "content": prompt}],
        },
        timeout=60,
    )
    resp.raise_for_status()
    data = resp.json()
    return "".join(block.get("text", "") for block in data.get("content", []))


def call_openai(model, prompt, max_tokens=1000):
    resp = requests.post(
        "https://api.openai.com/v1/chat/completions",
        headers={
            "Authorization": f"Bearer {os.environ['OPENAI_API_KEY']}",
            "content-type": "application/json",
        },
        json={
            "model": model,
            "max_tokens": max_tokens,
            "messages": [{"role": "user", "content": prompt}],
        },
        timeout=60,
    )
    resp.raise_for_status()
    return resp.json()["choices"][0]["message"]["content"]


def call_google(model, prompt, max_tokens=1000):
    url = f"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent"
    resp = requests.post(
        url,
        params={"key": os.environ["GOOGLE_API_KEY"]},
        json={
            "contents": [{"parts": [{"text": prompt}]}],
            "generationConfig": {"maxOutputTokens": max_tokens},
        },
        timeout=60,
    )
    resp.raise_for_status()
    data = resp.json()
    return data["candidates"][0]["content"]["parts"][0]["text"]


def call_groq(model, prompt, max_tokens=1000):
    resp = requests.post(
        "https://api.groq.com/openai/v1/chat/completions",
        headers={
            "Authorization": f"Bearer {os.environ['GROQ_API_KEY']}",
            "content-type": "application/json",
        },
        json={
            "model": model,
            "max_tokens": max_tokens,
            "messages": [{"role": "user", "content": prompt}],
        },
        timeout=60,
    )
    resp.raise_for_status()
    return resp.json()["choices"][0]["message"]["content"]


DISPATCH = {
    "anthropic": call_anthropic,
    "openai": call_openai,
    "google": call_google,
    "groq": call_groq,
}


# ---------------------------------------------------------------------------
# 5. TOP-LEVEL ROUTER (with fallback if the chosen model/provider errors out)
# ---------------------------------------------------------------------------

def route(prompt: str, task_override: str = None, max_tokens: int = 1000, verbose: bool = True):
    tags = {task_override} if task_override else classify_task(prompt)
    tried = set()

    while True:
        model_id = pick_model(tags, avoid=tried)
        cfg = MODELS[model_id]
        if verbose:
            print(f"[router] task tags={tags} -> model={model_id} ({cfg['provider']})",
                  file=sys.stderr)
        try:
            fn = DISPATCH[cfg["provider"]]
            return fn(model_id, prompt, max_tokens=max_tokens), model_id
        except Exception as e:
            if verbose:
                print(f"[router] {model_id} failed ({e}), trying next model...", file=sys.stderr)
            tried.add(model_id)
            if len(tried) >= len(available_models()):
                raise RuntimeError("All candidate models failed.") from e


# ---------------------------------------------------------------------------
# 6. CLI
# ---------------------------------------------------------------------------

def main():
    parser = argparse.ArgumentParser(description="Route a prompt to the best/cheapest AI model.")
    parser.add_argument("prompt", nargs="?", help="The prompt to send")
    parser.add_argument("--task", choices=["simple", "code", "creative", "reasoning",
                                            "vision", "long_context"],
                         help="Force a task type instead of auto-classifying")
    parser.add_argument("--max-tokens", type=int, default=1000)
    parser.add_argument("--interactive", action="store_true", help="Start a REPL")
    args = parser.parse_args()

    if args.interactive or not args.prompt:
        print("AI Router — interactive mode. Type 'exit' to quit.\n")
        while True:
            try:
                prompt = input(">>> ")
            except (EOFError, KeyboardInterrupt):
                break
            if prompt.strip().lower() in ("exit", "quit"):
                break
            if not prompt.strip():
                continue
            try:
                answer, used_model = route(prompt, task_override=args.task,
                                            max_tokens=args.max_tokens)
                print(f"\n[{used_model}]\n{answer}\n")
            except Exception as e:
                print(f"Error: {e}\n")
    else:
        answer, used_model = route(args.prompt, task_override=args.task,
                                    max_tokens=args.max_tokens)
        print(f"[{used_model}]\n{answer}")


if __name__ == "__main__":
    main()
