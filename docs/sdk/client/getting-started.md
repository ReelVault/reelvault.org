---
title: API client — getting started
description: ReelVaultClient — configuration, resource clients and basic usage.
outline: [2, 3]
---

# API client — getting started

`reelvault-sdk/client` exports a typed, framework-agnostic HTTP client built on `fetch`. One instance wraps the whole API: 25 resource clients share a single transport with global GET deduplication, optional caching, automatic retries and token refresh.

```bash
bun add reelvault-sdk   # or bun link, see the SDK overview
```

## Create a client

```ts
import { ReelVaultClient } from "reelvault-sdk/client";

const api = new ReelVaultClient({
  baseUrl: "http://localhost:3030",  // required — a trailing slash is trimmed
  accessToken: "<access-token>",     // optional — sent as Authorization: Bearer …
});
```

`baseUrl` also accepts a function (`baseUrl: () => string`), evaluated per request. That is useful when the address is only known at runtime — for example when it is entered on a login screen.

## Call the API

Every resource client exposes thin, fully typed methods:

```ts
// Log in and reuse the session
const { user, session } = await api.auth.login({
  email: "me@example.com",
  password: "…",
});

// Browse the library
const movies = await api.metadata.getAll({ fields: ["posterImages"] });
const detail = await api.metadata.getDetailsView(metadataId);

// Control playback of an existing session
await api.playbackSessions.sendCommand(sessionId, { type: "pause" });

// Admin scope
const { workers } = await api.admin.getWorkers();
```

Responses are inferred from the shared contracts, so there is nothing to decode by hand. Error handling is covered in [Caching, retries & errors](/sdk/client/caching-and-retries).

## `ClientConfig`

| Option | Type | Default | Description |
|---|---|---|---|
| `baseUrl` | `string \| (() => string)` | — *(required)* | API origin; trailing slash trimmed |
| `fetcher` | `Fetcher` | global `fetch` | Custom fetch implementation (test seams, proxies) |
| `headers` | `HeadersInput` | — | Default headers merged into every request |
| `accessToken` | `string` | — | Sent as `Authorization: Bearer …` |
| `onTokenExpired` | `() => string \| Promise<string>` | — | Called after a `401` to obtain a replacement token |
| `requestInterceptors` | `RequestInterceptor[]` | `[]` | Run before each request; may rewrite URL/options |
| `responseInterceptors` | `ResponseInterceptor[]` | `[]` | Run after each response |
| `enableRetry` | `boolean` | `true` | Retry transient failures |
| `maxRetries` | `number` | `3` | Retry limit per request |
| `timeout` | `number` | `30000` | Per-request timeout, in ms |
| `credentials` | `RequestCredentials` | `"same-origin"` | Use `"include"` for cross-origin cookie sessions |
| `enableCache` | `boolean` | `false` | TTL cache for successful GETs |
| `cacheTtlMs` | `number` | `5000` | Cache time-to-live, in ms |
| `maxTokenRefreshAttempts` | `number` | `1` | `401`-triggered refreshes per request |

## Instance API

Beyond the resource clients (see [Resources & realtime](/sdk/client/resources)), a `ReelVaultClient` exposes:

| Member | Description |
|---|---|
| `setAccessToken(token)` / `getAccessToken()` | Swap or read the bearer token at runtime |
| `clearCache()` | Drop the shared GET cache and in-flight dedup state |

## Resource clients

Grouped as on the instance:

| Group | Properties |
|---|---|
| Administration | `admin` |
| User & profile | `auth`, `setup`, `profiles`, `notifications`, `me` |
| Library & files | `libraries`, `media` |
| Metadata | `metadata`, `collections`, `companies`, `genres`, `keywords`, `people`, `images` |
| Video content | `seasons`, `episodes` |
| Browse & playback | `discover`, `playbackSessions`, `downloads`, `subtitles`, `providers`, `plugins`, `events` |
| Utilities | `health` |

Every method is listed with its signature in [Client resources](/reference/client/resources).

## How it is built

- **Thin transport.** The client builds URLs, serializes bodies and validates paths; payload validation is the server's job (shared TypeBox schemas). If you catch yourself pre-validating payloads on the client, you are duplicating the server.
- **One shared `HttpClient`.** All resource clients delegate to it, so caching, dedup, retry and token-refresh behave identically across the whole API.
- **No WebSocket management.** The client builds the realtime URL (`api.events.getWebSocketUrl()`) and sends playback commands over HTTP; owning the socket is up to you — see [Resources & realtime](/sdk/client/resources#realtime).
