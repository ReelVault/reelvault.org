---
title: SDK overview
description: The @reelvault/sdk package — what it exports and how to consume it.
outline: [2, 3]
---

# SDK overview

The ReelVault SDK is published to npm as the `@reelvault/sdk` package, developed in its own [ReelVault/sdk](https://github.com/ReelVault/sdk) repository and consumed through subpath exports. The server's own frontend, plugins and any third-party tooling all use the same published package, so nothing drifts between them.

## Entry points

| Import | What you get |
|---|---|
| `@reelvault/sdk` | Root — re-exports the client (`ReelVaultClient`), validation errors and **all** shared contracts |
| `@reelvault/sdk/client` | The typed HTTP client: `ReelVaultClient`, 25 resource clients, and the error, cache and token types |
| `@reelvault/sdk/common` | Shared request/response contracts — Elysia TypeBox schemas **and** their inferred TypeScript types |
| `@reelvault/sdk/plugin` | The server-side plugin SDK: `definePlugin`, `PluginHost` and every contract a plugin uses |
| `@reelvault/sdk/ui` | The client-side UI kit: `definePluginElement`, `ReelVaultElement`, `mountShadow`, schema builders |
| `@reelvault/sdk/ui/schema` | Just the declarative schema builders (tree-shakeable) |
| `@reelvault/sdk/testing` | `PluginTestHost` — an in-memory plugin host for unit tests |

Every entry point is dual-format (ESM + CJS) with full `.d.ts` declarations.

## Source layout

All SDK sources live in the [`ReelVault/sdk`](https://github.com/ReelVault/sdk) repository:

```
@reelvault/sdk/
├── package.json      # published as @reelvault/sdk
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

Routes validate with the same TypeBox schemas the client types are inferred from, so the server and its clients cannot disagree about a contract.

## Building

```bash
cd sdk
bun run build   # tsdown → dist/ (root, client, common, plugin, ui, testing)
```

The output is unbundled — one file per source module — minified for dead-code elimination only, targeting ESNext.

## Consuming the package

### From the website (development setup)

The website uses the published package as a regular dependency:

```bash
bun add @reelvault/sdk
```

While co-developing the SDK and the website, link a local checkout instead — `bun link` in the SDK repository overrides the registry version until you unlink.

### From a plugin

Plugin sources import the SDK for **types and builds only** — add it as a devDependency:

```bash
bun add -d @reelvault/sdk
```

Keep `@reelvault/sdk/*` **external** in your bundler config: at runtime the host resolves those imports itself, writing a `node_modules/@reelvault/sdk` shim into the plugins directory and re-exporting its own build. That way a plugin always runs against the exact SDK the server runs. You just import:

```ts
import { definePlugin } from "@reelvault/sdk/plugin";
```

Keep `@reelvault/sdk/*` **external** in your bundler config and bundle everything else into your entry. See [Publishing & catalogs](/plugins/publishing#keep-it-self-contained).

### Standalone

Install the package from npm (`bun add @reelvault/sdk`) — or link a local build, see above — then:

```ts
import { ReelVaultClient } from "@reelvault/sdk/client";
import type { MovieDetail } from "@reelvault/sdk/common";
```

## Where to go next

- [API client](/sdk/client/getting-started) — `new ReelVaultClient({...})` and the transport features.
- [Shared contracts](/sdk/common) — how schemas and types relate.
- [Plugin UI kit](/sdk/ui) and [testing host](/sdk/testing).
- [API reference](/reference/) — exact signatures for the client, host and UI.
- Writing a plugin? Start at [Plugins: getting started](/plugins/getting-started).
