---
title: PluginHost
description: Every host.* namespace, with exact signatures, capabilities and limits.
outline: [2, 3]
---

# `PluginHost`

`setup(host)` receives the `PluginHost` — the only door between a plugin and the server. Every namespace is gated by a [capability](/plugins/manifest#capabilities) declared in `plugin.json` and asserted at runtime.

```ts
import { definePlugin, type PluginHost } from "@reelvault/sdk/plugin";

export default definePlugin({
  async setup(host: PluginHost) { /* register everything here */ },
});
```

| Namespace | Capability | Purpose |
|---|---|---|
| `logger` / `config` | — | Structured logging, plugin configuration |
| `media` | `mediaAnalyzer` (register) / `mediaRead` (reads) | Media files, revisions, analyzers |
| `metadata` | `metadataRead` | Catalog titles, external-id lookups |
| `artifacts` | `artifactsRead` / `artifactsWrite` | Read or attach files to media |
| `ffmpeg` | `ffmpegRun` | Frame/sprite extraction, generic analyses |
| `http` | `httpFetch` | Outbound HTTP (SSRF-guarded) |
| `providers` | `metadataProvider` / `providerAccess` | Publish or consume metadata providers |
| `subtitles` | `subtitleProvider` | Register a subtitle provider |
| `jobs` / `tasks` | `jobs` | Queue work, cron-style tasks |
| `routes` | `httpRoute` | Inbound HTTP endpoints |
| `access` | `accessPolicy` | Stream-play veto |
| `notifications` | `notification` | User notifications |
| `realtime` | `eventHandler` | WebSocket broadcast (plugin-prefixed) |
| `storage` | `storage` | Per-plugin KV + blobs |
| `markers` | `markers` | Intro/credits/recap markers |
| `events` | `eventHandler` | Subscribe to server events |
| `hooks` | `eventHandler` | Transform/veto metadata import pipelines |

## `logger` / `config`

```ts
readonly logger: Logger;                            // pino-style; child loggers available
readonly config: Readonly<Record<string, unknown>>; // run through your config schema's parse
```

`config` is intentionally `unknown`: narrow it yourself or validate in a [config schema](/reference/config).

## `media` — *capability `mediaAnalyzer` (register) / `mediaRead` (reads)*

```ts
get(mediaFileId: string): Promise<PluginMediaFile | null>
getRevision(mediaFileId: string): Promise<PluginMediaRevision | null>
listEpisodeFilesBySeason(): Promise<Map<string, PluginEpisodeMediaFile[]>>
listAllMediaFiles(options?: { limit?: number; offset?: number }): Promise<PluginMediaFileInfo[]>
registerAnalyzer(analyzer: MediaAnalyzer): Promise<void>
```

```ts
interface PluginMediaRevision {
  size: number | null;
  sourceMtimeMs: number | null;
  audioStreams: Array<{ index: number; channels: number | null; isDefault: boolean }>;
}
```

`getRevision` is the **freshness fingerprint** for derived data: key caches on it and invalidate on `media.file.technical-data-updated`. `listAllMediaFiles` without paging does a full table scan — page it.

## `metadata` — *capability `metadataRead`*

```ts
get(metadataId: string): Promise<MetadataItem | null>
findByExternalId(providerId: string, externalId: string, type: ProviderMediaType): Promise<MetadataAvailability | null>
findManyByExternalIds(providerId: string, externalIds: readonly string[], type: ProviderMediaType): Promise<MetadataAvailability[]>
```

```ts
interface MetadataAvailability {
  externalId: string;
  metadataId: string;
  title: string;
  type: "movie" | "tv_show";
  hasFiles: boolean;   // at least one playable file
  fileCount: number;
}
```

One lookup per id is a table scan — use `findManyByExternalIds` for more than a couple of ids.

## `artifacts` — *capabilities `artifactsRead` / `artifactsWrite`*

```ts
list(mediaFileId: string): Promise<PlaybackArtifact[]>
write(artifact: PlaybackArtifactWrite): Promise<PlaybackArtifact>
deleteByKind?(mediaFileId: string, kind: string): Promise<number>
```

Artifact writes pass the [`beforeArtifactCreate`](/plugins/jobs-and-events#hooks) pipeline. Limits: max size and total-per-plugin quota come from **Admin → Server settings**; the allowed content types are media-safe only (WebVTT, plain text, JSON, WebP/PNG/JPEG).

## `ffmpeg` — *capability `ffmpegRun`*

```ts
extractFrame(request: { mediaFileId, timeMs, width?, format?: "webp" | "jpeg" }): Promise<ExtractedFrame>
extractSprite(request: { mediaFileId, timeMs: number[], width, height, columns, format? }): Promise<ExtractedSprite>

runAnalyse(args: string[], options?: {
  timeoutMs?: number;
  captureStdout?: boolean;
  maxStdoutBytes?: number;     // default 64 MiB
  useHardwareDecode?: boolean;
}): Promise<{ exitCode: number; stderr: string; stdout?: Uint8Array }>
```

`runAnalyse` is the generic escape hatch: arguments are file-level (no shell), network protocols are blocked, and output must land in server-managed temp directories. `useHardwareDecode` injects the configured `-hwaccel` per input (a no-op without hardware acceleration).

## `http` — *capability `httpFetch`*

```ts
fetch(input: RequestInfo | URL, init?: RequestInit): Promise<Response>
```

The host SSRF-guards every hop: protocol allow-list, private-address rejection, redirect validation. Destination hosts can be restricted with the `plugins.http.allowedDomains` setting.

## `providers`

Publishing requires `metadataProvider`; consuming requires `providerAccess` (which also grants metadata reads).

```ts
// publish
register(provider: MetadataProvider): Promise<void>

// consume
list(): Promise<ProviderStatus[]>
search(request: ProviderSearchRequest): Promise<ProviderSearchResponse[]>
getDetails(providerId: string, type: ProviderMediaType, externalId: string): Promise<ProviderMetadataResult | null>
getSeasonDetails(providerId: string, externalId: string, seasonNumber: number): Promise<ProviderSeasonResult | null>
resolveDetails(type: ProviderMediaType, title: string, year?: number): Promise<ProviderMetadataResult | null>
discover(request: ProviderDiscoveryRequest): Promise<ProviderDiscoveryResult | null>
getGenres(type: ProviderMediaType, providerId?: string): Promise<ProviderResultGenre[]>
```

Full contracts are in [Metadata & subtitle providers](/plugins/providers).

## `subtitles` — *capability `subtitleProvider`*

```ts
register(provider: SubtitleProvider): Promise<void>
```

## `jobs` / `tasks` — *capability `jobs`*

```ts
register<TData, TResult>(definition: PluginJobDefinition<TData, TResult>): Promise<void>
enqueue(name: string, data: unknown, options?: PluginEnqueueOptions): Promise<PluginJobHandle>
enqueueMany(name: string, items: Array<{ data: unknown; options?: PluginEnqueueOptions }>, commonOptions?): Promise<PluginJobHandle[]>

tasks.register(task: PluginScheduledTaskDefinition): Promise<void>
```

```ts
interface PluginJobContext<TData> {
  taskId: string;
  name: string;
  data: TData;
  attempt: number;
  signal: AbortSignal;          // honor it
  logger: Logger;
  operationId?: string;
  updateProgress?: (percent: number) => Promise<void>;
}
```

Enqueue options: `dedupeKey`, `priority`, `delayMs`, `attempts`, `backoff`, `operationId`, `reference`. See [Jobs, events & hooks](/plugins/jobs-and-events).

## `routes` — *capability `httpRoute`*

```ts
register(route: PluginHttpRoute): Promise<void>
```

```ts
interface PluginHttpRoute {
  method: "DELETE" | "GET" | "PATCH" | "POST" | "PUT";
  path: string;
  access?: "admin" | "user";      // "admin" = admin role; "user" (default) = authenticated
  body?: TSchema;                 // TypeBox — parsed and typed for the handler
  query?: TSchema;
  params?: TSchema;
  response?: TSchema;             // optional; validated when present
  handler(request: PluginHttpRequest): PluginHttpResponse | Promise<PluginHttpResponse>;
}
```

Routes mount under `/v1/plugins/<pluginId>/*`. See [HTTP routes](/plugins/http-routes).

## `access` — *capability `accessPolicy`*

```ts
register(policy: PluginAccessPolicy): void
```

```ts
interface PluginAccessPolicy {
  id: string;
  beforeAccess(context: Readonly<PluginAccessContext>): PluginAccessDenial | undefined | Promise<PluginAccessDenial | undefined>;
}
```

Policies sit on the hot path of every play request (server timeout 1 s). See [Access control](/plugins/access-control).

## `notifications` — *capability `notification`*

```ts
create(notification: PluginNotification): Promise<void>
```

```ts
interface PluginNotification {
  userId: string;
  profileId?: string;
  type: string;
  title: string;
  message?: string;
  data?: Record<string, unknown>;
  link?: string;
}
```

The server caps notifications per plugin per day (default 100).

## `realtime` — *capability `eventHandler`*

```ts
broadcast(type: string, payload: unknown): void
sendToUser(userId: string, type: string, payload: unknown): void
sendToProfile(profileId: string, type: string, payload: unknown): void
sendToSession(sessionId: string, type: string, payload: unknown): void
```

Your `type` is prefixed with the plugin id, so you cannot spoof core events or another plugin's channel.

## `storage` — *capability `storage`*

```ts
get(key: string): Promise<unknown>          // JSON-decoded; narrow it yourself
set(key: string, value: unknown): Promise<void>
update(key: string, updater: (current: unknown) => unknown | Promise<unknown>): Promise<unknown>
delete(key: string): Promise<void>
list(prefix?: string): Promise<string[]>

putBlob(key: string, content: Blob | Uint8Array, options: { contentType: string; expiresInMs: number }): Promise<PluginBlobMetadata>
getBlob(key: string): Promise<PluginBlob | undefined>
deleteBlob(key: string): Promise<void>
```

`update` is an atomic read-modify-write — the host locks per key, so concurrent updates cannot lose writes. SDK helpers `readStored(storage, key, schema)` and `updateStored(storage, key, schema, updater)` add TypeBox validation and typing.

Limits: value ≤ **64 KiB**; key ≤ 128 chars matching `[A-Za-z0-9._-]`; blobs ≤ **20 MiB** each with a **100 MiB** total per plugin; `list` returns at most 10,000 keys. The namespace is per-plugin.

## `markers` — *capability `markers`*

```ts
list(mediaFileId: string): Promise<MediaMarker[]>
set(mediaFileId: string, markers: readonly CreateMediaMarker[]): Promise<MediaMarker[]>
clear(mediaFileId: string): Promise<void>
```

Scoping is strict: you can only touch markers your plugin created; manual and other plugins' markers are invisible. Changes emit `media.markers.updated`.

## `events` — *capability `eventHandler`*

```ts
on<TEvent extends PluginEventName>(event: TEvent, handler: PluginEventHandler<TEvent>): void
```

All events and payloads are listed in [Plugin events](/reference/plugin/events).

## `hooks` — *capability `eventHandler`*

```ts
beforeArtifactCreate(handler): void
beforeMediaRecognition(handler): void
beforeMetadataSave(handler): void
```

Each handler may transform the candidate, return `undefined` to skip the operation, or call `rejectPluginHook(message)` to abort deliberately. See [Hooks](/reference/plugin/events#hooks).

## See also

- [Host API](/plugins/host-api) — the guided tour.
- [Manifest & capabilities](/plugins/manifest) — declaring what you use.
- [Plugin events](/reference/plugin/events)
