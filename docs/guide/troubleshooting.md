---
title: Troubleshooting
description: The problems people actually hit, and what to do about them.
outline: [2, 3]
---

# Troubleshooting

::: tip In short
Most problems come down to ffmpeg, the bind address, or a plugin using a capability it did not declare. Find the matching symptom below.
:::

## The server exits immediately

It almost always by ffmpeg. The server checks for `ffmpeg` and `ffprobe` at startup and refuses to run without them.

- The installers install ffmpeg for you — re-run the installer, or install [ffmpeg](https://ffmpeg.org) manually and make sure it is on the `PATH`, **or**
- set `ffmpeg.path` and `ffprobe.path` in **Admin → Server settings** (or via the environment) to their full paths.

Other common causes: the port is already in use, or `ROOT_DIR` is not writable by the user running the server.

## The port is taken (or I want a different one)

Restart with a different port: `docker compose` — change the published port mapping; installers — `install.sh --port 8080` / `install.ps1 -Port 8080`; archives and systemd — set `APP_PORT` in `settings.env`, or `%HERE%\settings.cmd` on Windows.

## I can't reach the client from another device

- If it works on the server itself but not elsewhere, the server is probably bound to localhost. Set `APP_HOST=0.0.0.0` (or put it behind a reverse proxy).
- Check the firewall on the host machine.
- In the browser console, a CORS error means the origin is not allowed. Add it to `APP_ALLOWED_ORIGINS` — localhost, private LAN ranges and `.lan` / `.local` are already allowed.
- Behind a reverse proxy, make sure the **WebSocket upgrade** headers are forwarded. Without them, live updates and remote control break.
- If sign-in appears to succeed but you are bounced back to login, check `APP_PUBLIC_URL`, `APP_SECURE` (it must match whether you are actually on HTTPS) and `APP_TRUSTED_PROXY_COUNT`.

See [Remote access & TLS](/guide/remote-access) for the full list.

## Setup asks for a token (or I lost it)

By default no token is needed. If `SETUP_TOKEN_ENABLED=true`, the token lives in `$ROOT_DIR/secrets.env` — read it there, or set `SETUP_TOKEN` in the environment and restart. The token is printed to the log only on the boot that generated it.

## Playback transcodes when it shouldn't

Open **Live activity** and look at the session's decision:

- **Device support** — the client may not decode this codec. A different client (or the desktop app) may direct-play the same file.
- **Bandwidth** — `stream.maxPerStreamBandwidthKbps` caps the stream; raise it or set it to `0`.
- **Hardware acceleration** — check **Admin → System resources → ffmpeg capabilities**. If your GPU was not detected, this runs on CPU. Re-run detection after driver changes, or set `ffmpeg.hwaccel` explicitly.
- **HDR** — HDR sources always transcode for SDR output. That is expected.

<Screenshot
  caption="Admin → System resources"
  hint="CPU, memory and disk pressure, plus which hardware encoders were detected and verified."
  src="/screenshots/admin-system-resources.png"
  alt="System resources page showing CPU, memory and disk usage with ffmpeg hardware encoder capabilities"
/>

## The picture stutters or the CPU is pinned

A software transcode is the usual answer. In order of effect:

1. Enable hardware acceleration if your machine supports it.
2. Use a faster preset (`ultrafast`, `superfast`) or cap the transcode resolution.
3. Lower worker concurrency so background jobs do not compete with playback — the server also pauses background work automatically under sustained pressure.
4. Avoid transcoding when possible: a client that direct-plays costs almost nothing.

## A file or series is missing

- Run a scan on the library.
- Check that the server can read the path — network mounts and permission errors are the usual cause.
- Look at **Admin → Media files** for the file's status. Files the server intentionally skipped (samples, extras, hidden files) are listed as ignored assets and can be un-ignored.
- Very unusual containers may have to be remuxed outside ReelVault first.

## Metadata is wrong or missing

- Make sure at least one metadata provider is installed and enabled in **Admin → Plugins**.
- Check the provider order in **Admin → Metadata providers** — the higher-priority provider wins conflicts.
- Fix a specific title with **Rematch** (or **Identify** on the media file).
- Still wrong? **Refresh metadata** to re-import.

## A plugin won't load

The Installed list shows the failure phase and reason. The three usual causes:

- it uses `host.*` features it did not declare under `capabilities`;
- its declared capability or version range does not match the server;
- the `entry` file is missing or failed to import.

A broken plugin does not take the server down — it stays disabled. Fix it and reload.

## Reporting a bug

Grab the **request id** from the error (or the failing log line) and the relevant section of **Admin → Server logs**, then open an issue on the matching repository:

- Server, API, transcoding → [reelvault](https://github.com/ReelVault/reelvault)
- Web or desktop client → [website](https://github.com/ReelVault/website)
- A bundled plugin → [plugins](https://github.com/ReelVault/plugins)
- This documentation → [reelvault.org](https://github.com/ReelVault/reelvault.org)
