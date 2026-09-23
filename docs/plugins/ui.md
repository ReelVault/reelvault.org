---
title: Frontend (ui.json)
description: Declare plugin UI — pages, dialogs, tabs and slots; declarative schemas vs custom elements.
outline: [2, 3]
---

# Frontend (ui.json)

The website is a **generic host**: it renders whatever a plugin declares in `ui.json` and contains no plugin-specific code. Adding a plugin never requires a host rebuild — or even a host restart.

## Surfaces

| Key | Rendered as |
|---|---|
| `pages` | Full pages at `/plugins/<id>/page/<path>` (optionally listed in user/admin navigation) |
| `dialogs` | Modals, opened by a slot action or from your bundle via the bridge |
| `tabs` | Tabs injected into a named host surface (`details`, `admin-plugin`, `settings`) |
| `slots` | Inline extension points — see the [slot names](#slot-names) |

Two more declarations extend existing host surfaces rather than adding new ones: [`playbackPreRoll`](#playback-pre-roll) (content before a title plays) and [`searchProvider`](#global-search) (provider titles in the global search box).

## How a surface renders

Each surface picks **exactly one** rendering mode:

- **Declarative schema** (recommended) — data describing the UI, rendered by the host's own components. Best for forms, admin CRUD, pages and dialogs; matches the app look and **cannot execute code**. Reference it inline (`schema`) or by file (`schemaRef` — inlined into the manifest at serve time, so the client fetches nothing extra).
- **Custom element** (advanced escape hatch) — an ESM module (`entry`) registering Web Components mounted as `<tag>`. Use it only when the schema cannot express the UI: live player interactions, custom visualizations, third-party embeds. Custom elements run the plugin's JS **same-origin in the host document** — only install plugins you trust.

`entry` is required only when a surface uses a custom-element `tag`. Schema-only plugins ship no JavaScript at all.

```json
{
	"name": "Bug Reports",
	"version": "1.0.0",
	"defaultLocale": "en",
	"pages": [
		{ "id": "admin", "path": "admin", "name": "Bug reports", "icon": "Shield", "nav": "admin", "adminOnly": true, "schemaRef": "./dist/ui/schema-admin.json" }
	],
	"dialogs": [{ "id": "report", "title": "Report a bug", "size": "lg", "schemaRef": "./dist/ui/schema-report.json" }],
	"tabs": {
		"details": [{ "id": "reports", "host": "details", "label": "Reports", "page": "admin", "adminOnly": true }]
	},
	"slots": {
		"root-floating-overlay": [{ "label": "Report a bug", "icon": "Bug", "action": { "type": "dialog", "dialog": "report" } }]
	}
}
```

### Pages, dialogs, tabs — the shared knobs

- `id` — stable id referenced by slots/tabs; `path` — URL segment for pages.
- `name` / `label` / `title` — text or locale map (see [Translations](#translations)).
- `icon` — a Lucide icon name from the host allowlist.
- `adminOnly` — stripped server-side from the manifest before it reaches a regular user; tabs and slot actions referencing them are dropped too.
- `priority` — ordering (lower first, default 100).
- Pages: `nav` — `"user"`, `"admin"`, or `false` to hide from navigation.
- Dialogs: `size` — `sm | md | lg | xl`.

### Slot names

| Slot | Location |
|---|---|
| `root-floating-overlay` | Floating action area above the whole app |
| `player-footer` | Under the video player |
| `details-action-bar` / `details-dropdown` | Title details page — buttons / overflow menu |
| `media-file-card-actions` | Per-file card actions |
| `dashboard-section` | User dashboard — full-width section among the built-in rows |
| `admin-sidebar-plugin-section` | Admin sidebar |
| `navbar-profile-menu` | Profile dropdown menu |

A slot contribution declares exactly one of:

- `action` — a clickable button/menu item: `{ type: "page", page }`, `{ type: "dialog", dialog }`, `{ type: "navigate", href }` (in-app route) or `{ type: "external", href }` (new tab), each optionally with `params`;
- `element` — an inline custom element (`{ tag }`) embedded on the spot.

Plus: `icon`, `priority`, `iconOnly: true` (compact icon button — accessible name kept from `label`), `adminOnly: true` (rendered only for administrators).

## Playback pre-roll

Declare `playbackPreRoll` to serve content the player shows **before** a title starts — the Cinemamode plugin uses it to play cinema-style trailers:

```json
{ "playbackPreRoll": { "endpoint": "/pre-roll" } }
```

`endpoint` is one of your plugin's [HTTP routes](/plugins/http-routes), relative to `/v1/plugins/<id>/`. The host picks the first enabled plugin that declares it, calls the endpoint with `?mediaFileId=<id>`, and renders the entries before playback starts:

```json
{
  "entries": [
    { "kind": "youtube", "key": "dQw4w9WgXcQ", "title": "Arrival", "trailerName": "Official trailer", "imageUrl": "https://…", "metadataId": "md-123" }
  ]
}
```

Return an empty `entries` list to skip. The player **waits** for this call, so keep it fast and cache aggressively; when no plugin declares `playbackPreRoll`, playback starts immediately.

## Global search

Declare `searchProvider` to extend the host's search box with titles from a provider — Media Requests uses it so users can find and request titles that are not in the library yet:

```json
{
  "searchProvider": {
    "endpoint": "/search",
    "requestEndpoint": "/requests",
    "itemPage": "detail"
  }
}
```

| Field | Meaning |
|---|---|
| `endpoint` | Route queried with `?query=<term>`; returns `{ "items": [ … ] }` |
| `requestEndpoint` | Optional route that receives a `POST` with the selected item to start a request |
| `itemPage` | Optional id of one of your pages, opened when an item is selected (it receives `providerId`, `externalId` and `mediaType` as query params) |

An item is `{ providerId, externalId, mediaType, title, year?, posterPath?, imageUrl?, overview?, state }`, where `state` is one of `available`, `pending`, `approved`, `rejected`, `none`. As with pre-roll, only the first plugin to declare `searchProvider` is used.

## Declarative schemas

Build them type-safely and emit JSON at build time:

```ts
// ui/schema.ts → dist/ui/schema.json
import { button, defineSchema, grid, row, selectField, stack, text, textField, textareaField } from "reelvault-sdk/ui/schema";

export default defineSchema({
  data: {
    summary: { path: "/stats" },                    // named GET sources, fetched on mount
  },
  body: [
    stack([
      text("Describe the problem.", "muted"),
      textField({ name: "title", label: "Title", required: true }),
      grid([
        selectField({ name: "category", label: "Category", default: "general", options: [/* … */] }),
        selectField({ name: "severity", label: "Severity", default: "medium", options: [/* … */] }),
      ], { columns: 2 }),
      textareaField({ name: "description", label: "Description", required: true, rows: 5 }),
      row([
        button("Cancel", { type: "close" }, { variant: "ghost" }),
        button("Submit", { type: "submit", path: "/reports", successToast: "Sent", close: true }),
      ], { align: "end" }),
    ]),
  ],
});
```

The vocabulary: layout (`stack`, `row`, `grid`, `card`, `section`, `tabs`, `separator`), text (`heading`, `text`, `badge`, `alert`), fields (`text | textarea | number | select | switch | checkbox | secret | date`), buttons, data display (`stats`, `table`, `list`, `embed`, `empty`) and control flow (`foreach`; the conditional node is `if`, built with the `when(condition, content, otherwise?)` helper).

**Actions** connect the schema to your [routes](/plugins/http-routes): `submit` (form → path), `call` (explicit method/body/query), `delete`, `navigate`, `openDialog`, `close`, `toast`, `refresh` — with optional `confirm`, `successToast`, and `refresh: ["sourceName"]` to re-fetch data sources after success.

**Expressions** interpolate as <span v-pre>`{{form.x}}`, `{{data.<source>.<path>}}` or `{{item.x}}`</span> (inside `list`/`table`/`foreach`); conditions (`hiddenIf`, `disabledIf`, `if`) compare against the same expressions (`eq`, `gt`, `contains`, `truthy`, …). Schema surfaces receive the **full ambient context**: <span v-pre>`{{context.params.*}}`, `{{context.pageUrl}}`, `{{context.locale}}`, `{{context.theme}}`, `{{context.user.role}}`, `{{context.profile.id}}`, `{{context.player.currentTime}}`</span> and `context.device` (`userAgent`, `language`, `screenResolution`, `browser`, `os`).

## Custom elements

When you need real code, define elements with the [`reelvault-sdk/ui`](/sdk/ui) kit and list their tags in the manifest:

```tsx
import { definePluginElement, mountShadow } from "reelvault-sdk/ui";
import { createRoot } from "react-dom/client";
import css from "./styles.css?inline";

definePluginElement("rv-example-panel", (element, host) => {
  const mount = mountShadow(element, css);
  const root = createRoot(mount);
  root.render(<Panel host={host} />);
  return () => root.unmount();
});
```

The live host API (`host.api.call`, `navigate`, `openDialog`, `toast`, `getPlayerState`, `seek`, `onContext`, `onEvent`) is versioned (`PLUGIN_UI_PROTOCOL_VERSION`) and documented in [Plugin UI kit — the host API](/sdk/ui#the-host-api).

## Translations

Any label/title/message accepts a plain string or a locale map:

```json
"label": { "en": "Report a bug", "pl": "Zgłoś błąd" }
```

The host resolves against the active app locale, then the plugin's `defaultLocale`, then the first available entry.

## Building the bundle

Put frontend sources in `ui/` with a `package.json` whose `build` script emits a single ESM module at `ui/dist/index.js` (import CSS with `?inline` so Shadow DOM picks it up). The starter lives in the standalone [plugin-template](https://github.com/ReelVault/ReelVault.PluginTemplate) repo; the catalog builder in `ReelVault.Plugins` runs the same UI build for cataloged plugins.

Two development-loop gotchas: `schemaRef` files are read from `ui/dist/` — run the build before reloading, or inline the schema while iterating; and a custom-element `entry` is served from `ui/dist/index.js`, so the built bundle must exist next to the sources for the page to load.

Disabling a plugin removes all of its surfaces (pages, dialogs, tabs, slots) automatically; the aggregated manifest is served at `GET /v1/plugins/ui/manifest`.
