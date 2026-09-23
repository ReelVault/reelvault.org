---
title: Client configuration
description: ReelVaultClient options, defaults and instance methods.
outline: [2, 3]
---

# `ReelVaultClient`

```ts
import { ReelVaultClient } from "@reelvault/sdk/client";

const api = new ReelVaultClient({
  baseUrl: "http://localhost:3030",
  credentials: "include",
});
```

One instance wraps the whole API. All 25 resource clients share a single transport, which is what makes in-flight GET deduplication, caching, retries and token refresh behave consistently across the surface.

## `ClientConfig`

| Option | Type | Default | Description |
|---|---|---|---|
| `baseUrl` | `string \| (() => string)` | — *(required)* | API origin. Strings are trimmed of a trailing slash; a function is evaluated per request. |
| `fetcher` | `(url, options) => Promise<Response>` | global `fetch` | Custom fetch implementation (test seams, proxies). |
| `headers` | `HeadersInit \| Record<string, string> \| Map<string, string>` | — | Default headers merged into every request. |
| `accessToken` | `string` | — | Sent as `Authorization: Bearer …`. |
| `onTokenExpired` | `() => string \| Promise<string>` | — | Called after a `401`; returns a replacement token. |
| `requestInterceptors` | `RequestInterceptor[]` | `[]` | Run before each request; may rewrite URL/options. |
| `responseInterceptors` | `ResponseInterceptor[]` | `[]` | Run after each response. |
| `enableRetry` | `boolean` | `true` | Retry transient failures. |
| `maxRetries` | `number` | `3` | Retry limit per request. |
| `timeout` | `number` | `30000` | Per-request timeout, in ms. |
| `credentials` | `RequestCredentials` | `"same-origin"` | Use `"include"` for cross-origin cookie sessions. |
| `enableCache` | `boolean` | `false` | TTL cache for successful GETs. |
| `cacheTtlMs` | `number` | `5000` | Cache time-to-live, in ms. |
| `maxTokenRefreshAttempts` | `number` | `1` | How many `401`-triggered refreshes one request may use. |

### Interceptor types

```ts
type RequestInterceptor = (
  url: string,
  options: RequestInit,
) => { url: string; options: RequestInit } | Promise<{ url: string; options: RequestInit }>;

type ResponseInterceptor = (response: Response) => Response | Promise<Response>;
```

## Instance methods

| Member | Signature | Description |
|---|---|---|
| `setAccessToken` | `(token: string \| undefined) => void` | Swap the bearer token at runtime. |
| `getAccessToken` | `() => string \| undefined` | Read the current bearer token. |
| `clearCache` | `() => void` | Drop the shared GET cache and in-flight dedupe state. |

## Resource clients

| Group | Properties |
|---|---|
| Administration | `admin` |
| User & profile | `auth`, `setup`, `profiles`, `notifications`, `me` |
| Library & files | `libraries`, `media` |
| Metadata | `metadata`, `collections`, `companies`, `genres`, `keywords`, `people`, `images` |
| Video content | `seasons`, `episodes` |
| Browse & playback | `discover`, `playbackSessions`, `downloads`, `subtitles`, `providers`, `plugins`, `events` |
| Utilities | `health` |

Method signatures for every resource are in [Client resources](/reference/client/resources).

## See also

- [Authentication](/sdk/client/authentication) — bearer tokens, cookies, profile scoping.
- [Errors](/reference/client/errors) — the error hierarchy and retry rules.
- [Caching, retries & errors](/sdk/client/caching-and-retries) — the behaviour behind these options.
