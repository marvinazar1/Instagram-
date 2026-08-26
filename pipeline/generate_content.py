#!/usr/bin/env python3
"""Generate a Reel script + Instagram caption for one topic using Claude.

Picks a topic from the 4-pillar content bank (pipeline/topics.json --
{"pillars": [id, ...], "<pillar_id>": ["topic title", ...]}), rotating
pillars and avoiding recently-used topics, then asks Claude to turn it into
a structured short-form video script matching the schema consumed by
src/VideoTemplate.tsx.

Usage:
    python pipeline/generate_content.py
    python pipeline/generate_content.py --pillar market_updates
    python pipeline/generate_content.py --topic-id market_updates:average-days-on-market-vs-last-year
    python pipeline/generate_content.py --output pipeline/output/content.json
"""

from __future__ import annotations

import argparse
import json
import os
import random
import re
import sys
from pathlib import Path
from typing import Any

from anthropic import Anthropic
from dotenv import load_dotenv

PIPELINE_DIR = Path(__file__).resolve().parent
TOPICS_PATH = PIPELINE_DIR / "topics.json"
DEFAULT_OUTPUT_PATH = PIPELINE_DIR / "output" / "content.json"
HISTORY_PATH = PIPELINE_DIR / "output" / "history.json"
HISTORY_LOOKBACK = 6

DEFAULT_MODEL = "claude-sonnet-4-5"
DEFAULT_AGENT_NAME = "Your Name Realty"

SCHEMA_INSTRUCTIONS = """
Return ONLY a single JSON object (no markdown fences, no commentary) with
this exact shape:

{
  "hook": string,               // <= 12 words, spoken in the first 2-3 seconds, must stop the scroll
  "hook_duration_seconds": number,  // 2 to 3
  "scenes": [                   // 3 to 5 scenes covering the key points, in order
    {"text": string, "duration_seconds": number}  // text <= 16 words, duration 2.5 to 4.5
  ],
  "cta": string,                // <= 14 words, matches the topic's call to action
  "cta_duration_seconds": number,  // 2.5 to 3.5
  "caption": string,            // Instagram caption, 2-4 short lines, conversational, 1-2 emoji max, ends with a soft CTA, NO hashtags in this field
  "hashtags": [string]          // 8 to 15 relevant real-estate hashtags, each starting with '#', no spaces
}

Writing rules (this is a retention-optimized Reel — every rule below exists
to keep a scrolling viewer watching to the end):
- Write for a vertical, fast-paced Instagram Reel voiceover. Punchy, plain-spoken, no jargon.
- Each scene's "text" is a single spoken line, not a paragraph.
- Do not fabricate specific statistics, rates, or prices. Speak in general, defensible terms.
- Keep the total spoken script (hook + scenes + cta) between 18 and 28 seconds when read aloud at a natural pace (~2.5-3.5 words/second) — shorter, tighter scripts get watched to completion far more often than long ones.
- Open loop, don't resolve too early: the hook must create a specific curiosity gap (a number, a contrarian claim, or a named mistake) WITHOUT giving away the answer. Save the single most valuable or surprising point for the LAST scene, not the first, so there's a reason to keep watching.
- End each non-final scene on a small forward-pull when it fits naturally ("but here's the part most people miss...") rather than a fully closed statement.
- The CTA should explicitly pay off the hook's open loop (reference what was promised) so it reads as the natural resolution, not a bolted-on ask.
- Emphasis markup: in "hook", each scene "text", and "cta", wrap the ONE (at most two) most important word or number per line in double asterisks, e.g. "Prices dropped **12%** last month." This drives an on-screen highlight color — used sparingly it draws the eye, used on every word it does nothing, so be selective.
"""


def load_topics() -> dict[str, Any]:
    with TOPICS_PATH.open("r", encoding="utf-8") as f:
        return json.load(f)


def load_history() -> list[str]:
    if not HISTORY_PATH.exists():
        return []
    try:
        with HISTORY_PATH.open("r", encoding="utf-8") as f:
            return json.load(f).get("recent_topic_ids", [])
    except (json.JSONDecodeError, OSError):
        return []


def save_history(topic_id: str, recent: list[str]) -> None:
    HISTORY_PATH.parent.mkdir(parents=True, exist_ok=True)
    updated = ([topic_id] + [t for t in recent if t != topic_id])[:HISTORY_LOOKBACK]
    with HISTORY_PATH.open("w", encoding="utf-8") as f:
        json.dump({"recent_topic_ids": updated}, f, indent=2)


def slugify(text: str) -> str:
    return re.sub(r"[^a-z0-9]+", "-", text.lower()).strip("-")


def pillar_label(pillar_id: str) -> str:
    return pillar_id.replace("_", " ").title()


def pick_topic(
    topics_data: dict[str, Any],
    pillar_id: str | None,
    topic_id: str | None,
    recent_topic_ids: list[str],
) -> tuple[str, str, str]:
    """Returns (pillar_id, topic_title, topic_id)."""
    pillars: list[str] = topics_data["pillars"]

    if topic_id:
        for pillar in pillars:
            for title in topics_data[pillar]:
                if f"{pillar}:{slugify(title)}" == topic_id:
                    return pillar, title, topic_id
        raise SystemExit(f"No topic found with id '{topic_id}'")

    candidate_pillars = pillars
    if pillar_id:
        if pillar_id not in pillars:
            raise SystemExit(f"No pillar found with id '{pillar_id}'")
        candidate_pillars = [pillar_id]

    pillar = random.choice(candidate_pillars)
    titles = topics_data[pillar]
    fresh_titles = [
        title for title in titles if f"{pillar}:{slugify(title)}" not in recent_topic_ids
    ]
    title = random.choice(fresh_titles or titles)
    return pillar, title, f"{pillar}:{slugify(title)}"


def build_prompt(pillar: str, title: str) -> str:
    return f"""You are a social media scriptwriter for a residential real estate agent's Instagram Reels.

Content pillar: {pillar_label(pillar)}
Topic: {title}

{SCHEMA_INSTRUCTIONS}"""


def call_claude(prompt: str, model: str) -> dict[str, Any]:
    client = Anthropic()
    message = client.messages.create(
        model=model,
        max_tokens=1500,
        messages=[{"role": "user", "content": prompt}],
    )
    raw_text = "".join(
        block.text for block in message.content if block.type == "text"
    ).strip()

    if raw_text.startswith("```"):
        raw_text = raw_text.strip("`")
        if raw_text.lower().startswith("json"):
            raw_text = raw_text[4:]
        raw_text = raw_text.strip()

    try:
        return json.loads(raw_text)
    except json.JSONDecodeError as exc:
        raise SystemExit(
            f"Claude did not return valid JSON.\n---\n{raw_text}\n---\nError: {exc}"
        ) from exc


def main() -> None:
    load_dotenv()

    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--pillar", help="Restrict to a specific pillar id")
    parser.add_argument("--topic-id", help="Generate a specific topic id")
    parser.add_argument(
        "--agent-name",
        default=os.environ.get("AGENT_NAME", DEFAULT_AGENT_NAME),
        help="Name/brand shown in the video header",
    )
    parser.add_argument(
        "--logo-src",
        default=os.environ.get("LOGO_SRC", ""),
        help="Path to a logo image relative to public/, e.g. 'logo.png'. Optional — omit for a text-only header mark.",
    )
    parser.add_argument(
        "--model",
        default=os.environ.get("ANTHROPIC_MODEL", DEFAULT_MODEL),
        help="Anthropic model id to use",
    )
    parser.add_argument(
        "--output",
        default=str(DEFAULT_OUTPUT_PATH),
        help="Where to write the generated content JSON",
    )
    args = parser.parse_args()

    if not os.environ.get("ANTHROPIC_API_KEY"):
        sys.exit("ANTHROPIC_API_KEY is not set. Add it to your .env file.")

    topics_data = load_topics()
    recent_topic_ids = load_history()
    pillar, title, topic_id = pick_topic(topics_data, args.pillar, args.topic_id, recent_topic_ids)

    print(f"Selected pillar '{pillar_label(pillar)}' / topic '{title}'")
    prompt = build_prompt(pillar, title)
    generated = call_claude(prompt, args.model)

    content = {
        "pillar": pillar,
        "pillarLabel": pillar_label(pillar),
        "agentName": args.agent_name,
        **({"logoSrc": args.logo_src} if args.logo_src else {}),
        "hook": generated["hook"],
        "hookDurationInSeconds": generated["hook_duration_seconds"],
        "scenes": [
            {
                "text": scene["text"],
                "durationInSeconds": scene["duration_seconds"],
            }
            for scene in generated["scenes"]
        ],
        "cta": generated["cta"],
        "ctaDurationInSeconds": generated["cta_duration_seconds"],
        "caption": generated["caption"],
        "hashtags": generated["hashtags"],
    }

    output_path = Path(args.output)
    output_path.parent.mkdir(parents=True, exist_ok=True)
    with output_path.open("w", encoding="utf-8") as f:
        json.dump(content, f, indent=2)

    save_history(topic_id, recent_topic_ids)
    print(f"Wrote content to {output_path}")


if __name__ == "__main__":
    main()
