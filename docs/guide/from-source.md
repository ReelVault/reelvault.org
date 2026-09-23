---
title: Run from source
description: Build and run ReelVault from the source repository — for developers and tinkerers.
outline: [2, 3]
---

# Run from source

::: warning For developers
This page assumes you are comfortable with a terminal, Git and [Bun](https://bun.sh). If you just want to run ReelVault, use [Install & run](/guide/getting-started) instead — Docker or an installer is far easier.
:::

A source checkout gives you the server and the API, but **not** the bundled web client — that lives in a separate repository. It is the right path only if you want to change the server itself.

## What you need

- [Bun](https://bun.sh) installed.
- [ffmpeg and ffprobe](https://ffmpeg.org) on your `PATH` — the installers and images provide these for you, but a source checkout does not.
- Git.

## Run it

```bash
git clone https://github.com/ReelVault/reelvault.git
cd reelvault
bun install
bun dev   # http://localhost:3030 — API only, no bundled UI
```

Without a `.env` file, the server uses port `3030`, stores its data in `./data`, and writes auto-generated secrets to `data/secrets.env` with `0600` permissions on first boot.

## The web client is separate

The browser and desktop app live in the [website](https://github.com/ReelVault/website) repository. Its README covers the dev server (port `3000`, proxying `/v1` and `/api` to `:3030`) and the desktop build. The client talks to the server through the typed SDK — see the [SDK overview](/sdk/).

## Server commands

```bash
bun dev              # watch mode
bun start            # production start
bun test             # test suite
bun run check-types  # tsc --noEmit
bun run db:migrate   # apply database migrations
bun run build-sdk    # build the @reelvault/sdk package
```

## Next steps

- [Server configuration](/guide/configuration) — environment variables and settings.
- [Backups & upgrades](/guide/maintenance) — upgrading a source checkout.
- [Develop](/sdk/) — the SDK and plugins.
