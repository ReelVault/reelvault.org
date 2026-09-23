---
title: Client errors
description: The error classes the SDK throws, their fields, and exactly what gets retried.
outline: [2, 3]
---

# Client errors

Every error the client throws is a standard `Error` subclass with structured fields and a `toJSON()` that is safe to pipe into a structured logger.

```ts
import {
  ReelVaultError,
  ReelVaultValidationError,
  NetworkError,
  TimeoutError,
  isRetryableError,
  isRetryableStatus,
} from "@reelvault/sdk/client";
```

## `ReelVaultError`

Thrown for any non-2xx response.

| Member | Type | Description |
|---|---|---|
| `status` | `number` | HTTP status code |
| `statusText` | `string` | HTTP status text |
| `data` | `unknown` | Parsed response body — the [error envelope](/sdk/client/caching-and-retries#server-error-envelope) for ReelVault's own API |
| `url` | `string` | Request URL |
| `method` | `string \| undefined` | Request verb |
| `requestId` | `string \| undefined` | Server request id, when present |
| `code` | `string \| undefined` | Stable machine-readable code from the payload |
| `params` | `Record<string, string \| number \| boolean \| null> \| undefined` | Values for interpolating `code` |
| `attempt` | `number \| undefined` | Which attempt failed, when retries were involved |
| `retryable` | `boolean` *(getter)* | `true` when `isRetryableStatus(status)` |
| `toJSON()` | `Record<string, unknown>` | Serializable snapshot |

`message` is developer-facing (`HTTP <status>: <statusText> (<METHOD> <url>)`); translate `code` and interpolate `params` for anything a user sees.

## `NetworkError`

The request never completed — connection refused, DNS failure, an abort caused by fetch itself.

| Member | Type | Description |
|---|---|---|
| `url` | `string` | Request URL |
| `method` | `string \| undefined` | Request verb |
| `cause` | `Error \| undefined` | The underlying error |

## `TimeoutError`

The request exceeded `timeout`.

| Member | Type | Description |
|---|---|---|
| `url` | `string` | Request URL |
| `timeout` | `number` | The timeout that elapsed, in ms |

## `ReelVaultValidationError`

Raised *before* the request is sent, when a payload fails runtime validation against the shared TypeBox schema — the same constraints the server enforces. This gives you structured form errors without a round trip.

| Member | Type | Description |
|---|---|---|
| `errors` | `{ path: string; message: string; value: unknown }[]` | One entry per failing field |
| `method` / `url` | `string \| undefined` | Request target |

## Retry helpers

```ts
isRetryableStatus(status: number): boolean;   // 408, 425, 429, or >= 500
isRetryableError(error: unknown): boolean;    // retryable status, NetworkError, TimeoutError
```

The transport retries only when **all** of these hold:

1. `enableRetry` is on and attempts remain (`maxRetries`, default `3`);
2. the request has not been aborted by the caller;
3. the error is retryable; and
4. the method is idempotent (`GET`, `HEAD`, `OPTIONS`, `PUT`, `DELETE`) **or** the request carries an `idempotency-key` header.

Point 4 is why a bare `POST` is not retried: replaying it could create the resource twice. Send an `idempotency-key` header when you do want a mutation retried. `Retry-After` on a `429`/`503` response is honoured; other retries use a bounded backoff with jitter.

## See also

- [Caching, retries & errors](/sdk/client/caching-and-retries) — the behaviour and the server envelope.
- [Client configuration](/reference/client/configuration) — `enableRetry`, `maxRetries`, `timeout`.
