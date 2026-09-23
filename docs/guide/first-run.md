---
title: First-run setup
description: Create the administrator account, sign in, and add your first playback profile.
outline: [2, 3]
---

# First-run setup

A brand-new server has no accounts and no libraries. The web client walks you through it — no tokens, no config files.

<Screenshot
  caption="The first-run setup wizard"
  hint="Create the administrator account, confirm, done."
  ratio="4 / 3"
  src="/screenshots/setup-wizard.png"
  alt="The setup wizard with an administrator name, email and password form"
/>

## 1. Create the administrator

Open `http://<host>:3030` right after starting the server. While the server is unconfigured it redirects to the setup wizard:

1. Enter a name, email and password for the administrator.
2. Confirm.

That's it — the first account is always an administrator. Under the hood this calls `POST /v1/setup`; once an administrator exists, setup is closed for good. The same information is available over the API:

```bash
curl http://localhost:3030/v1/setup/status
# {"required":true,"tokenRequired":false}
```

### Setup tokens (optional)

By default no token is needed — the right call for a server that only listens on your LAN. If you plan to expose a **not-yet-configured** server to the public internet, you can require a one-time token before setup is allowed:

```bash
SETUP_TOKEN_ENABLED=true
```

Set it before the first boot (or before you delete all users to re-run setup); `SETUP_TOKEN` is then generated into `$ROOT_DIR/secrets.env` and printed to the log on the boot that generated it, or you can set your own. The setup wizard then asks for it as a first step. Once your administrator exists, the token plays no further role — see [Remote access & TLS](/guide/remote-access).

## 2. Sign in

Use the email and password you just created. From the login screen you can also:

- **Register** additional accounts (if the server allows it).
- **Pair a TV or console-style client** with Quick Connect — the device shows a short code, you approve it from a signed-in device.
- **Enable two-factor authentication** later, from your user settings.

## 3. Add a playback profile

Profiles are separate viewing identities under one account — a bit like Netflix profiles. Each profile has its own resume points, watchlist, ratings, and audio/subtitle preferences. A profile can optionally be protected with a PIN.

The first profile is created for you during setup; add more from **Admin → Users**, or switch between them from the profile menu. Devices remember which profile was last used.

## 4. Point it at your media

Everything else starts in the admin panel. The next step is [Libraries & scanning](/guide/libraries) — add the folders that hold your movies and shows.

## What next?

- [Configuration](/guide/configuration) — environment variables and system settings.
- [Web & desktop clients](/guide/website) — connect more devices.
- [Installing plugins](/guide/plugins) — add metadata providers and other extras.
