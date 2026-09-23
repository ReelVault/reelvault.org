---
title: Configuration
description: The environment variables ReelVault reads at startup, and the runtime settings you change in the admin panel.
outline: [2, 3]
---

# Configuration

There are two layers:

- **Environment variables** — read once at startup. They cover networking, paths and secrets. See `.env.example` in the server repository for the full, commented list.
- **System settings** — runtime behaviour you change in **Admin → Server settings** (scanning, transcoding, caches, quotas…). Most changes apply without a restart.

Everything in the environment layer has a sensible default, so a bare `bun dev` or `docker compose up` works. `BETTER_AUTH_SECRET` is generated and persisted to `$ROOT_DIR/secrets.env` on first boot; a setup token is only generated when you enable it (see the table).

## Environment variables

| Variable | Default | What it does |
|---|---|---|
| `NODE_ENV` | `production` | Set to `development` for dev-only tracing and pretty logs. |
| `APP_PORT` | `3030` | HTTP port. |
| `APP_HOST` | `127.0.0.1` | Bind address. Set `0.0.0.0` to expose the server on the LAN (or leave it behind a reverse proxy). |
| `APP_PUBLIC_URL` | — | The URL users actually open, e.g. `https://media.example.com`. Matters for auth callbacks and links. |
| `APP_ALLOWED_ORIGINS` | localhost + LAN | Extra comma-separated origins/patterns allowed by CORS. Localhost, private LAN ranges and `.lan` / `.local` domains are always allowed. |
| `APP_SECURE` | `false` | Set `true` when serving over HTTPS so cookies are marked `Secure`. |
| `APP_COOKIE_DOMAIN` | auto | Only needed if a reverse proxy strips or rewrites the `Origin` header. |
| `APP_TRUSTED_PROXY_COUNT` | `0` | How many reverse proxies may append `X-Forwarded-For`. `0` ignores the header; `1` for a single nginx/Caddy/Traefik. |
| `OPENAPI_DOCS_ENABLED` | `true` | Serves the interactive API reference at `/openapi`. |
| `ROOT_DIR` | `./data` | Where the SQLite database, transcodes, downloads, plugins, images and secrets live. |
| `DB_FILE_NAME` | `reelvault.sqlite` | Database file, relative to `ROOT_DIR`. |
| `APP_WEB_DIST` | `./web` if present | Directory with a built web UI to serve on the same port (release archives set this; without it the server is API-only). |
| `SETUP_TOKEN_ENABLED` | `false` | Require a one-time token to complete first-run setup. Enable before exposing a not-yet-configured server to an untrusted network. |
| `SETUP_TOKEN` | generated when enabled | The setup token; ignored unless `SETUP_TOKEN_ENABLED=true`. |
| `BETTER_AUTH_SECRET` | generated | Session/auth secret. Keep it stable across restarts and rebuilds. |

## System settings

Open **Admin → Server settings**. Groups you will actually touch:

- **Scanning** — auto-watcher on/off, debounce and cooldown windows, scan and ffprobe concurrency. Leave concurrency at `0` to let the server size it to your hardware.
- **Streaming & transcoding** — default encoder preset and CRF, hardware acceleration mode and device, HDR tone-mapping method, max sessions and per-session bandwidth.
- **Images** — poster/thumbnail quality and caching.
- **Trickplay** — thumbnail preview generation.
- **Downloads** — per-profile storage quota and retention.
- **Workers & resources** — background worker concurrency and resource thresholds.
- **Plugins** — the outbound HTTP allow-list and per-plugin limits.

`ffmpeg.path` and `ffprobe.path` are also settings: if the binaries are not on the server's `PATH`, point these at the full paths there. The server verifies that they exist at startup and refuses to run without them.

## Secrets

Treat `$ROOT_DIR/secrets.env`, plugin `config.json` files and the database as sensitive. The server generates secrets with `0600` permissions where it can, but backups are your responsibility — see [Backups & upgrades](/guide/maintenance).

## Next steps

- [Libraries & scanning](/guide/libraries)
- [Remote access & TLS](/guide/remote-access)
- [Troubleshooting](/guide/troubleshooting)
