---
title: Authentication
description: Bearer tokens, cookie sessions, token refresh and profile scoping with the ReelVault client.
outline: [2, 3]
---

# Authentication

The ReelVault API accepts two credential styles — cookie sessions (what the first-party web client uses) or bearer tokens. The client supports both.

## Bearer tokens

Pass `accessToken` in the config (or later via `setAccessToken`); it is sent as `Authorization: Bearer …` on every request.

```ts
const api = new ReelVaultClient({ baseUrl, accessToken: token });

// after a re-login or token rotation:
api.setAccessToken(newToken);
```

### Automatic refresh

Configure `onTokenExpired` and the client refreshes for you: when a request comes back `401`, the transport calls your function, swaps in the returned token and replays the request once (`maxTokenRefreshAttempts`, default 1).

```ts
const api = new ReelVaultClient({
  baseUrl,
  accessToken: loadToken(),
  onTokenExpired: async () => {
    const fresh = await reauthenticate(); // your logic
    saveToken(fresh);
    return fresh;
  },
});
```

Refreshes are **single-flight**: concurrent 401s trigger one `onTokenExpired` call behind a mutex, and queued requests replay with the new token. If refresh fails, the original `ReelVaultError` (status 401) is thrown.

## Cookie sessions

The server's first-party auth is [better-auth](https://www.better-auth.com) with session cookies. To use cookies instead of tokens:

```ts
const api = new ReelVaultClient({
  baseUrl: "https://media.example.com",
  credentials: "include", // cross-origin — send and accept cookies
});
```

Then log in through the auth routes; the session cookie rides along from then on:

```ts
await api.auth.login({ email, password });
const session = await api.auth.getMe();
```

## Profile scoping

Most user-facing endpoints are scoped to a playback **profile** through the `x-profile-id` header. Send it as a default header or attach it per request via an interceptor:

```ts
const api = new ReelVaultClient({
  baseUrl,
  credentials: "include",
  headers: { "x-profile-id": profileId },
});

// or dynamically:
const api2 = new ReelVaultClient({
  baseUrl,
  requestInterceptors: [(url, options) => ({
    url,
    options: { ...options, headers: { ...options.headers, "x-profile-id": currentProfileId } },
  })],
});
```

## Session management routes

`api.auth` covers the whole lifecycle — including two-factor and Quick Connect (pairing from TV / console style clients):

```ts
api.auth.register(body)               // create an account
api.auth.login(body) / logout()
api.auth.getMe()                      // current session
api.auth.listSessions()               // all active sessions of the user
api.auth.revokeSession(id) / revokeOtherSessions()

// two-factor
api.auth.enableTwoFactor(password)    // → { totpURI, backupCodes }
api.auth.verifyTotp(code)
api.auth.verifyBackupCode(code)
api.auth.generateBackupCodes(password)
api.auth.disableTwoFactor(password)

// quick connect — start on the new device, approve on a signed-in one
api.auth.quickConnectInitiate()       // → { code, secret, expiresIn }; poll with the secret
api.auth.quickConnectCheck(secret)    // → { authenticated, token?, user?, redirect? }
api.auth.quickConnectGenerate()       // on a signed-in device → { code, expiresIn }
api.auth.quickConnectAuthorize(code)  // on the signed-in device → approve the code
api.auth.quickConnectRedeem(code)     // on the new device → LoginResponse
```

First-admin creation during server setup goes through `api.setup.getStatus()` / `api.setup.createAdmin(...)` with the `x-setup-token` header — see [Getting started](/guide/getting-started#first-run-setup).
