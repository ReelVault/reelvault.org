---
title: Plugin events & hooks
description: The full event map with payloads, the envelope every handler receives, and the hook contracts.
outline: [2, 3]
---

# Plugin events & hooks

## Envelope

Every handler receives a frozen envelope merged with the event-specific payload:

```ts
interface PluginEventEnvelope {
  eventId: string;
  payloadVersion: 1;
  occurredAt: string;   // ISO 8601
  correlationId: string;
}
```

`host.events.on` requires the `eventHandler` capability:

```ts
host.events.on("media.file.ready", ({ libraryId, mediaFileId, metadataId }) => { /* … */ });
```

## Event map

`PluginEventDataMap` — 21 events across eight groups.

> Server note: `media.file.identified` is emitted when an ingest matches a new media file to metadata (`status: "matched"`), and `media.file.unavailable` when a scan removes files that disappeared from disk. The remaining contract events are all live.

### Plugin

| Event | Payload |
|---|---|
| `plugin.enabled` | `pluginId` |
| `plugin.disabled` | `pluginId` |

### Library

| Event | Payload |
|---|---|
| `library.scan.started` | `libraryId`, `scanId` |
| `library.scan.completed` | `libraryId`, `scanId`, `errors` |

### Media files

| Event | Payload |
|---|---|
| `media.file.discovered` | `libraryId`, `mediaFileId` |
| `media.file.ready` | `libraryId`, `mediaFileId`, `metadataId` |
| `media.file.unavailable` | `libraryId`, `mediaFileId` |
| `media.file.identified` | `mediaFileId`, `metadataId`, `status: "matched" \| "unmatched" \| "ignored"` |
| `media.file.technical-data-updated` | `mediaFileId`, `size`, `sourceMtimeMs`, `audioChanged` |

### Metadata

| Event | Payload |
|---|---|
| `metadata.search.requested` | `type: "movie" \| "tv_show"`, `title`, `year?` |
| `metadata.saved` | `metadataId` |
| `metadata.refreshed` | `metadataId` |

### Artifacts

| Event | Payload |
|---|---|
| `artifact.created` | `mediaFileId`, `artifactId`, `artifactType` |

### Markers

| Event | Payload |
|---|---|
| `media.markers.updated` | `mediaFileId`, `markerCount` |

### Playback

| Event | Payload |
|---|---|
| `playback.session.started` | `sessionId`, `mediaFileId` |
| `playback.session.ended` | `sessionId`, `mediaFileId`, `reason?` |
| `playback.lifecycle.started` | `sessionId`, `userId?`, `profileId`, `mediaFileId`, `mode: "direct-stream" \| "transcode"`, `videoCodec`, `audioCodec`, `videoBitrateKbps`, `audioStreamIndex`, `startedAt` |
| `playback.lifecycle.progress` | `profileId`, `mediaFileId`, `position`, `duration`, `progressPercent`, `audioStreamIndex?`, `subtitleId?`, `updatedAt` |
| `playback.lifecycle.stopped` | `sessionId`, `mediaFileId`, `reason`, `stoppedAt` |
| `playback.progress.updated` | `profileId`, `mediaFileId`, `position`, `duration`, `completed`, `audioStreamIndex?`, `subtitleId?` |

### Notifications

| Event | Payload |
|---|---|
| `notification.created` | `notificationId`, `userId`, `profileId?`, `type`, `sourcePluginId?` |

## Helper exports

```ts
import {
  createPluginEventPayload,
  type PluginEventDataMap,
  type PluginEventEnvelope,
  type PluginEventName,
  type PluginEventMap,
  type PluginEventHandler,
} from "reelvault-sdk/plugin";
```

`createPluginEventPayload` builds the same frozen envelope production uses; the [testing host](/sdk/testing) calls it when you `host.emit(...)`.

## Hooks

Hooks intercept core pipelines **before** they complete. A handler may return a transformed candidate, return `undefined` to skip the operation, or throw a rejection.

```ts
import { rejectPluginHook } from "reelvault-sdk/plugin";

host.hooks.beforeMetadataSave(({ candidate }) => {
  if (isJunk(candidate)) return undefined;                    // skip this save
  return { ...candidate, title: cleanup(candidate.title) };    // transform
});
```

| Hook | Context | Pipeline |
|---|---|---|
| `beforeMediaRecognition` | `{ candidate: { type, title, year?, season?, episode? } }` | filename → title recognition |
| `beforeMetadataSave` | `{ candidate: MetadataCandidate }` | metadata import/save |
| `beforeArtifactCreate` | `{ candidate: { mediaFileId, kind, contentType, size } }` | artifact writes |

```ts
class PluginHookRejection extends Error {}
function rejectPluginHook(message: string): never;
```

`rejectPluginHook` stops the pipeline **without** counting it as a plugin failure — use it for deliberate vetoes.

## See also

- [Jobs, events & hooks](/plugins/jobs-and-events) — the guided tour.
- [Testing host](/sdk/testing) — emitting events in tests.
- [Realtime](/plugins/host-api#hostrealtime) — pushing to connected clients.
