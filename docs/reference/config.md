---
title: Manifest & config reference
description: plugin.json fields, capability names, config field builders, and catalog entries.
outline: [2, 3]
---

# Manifest & config reference

## `plugin.json`

Read **before** your module is imported — the contract that decides whether your code runs.

```ts
interface PluginManifest {
  id: string;
  name: string;
  version: string;
  entry: string;
  capabilities: PluginCapabilityName[];
  description?: string;
  homepage?: string;
  license?: string;
}
```

| Field | Notes |
|---|---|
| `id` | Reverse-domain identifier. Only `[A-Za-z0-9._-]`. |
| `version` | Your plugin's semver. |
| `entry` | Module path, relative to the plugin directory, default-exporting the plugin object. |
| `capabilities` | What the plugin uses from the host. Using an undeclared capability aborts loading. |
| `description` / `homepage` / `license` | Metadata for catalogs and the admin UI. |

## Capabilities

Capabilities are the only access gate — there is no separate permission list.

```ts
type PluginCapabilityName =
  | "metadataProvider" | "providerAccess" | "subtitleProvider" | "mediaAnalyzer"
  | "mediaRead" | "metadataRead" | "artifactsRead" | "artifactsWrite" | "ffmpegRun"
  | "markers" | "jobs" | "eventHandler" | "storage"
  | "httpRoute" | "accessPolicy" | "notification" | "httpFetch";
```

| Capability | Unlocks |
|---|---|
| `metadataProvider` | `host.providers.register` |
| `providerAccess` | `host.providers.list/search/getDetails/getSeasonDetails/resolveDetails/discover/getGenres` |
| `subtitleProvider` | `host.subtitles.register` |
| `mediaAnalyzer` | `host.media.registerAnalyzer` |
| `mediaRead` | `host.media.get/getRevision/listEpisodeFilesBySeason/listAllMediaFiles` |
| `metadataRead` | `host.metadata.get/findByExternalId/findManyByExternalIds` |
| `artifactsRead` | `host.artifacts.list` |
| `artifactsWrite` | `host.artifacts.write/deleteByKind` |
| `ffmpegRun` | `host.ffmpeg.runAnalyse/extractFrame/extractSprite` |
| `markers` | `host.markers` |
| `jobs` | `host.jobs` and `host.tasks` |
| `eventHandler` | `host.events.on`, `host.hooks.*`, `host.realtime.*` |
| `storage` | `host.storage` |
| `httpRoute` | `host.routes.register` |
| `accessPolicy` | `host.access.register` |
| `notification` | `host.notifications.create` |
| `httpFetch` | `host.http.fetch` |

Declare the narrowest set you can — capabilities are shown to the admin at install time and enforced at runtime.

## Config schema

Configuration is declared with `defineConfig` next to the entry (see [Configuration](/plugins/config)):

```ts
import { defineConfig, field, type InferConfig } from "reelvault-sdk/plugin";

const config = defineConfig({
  apiKey: field.secret({ label: "API key", required: true, default: "" }),
  language: field.string({ label: "Language", default: "en-US" }),
  region: field.select({ label: "Region", options: [{ label: "US", value: "us" }], default: "us" }),
  maxResults: field.number({ label: "Max results", default: 20, min: 1, max: 50 }),
  includeAdult: field.boolean({ label: "Include adult", default: false }),
});
```

Each builder returns a typed field. The admin form descriptors (`PluginConfigField[]`) are derived from the specs, and `host.config` is the parsed, typed result.

| Builder | Value type | Extras |
|---|---|---|
| `field.string` | `string` | `default`, `required`, `pattern`, `minLength`, `maxLength` |
| `field.secret` | `string` | `default`, `required` |
| `field.number` | `number` | `default`, `min`, `max`, `step` |
| `field.boolean` | `boolean` | `default` |
| `field.select` | union of `options[].value` | `options`, `default` |

A field with a `default` is always present after parsing; without one it can be `undefined`.

## UI manifest (`ui.json`)

```ts
interface PluginUiManifest {
  name: string;
  version: string;
  defaultLocale?: string;
  entry: string;                                  // required only for custom-element tags
  pages?: PluginPageContribution[];
  dialogs?: PluginDialogContribution[];
  tabs?: Partial<Record<"details" | "admin-plugin" | "settings", PluginTabContribution[]>>;
  slots?: Partial<Record<PluginSlotName, PluginSlotContribution[]>>;
  playbackPreRoll?: { endpoint: string };
  searchProvider?: { endpoint: string; requestEndpoint?: string; itemPage?: string };
}
```

```ts
type PluginSlotName =
  | "root-floating-overlay" | "player-footer" | "dashboard-section"
  | "details-action-bar" | "details-dropdown" | "media-file-card-actions"
  | "admin-sidebar-plugin-section" | "navbar-profile-menu";

type PluginLocalizedText = string | Record<string, string>;
```

A surface renders through exactly one of `tag`, `schema` or `schemaRef`. Full details in [Frontend (ui.json)](/plugins/ui).

## Catalog entry

A catalog is any static URL serving `reelvault-catalog.json` with `apiVersion: 1`.

```ts
interface PluginCatalogEntry {
  id: string;
  name: string;
  version: string;       // latest release, semver
  category: "metadata" | "subtitles" | "automation" | "integrations" | "ui" | "other";
  downloadUrl: string;   // https only
  checksum: string;      // "sha256-" + 64 hex chars
  description?: string;
  homepage?: string;     // https only
  iconUrl?: string;      // https only
  changelog?: string;
  date?: string;
  capabilities?: string[];
  versions?: PluginCatalogVersionEntry[]; // older installable releases, newest first
}

interface PluginCatalogVersionEntry {
  version: string;       // semver, unique within the entry
  downloadUrl: string;   // https only
  checksum: string;      // "sha256-" + 64 hex chars
  date?: string;
  changelog?: string;
}
```

Top-level fields describe the latest release; `versions[]` keeps older installable archives (max 50 per entry). Installing a specific version is the update/rollback path. See [Publishing & catalogs](/plugins/publishing).

## Versions

| Constant | Import | Value |
|---|---|---|
| `PLUGIN_UI_PROTOCOL_VERSION` | `reelvault-sdk/plugin` / `reelvault-sdk/ui` | `2` |
