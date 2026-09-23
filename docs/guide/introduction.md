---
title: What is ReelVault?
description: A plain-language look at what ReelVault does, how the pieces fit together, and which path fits you.
outline: [2, 3]
---

# What is ReelVault?

ReelVault is a media server you run yourself. Point it at the folders where your movies and shows live, and it turns them into a library you can browse and stream — with artwork, descriptions, subtitles and resume-where-you-left-off — to a browser or the desktop app.

It is the same idea as Jellyfin or Plex, built from scratch on [Bun](https://bun.sh) and [Elysia](https://elysiajs.com). It is meant for a household or a small circle of friends on their own hardware, not as a hosted service.

## What it does

- **Streaming** — the server watches each file and picks the cheapest way to play it: *direct play* when the device understands the file, *remux* when only the container is wrong, and *on-the-fly transcoding* when it has to re-encode video or audio. Playback resumes where you stopped, and seeking is aligned to the real stream.
- **Hardware acceleration** — if your machine has a GPU that can encode video (Intel Quick Sync, NVIDIA NVENC, AMD, Apple VideoToolbox), ReelVault detects it, verifies it with a test encode, and falls back to software automatically when a file trips it up.
- **HDR** — detects HDR10, Dolby Vision and HLG, and tone-maps to SDR when the screen cannot show HDR.
- **Libraries** — folder watchers pick up new files, series are grouped into seasons and episodes, and multiple versions of the same title are kept side by side. Intro, credits and recap markers are supported.
- **People** — accounts and playback profiles, so everyone gets their own resume points, watchlist, ratings and audio/subtitle preferences. Admins can see and stop active streams.
- **Plugins** — almost everything source-specific is a plugin: metadata (TMDB, OMDb…), subtitles, requests, webhooks, extra UI. See [Develop](/plugins/getting-started) if you want to write one.
- **Operations** — an admin panel with dashboards, a task and worker queue, ffmpeg diagnostics, live sessions, notifications, rate limiting, an audit log and rotating logs.

## How the pieces fit together

```
                    ┌──────────────────────────────┐
                    │        reelvault             │
                    │  Bun + Elysia, SQLite, ffmpeg│
                    │  HTTP API · HLS · plugins    │
                    └──────────────┬───────────────┘
                                   │ HTTP + WebSocket
              ┌────────────────────┼────────────────────┐
              │                    │                    │
      ┌───────▼───────┐   ┌────────▼────────┐   ┌───────▼────────┐
      │   Website     │   │ Tauri desktop   │   │ Plugin UI      │
      │ (browser SPA) │   │ (same build)    │   │ (pages/slots)  │
      └───────────────┘   └─────────────────┘   └────────────────┘
```

The **server** owns everything that matters: validation, streaming decisions, metadata merging, progress. Clients are thin — they ask the server and render the answer.

The **website** is a generic React app. It ships as a browser page and as a [Tauri](https://v2.tauri.app) desktop app from the same code, and it renders whatever plugins declare in their UI manifest.

**Plugins** run inside the server process (backend) and inside the web client (UI). Installing one is an admin action — that is the trust boundary.

<Screenshot
  caption="The ReelVault dashboard"
  hint="Continue watching, recently added titles and per-profile recommendations."
  src="/screenshots/dashboard-shelves.png"
  alt="Dashboard shelves with recently added movie posters, genres and ratings"
/>

## Which path are you on?

**I just want to run it.** Start with [Install & run](/guide/getting-started), then [First-run setup](/guide/first-run). Everything in the **Self-hosting ReelVault** section is for you.

**I want to build something.** The **Develop** section covers the [SDK](/sdk/) and [plugins](/plugins/getting-started). You do not need to read the self-hosting section first.

## Where the code lives

| Repository | What is inside |
|---|---|
| [reelvault](https://github.com/ReelVault/reelvault) | The backend |
| [sdk](https://github.com/ReelVault/sdk) | The typed TypeScript SDK, published to npm as the `@reelvault/sdk` package |
| [website](https://github.com/ReelVault/website) | The web and desktop client (React, Vite, TanStack, Tauri) |
| [plugins](https://github.com/ReelVault/plugins) | First-party plugins and the catalog manifest |
| [reelvault.org](https://github.com/ReelVault/reelvault.org) | This documentation site |

## Next steps

- [Install & run](/guide/getting-started) — get a server up.
- [Web & desktop clients](/guide/website) — how to connect a client.
- [Plugins (admin)](/guide/plugins) — install your first plugin.
- [SDK overview](/sdk/) — for developers.
