---
title: Getting started
description: Your first ReelVault plugin — anatomy, minimal example and the development loop.
outline: [2, 3]
---

# Plugins — getting started

A ReelVault plugin is a directory under `$ROOT_DIR/plugins/` with a `plugin.json` manifest and a TypeScript entry. Plugins run **in the server process**, with the same access to the machine the server has, so they can add backend behaviour (providers, jobs, routes, events) and frontend surfaces (pages, dialogs, tabs, UI slots) without any change to the host. Installing and enabling a plugin is an administrator action — that is the trust boundary.

## Anatomy

```
plugins/org.example.hello/
├── plugin.json     # manifest — read before your code is imported
├── index.ts        # entry — default-exports a definePlugin(...) object
├── config.ts       # optional — the plugin's typed configuration
├── ui.json         # optional — frontend contributions
├── ui/             # optional — frontend sources, built to ui/dist
└── catalog.json    # optional — category/homepage/changelog for catalogs
```

## The minimal plugin

```json
// plugin.json
{
	"id": "org.example.hello",
	"name": "Hello",
	"version": "1.0.0",
	"entry": "./index.ts",
	"capabilities": ["httpRoute"]
}
```

```ts
// index.ts
import { definePlugin, ok, route, t } from "@reelvault/sdk/plugin";

export default definePlugin({
	async setup(host) {
		// Backend: an HTTP route → /v1/plugins/org.example.hello/greet?name=X
		await host.routes.register(
			route({
				method: "GET",
				path: "/greet",
				query: t.Object({ name: t.Optional(t.String()) }),
				handler: ({ query }) => ok({ message: `Hello, ${query.name ?? "world"}!` }),
			}),
		);

		host.logger.info("Hello plugin ready");
	},
});
```

That is a working backend plugin. Declare what you use — `capabilities` are verified at runtime, and using an undeclared capability aborts loading immediately (see [Manifest & capabilities](/plugins/manifest)). Need settings? Add a `config.ts` with `defineConfig` and use `definePlugin(config, { setup })` — see [Configuration](/plugins/config).

## Lifecycle

```ts
export default definePlugin({
	async setup(host) { /* register everything — called on load */ },
	async onEnable() { /* enabled (manually or after load) */ },
	async onDisable() { /* disabled — stop work, keep registrations intact */ },
	async onUnload()  { /* about to be swapped/removed — final cleanup */ },
});
```

With configuration, the config definition comes first: `definePlugin(config, { setup(host) { … } })`. Both `definePlugin` forms are identity helpers — they exist for typing and autocomplete only.

## Frontend contributions (optional)

Add a `ui.json` and the **generic host website** renders your surfaces — pages at `/plugins/<id>/page/<path>`, dialogs, tabs on host screens, and inline slots like the player footer:

```json
// ui.json — declarative schema, no frontend build needed
{
	"name": "Hello",
	"version": "1.0.0",
	"pages": [
		{
			"id": "greet",
			"path": "greet",
			"name": "Greet",
			"icon": "Sparkles",
			"nav": "user",
			"schema": { "body": [{ "type": "text", "text": "Hello from the Hello plugin." }] }
		}
	],
	"slots": {
		"player-footer": [
			{ "label": "Greet", "icon": "Sparkles", "priority": 20, "action": { "type": "page", "page": "greet" } }
		]
	}
}
```

Surfaces render either as **declarative schemas** (data — recommended, matches the app's look, cannot execute code) or **custom elements** (your own ESM bundle, for UI the schema cannot express). Both are covered in [Frontend (ui.json)](/plugins/ui); the client-side helpers live in [`@reelvault/sdk/ui`](/sdk/ui).

## Development loop

1. Fork the standalone [`plugin-template`](https://github.com/ReelVault/plugin-template) repo (backend + UI) — one repo per plugin, catalog optional.
2. Work directly in your server's `ROOT_DIR/plugins/<your-id>/` — plugins load at boot.
3. Apply changes with `POST /v1/admin/plugins/reload` (admin auth) — or restart the dev server.
4. Unit-test the backend against the in-memory [testing host](/sdk/testing).

```bash
# inside the plugins repo
bun run build-catalog   # builds every plugin + UI, packs zips, writes dist/reelvault-catalog.json
```

## Where to go next

- [Manifest & capabilities](/plugins/manifest) — declare what your plugin is and uses.
- [Host API](/plugins/host-api) — everything `host.*` can do.
- [Metadata & subtitle providers](/plugins/providers) — the most common plugin kind.
- [Jobs, events & hooks](/plugins/jobs-and-events) — background work and reacting to the server.
- [Publishing & catalogs](/plugins/publishing) — ship it to users.
