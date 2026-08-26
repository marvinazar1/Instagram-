#!/usr/bin/env python3
"""Publish a rendered Reel to Instagram via the Graph API.

The Instagram Graph API's container-creation step (`/{ig-user-id}/media`)
requires a publicly reachable `video_url` — it cannot accept a raw file
upload. Host the rendered file (S3, Cloudinary, a CDN bucket, etc.) first,
then pass its URL with --video-url (or VIDEO_PUBLIC_URL in .env).

Flow implemented (see Meta's Instagram Content Publishing docs):
  1. POST /{ig-user-id}/media       -> create a REELS container, get creation_id
  2. GET  /{creation_id}            -> poll status_code until FINISHED
  3. POST /{ig-user-id}/media_publish -> publish the container

Required env vars (.env):
  IG_USER_ID       Instagram Business/Creator account id
  IG_ACCESS_TOKEN  Long-lived Page access token with instagram_content_publish

Usage:
    python pipeline/post_to_instagram.py --video-url https://cdn.example.com/reel.mp4
    python pipeline/post_to_instagram.py --video-url https://... --content pipeline/output/content.json
    python pipeline/post_to_instagram.py --video-url https://... --dry-run
"""

from __future__ import annotations

import argparse
import json
import os
import sys
import time
from pathlib import Path

import requests
from dotenv import load_dotenv

PIPELINE_DIR = Path(__file__).resolve().parent
DEFAULT_CONTENT_PATH = PIPELINE_DIR / "output" / "content.json"
GRAPH_API_VERSION = os.environ.get("GRAPH_API_VERSION", "v21.0")
GRAPH_API_BASE = f"https://graph.facebook.com/{GRAPH_API_VERSION}"

POLL_INTERVAL_SECONDS = 5
POLL_TIMEOUT_SECONDS = 300


def build_caption(content: dict) -> str:
    caption = content["caption"].strip()
    hashtags = " ".join(content.get("hashtags", []))
    return f"{caption}\n\n{hashtags}".strip()


def create_container(ig_user_id: str, access_token: str, video_url: str, caption: str) -> str:
    response = requests.post(
        f"{GRAPH_API_BASE}/{ig_user_id}/media",
        data={
            "media_type": "REELS",
            "video_url": video_url,
            "caption": caption,
            "access_token": access_token,
        },
        timeout=30,
    )
    payload = response.json()
    if response.status_code != 200 or "id" not in payload:
        sys.exit(f"Failed to create media container: {payload}")
    return payload["id"]


def wait_until_ready(container_id: str, access_token: str) -> None:
    deadline = time.time() + POLL_TIMEOUT_SECONDS
    while time.time() < deadline:
        response = requests.get(
            f"{GRAPH_API_BASE}/{container_id}",
            params={"fields": "status_code,status", "access_token": access_token},
            timeout=30,
        )
        payload = response.json()
        status_code = payload.get("status_code")
        print(f"Container status: {status_code} ({payload.get('status')})")

        if status_code == "FINISHED":
            return
        if status_code == "ERROR":
            sys.exit(f"Media container failed processing: {payload}")

        time.sleep(POLL_INTERVAL_SECONDS)

    sys.exit(f"Timed out after {POLL_TIMEOUT_SECONDS}s waiting for container to finish.")


def publish_container(ig_user_id: str, access_token: str, container_id: str) -> dict:
    response = requests.post(
        f"{GRAPH_API_BASE}/{ig_user_id}/media_publish",
        data={"creation_id": container_id, "access_token": access_token},
        timeout=30,
    )
    payload = response.json()
    if response.status_code != 200 or "id" not in payload:
        sys.exit(f"Failed to publish media: {payload}")
    return payload


def main() -> None:
    load_dotenv()

    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument(
        "--video-url",
        default=os.environ.get("VIDEO_PUBLIC_URL"),
        help="Publicly reachable URL of the rendered MP4",
    )
    parser.add_argument("--content", default=str(DEFAULT_CONTENT_PATH))
    parser.add_argument(
        "--dry-run",
        action="store_true",
        help="Print the caption/steps without calling the Graph API",
    )
    args = parser.parse_args()

    content_path = Path(args.content)
    if not content_path.exists():
        sys.exit(f"{content_path} not found. Run generate_content.py first.")
    with content_path.open("r", encoding="utf-8") as f:
        content = json.load(f)

    caption = build_caption(content)

    if args.dry_run:
        print("--- DRY RUN: would publish this Reel ---")
        print(f"video_url: {args.video_url or '(not set)'}")
        print("caption:")
        print(caption)
        return

    if not args.video_url:
        sys.exit("--video-url (or VIDEO_PUBLIC_URL) is required to publish.")

    ig_user_id = os.environ.get("IG_USER_ID")
    access_token = os.environ.get("IG_ACCESS_TOKEN")
    if not ig_user_id or not access_token:
        sys.exit("IG_USER_ID and IG_ACCESS_TOKEN must be set in .env.")

    print("Creating media container...")
    container_id = create_container(ig_user_id, access_token, args.video_url, caption)

    print(f"Container created: {container_id}. Waiting for processing...")
    wait_until_ready(container_id, access_token)

    print("Publishing...")
    result = publish_container(ig_user_id, access_token, container_id)
    print(f"Published Reel: media id {result['id']}")


if __name__ == "__main__":
    main()
