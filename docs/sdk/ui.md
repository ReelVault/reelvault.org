---
title: Plugin UI kit
description: reelvault-sdk/ui — custom elements, shadow mounting and declarative schema builders.
outline: [2, 3]
---

# Plugin UI kit — `reelvault-sdk/ui`

This entry point is the **client-side** half of the plugin SDK. Plugin UI ships as custom elements (Web Components) defined by one ESM module — the `entry` in `ui.json` — which the host website imports and mounts.

There are two ways to build UI:

1. **Declarative schema** (recommended for most surfaces) — data rendered by the host's own components, built with the schema helpers exported here. No custom code runs in the browser. See [Frontend (ui.json)](/plugins/ui).
2. **Custom elements** — for UI the schema cannot express (live player interactions, custom visualizations, third-party embeds). This page.

Custom elements are used instead of iframes because the element runs directly in the host document: no sandbox, no `postMessage` bridge, and Shadow DOM isolates styles while CSS custom properties (theme tokens) still inherit from the host.

## Define an element

```tsx
import { definePluginElement, mountShadow } from "reelvault-sdk/ui";
import { createRoot } from "react-dom/client";
import css from "./styles.css?inline";

definePluginElement("rv-example-panel", (element, host) => {
  const mount = mountShadow(element, css);
  const root = createRoot(mount);
  root.render(<Panel host={host} />);
  return () => root.unmount(); // teardown — runs on disconnect
});
```

- `definePluginElement(tag, setup)` registers the custom element. It is idempotent, so calling it more than once is safe.
- `setup` receives the element and the live [`PluginUiHost`](#the-host-api), and may return a teardown function.
- `mountShadow(element, cssText?)` attaches an open shadow root once, injects your CSS, and returns the mount div. Theme tokens (`var(--background)`, …) work inside it.

### Class alternative

Prefer classes? Extend `ReelVaultElement`. The host assigns itself to `element.reelvaultHost` and calls `onHost(host)` once the element is connected **and** the host is available (in either order). `onTeardown` runs on disconnect; elements may re-mount.

## The host API

`PluginUiHost` is a live object the host hands to every mounted surface:

| Member | Description |
|---|---|
| `protocolVersion` | Contract version (`PLUGIN_UI_PROTOCOL_VERSION`, currently `2`) |
| `pluginId` | Your plugin id |
| `context` | Live [`PluginUiContext`](#context) — subscribe to changes with `onContext` |
| `api.call<TResult>(path, options?)` | Call **your plugin's** backend routes (`/v1/plugins/<id>/<path>`); options: `{ method, query, body }` |
| `navigate(to)` | Navigate the host app to an in-app path |
| `openDialog(dialog, params?)` | Open one of your plugin's dialogs |
| `close()` | Close the surface containing this element (dialogs) |
| `toast(level, message)` | Show a toast. `level` is `"success"`, `"error"` or `"info"` |
| `getPlayerState()` | `{ currentTime?, duration?, mediaFileId? }` — empty when no player is mounted |
| `seek(time)` | Seek the host player to an absolute position, in seconds |
| `onContext(listener)` | Context updates; returns an unsubscribe function |
| `onEvent(event, listener)` | Subscribe to a host realtime event; returns an unsubscribe function |

### Context

```ts
interface PluginUiContext {
  protocolVersion: number;
  pluginId: string;
  page?: string;       // when the surface is a page or tab
  dialog?: string;     // when the surface is a dialog
  params: Record<string, string>;  // route params from the triggering contribution
  locale: string;
  theme: "light" | "dark";
  apiBaseUrl: string;
  pageUrl?: string;    // full current URL (context capture)
  user?: { id, role, name? };
  profile?: { id, name };
  player?: { currentTime?, duration?, mediaFileId? };
  device?: { userAgent?, language?, screenResolution?, browser?, os? };
}
```

## Schema builders

The same entry point exports the **declarative schema** helpers. They are identity functions that give you autocomplete and compile-time errors; the plugin build serializes the result to JSON, and the host renders it with its own components:

```ts
import { defineSchema, stack, text, textField, textareaField, grid, selectField, row, button } from "reelvault-sdk/ui/schema";

export default defineSchema({
  body: [
    stack([
      text("Describe the problem.", "muted"),
      textField({ name: "title", label: "Title", required: true }),
      grid([
        selectField({ name: "category", label: "Category", options: [/* … */] }),
        selectField({ name: "severity", label: "Severity", options: [/* … */] }),
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

The vocabulary:

- **Layout** — `stack`, `row`, `grid`, `card`, `section`, `tabs`, `separator`
- **Text** — `heading`, `text`, `badge`, `alert`
- **Fields** — `text`, `textarea`, `number`, `select`, `switch`, `checkbox`, `secret`, `date`
- **Data** — `stats`, `table`, `list`, `embed`, `empty`
- **Control flow** — `foreach`, `when`
- **Actions** — `submit`, `call`, `delete`, `navigate`, `openDialog`, `close`, `toast`, `refresh`

Expressions interpolate as <span v-pre>`{{form.x}}`, `{{data.<source>.<path>}}` and `{{item.x}}`</span>. The full node reference lives in [UI schema](/reference/ui/schema).

`reelvault-sdk/ui/schema` exports only the builders. Import from the subpath when you do not need the element kit — schema-only plugins ship no JavaScript at all.

## Bundling

Bundle `ui/` into a **single ESM module** that registers all your elements (`ui/dist/index.js`). Import your CSS with `?inline` so it lands in the bundle for `mountShadow`. The starter lives in the standalone [plugin-template](https://github.com/ReelVault/ReelVault.PluginTemplate) repo; the full manifest format — pages, dialogs, tabs, slots, and how they reference schemas or tags — is in [Frontend (ui.json)](/plugins/ui).
