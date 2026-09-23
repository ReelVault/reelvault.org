---
title: Jobs, events & hooks
description: Queue work with jobs and tasks, react to server events, intercept pipelines with hooks, send notifications.
outline: [2, 3]
---

# Jobs, events & hooks

Most plugins need to do work outside a request: fetch something in the background, react to a file being added, or adjust a title before it is saved. This page covers the four tools for that — jobs, scheduled tasks, events and hooks — plus notifications and realtime.

## Jobs

Custom jobs run in the server's worker queue — with retries, concurrency limits, progress reporting and cancellation. Register a definition, then enqueue work:

```ts
await host.jobs.register({
  name: "scan-subtitles",
  title: "Scan subtitles",
  description: "Fetches subtitles for newly added files",
  options: {
    attempts: 3,
    backoff: { type: "exponential", delayMs: 5_000 },
    concurrency: 1,        // serialize heavy work
    timeoutMs: 10 * 60_000,
    removeOnComplete: 50,
  },
  handler: async (job) => {
    // job.data — your payload, job.attempt — retry counter,
    // job.signal — AbortSignal (honor it!), job.logger — job-scoped logger
    for (const file of job.data.files) {
      if (job.signal.aborted) throw new Error("cancelled");
      await processFile(file);
      await job.updateProgress?.(percent);
    }
    return summary;
  },
});

// enqueue at runtime:
await host.jobs.enqueue("scan-subtitles", { files }, { dedupeKey: `scan:${libraryId}` });
await host.jobs.enqueueMany("scan-subtitles", files.map((file) => ({ data: { file } })), {
  operationId,               // groups the batch in the admin UI
});
```

Enqueue options: `dedupeKey` (skip duplicates), `priority`, `delayMs`, `attempts`, `backoff`, `operationId` (grouping), `reference: { type, id }` (link to an entity). The handler's return value (`string | undefined`) becomes the job result note visible in the admin panel.

**Habits that pay off:** run analyses (ffmpeg, correlations) with `concurrency: 1`, honour `signal`, and keep the event loop free — move heavy loops into a `Worker`.

## Scheduled tasks

Cron-style tasks show up in the admin task scheduler and can be triggered manually:

```ts
await host.tasks.register({
  id: "refresh-availability",
  name: "Refresh availability",
  description: "Checks requested titles against the library",
  defaultTriggers: [{ id: "hourly", type: "interval", intervalMinutes: 60 }],
  run: async () => "checked 42 requests",                   // result note
});
```

Requires the `jobs` capability. Triggers follow the shared `TaskTrigger` contract: `{ id, type: "startup" | "daily" | "weekly" | "interval", timeOfDay?, dayOfWeek?, intervalMinutes?, maxRuntimeMinutes? }` — the same shape administrators see and edit in the scheduled-tasks UI.

## Events

With the `eventHandler` capability you can subscribe to every typed server event (21 today). Handlers receive a frozen envelope (`eventId`, `payloadVersion: 1`, `occurredAt`, `correlationId`) plus event-specific fields:

```ts
host.events.on("media.file.ready", async ({ libraryId, mediaFileId, metadataId }) => {
  await maybeFulfillRequest(metadataId);
});
```

The full map (`PluginEventDataMap`, from `reelvault-sdk/plugin`):

| Group | Events |
|---|---|
| Plugin | `plugin.enabled`, `plugin.disabled` |
| Library | `library.scan.started`, `library.scan.completed` |
| Media files | `media.file.discovered`, `media.file.ready`, `media.file.unavailable`, `media.file.identified`, `media.file.technical-data-updated` |
| Metadata | `metadata.search.requested`, `metadata.saved`, `metadata.refreshed` |
| Artifacts | `artifact.created` |
| Markers | `media.markers.updated` |
| Playback | `playback.session.started`, `playback.session.ended`, `playback.lifecycle.started`, `playback.lifecycle.progress`, `playback.lifecycle.stopped`, `playback.progress.updated` |
| Notifications | `notification.created` |

Two idioms worth copying:

- **Freshness**: key caches on `host.media.getRevision(id)` and invalidate on `media.file.technical-data-updated` (carries `size`, `sourceMtimeMs`, `audioChanged`).
- **Fulfillment**: watch `media.file.ready` and match against your own storage to implement "notify me when it lands in the library" flows.

## Hooks

Hooks intercept core import pipelines **before** they complete. A hook may transform the candidate (return the changed one) or veto it; returning `undefined` keeps the candidate unchanged. To abort the operation entirely, veto it:

```ts
import { rejectPluginHook } from "reelvault-sdk/plugin";

host.hooks.beforeMetadataSave(({ candidate }) => {
  if (isJunk(candidate)) return undefined;        // skip this save
  return { ...candidate, title: cleanup(candidate.title) };  // transform
});

host.hooks.beforeMediaRecognition(({ candidate }) => {
  if (candidate.year && candidate.year < 1900) rejectPluginHook("Year out of range");
});
```

| Hook | Context | Pipeline |
|---|---|---|
| `beforeMediaRecognition` | `{ candidate: { type, title, year?, season?, episode? } }` | filename → title recognition |
| `beforeMetadataSave` | `{ candidate: MetadataCandidate }` | metadata import/save |
| `beforeArtifactCreate` | `{ candidate: { mediaFileId, kind, contentType, size } }` | artifact writes |

`rejectPluginHook(message)` throws `PluginHookRejection` — the pipeline stops **without** counting the stop as a plugin failure.

## Notifications

```ts
await host.notifications.create({
  userId,                     // recipient (profileId optional)
  type: "request.fulfilled",
  title: "Arrival is now available",
  message: "You requested it — start watching.",
  link: "/metadata/md-123",   // in-app link
  data: { metadataId: "md-123" },
});
```

Notifications are persisted, attributed to your plugin, and delivered over realtime to connected clients. Requires the `notification` capability; you can also observe `notification.created` like any other event.

## Realtime

For ephemeral push (live dashboards, presence) use [`host.realtime`](/plugins/host-api#hostrealtime) — `broadcast` / `sendToUser` / `sendToProfile` / `sendToSession`. Prefer notifications when the message should survive the socket.
