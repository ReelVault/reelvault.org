---
title: Remote access & TLS
description: Expose your server beyond the LAN safely — reverse proxy, HTTPS, and the settings that matter.
outline: [2, 3]
---

# Remote access & TLS

By default a ReelVault server only listens on localhost. You decide how far to open it up: to the LAN, or to the internet. How much you open depends on who needs access.

## On the LAN

The simplest setup: let the server listen on all interfaces.

```bash
APP_HOST=0.0.0.0
```

Any device on the same network can then reach `http://<your-host>:3030`. Localhost, private LAN ranges (`192.168.x.x`, `10.x.x.x`, `172.16–31.x.x`) and `.lan` / `.local` domains are allowed as origins out of the box, so the client works without extra CORS configuration. The installers do this for you — `install.sh --remote` on Linux, `install.ps1 -Remote` on Windows (the Docker image always listens on all interfaces).

If you have a hostname for the machine (for example `reelvault.lan`), set `APP_PUBLIC_URL` to it so generated links and auth callbacks point at the right place.

## Exposing it to the internet

**Put it behind a reverse proxy.** Terminate TLS there and forward to the server — do not expose port 3030 directly. And do it **after** first-run setup is complete, or enable a setup token first (`SETUP_TOKEN_ENABLED=true`) — on an unconfigured server anyone who reaches the setup wizard could create the administrator account.

A typical nginx site:

```nginx
server {
    listen 443 ssl;
    server_name media.example.com;

    location / {
        proxy_pass http://127.0.0.1:3030;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;

        # WebSocket (realtime events)
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }
}
```

Then set:

| Variable | Value | Why |
|---|---|---|
| `APP_PUBLIC_URL` | `https://media.example.com` | Correct links and auth callbacks. |
| `APP_SECURE` | `true` | Cookies are marked `Secure`, so they only travel over HTTPS. |
| `APP_TRUSTED_PROXY_COUNT` | `1` | Trust exactly one proxy for `X-Forwarded-For` — the client IP is used for rate limiting and the audit log. Increase only if you have a CDN in front. |
| `APP_ALLOWED_ORIGINS` | your domain, if needed | Usually unnecessary; add it if the browser origin differs from the server URL. |

The WebSocket upgrade matters: without it, playback controls and live updates fall back to polling or stop working.

If your proxy rewrites or drops the `Origin` header, set `APP_COOKIE_DOMAIN` as well — otherwise leave it alone, since the server derives the cookie domain automatically.

## Check your setup

<Screenshot
  caption="Remote-access diagnostics"
  hint="Admin → Server settings → Network: public URL, HTTPS, bind address, trusted proxies and ready-to-copy proxy configs."
  src="/screenshots/admin-remote-access.png"
  alt="The remote access card with public address, HTTPS, server binding, trusted proxies and nginx/Caddy snippets"
/>

**Admin → Server settings → Network** includes a **Remote access** card: it inspects the bind address, the public URL, allowed origins and proxy settings, and tells you what a client outside your network would experience. It also generates reverse-proxy snippets for Caddy and nginx. Run it before you take the server public.

## A safer default

If you only need access for a few people, a VPN is less work and less risk than publishing the server: WireGuard, Tailscale and similar tools give every device a private address that reaches the LAN setup above. Nothing is exposed to the public internet, and you keep the plain `http://` setup on the tunnel.

## Next steps

- [Backups & upgrades](/guide/maintenance)
- [Diagnostics & logs](/guide/diagnostics)
- [Troubleshooting](/guide/troubleshooting)
