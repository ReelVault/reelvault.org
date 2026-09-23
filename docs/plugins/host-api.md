---
title: Host API
description: The PluginHost — every host.* namespace available to a plugin.
outline: [2, 3]
---

# Host API

`setup(host)` receives the `PluginHost` — the only door between your plugin and the server. Every namespace below is gated by a [capability](/plugins/manifest#capabilities); the signature lists are exact (from `sdk/plugin/types.ts` in the server repo).

| Namespace | Capability | Purpose |
|---|---|---|
| `host.logger` / `host.config` | — | Structured logging (pino-style), typed plugin configuration |
| `host.media` | `mediaAnalyzer` (register) / `mediaRead` (reads) | Media files, revisions, analyzers |
| `host.metadata` | `metadataRead` | Catalog titles, external-id lookups |
| `host.artifacts` | `artifactsRead` / `artifactsWrite` | Read or attach files to media (trickplay, chapters…) |
| `host.ffmpeg` | `ffmpegRun` | Frame/sprite extraction, generic analyse runs |
| `host.http` | `httpFetch` | Outbound HTTP (SSRF-guarded) |
| `host.providers` | `metadataProvider` / `providerAccess` | Publish or consume metadata providers |
| `host.subtitles` | `subtitleProvider` | Register a subtitle provider |
| `host.jobs` / `host.tasks` | `jobs` | Queue work, cron-style tasks |
| `host.routes` | `httpRoute` | Inbound HTTP endpoints |
| `host.access` | `accessPolicy` | Stream-play veto |
| `host.notifications` | `notification` | User notifications |
| `host.realtime` | `eventHandler` | WebSocket broadcast (plugin-prefixed) |
| `host.storage` | `storage` | Per-plugin KV + blobs |
| `host.markers` | `markers` | Intro/credits/recap markers (plugin-scoped) |
| `host.events` | `eventHandler` | Subscribe to server events |
| `host.hooks` | `eventHandler` | Transform/veto metadata import pipelines |

A few namespaces have their own page: [providers](/plugins/providers), [jobs, events & hooks](/plugins/jobs-and-events), [routes](/plugins/http-routes), [access](/plugins/access-control).

## `host.logger` / `host.config`

```ts
host.logger.info({ mediaFileId }, "analyzing file");  // pino-style, child loggers available
const apiKey = host.config.apiKey;                     // typed from defineConfig
```

`host.config` is `Readonly<Record<string, unknown>>` — narrow values yourself or validate with your [config schema](/plugins/config).

## `host.media`

```ts
get(mediaFileId): Promise<PluginMediaFile | null>;
getRevision(mediaFileId): Promise<PluginMediaRevision | null>;
listEpisodeFilesBySeason(): Promise<Map<string, PluginEpisodeMediaFile[]>>;
listAllMediaFiles(options?: { limit?, offset? }): Promise<PluginMediaFileInfo[]>;
registerAnalyzer(analyzer: MediaAnalyzer): Promise<void>;
```

`PluginMediaRevision` — `{ size, sourceMtimeMs, audioStreams }` — is the **freshness fingerprint** for derived data: cache analyses keyed on it and invalidate on the `media.file.technical-data-updated` event. `listAllMediaFiles` without paging options does a full table scan — page it.

## `host.metadata`

```ts
get(metadataId): Promise<MetadataItem | null>;
findByExternalId(providerId, externalId, type): Promise<MetadataAvailability | null>;
findManyByExternalIds(providerId, externalIds, type): Promise<MetadataAvailability[]>;
```

`MetadataAvailability` tells you whether a provider-known title exists in the library (`hasFiles`, `fileCount`) — the basis for availability badges. The batch form exists because one-lookup-per-id is a table scan; use `findManyByExternalIds` when checking more than a couple of ids.

## `host.artifacts`

```ts
list(mediaFileId): Promise<PlaybackArtifact[]>;
write(artifact: PlaybackArtifactWrite): Promise<PlaybackArtifact>;
deleteByKind(mediaFileId, kind): Promise<number>;
```

Artifacts are files attached to a media file (`trickplay | chapters | preview | waveform`, …) and served to the frontend with authorization. Writes pass the [`beforeArtifactCreate`](/plugins/jobs-and-events#hooks) pipeline.

## `host.ffmpeg`

```ts
extractFrame({ mediaFileId, timeMs, width?, format? }): Promise<ExtractedFrame>;
extractSprite({ mediaFileId, timeMs[], width, height, columns, format? }): Promise<ExtractedSprite>;
runAnalyse(args: string[], options?: {
  timeoutMs?; captureStdout?; maxStdoutBytes?; useHardwareDecode?;
}): Promise<{ exitCode, stderr, stdout? }>;
```

`runAnalyse` is the generic escape hatch for analysis jobs: args are file-level (no shell), network protocols are blocked, output must land in server-managed temp directories. `captureStdout` returns raw stdout bytes (capped, default 64 MiB) for pipelines that emit machine-readable data (PCM, JSON); `useHardwareDecode` injects the server-configured `-hwaccel` per input (no-op without hardware acceleration). Runs require the `ffmpegRun` capability.

## `host.http`

```ts
fetch(input: RequestInfo | URL, init?: RequestInit): Promise<Response>;
```

Outbound HTTP — the same `fetch` signature providers receive, but the host SSRF-guards every hop: protocol allow-list, private-address rejection, redirect validation. Destination hosts can be restricted server-side via `plugins.http.allowedDomains`. Requires the `httpFetch` capability. Read the body yourself (`await response.json()` / `.text()`).

## `host.storage`

```ts
get(key): Promise<unknown>;                        // JSON-decoded — narrow it yourself
set(key, value): Promise<void>;                    // value ≤ 64 KiB
update(key, updater): Promise<unknown>;            // atomic read-modify-write (host locks per key)
delete(key): Promise<void>;
list(prefix?): Promise<string[]>;
putBlob(key, content, { contentType, expiresInMs }): Promise<PluginBlobMetadata>;
getBlob(key): Promise<PluginBlob | undefined>;
deleteBlob(key): Promise<void>;                    // blobs: 20 MiB each, 100 MiB quota per plugin
```

Namespace is per-plugin — you see only your own keys. `get` returns `unknown` by design; use the validated helpers from the SDK when you want a typed value:

```ts
import { readStored, updateStored, t } from "@reelvault/sdk/plugin";

const Count = t.Object({ value: t.Number() });

const current = await readStored(host.storage, "counter", Count); // { value: number } | undefined
const next = await updateStored(host.storage, "counter", Count, (prev) => ({ value: (prev?.value ?? 0) + 1 }));
```

`update`/`updateStored` serialize concurrent writes per key, so a read-modify-write never loses an update — no plugin-side locking required.

## `host.markers`

```ts
list(mediaFileId): Promise<MediaMarker[]>;
set(mediaFileId, markers: readonly CreateMediaMarker[]): Promise<MediaMarker[]>;
clear(mediaFileId): Promise<void>;
```

Write intro/credits/recap markers for players to consume. Scoping is strict: you can only touch markers your plugin created — other plugins' and manual markers are invisible to you. Marker changes emit `media.markers.updated`.

## `host.realtime`

```ts
broadcast(type, payload): void;
sendToUser(userId, type, payload): void;
sendToProfile(profileId, type, payload): void;
sendToSession(sessionId, type, payload): void;
```

Push messages to connected clients over WebSocket. Your `type` is prefixed with the plugin id — you cannot spoof core events or other plugins' channels. Combine with [`host.notifications`](/plugins/jobs-and-events#notifications) when a message should outlive the socket.
