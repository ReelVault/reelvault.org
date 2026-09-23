---
title: FAQ
description: Short answers to the questions that come up most.
outline: [2, 3]
---

# FAQ

## Is ReelVault free?

Yes. The server, website and first-party plugins are licensed under the GNU GPL v3. You pay only for your hardware and electricity.

## What can I run it on?

Anything that runs [Bun](https://bun.sh) and ffmpeg: a home server, NAS, mini PC, Raspberry Pi, an old laptop — or a VPS. Docker images cover common architectures. The server adapts its concurrency and resource use to whatever hardware it finds, so you do not have to hand-tune it for a small box.

## Do I need a GPU?

No. Software transcoding works everywhere; a GPU just lets you transcode more streams at once, with less CPU. If you have Intel Quick Sync, NVIDIA NVENC, AMD or Apple VideoToolbox, ReelVault will detect and use it.

## Will it work with Plex or Jellyfin clients?

No. ReelVault has its own client, and an open HTTP API underneath it. Anything built against the API — including your own app — works. See the [SDK overview](/sdk/).

## Is there a mobile app?

There is no separate native app. The web client is responsive and installable to a phone home screen (it ships a web manifest), and the desktop app covers computers. That is the whole client surface.

## Can several people use it at once?

Yes. Accounts and playback profiles are built in: each profile keeps its own progress, watchlist and preferences. Concurrent streams are capped by `stream.maxSessions` and `stream.maxSessionsPerUser`, both configurable.

## Does it move or rename my files?

Only if a library uses `sidecar` or `database_and_sidecar` metadata storage, which writes `.nfo` files next to your media. In the default `database` mode, your media folders are read-only to ReelVault.

## How do I watch from outside my home?

Put the server behind a reverse proxy with HTTPS, or connect over a VPN. It does not open a tunnel for you. Full walkthrough in [Remote access & TLS](/guide/remote-access).

## Where do plugins come from?

From catalog repositories — static URLs serving a catalog manifest. A fresh server points at the official [plugins](https://github.com/ReelVault/plugins) catalog; you can add your own. Install and update from [Admin → Plugins](/guide/plugins).

## Can I write my own plugin?

Yes — that is what the whole **Develop** section is for. Start at [Plugins: getting started](/plugins/getting-started). Plugins can add metadata sources, subtitle sources, jobs, HTTP endpoints, and UI surfaces that render in the client without changing it.

## What languages does it speak?

The web client ships with localization (English and Polish), and metadata language is chosen per provider. The interface follows your browser, or you can pick a language in user settings.

## How do I back it up?

Copy `ROOT_DIR` while the server is stopped. That is the database, secrets, plugins and generated data. See [Backups & upgrades](/guide/maintenance).

## Something is broken. Where do I look?

[Diagnostics & logs](/guide/diagnostics) first, then [Troubleshooting](/guide/troubleshooting). If you file an issue, include the request id and the matching log lines.
