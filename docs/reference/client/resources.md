---
title: Client resources
description: Every resource client and its methods, with signatures.
outline: [2, 3]
---

# Client resources

A `ReelVaultClient` exposes 25 resource clients. Method parameters and return types are inferred from the shared contracts (`@reelvault/sdk/common`), so this page is a map — your editor has the full detail.

## Collection conventions

Collection endpoints share a shape:

- `getAll` accepts pagination (`page`/`limit` or `offset`), sorting and filters, plus a `fields` projection.
- Methods typed `getAll<F extends string>` are generic over the projected field set — the returned row type narrows to exactly what you asked for. Empty `fields` returns the full relations.
- List responses are wrapped in `PaginatedResponse<T>`: `{ page, limit, total, totalPages, nextCursor?, data }`.

```ts
const movies = await api.metadata.getAll({ fields: ["posterImages"], limit: 20 });
```

## Administration

### `api.admin`

The largest surface. Grouped highlights:

| Area | Methods |
|---|---|
| System settings | `getSystemSettings`, `updateSystemSettings`, `resetSystemSettings` |
| Dashboard & stats | `getDashboard`, `getAnalytics(days?)`, `getStats`, `getCacheStats`, `getLiveActivity`, `terminateLiveStream(sessionId, reason?)` |
| Workers & jobs | `getWorkers`, `runWorker`, `runWorkerCategory`, `cancelWorker`, `cancelAllWorkers`, `resumeWorkerOperation`, `updateWorkerTriggers`, `purgeWorkerHistory`, `getWorkerJobs`, `getWorkerJob`, `cancelWorkerJob`, `deleteWorkerJob`, `getWorkerOperations`, `getWorkerOperation`, `getWorkerOperationJobs`, `cancelWorkerOperation`, `cancelAllWorkerOperations` |
| Users | `getUsers`, `getUser`, `getUserFull`, `createUser`, `updateUser`, `setUserPassword`, `deleteUser` |
| Profiles | `getUserProfiles`, `createUserProfile`, `updateUserProfile`, `deleteUserProfile`, `getUserProfilePreferences`, `updateUserProfilePreferences` |
| Providers | `getMetadataProviderConfigurations`, `updateMetadataProviderConfiguration`, `reorderMetadataProviderConfigurations` |
| Media hygiene | `refreshMetadata`, `deleteOrphanMetadata`, `generateTrickplay`, `generateAllTrickplay`, `getTrickplayStats` |
| Plugins & catalog | `getPlugins`, `getPlugin`, `enablePlugin`, `disablePlugin`, `reloadPlugin`, `reloadPlugins`, `getPluginConfig`, `updatePluginConfig`, `getPluginRepositories`, `createPluginRepository`, `updatePluginRepository`, `deletePluginRepository`, `refreshPluginRepository`, `getPluginCatalog`, `installCatalogPlugin`, `installPluginArchive`, `uninstallPlugin` |
| Infrastructure | `getProcesses`, `getResources`, `getFfmpegCapabilities`, `refreshFfmpegCapabilities`, `getRemoteAccessDiagnostics`, `browseFilesystem`, `getDatabaseBackups`, `createDatabaseBackup`, `deleteDatabaseBackup` |
| Logs & audit | `getLogFiles`, `getLogs`, `downloadLogs`, `deleteLogFile`, `cleanupLogs`, `getAudit` |
| Downloads | `getDownloadJobs`, `deleteDownloadJob` |

`installCatalogPlugin` accepts an optional `version` to install — or roll back to — a specific release from the catalog's version history.

## User & profile

### `api.auth`

```ts
listSessions(query?: PaginationQuery): Promise<ActiveSessionsResponse>
revokeSession(sessionId: string): Promise<{ success: boolean }>
revokeOtherSessions(): Promise<{ success: boolean }>
register(body: RegisterRequest): Promise<RegisterResponse>
login(body: LoginRequest): Promise<LoginResponse>
logout(): Promise<LogoutResponse>
getMe(): Promise<SessionResponse>

enableTwoFactor(password: string): Promise<{ totpURI: string; backupCodes: string[] }>
disableTwoFactor(password: string): Promise<{ success: boolean }>
verifyTotp(code: string): Promise<{ success: boolean }>
verifyBackupCode(code: string): Promise<{ success: boolean }>
generateBackupCodes(password: string): Promise<{ backupCodes: string[] }>

quickConnectInitiate(): Promise<QuickConnectInitiateResponse>
quickConnectCheck(secret: string): Promise<QuickConnectCheckResponse>
quickConnectAuthorize(code: string): Promise<{ success: boolean }>
quickConnectGenerate(): Promise<QuickConnectGenerateResponse>
quickConnectRedeem(code: string): Promise<LoginResponse>
```

### `api.setup`

```ts
getStatus(): Promise<SetupStatus>
createAdmin(body: SetupAdminRequest, setupToken: string): Promise<RegisterResponse>
```

### `api.profiles`

```ts
getAll, create, getById, update, delete
switch(body: SwitchProfile): Promise<{ success: boolean }>
getPreferences(id), updatePreferences(id, body), getPreferenceDefaults(), resetPreferences(id)
uploadAvatar(id: string, file: Blob): Promise<{ avatarUrl: string }>
```

### `api.me`

```ts
get(): Promise<SessionResponse>
getContinueWatching(limit = 12): Promise<ContinueWatchingResponse>
getPlaybackProgress(metadataId), updatePlaybackProgress(mediaFileId, body), resetPlaybackProgress(mediaFileId)
getStreamPrefs(mediaFileId): Promise<StreamPrefs>
getPlaybackSuggestions(metadataId): Promise<SmartPlayResponse>

getWatchlist, isInWatchlist(metadataId), addToWatchlist(metadataId), removeFromWatchlist(metadataId), toggleWatchlist(metadataId), getWatchlistStatuses(metadataIds)
getWatchedHistory(query?), syncWatchedHistory(body), isWatched(metadataId), getInsights(range), getWrapped(year?), clearWatchedHistory()
rate(body): Promise<UserRating>
deleteRating(metadataId)
```

### `api.notifications`

```ts
getAll(query?: { unreadOnly?: boolean }): Promise<Notification[]>
getUnreadCount(): Promise<{ count: number }>
markRead(id: string): Promise<{ success: true }>
markAllRead(): Promise<{ success: true }>
```

## Library & files

### `api.libraries`

```ts
getAll, create, getById, update
delete(libraryId): Promise<{ success: boolean }>
scan(libraryId): Promise<OperationQueuedResponse>
scanPath(libraryId, pathId): Promise<OperationQueuedResponse>
checkErrors(libraryPaths): Promise<OperationQueuedResponse>
getIgnoredAssets(libraryId): Promise<Array<{ path; fileName; reason }>>
```

### `api.media` (media files)

```ts
getAll, getById
getArtifacts(mediaFileId): Promise<PlaybackArtifact[]>
getArtifact(mediaFileId, artifactId): Promise<Blob | string>
getAllMarkers(): Promise<MediaMarker[]>
getMarkers(mediaFileId), setMarkers(mediaFileId, markers), deleteMarkers(mediaFileId)
refresh(mediaFileId), refreshAll(), scan(…), update(…), reassign(…)
delete(mediaFileId)
getAudit(): Promise<OperationQueuedResponse>
getAuditStatus(operationId): Promise<MediaFileAuditStatus>
```

## Metadata & catalog entities

### `api.metadata`

```ts
getAll, getById
getDetailsView(metadataId): Promise<MetadataDetailsViewResponse>
update, rematch, linkProvider
getImageOptions(metadataId): Promise<MetadataImageOption[]>
selectImage(metadataId, body), uploadImage(metadataId, type, file), refreshImages(metadataId, body?)
merge(metadataId, sourceMetadataId): Promise<{ success: true; targetId: string }>
delete(metadataId)
getSimilar(metadataId)
searchGlobal(query: string, limit = 6): Promise<GlobalSearchResponse>
```

### Entities

| Client | Methods |
|---|---|
| `api.collections` | `getAll`, `getById`, `update`, `updateOrder(collectionId, metadataIds)` |
| `api.seasons` | `getAll`, `getById` |
| `api.episodes` | `getAll`, `getById`, `refresh(episodeId)`, `refreshImage(episodeId)` |
| `api.people` | `getAll`, `getById`, `refresh`, `refreshImage` |
| `api.genres` / `api.keywords` | `getAll`, `getById` |
| `api.companies` | `getAll`, `getById`, `getMetadata(companyId, query?)` |
| `api.images` | `getById(imageId, query?): Promise<Blob>`, `getUrlById(imageId, query?): string`, `delete(imageId, deleteFile?)` |

### `api.discover`

```ts
getDiscoverView(query?: { limit?: number }): Promise<DiscoverResponse>
```

## Playback

### `api.playbackSessions`

```ts
create(body: CreatePlaybackSession, options?: { idempotencyKey?: string }): Promise<PlaybackSession>
getView(mediaFileId): Promise<PlaybackViewResponse>
listMine(): Promise<MyPlaybackSessionsResponse>

getPlaylistUrl(sessionId): string
getPlaylist(sessionId): Promise<Blob>
getSegmentUrl(sessionId, segment): string
getSegment(sessionId, segment): Promise<Blob>

sendCommand(sessionId, command)
seek(sessionId, position): Promise<StreamSeekResponse>
getTranscodeProgress(sessionId): Promise<TranscodeProgressResponse>
getDiagnostics(sessionId): Promise<PlaybackDiagnostics>
keepAlive(sessionId)
release(sessionId): Promise<void>
```

`create` accepts an `idempotencyKey` — it is sent as the `idempotency-key` header, which both allows the `POST` to be retried safely and lets the server deduplicate a retried session creation.

### `api.subtitles`

```ts
getAll(query?): Promise<PaginatedResponse<Subtitle>>
create(body), getById(id), update(id, body)
delete(id): Promise<{ success: true }>
getContent(id: string): Promise<string>

listProviders(): Promise<SubtitleProviderStatus[]>
searchProviders(body): Promise<SubtitleProviderSearchResponse[]>
downloadFromProvider(providerId, body): Promise<Subtitle>
```

### `api.downloads`

```ts
list(): Promise<MyDownloadsResponse>
prepare(body: PrepareDownload): Promise<DownloadJob>
getStatus(jobId): Promise<DownloadJob | null>
getFileUrl(jobId): string
remove(jobId): Promise<{ success: boolean }>
```

## Platform

### `api.providers`

```ts
list(): Promise<MetadataProviderStatus[]>
getConfigurations(): Promise<MetadataProviderConfiguration[]>
search(body): Promise<MetadataProviderSearchResponse[]>
```

### `api.plugins`

```ts
list(): Promise<PluginRuntimeStatus[]>
getUiManifest(): Promise<PluginUiManifestResponse>
call<TResult>(pluginId, path, options?): Promise<TResult>
```

### `api.health`

```ts
check(): Promise<HealthStatus>
```

## Realtime

The client does not own a WebSocket. `api.events` builds the URL and sends playback commands:

```ts
getWebSocketUrl(query?: { profileId?: string }): string   // ws(s)://…/v1/events/ws
sendPlaybackCommand(sessionId, command: PlaybackCommand): Promise<PlaybackCommandResponse>
```

Event names and payloads are in [Realtime](/sdk/client/resources#realtime) and [Plugin events](/reference/plugin/events).

## See also

- [Client configuration](/reference/client/configuration)
- [Client errors](/reference/client/errors)
- [Resources & realtime](/sdk/client/resources) — the task-oriented tour.
