---
title: Manifest & capabilities
description: plugin.json — identity, capabilities and metadata.
outline: [2, 3]
---

# Manifest & capabilities

The manifest (`plugin.json`) is read **before** your module is imported — it is the contract that decides whether your code runs at all.

```json
{
	"id": "org.example.hello",
	"name": "Hello",
	"version": "1.0.0",
	"description": "Says hello.",
	"homepage": "https://github.com/you/hello-plugin",
	"license": "GPL-3.0",
	"entry": "./index.ts",
	"capabilities": ["jobs", "httpRoute", "mediaRead"]
}
```

Point it at the TypeScript source; `bun run build-catalog` bundles it and rewrites the path to the emitted `.js` file in the package.

## Fields

| Field | Meaning |
|---|---|
| `id` | Unique identifier, reverse-domain style (e.g. `org.reelvault.tmdb`). Only `[A-Za-z0-9._-]`. |
| `name` / `version` | Display name and your plugin's semver. |
| `entry` | Module path (relative to the plugin dir) that default-exports the plugin object. |
| `capabilities` | **What the plugin uses from the host.** Verified at runtime — touching an undeclared capability aborts loading immediately. |
| `description` / `homepage` / `license` | Metadata for catalogs and the admin UI. |

That is the whole manifest. Configuration lives next to your code (see [Configuration](/plugins/config)) and the plugin's UI is described in `ui.json`.

## Capabilities

Capabilities are the **only** access gate: every `host.*` call asserts the matching capability the first time it runs. Declaring the capability in `plugin.json` is therefore mandatory — using an undeclared one aborts loading with an error naming it.

| Capability | Unlocks |
|---|---|
| `metadataProvider` | `host.providers.register` — serve metadata to the server |
| `providerAccess` | `host.providers.list/search/getDetails/…` — consume other plugins' providers |
| `subtitleProvider` | `host.subtitles.register` |
| `mediaAnalyzer` | `host.media.registerAnalyzer` — derive source/edition/quality tags |
| `mediaRead` | `host.media.get/getRevision/listEpisodeFilesBySeason/listAllMediaFiles` |
| `metadataRead` | `host.metadata.get/findByExternalId/findManyByExternalIds` |
| `artifactsRead` | `host.artifacts.list` |
| `artifactsWrite` | `host.artifacts.write/deleteByKind` |
| `ffmpegRun` | `host.ffmpeg.runAnalyse/extractFrame/extractSprite` |
| `markers` | `host.markers` — intro/credits/recap markers |
| `jobs` | `host.jobs` and `host.tasks` — queue work and cron-style tasks |
| `eventHandler` | `host.events.on`, `host.hooks.*`, `host.realtime.*` |
| `storage` | `host.storage` — per-plugin KV + blobs |
| `httpRoute` | `host.routes.register` — expose endpoints under `/v1/plugins/<id>/*` |
| `accessPolicy` | `host.access.register` — veto stream playback |
| `notification` | `host.notifications.create` |
| `httpFetch` | `host.http.fetch` — outbound HTTP |

**Declare the narrowest set you can get away with.** Capabilities are shown to the administrator when the plugin is installed, and enforced at runtime.

## In practice

Add the capability to `plugin.json` **before** you call the matching `host.*` API. The abort happens on the first call, and the error names the capability — so declaring upfront is easier than debugging the abort after the fact.
