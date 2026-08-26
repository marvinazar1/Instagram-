# Remotion video

<p align="center">
  <a href="https://github.com/remotion-dev/logo">
    <picture>
      <source media="(prefers-color-scheme: dark)" srcset="https://github.com/remotion-dev/logo/raw/main/animated-logo-banner-dark.apng">
      <img alt="Animated Remotion Logo" src="https://github.com/remotion-dev/logo/raw/main/animated-logo-banner-light.gif">
    </picture>
  </a>
</p>

Welcome to your Remotion project!

## Real estate content engine

This project also includes an end-to-end pipeline for generating and
publishing real estate Instagram Reels:

```
src/
├── Root.tsx              # Registers the RealEstateReel composition (9:16, 1080x1920)
├── VideoTemplate.tsx      # Reel layout: header, hook/CTA cards, scene captions, audio
├── content-types.ts       # Shared content schema (hook, scenes, cta, caption, hashtags)
└── components/            # Header, TextCard, CaptionOverlay
pipeline/
├── topics.json             # 4-pillar content bank (market, buyer, seller, homeowner advice)
├── generate_content.py     # Picks a topic and asks Claude for a script + IG caption
├── generate_audio.py       # TTS voiceover (ElevenLabs or local Kokoro)
└── post_to_instagram.py    # Publishes the rendered Reel via the Instagram Graph API
orchestrator.sh              # Runs the full pipeline end to end
```

**Setup**

```console
cp .env.example .env   # fill in ANTHROPIC_API_KEY, ELEVENLABS_*, IG_* as needed
pip install -r pipeline/requirements.txt
```

**Run the full pipeline**

```console
./orchestrator.sh                          # random topic, render only (dry-run publish)
./orchestrator.sh --pillar market_updates  # pin a content pillar
./orchestrator.sh --publish --video-url https://your-cdn.example.com/reel.mp4
```

Publishing requires the rendered MP4 to be hosted at a public URL — the
Instagram Graph API's container-creation step cannot accept a raw file
upload, only a `video_url`.

## Commands

**Install Dependencies**

```console
npm i
```

**Start Preview**

```console
npm run dev
```

**Render video**

```console
npx remotion render
```

**Upgrade Remotion**

```console
npx remotion upgrade
```

## Docs

Get started with Remotion by reading the [fundamentals page](https://www.remotion.dev/docs/the-fundamentals).

## Help

We provide help on our [Discord server](https://discord.gg/6VzzNDwUwV).

## Issues

Found an issue with Remotion? [File an issue here](https://github.com/remotion-dev/remotion/issues/new).

## License

Note that for some entities a company license is needed. [Read the terms here](https://github.com/remotion-dev/remotion/blob/main/LICENSE.md).
