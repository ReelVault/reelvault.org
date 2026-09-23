---
title: SDK overview
description: The reelvault-sdk package — what it exports and how to consume it.
outline: [2, 3]
---

# SDK overview

The ReelVault server ships with a typed TypeScript SDK, published to npm as the `reelvault-sdk` package. Its sources live in the server repository under `sdk/` and are consumed through subpath exports. The server's own frontend, plugins and any third-party tooling all use the same source of truth, so nothing drifts between them.

## Entry points

| Import | What you get |
|---|---|
| `reelvault-sdk` | Root — re-exports the client (`ReelVaultClient`), validation errors and **all** shared contracts |
| `reelvault-sdk/client` | The typed HTTP client: `ReelVaultClient`, 25 resource clients, and the error, cache and token types |
| `reelvault-sdk/common` | Shared request/response contracts — Elysia TypeBox schemas **and** their inferred TypeScript types |
| `reelvault-sdk/plugin` | The server-side plugin SDK: `definePlugin`, `PluginHost` and every contract a plugin uses |
| `reelvault-sdk/ui` | The client-side UI kit: `definePluginElement`, `ReelVaultElement`, `mountShadow`, schema builders |
| `reelvault-sdk/ui/schema` | Just the declarative schema builders (tree-shakeable) |
| `reelvault-sdk/testing` | `PluginTestHost` — an in-memory plugin host for unit tests |

Every entry point is dual-format (ESM + CJS) with full `.d.ts` declarations.

## Source layout

All SDK sources live in the server repository under [`sdk/`](https://github.com/ReelVault/ReelVault.Server/tree/main/sdk):

```
sdk/
├── package.json      # published as reelvault-sdk
├── index.ts          # root entry
├── client/           # transport (core/) + one class per API area (resources/)
│   ├── core/         # HttpClient, TtlCache, dedup, TokenManager, errors, retry
│   └── resources/    # admin, auth, libraries, media, metadata, playback-sessions, …
├── common/           # 58 contract files: schemas + types (auth, media, playback, providers, admin…)
├── plugin/           # plugin contracts: types.ts (PluginHost), manifest, http, hooks, events,
│                     #   storage, access, config, ui-host, ui-manifest, ui-schema
├── ui/               # custom-element kit + schema builders
└── testing/          # PluginTestHost
```

The server imports the SDK through the `@sdk/*` path alias. That is why the two can never drift: routes validate with the same schemas the client types are inferred from.

## Building

```bash
cd ReelVault.Server
bun run build-sdk   # tsdown → sdk/dist/ (root, client, common, plugin, ui, testing)
```

The output is unbundled — one file per source module — minified for dead-code elimination only, targeting ESNext.

## Consuming the package

### From the website (development setup)

The Website links the package locally:

```bash
cd ReelVault.Server/sdk && bun link      # expose the package
cd ReelVault.Website && bun link reelvault-sdk
```

After changing SDK code, `bun run build-sdk` in the server repo refreshes `sdk/dist/` in place. The linked Website picks up the change on its next dev-server restart.

### From a plugin

Plugins **do not bundle** the SDK and do not need `reelvault-sdk` in their `node_modules`. The host resolves `reelvault-sdk/*` imports itself: at boot it writes a `node_modules/reelvault-sdk` shim into the plugins directory and registers a module alias to its own build. You just import:

```ts
import { definePlugin } from "reelvault-sdk/plugin";
```

Keep `reelvault-sdk/*` **external** in your bundler config and bundle everything else into your entry. See [Publishing & catalogs](/plugins/publishing#keep-it-self-contained).

### Standalone

Install the package from npm (`bun add reelvault-sdk`) — or link a local build, see above — then:

```ts
import { ReelVaultClient } from "reelvault-sdk/client";
import type { MovieDetail } from "reelvault-sdk/common";
```

## Where to go next

- [API client](/sdk/client/getting-started) — `new ReelVaultClient({...})` and the transport features.
- [Shared contracts](/sdk/common) — how schemas and types relate.
- [Plugin UI kit](/sdk/ui) and [testing host](/sdk/testing).
- [API reference](/reference/) — exact signatures for the client, host and UI.
- Writing a plugin? Start at [Plugins: getting started](/plugins/getting-started).
