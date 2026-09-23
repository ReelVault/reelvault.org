---
title: Plugin UI host
description: PluginUiHost, the element kit, and the context types passed to plugin custom elements.
outline: [2, 3]
---

# Plugin UI host — `reelvault-sdk/ui`

The client-side half of the plugin SDK. Only surfaces that declare a custom-element `tag` need it; declarative-schema surfaces ship no JavaScript.

```ts
import {
  definePluginElement,
  mountShadow,
  ReelVaultElement,
  PLUGIN_UI_PROTOCOL_VERSION,
  type PluginUiHost,
} from "reelvault-sdk/ui";
```

`PLUGIN_UI_PROTOCOL_VERSION` is `2`.

## Element kit

### `definePluginElement`

```ts
type PluginElementSetup = (element: HTMLElement, host: PluginUiHost) => (() => void) | undefined;

definePluginElement(tag: string, setup: PluginElementSetup): void
```

Registers `tag` as a custom element. Idempotent — calling it twice is safe. The optional returned function is a teardown that runs on disconnect.

```tsx
definePluginElement("rv-example-panel", (element, host) => {
  const mount = mountShadow(element, css);
  const root = createRoot(mount);
  root.render(<Panel host={host} />);
  return () => root.unmount();
});
```

### `ReelVaultElement`

The class behind `definePluginElement`. Extend it directly if you prefer classes:

```ts
abstract class ReelVaultElement extends HTMLElement {
  get reelvaultHost(): PluginUiHost | null;
  set reelvaultHost(host: PluginUiHost | null);
  protected abstract onHost(host: PluginUiHost): (() => void) | undefined;
}
```

The host assigns itself to `element.reelvaultHost`; `onHost` runs once the element is **both** connected and has a host (in either order). `onTeardown` (the returned function) runs on disconnect; elements may re-mount.

### `mountShadow`

```ts
mountShadow(element: HTMLElement, cssText?: string): HTMLElement
```

Attaches an open shadow root once, injects `cssText` (if provided and not already injected), and returns the element to render into. The host's CSS custom properties (`var(--background)`, …) inherit into the shadow root, so theme tokens work. Import your CSS with `?inline` so it lands in the bundle.

## `PluginUiHost`

The live object handed to every mounted surface.

| Member | Signature | Description |
|---|---|---|
| `protocolVersion` | `number` | `PLUGIN_UI_PROTOCOL_VERSION` |
| `pluginId` | `string` | Your plugin id |
| `context` | `PluginUiContext` | Live ambient context; subscribe with `onContext` |
| `api.call` | `<TResult>(path, options?) => Promise<TResult>` | Call your own backend routes (`/v1/plugins/<id>/<path>`); options `{ method, query, body }` |
| `navigate` | `(to: string) => void` | Navigate the host app to an in-app path |
| `openDialog` | `(dialog: string, params?) => void` | Open one of your dialogs |
| `close` | `() => void` | Close the surface containing this element |
| `toast` | `(level, message) => void` | `level`: `"success" \| "error" \| "info"` |
| `getPlayerState` | `() => PluginPlayerState` | `{ currentTime?, duration?, mediaFileId? }`; empty when no player is mounted |
| `seek` | `(time: number) => void` | Seek the host player to an absolute position, in seconds |
| `onContext` | `(listener) => () => void` | Context updates; returns an unsubscribe function |
| `onEvent` | `(event: string, listener) => () => void` | Subscribe to a host realtime event; returns an unsubscribe |

```ts
interface PluginUiApiCallOptions {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  query?: Record<string, string>;
  body?: unknown;
}
```

## Context types

```ts
interface PluginUiContext {
  protocolVersion: number;
  pluginId: string;
  page?: string;                   // set when the surface is a page or tab
  dialog?: string;                 // set when the surface is a dialog
  params: Record<string, string>;  // route params from the triggering contribution
  locale: string;
  theme: "light" | "dark";
  apiBaseUrl: string;
  pageUrl?: string;                // full current URL (context capture)
  user?: PluginUiUserContext;
  profile?: PluginUiProfileContext;
  player?: PluginUiPlayerContext;
  device?: PluginUiDeviceContext;
}

interface PluginUiUserContext { id: string; role: string; name?: string }
interface PluginUiProfileContext { id: string; name: string }
interface PluginUiPlayerContext { currentTime?: number; duration?: number; mediaFileId?: string }
interface PluginUiDeviceContext {
  userAgent?: string;
  language?: string;
  screenResolution?: string;
  browser?: string;
  os?: string;
}

type PluginPlayerState = PluginUiPlayerContext;
```

## See also

- [Frontend (ui.json)](/plugins/ui) — declaring surfaces and slots.
- [Plugin UI kit](/sdk/ui) — the guided tour.
- [UI schema reference](/reference/ui/schema)
