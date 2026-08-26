#!/usr/bin/env python3
"""Fetch free stock B-roll (video, falling back to photo) per segment from
Pexels and enrich pipeline/output/content.json with it.

Requires PEXELS_API_KEY (free, from https://www.pexels.com/api/). Picks a
search query per segment from pipeline/broll_keywords.json, role-matched to
the segment's position in the script (hook = establishing shot, scene =
supporting detail shot, cta = closing/success shot), so a single Reel gets
visually varied, narratively appropriate footage rather than one repeated
clip.

Downloads a portrait-oriented clip/photo per segment into public/broll/ and
adds `brollSrc` (path relative to public/) + `brollType` ("video" | "photo")
to the corresponding hook/scene/cta object in content.json in place — the
video template composites it with a grayscale + gold duotone treatment plus
a black scrim, per the brand standard (black/white/gold only, background
predominantly dark).

If PEXELS_API_KEY isn't set, or a search/download fails for a given segment,
that segment is simply left without B-roll — VideoTemplate already renders
correctly without it (falls back to the animated gradient background). B-roll
is a bonus visual layer, never a hard requirement for the pipeline to run.

Usage:
    python pipeline/fetch_broll.py
    python pipeline/fetch_broll.py --input pipeline/output/content.json
"""

from __future__ import annotations

import argparse
import json
import os
import random
import sys
from pathlib import Path
from typing import Any

import requests
from dotenv import load_dotenv

REPO_ROOT = Path(__file__).resolve().parent.parent
PIPELINE_DIR = REPO_ROOT / "pipeline"
DEFAULT_CONTENT_PATH = PIPELINE_DIR / "output" / "content.json"
KEYWORDS_PATH = PIPELINE_DIR / "broll_keywords.json"
PUBLIC_BROLL_DIR = REPO_ROOT / "public" / "broll"

PEXELS_VIDEO_SEARCH_URL = "https://api.pexels.com/videos/search"
PEXELS_PHOTO_SEARCH_URL = "https://api.pexels.com/v1/search"

# Prefer a moderate-resolution portrait file — big enough to look sharp at
# 1080x1920, small enough not to balloon download size/render time.
TARGET_WIDTH = 1080
MAX_WIDTH = 1600


def load_keywords() -> dict[str, dict[str, list[str]]]:
    with KEYWORDS_PATH.open("r", encoding="utf-8") as f:
        return json.load(f)


def _pick_video_file(video_files: list[dict[str, Any]]) -> dict[str, Any] | None:
    portrait = [
        f
        for f in video_files
        if f.get("width") and f.get("height") and f["height"] > f["width"]
    ]
    candidates = portrait or video_files
    candidates = [c for c in candidates if c.get("width")]
    if not candidates:
        return None
    under_max = [c for c in candidates if c["width"] <= MAX_WIDTH]
    pool = under_max or candidates
    return min(pool, key=lambda c: abs(c["width"] - TARGET_WIDTH))


def search_video(query: str, api_key: str) -> dict[str, Any] | None:
    response = requests.get(
        PEXELS_VIDEO_SEARCH_URL,
        headers={"Authorization": api_key},
        params={"query": query, "orientation": "portrait", "per_page": 5},
        timeout=30,
    )
    if response.status_code != 200:
        return None
    results = response.json().get("videos", [])
    if not results:
        return None
    video = random.choice(results)
    video_file = _pick_video_file(video.get("video_files", []))
    if not video_file:
        return None
    return {"url": video_file["link"], "ext": "mp4"}


def search_photo(query: str, api_key: str) -> dict[str, Any] | None:
    response = requests.get(
        PEXELS_PHOTO_SEARCH_URL,
        headers={"Authorization": api_key},
        params={"query": query, "orientation": "portrait", "per_page": 5},
        timeout=30,
    )
    if response.status_code != 200:
        return None
    results = response.json().get("photos", [])
    if not results:
        return None
    photo = random.choice(results)
    url = photo.get("src", {}).get("large2x") or photo.get("src", {}).get("large")
    if not url:
        return None
    return {"url": url, "ext": "jpg"}


def fetch_broll_for_segment(
    role: str, keyword_pool: dict[str, list[str]], api_key: str, out_stem: str
) -> dict[str, str] | None:
    queries = keyword_pool.get(role, keyword_pool.get("scene", []))
    if not queries:
        return None
    query = random.choice(queries)

    result = search_video(query, api_key)
    kind = "video"
    if result is None:
        result = search_photo(query, api_key)
        kind = "photo"
    if result is None:
        print(f"  [{role}] no B-roll found for '{query}', skipping.")
        return None

    output_path = PUBLIC_BROLL_DIR / f"{out_stem}.{result['ext']}"
    try:
        with requests.get(result["url"], stream=True, timeout=60) as response:
            response.raise_for_status()
            with output_path.open("wb") as f:
                for chunk in response.iter_content(chunk_size=1 << 20):
                    f.write(chunk)
    except requests.RequestException as exc:
        print(f"  [{role}] download failed for '{query}': {exc}")
        return None

    print(f"  [{role}] '{query}' -> {output_path.name} ({kind})")
    return {
        "brollSrc": str(output_path.relative_to(REPO_ROOT / "public")),
        "brollType": kind,
    }


def main() -> None:
    load_dotenv()

    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--input", default=str(DEFAULT_CONTENT_PATH))
    args = parser.parse_args()

    api_key = os.environ.get("PEXELS_API_KEY")
    if not api_key:
        print("PEXELS_API_KEY not set — skipping B-roll (video will use the animated background only).")
        return

    content_path = Path(args.input)
    if not content_path.exists():
        sys.exit(f"{content_path} not found. Run generate_content.py first.")
    with content_path.open("r", encoding="utf-8") as f:
        content: dict[str, Any] = json.load(f)

    keywords_by_pillar = load_keywords()
    keyword_pool = keywords_by_pillar.get(
        content["pillar"], next(iter(keywords_by_pillar.values()))
    )

    PUBLIC_BROLL_DIR.mkdir(parents=True, exist_ok=True)
    print("Fetching B-roll...")

    hook_result = fetch_broll_for_segment("hook", keyword_pool, api_key, "hook")
    if hook_result:
        content["hookBrollSrc"] = hook_result["brollSrc"]
        content["hookBrollType"] = hook_result["brollType"]

    for i, scene in enumerate(content["scenes"]):
        result = fetch_broll_for_segment("scene", keyword_pool, api_key, f"scene-{i}")
        if result:
            scene.update(result)

    cta_result = fetch_broll_for_segment("cta", keyword_pool, api_key, "cta")
    if cta_result:
        content["ctaBrollSrc"] = cta_result["brollSrc"]
        content["ctaBrollType"] = cta_result["brollType"]

    with content_path.open("w", encoding="utf-8") as f:
        json.dump(content, f, indent=2)
    print(f"Updated {content_path}")


if __name__ == "__main__":
    main()
