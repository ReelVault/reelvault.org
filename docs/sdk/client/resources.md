---
title: Resources & realtime
description: Every resource client on ReelVaultClient, plus realtime WebSocket events and playback commands.
outline: [2, 3]
---

# Resources & realtime

A `ReelVaultClient` instance exposes 25 resource clients. Method parameters and return types are all inferred from the shared contracts (`@reelvault/sdk/common`), so treat this page as a map — your editor has the details.

Collection endpoints share conventions: `getAll` supports pagination (`limit`, `offset` / `page`), sorting and a `fields` projection (request only the relations you need; empty `fields` loads full relations). Methods typed `getAll<F>` are generic over the projected field set, so the returned row type narrows to what you asked for.

## User & profile

### `api.auth`

Account lifecycle, sessions, two-factor, Quick Connect — full listing in [Authentication](/sdk/client/authentication#session-management-routes).

### `api.setup`

| Method | Purpose |
|---|---|
| `getStatus()` | First-run setup state |
| `createAdmin(body)` | Create the first administrator (needs `x-setup-token`) |

### `api.profiles`

Playback profiles (who is watching): `getAll`, `create`, `getById`, `update`, `delete`, `switch`, `getPreferences`, `updatePreferences`, `getPreferenceDefaults`, `resetPreferences`, `uploadAvatar`.

### `api.me`

Everything scoped to the current viewer:

- progress & resume: `getContinueWatching`, `getPlaybackProgress`, `updatePlaybackProgress`, `resetPlaybackProgress`
- stream preferences: `getStreamPrefs`
- suggestions: `getPlaybackSuggestions`
- watchlist: `getWatchlist`, `isInWatchlist`, `addToWatchlist`, `removeFromWatchlist`, `toggleWatchlist`, `getWatchlistStatuses`
- history & stats: `getWatchedHistory`, `syncWatchedHistory`, `isWatched`, `getInsights`, `getWrapped`, `clearWatchedHistory`
- ratings: `getRatings`, `rate`, `deleteRating`

### `api.notifications`

`getAll`, `getUnreadCount`, `markRead`, `markAllRead`.

## Library & files

### `api.libraries`

`getAll`, `create`, `getById`, `update`, `delete`, `scan`, `scanPath`, `checkErrors`, `getIgnoredAssets`.

### `api.media` (media files)

- retrieval: `getAll`, `getById`
- artifacts & markers: `getArtifacts`, `getArtifact`, `getAllMarkers`, `getMarkers`, `setMarkers`, `deleteMarkers`
- maintenance: `refresh`, `refreshAll`, `scan`, `update`, `reassign`, `delete`
- audits: `getAudit`, `getAuditStatus`

## Metadata & catalog entities

### `api.metadata` (titles)

`getAll`, `getById`, `getDetailsView` (one request for the full details page), `update`, `rematch`, `linkProvider`, `getImageOptions`, `selectImage`, `uploadImage`, `refreshImages`, `merge`, `delete`, `getSimilar`, `searchGlobal` (fuzzy fallback search).

### Entities

| Client | Methods |
|---|---|
| `api.collections` | `getAll`, `getById`, `update`, `updateOrder` |
| `api.seasons` | `getAll`, `getById` |
| `api.episodes` | `getAll`, `getById`, `refresh`, `refreshImage` |
| `api.people` | `getAll`, `getById`, `refresh`, `refreshImage` |
| `api.genres` / `api.keywords` / `api.companies` | `getAll`, `getById` (`companies` adds `getMetadata`) |
| `api.images` | `getById`, `getUrlById`, `delete` |

### `api.discover`

`getDiscoverView` — curated feeds (trending, popular, …) aggregated from enabled metadata providers.

## Playback

### `api.playbackSessions`

The heart of streaming. A session pins a transcode/remux pipeline to one media file for one viewer:

| Method | Purpose |
|---|---|
| `create(body)` | Open a session (server decides direct play / remux / transcode from client capabilities) |
| `getPlaylistUrl(session)` / `getSegmentUrl(...)` | Direct media URLs for the player (hls.js) |
| `sendCommand(sessionId, command)` | Remote control — see [commands](#playback-commands) |
| `seek(sessionId, position)` | Seek with server-side stream-start alignment |
| `getTranscodeProgress(sessionId)` | Transcoded ranges for the progress bar |
| `getDiagnostics(sessionId)` | Pipeline diagnostics |
| `keepAlive(sessionId)` | Heartbeat — keeps the session alive |
| `release(sessionId)` | Close the session and stop transcode workers |
| `listMine()` / `getView(sessionId)` | Session introspection |

### `api.subtitles`

Library subtitles: `getAll`, `getById`, `create`, `update`, `delete`, `getContent`; provider-backed search & download: `listProviders`, `searchProviders`, `downloadFromProvider`.

### `api.downloads`

Offline copies with server-side quota/retention: `list`, `prepare`, `getStatus`, `getFileUrl`, `remove`.

## Platform

### `api.providers`

`list` (installed metadata/subtitle providers), `getConfigurations`, `search` (titles across providers — used by identify/requests flows).

### `api.plugins`

`list`, `getUiManifest` (aggregated `ui.json` manifest), `call` (invoke a plugin route — the same path the website's plugin host uses).

### `api.admin`

The admin surface is large; grouped highlights:

- system: `getSystemSettings`, `updateSystemSettings`, `resetSystemSettings`, `getDashboard`, `getAnalytics`, `getStats`, `getCacheStats`, `getLiveActivity`
- workers & jobs: `getWorkers`, `runWorker`, `runWorkerCategory`, `cancelWorker`, `cancelAllWorkers`, `resumeWorkerOperation`, `updateWorkerTriggers`, `purgeWorkerHistory`, `getWorkerJobs`, `getWorkerJob`, `cancelWorkerJob`, `getWorkerOperations`, `cancelWorkerOperation`, `cancelAllWorkerOperations`
- users: `getUsers`, `getUser`, `getUserFull`, `createUser`, `updateUser`, `setUserPassword`, `deleteUser`, profile & preference management
- metadata providers: `getMetadataProviderConfigurations`, `updateMetadataProviderConfiguration`, `reorderMetadataProviderConfigurations`
- ffmpeg: `getFfmpegCapabilities`, `refreshFfmpegCapabilities`
- plugins & catalog: `getPlugins`, `getPlugin`, `enablePlugin`, `disablePlugin`, `reloadPlugin`, `reloadPlugins`, `getPluginRepositories`, `createPluginRepository`, `updatePluginRepository`, `deletePluginRepository`, `refreshPluginRepository`, `getPluginCatalog`, `installCatalogPlugin`, `installPluginArchive`, `uninstallPlugin`
- media hygiene: `refreshMetadata`, `deleteOrphanMetadata`, `generateTrickplay`, `generateAllTrickplay`, `getTrickplayStats`
- infrastructure: `getProcesses`, `getResources`, `getLogFiles`, `getLogs`, `getAudit`, `downloadLogs`, `deleteLogFile`, `cleanupLogs`, `browseFilesystem`, `getDatabaseBackups`, `createDatabaseBackup`, `deleteDatabaseBackup`, `getRemoteAccessDiagnostics`
- downloads: `getDownloadJobs`, `deleteDownloadJob`

`installCatalogPlugin` accepts an optional `version` to install — or roll back to — a specific release from the catalog's version history.

### `api.health`

`check` — liveness probe.

## Realtime

The client does **not** own a WebSocket; it builds the URL and hands you the event contract.

```ts
const wsUrl = api.events.getWebSocketUrl({ profileId }); // http(s)→ws(s), path /v1/events/ws
const socket = new WebSocket(wsUrl);
```

Messages are `RealtimeEventMessage` envelopes:

```ts
interface RealtimeEventMessage<TData = unknown> {
  type: string;     // key of RealtimeEventMap, e.g. "playback:session:progress"
  payload: TData;
  occurredAt: string;
}
```

`RealtimeEventMap` (from `@reelvault/sdk/common`) types the known payloads:

| Event | Payload highlights |
|---|---|
| `notification:created` | notification fields (`id`, `title`, `type`, `data`, …) |
| `library:scan:completed` | `libraryId`, `libraryTitle` |
| `worker:job:completed` | `jobId`, `workerId`, `type` |
| `playback:session:started` / `ended` / `terminated` | `sessionId`, `mediaFileId`, `reason?` |
| `playback:session:seeked` | `sessionId`, `startTime` (real stream start), `position?` |
| `playback:session:progress` | `sessionId`, `position?`, `duration?`, `isPaused?` |
| `playback:progress:updated` | `mediaFileId`, `position`, `duration`, `completed` |
| `playback:command` | `sessionId`, `command` (remote control arriving at this client) |
| `auth:session:revoked` | `sessionId` — sign the user out |
| `system.resource_alert` / `system.rescue_state` | server health telemetry |

Note the two namespaces: client realtime events are **colon-separated** (`playback:*`), while plugin events (inside the server) are dot-separated (`media.file.ready`) — see [Jobs, events & hooks](/plugins/jobs-and-events).

### Playback commands

Remote-control commands go over HTTP and are delivered to the target session's socket by the server:

```ts
await api.events.sendPlaybackCommand(sessionId, { type: "seek", relative: -10 });
await api.events.sendPlaybackCommand(sessionId, { type: "pause" });
```

`PlaybackCommand`: `{ type: "play" | "pause" | "seek" | "stop" | "setVolume", position?, relative?, volume? }` (`relative` is a signed offset in seconds; `volume` is 0–1). The response `{ delivered, command }` tells you whether the session was connected.
