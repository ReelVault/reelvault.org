---
title: Caching, retries & errors
description: What the ReelVault client does automatically — GET dedup and caching, retry policy, timeouts — and how to handle its errors.
outline: [2, 3]
---

# Caching, retries & errors

## In-flight dedup (always on)

Concurrent identical GETs are coalesced into a single network request. The key covers method, URL, headers and access token, so different users/headers never share responses. The first response is fanned out to every caller; failures propagate to all of them. This requires no configuration.

## TTL cache (opt-in)

```ts
const api = new ReelVaultClient({
  baseUrl,
  enableCache: true,   // default: false
  cacheTtlMs: 5_000,   // default: 5 s, max 500 entries (LRU eviction)
});
```

Successful GETs are cached for the TTL; subsequent calls within the window are served from memory. Mutations never hit the cache. Drop everything manually with `api.clearCache()` — sensible after a login/logout or a bulk mutation the API can't notify you about.

Caching is conservative on purpose: the server pushes realtime updates over WebSocket ([realtime events](/sdk/client/resources#realtime)), so most UIs prefer invalidating explicitly over blanket caching.

## Retries

Transient failures are retried automatically (`enableRetry: true`, up to `maxRetries: 3`). A failure is transient when:

- the status is `408` (request timeout), `425` (too early), `429` (rate limit) or any `5xx`,
- the network itself fails (connection refused, DNS, …).

A `Retry-After` response header is honored — the next attempt waits for the requested interval (capped at 30 s); other retries use a bounded backoff (200 ms doubling to 5 s, with ±20% jitter). Retried requests surface in errors as `attempt`.

Only **idempotent** methods are retried: `GET`, `HEAD`, `OPTIONS`, `PUT`, `DELETE`. A `POST` or `PATCH` is not retried unless the request carries an `idempotency-key` header — replaying it blindly could create the same resource twice. Non-retryable statuses (`400`, `401`, `403`, `404`, `409`, …) throw immediately.

You can reuse the same predicates outside the transport:

```ts
import { isRetryableError, isRetryableStatus } from "@reelvault/sdk/client";
```

## Timeouts

Each request is bounded by `timeout` (default 30 s). Long streams (HLS segments) are not fetched through this client — playback uses direct media URLs — so the default is safe for JSON traffic. Expiry throws `TimeoutError`.

## Error taxonomy

Every error the client throws is a standard `Error` subclass with structured fields and a `toJSON()` safe for structured loggers.

### `ReelVaultError` — non-2xx responses

| Field | Description |
|---|---|
| `status` / `statusText` | HTTP status |
| `data` | Raw response payload — the [server error envelope](#server-error-envelope) for ReelVault's own API |
| `url` / `method` | Request target and verb |
| `requestId` | Server request id, when present — quote it in bug reports |
| `code` / `params` | Machine-readable error code + interpolation params (for i18n) |
| `attempt` | Which attempt failed, when retries were involved |
| `retryable` | `true` for statuses the transport would retry |

`code` and `params` are the fields meant for people: translate the code to a localized string and interpolate `params`. `error.message` is a developer-facing fallback (the status line plus the URL), not UI copy — see [Server error envelope](#server-error-envelope).

### `NetworkError` — the request never completed

Connection failures, DNS errors, aborts caused by the fetch itself. Carries `url` and `method`.

### `TimeoutError` — the request exceeded `timeout`

Carries `url` and the `timeout` in ms.

### `ReelVaultValidationError` — rejected before it was sent

Raised when a request payload fails runtime validation against the shared TypeBox schema — the same constraints the server enforces — so you get immediate structured feedback without a round trip. Carries `errors: { path, message, value }[]` for form binding.

```ts
try {
  await api.libraries.create({ /* … */ });
} catch (error) {
  if (error instanceof ReelVaultValidationError) {
    error.errors.forEach(({ path, message }) => showFieldError(path, message));
  } else if (error instanceof ReelVaultError) {
    if (error.status === 401) redirectToLogin();
    // Translate the stable code and interpolate params — never show error.message.
    else showError(t(error.code ?? "generic"), error.params, error.requestId);
  } else {
    throw error; // NetworkError / TimeoutError / unexpected
  }
}
```

## Server error envelope

API failures use a small, fixed envelope — `ReelVaultError.data` is that object:

```json
{
  "statusCode": 404,
  "code": "not_found",
  "requestId": "9f2c1a4e-…",
  "params": { "libraryId": "42" }
}
```

| Field | Meaning |
|---|---|
| `statusCode` | HTTP status (400–599) |
| `code` | Stable machine identifier — map it to a localized string |
| `params` | Values to interpolate into that string |
| `requestId` | Server request id; quote it in bug reports |
| `details` | Optional extra payload for validation and similar cases |

The envelope carries **no `message`** by design — the client owns all user-facing text. The codes come in two flavours: generic HTTP ones (`validation`, `conflict`, `not_found`, `forbidden`) and granular domain ones (`plugin.storage.value_too_large`). Translate `code` and interpolate `params`; never show `error.message`.

> If a reverse proxy or gateway returns a standard RFC 9457 Problem Details body instead (`title`, `detail`, …), `ReelVaultError.message` picks the first non-empty of `message` / `detail` / `title` / `error`. That is a convenience for logs and debugging, not a substitute for translating `code`.
