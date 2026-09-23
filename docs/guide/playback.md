---
title: Playback & transcoding
description: How ReelVault decides between direct play, remux and transcoding, and how to tune it for your hardware.
outline: [2, 3]
---

# Playback & transcoding

::: tip In short
The server picks **direct play**, **remux** or **transcode** per file and device — cheapest option wins. A GPU speeds up transcodes; HDR always transcodes to SDR.
:::

You never pick "direct play" or "transcode" yourself. When playback starts, the server compares the file with what the client can handle and picks the cheapest option:

| Decision | When it is used | Cost |
|---|---|---|
| **Direct play** | The device understands the video and audio as-is | None — the file is streamed byte for byte |
| **Remux** | Codecs are fine, but the container is not | Copy streams into an HLS container; no re-encode |
| **Transcode** | The device cannot decode the video or audio | Re-encode on the fly; the heaviest option |

Transcoding is CPU- or GPU-heavy, so a client that can direct-play will always get the untouched file.

<Screenshot
  caption="Choosing quality, audio and subtitles in the player"
  hint="The in-player menus, including the current transcode decision."
  src="/screenshots/player-menus.png"
  alt="The player with the playback settings menu open: quality presets and playback speed"
/>

The player's **Statistics** panel spells out the decision the server made and why:

<Screenshot
  caption="The player's stream diagnostics"
  hint="Source file, server decision (direct stream / remux / transcode), buffer and browser playback."
  src="/screenshots/player-statistics.png"
  alt="Player diagnostics showing a direct stream decision, codec copy details and buffer state"
/>

## Hardware acceleration

If your machine has a GPU that can encode, the server uses it for transcodes:

- **Intel** — Quick Sync (QSV)
- **NVIDIA** — NVENC
- **AMD** — AMF / VA-API
- **Apple** — VideoToolbox

Detection happens per encoder and is verified with a test encode, so an advertised-but-broken encoder does not silently produce garbage. If hardware fails mid-stream, the session falls back to software once.

Relevant settings in **Admin → Server settings → Streaming**:

- `ffmpeg.hwaccel` — `auto`, a specific engine, or `none` to force software.
- `ffmpeg.hwaccelDevice` — which device to use when you have more than one GPU.
- Encoder **preset** and **CRF** — the quality/speed trade-off. Leave `ffmpeg.preset` on `veryfast` unless you know you want otherwise.

**Admin → System resources** shows ffmpeg capabilities and lets you refresh the detection.

## HDR

::: info HDR always transcodes
The server detects HDR10, Dolby Vision and HLG. HDR sources always transcode, because the output is an SDR HLS stream; tone-mapping converts the colours (`tonemapx` / `zscale`, configurable in `ffmpeg.toneMapping`). If everything you own is SDR, you can ignore this entirely.
:::

## Sessions and limits

Every playback is a **session** that ties a viewer to a file and a pipeline. Admins can watch and terminate live sessions from the dashboard.

Settings that cap them:

- `stream.maxSessions` — total concurrent streams.
- `stream.maxSessionsPerUser` — per account.
- `stream.maxPerStreamBandwidthKbps` — optional per-stream bandwidth ceiling.
- `stream.inactivityTimeoutMs` — how long a stalled session is kept before it is reaped.

Temporary transcode files live under `$ROOT_DIR/transcodes` and are cleaned up when a session ends and on boot.

## Subtitles and audio

- Library subtitles are listed per title; external subtitle files next to the media are picked up during scanning.
- Subtitle **provider plugins** can search and download subtitles from the title page.
- Audio track selection is remembered per profile, and `stream.smartAudioTrackSelection` makes the server prefer a track the client can play directly.

## Trickplay

Trickplay generates thumbnail sprites so the player shows previews while you scrub. Turn it on per title or across the library in **Admin → Trickplay**; generation runs as background workers and takes a while for a large library.

## Next steps

- [Users & profiles](/guide/users-and-profiles)
- [Diagnostics & logs](/guide/diagnostics)
- [Troubleshooting](/guide/troubleshooting)
