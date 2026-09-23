---
title: FAQ
description: Short answers to the questions that come up most.
outline: [2, 3]
---

# FAQ

Short answers to the questions that come up most. New to ReelVault? Start with [Self-hosting ReelVault](/guide/).

## Getting started

### Do I need to know how to program?

No. If you can install an app and copy a folder path, you can run ReelVault. The installers and Docker image handle the technical parts, and the setup wizard walks you through the rest. Programming only comes up if you want to [write a plugin](/plugins/getting-started).

### Is ReelVault free?

Yes. The server, the web app and the first-party plugins are licensed under the GNU GPL v3. You pay only for your hardware and electricity.

### What can I run it on?

Anything that runs [Bun](https://bun.sh) and ffmpeg: a home server, NAS, mini PC, Raspberry Pi, an old laptop — or a VPS. Docker images cover common architectures, and the server adapts its resource use to the hardware it finds.

### Do I need a GPU?

No. Software conversion works everywhere; a GPU just lets you convert more streams at once, with less CPU. If you have Intel Quick Sync, NVIDIA NVENC, AMD or Apple VideoToolbox, ReelVault will detect and use it.

### Do I need an internet connection?

Only to install ReelVault and to fetch metadata from providers. Your own files, playback and the interface all work on your local network without internet.

## Watching

### Will it work with Plex or Jellyfin clients?

No. ReelVault has its own client and an open HTTP API underneath it. Anything built against the API — including your own app — works. See the [SDK overview](/sdk/).

### Is there a mobile app?

Not yet — a dedicated mobile app is **planned**. For now, the web app is responsive and can be installed to a phone home screen (it behaves like an app), and the desktop app covers computers. See [Web & desktop clients](/guide/website).

### Can several people use it at once?

Yes. Accounts and playback profiles are built in: each profile keeps its own progress, watchlist and preferences. Concurrent streams are capped by `stream.maxSessions` and `stream.maxSessionsPerUser`, both configurable.

### How do I watch from outside my home?

The easiest safe way is a VPN such as [Tailscale](https://tailscale.com) or WireGuard — see [Watching away from home](/guide/website#watching-away-from-home). Publishing the server on the internet is an administrator task; see [Remote access & TLS](/guide/remote-access).

## Your files & data

### Does it move or rename my files?

Only if a library uses `sidecar` or `database_and_sidecar` metadata storage, which writes `.nfo` files next to your media. In the default `database` mode, your media folders are read-only to ReelVault.

### How do I back it up?

Copy the server's data folder (`ROOT_DIR`) while the server is stopped. That is the database, secrets, plugins and generated data. See [Backups & upgrades](/guide/maintenance).

### Where do plugins come from?

From catalog repositories — web addresses serving a catalog file. A fresh server points at the official [plugins](https://github.com/ReelVault/plugins) catalog; you can add your own. Install and update from [Admin → Plugins](/guide/plugins).

### Can I write my own plugin?

Yes — that is what the whole **Develop** section is for. Start at [Plugins: getting started](/plugins/getting-started). Plugins can add metadata sources, subtitle sources, jobs, HTTP endpoints, and UI surfaces that render in the client without changing it.

### What languages does it speak?

The web app ships with localization (English and Polish), and metadata language is chosen per provider. The interface follows your browser, or you can pick a language in user settings.

### Something is broken. Where do I look?

[Diagnostics & logs](/guide/diagnostics) first, then [Troubleshooting](/guide/troubleshooting). If you file an issue, include the request id and the matching log lines.
