---
title: Install & run
description: Get ReelVault running in minutes — one Docker command, or the installer for Windows and Linux.
outline: [2, 3]
---

# Install & run

ReelVault is one program: the API, the web UI and the streaming engine all run from a single process on a single port. Pick one of the paths below — all of them end the same way, at `http://localhost:3030`, where the setup wizard creates your administrator account (no tokens, no config files).

## What you need

- **A machine to run it on** — a home server, NAS, mini PC or an always-on desktop. Anything x86-64 or arm64 works; 4 GB of RAM is enough to start, more helps with transcoding.
- **Your media**, already on disk.
- **A browser** on any device you want to watch from.

ffmpeg/ffprobe are a hard requirement for streaming — the installers and images handle them for you; if you install from source, [install ffmpeg](https://ffmpeg.org) yourself.

## Option A — Docker (recommended for servers and NAS)

One container: server, web UI and ffmpeg included.

```bash
mkdir reelvault && cd reelvault
curl -fsSL https://raw.githubusercontent.com/ReelVault/ReelVault.Server/main/docker-compose.yml -o docker-compose.yml
docker compose up -d
```

Open `http://localhost:3030` and create the administrator account. Your data lives in the `reelvault-data` volume.

To scan your media, uncomment the media volume in `docker-compose.yml` first:

```yaml
volumes:
  - reelvault-data:/data
  - /srv/media:/media:ro
```

<details>
<summary>Or run the image directly</summary>

```bash
docker run -d --name reelvault \
  -p 3030:3030 -v reelvault-data:/data \
  ghcr.io/reelvault/server:latest
```
</details>

## Option B — Windows (installer)

1. Download `install.bat` from the [latest release](https://github.com/ReelVault/ReelVault.Server/releases/latest) (it sits next to the big `ReelVault-…-windows-x64.zip` — you only need the `.bat`).
2. Double-click it. It downloads the app, installs ffmpeg if missing, and creates a **ReelVault** shortcut in the Start Menu.
3. Open ReelVault from the Start Menu, then open `http://localhost:3030`.

Prefer PowerShell?

```powershell
.\install.ps1 -Remote          # reachable from other devices on the LAN
.\install.ps1 -Port 8080       # custom port
.\install.ps1 -Autostart       # start when you sign in
```

## Option C — Linux (installer)

```bash
curl -fsSL -o install.sh https://github.com/ReelVault/ReelVault.Server/releases/latest/download/install.sh
bash install.sh
```

The installer installs ffmpeg, downloads the release archive into `~/.local/share/reelvault`, and registers a systemd user service that starts with your session.

```bash
bash install.sh --remote       # reachable from other devices on the LAN
bash install.sh --port 8080    # custom port
bash install.sh --upgrade      # update, keeping your data
bash install.sh --uninstall    # remove again
```

## Option D — release archive (no installer)

Every release ships portable archives — `ReelVault-<version>-linux-x64.tar.gz` (also arm64) and `ReelVault-<version>-windows-x64.zip`. They contain everything including the runtime: unpack, run `start.sh` / `start.bat`, open `http://localhost:3030`. All state lives in the unpacked `data/` folder — move the folder, move the server.

## From source (developers)

```bash
git clone https://github.com/ReelVault/ReelVault.Server.git
cd ReelVault.Server
bun install
bun dev   # http://localhost:3030 — API only, no bundled UI
```

Without a `.env`, the server uses port `3030`, stores data in `./data`, and writes auto-generated secrets to `data/secrets.env` with `0600` permissions on first boot. The web client is a separate repository — its [README](https://github.com/ReelVault/ReelVault.Website) covers the dev server (port `3000`, proxies `/v1` and `/api` to `:3030`) and the desktop build.

## Connect to it

<Screenshot
  caption="The web client connected to a fresh server"
  hint="What you see after signing in for the first time."
  src="/screenshots/first-signin.png"
  alt="The profile picker asking who is watching, with profile tiles and an add-profile slot"
/>

- **Browser** — open `http://<host>:3030`. See [Web & desktop clients](/guide/website).
- **API reference** — the server serves an interactive OpenAPI reference at `http://<host>:3030/openapi` while `OPENAPI_DOCS_ENABLED=true` (the default).
- **Your own app** — use the typed client; see the [SDK overview](/sdk/).

## Next steps

- [First-run setup](/guide/first-run) — create the administrator and your first profile.
- [Configuration](/guide/configuration) — the few settings you will want to know.
- [Libraries & scanning](/guide/libraries) — add your media folders.

## Server commands (from source)

```bash
bun dev              # watch mode
bun start            # production start
bun test             # test suite
bun run check-types  # tsc --noEmit
bun run db:migrate   # apply database migrations
bun run build-sdk    # build the reelvault-sdk package
```
