---
title: Web & desktop clients
description: How to use ReelVault from a browser, the desktop app, or your phone — and how to point a client at your server.
outline: [2, 3]
---

# Web & desktop clients

ReelVault's client is one app that ships two ways: a page you open in a browser, and a desktop app built from the same code with [Tauri](https://v2.tauri.app). There is no separate mobile app for now.

<Screenshot
  caption="Browsing the library"
  hint="The Movies grid, with filters and sorting."
  src="/screenshots/movies-grid.png"
  alt="The movies page with poster cards, genres, ratings, search and an A-Z index"
/>

## Browser

The server serves the web client itself — open the address the server is on (by default `http://<host>:3030`) and you get both the app and the API from the same place. Any current Chrome, Edge, Firefox or Safari works; playback uses [hls.js](https://github.com/video-dev/hls.js) and needs Media Source Extensions (all modern browsers have it).

Because the app ships a web manifest, you can **install it as an app** from the browser menu — it opens in its own window, with its own icon and no browser chrome.

When you open the client from another device on the same network, it automatically talks to the same origin it was served from, so `http://reelvault.lan:3030` or `http://192.168.1.20:3030` just works without extra configuration. If you host the client behind a different origin than the API (advanced setups), the client falls back to the `api.*` subdomain convention — see the [ReelVault.Website](https://github.com/ReelVault/ReelVault.Website) README.

## Desktop app

The Tauri build wraps the same frontend in a native window. API calls go **directly** to the server (there is no proxy in the desktop shell), so on first launch you enter the server address on the login screen. The resolution order is:

1. `VITE_REELVAULT_API_URL`, if it was set when the desktop app was built;
2. the address you type on the login screen;
3. `http://localhost:3030`.

The server allowlists the Tauri origins automatically, so no CORS setup is needed.

## Finding your way around

- **Dashboard** — continue watching, recently added, and per-profile recommendations.
- **Movies** and **Series** — the full library, with sorting and filters.
- **Discover** — curated feeds (trending, popular, upcoming…) pulled from the metadata providers you have enabled.
- **Search** — finds titles and people in your library; if a plugin provides search (for example Media Requests), it also searches outside your library.
- **Collections**, **Genres**, **Keywords**, **Companies**, **People** — browse by any of those.
- **Watchlist** — save titles for later.

## Watching

- **Resume** — playback position is stored per profile, so you can start on the TV and finish on your phone.
- **Quality** — you do not choose direct play or transcode; the server picks the best option for the device and file, and re-encodes only when it has to.
- **Audio & subtitles** — switch tracks from the player; the server remembers your choice per profile.
- **Markers** — intro, credits and recap markers show up on the timeline so you can skip them.
- **Remote control** — a session started on one device can be paused, seeked or stopped from another.
- **Offline downloads** — where the server allows it, prepare a copy for offline playback.

<Screenshot
  caption="The video player"
  hint="Timeline with seek, quality presets and playback controls."
  src="/screenshots/player.png"
  alt="The video player playing a title with the timeline, pause, seek, volume and settings controls visible"
/>

## Your account

The user menu (top right) holds:

- **Settings** — interface language, theme, and playback preferences.
- **Devices & sessions** — every signed-in session, with the ability to revoke any of them.
- **Notifications** — server and plugin notifications.
- **History** and **Insights** — what you have watched and your viewing stats.
- **Remote** — save the server address for the desktop app / bookmarking.
- **Two-factor authentication** — TOTP and backup codes.

## Building the client yourself

Developers who want to run or modify the client should start from the [ReelVault.Website](https://github.com/ReelVault/ReelVault.Website) repository — its README covers the stack, the dev server and the desktop build. The client talks to the server exclusively through the typed SDK; see the [SDK overview](/sdk/).
