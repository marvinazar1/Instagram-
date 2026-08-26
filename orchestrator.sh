#!/usr/bin/env bash
# End-to-end Reel pipeline: generate script -> synthesize voiceover -> render -> publish.
#
# Usage:
#   ./orchestrator.sh [--pillar PILLAR_ID] [--topic-id TOPIC_ID] [--publish] [--video-url URL]
#
# Examples:
#   ./orchestrator.sh                                   # random topic, render only (dry-run publish)
#   ./orchestrator.sh --pillar market_updates            # pin the content pillar
#   ./orchestrator.sh --publish --video-url https://...  # render and actually publish to Instagram
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

PILLAR=""
TOPIC_ID=""
PUBLISH=false
VIDEO_URL="${VIDEO_PUBLIC_URL:-}"
OUTPUT_VIDEO="out/reel.mp4"

while [[ $# -gt 0 ]]; do
  case "$1" in
    --pillar)
      PILLAR="$2"
      shift 2
      ;;
    --topic-id)
      TOPIC_ID="$2"
      shift 2
      ;;
    --publish)
      PUBLISH=true
      shift
      ;;
    --video-url)
      VIDEO_URL="$2"
      shift 2
      ;;
    -h|--help)
      grep '^#' "$0" | sed 's/^# \{0,1\}//'
      exit 0
      ;;
    *)
      echo "Unknown argument: $1" >&2
      exit 1
      ;;
  esac
done

echo "==> [1/4] Generating script + caption"
CONTENT_ARGS=()
[[ -n "$PILLAR" ]] && CONTENT_ARGS+=(--pillar "$PILLAR")
[[ -n "$TOPIC_ID" ]] && CONTENT_ARGS+=(--topic-id "$TOPIC_ID")
python3 pipeline/generate_content.py "${CONTENT_ARGS[@]}"

echo "==> [2/4] Synthesizing voiceover"
python3 pipeline/generate_audio.py

echo "==> [3/4] Rendering video"
mkdir -p out
npx remotion render src/index.ts RealEstateReel "$OUTPUT_VIDEO" \
  --props=pipeline/output/props.json

echo "==> [4/4] Publishing to Instagram"
if [[ "$PUBLISH" == true ]]; then
  if [[ -z "$VIDEO_URL" ]]; then
    echo "Error: --publish requires --video-url (or VIDEO_PUBLIC_URL) pointing at a hosted copy of $OUTPUT_VIDEO" >&2
    exit 1
  fi
  python3 pipeline/post_to_instagram.py --video-url "$VIDEO_URL"
else
  python3 pipeline/post_to_instagram.py --video-url "${VIDEO_URL:-}" --dry-run
  echo "(dry run — pass --publish --video-url <hosted mp4 url> to actually post)"
fi

echo "==> Done. Rendered video: $OUTPUT_VIDEO"
