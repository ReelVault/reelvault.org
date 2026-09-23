---
title: Publishing & catalogs
description: Package your plugin, publish a catalog manifest, and how installation works on servers.
outline: [2, 3]
---

# Publishing & catalogs

There are two ways to get a plugin onto a server: hand it over as a directory, or publish it to a catalog so admins can install it in one click. This page covers both, plus what the server does when it installs something.

## Two distribution paths

1. **Manual install** — copy the plugin directory into the server's `ROOT_DIR/plugins/` and run `POST /v1/admin/plugins/reload`. Works today, no catalog needed; it stays the developer path.
2. **Catalog install** — servers browse catalog repositories (URLs serving a catalog manifest), and administrators install plugins in one click. This is the user-facing path.

## The catalog manifest

A catalog is any static URL serving `reelvault-catalog.json` (`apiVersion: 1`):

```jsonc
{
	"apiVersion": 1,
	"name": "ReelVault Official",
	"plugins": [
		{
			"id": "org.reelvault.tmdb",
			"name": "TMDB Metadata Provider",
			"version": "1.2.0",
			"description": "Metadata provider backed by The Movie Database API.",
			"category": "metadata",
			"homepage": "https://github.com/ReelVault/plugins/tree/main/plugins/tmdb",
			"iconUrl": "https://…/tmdb.png",
			"changelog": "Added poster ranking.",
			"date": "2026-09-01",
			"downloadUrl": "https://…/tmdb-1.2.0.zip",
			"checksum": "sha256-<hex of the archive>",
			"capabilities": ["metadataProvider"],
			"versions": [
				{
					"version": "1.1.0",
					"date": "2026-08-10",
					"changelog": "Series genre mapping.",
					"downloadUrl": "https://…/tmdb-1.1.0.zip",
					"checksum": "sha256-<hex of the archive>"
				}
			]
		}
	]
}
```

### Versioning & rollback

The top-level fields always describe the **latest** release. An optional `versions` array lists older installable archives — up to 50 per plugin, unique semver, newest first. Every entry, latest or historical, carries its own `downloadUrl` and `checksum`.

Administrators can install **any** listed version from **Admin → Plugins** (the plugin's revision history). Installing an older version is the rollback path; installing a newer one is the update — both follow the same verified download path described below.

Hosting: **any static HTTPS URL works** — a GitHub release asset, raw.githubusercontent.com, GitHub Pages, or a TLS-terminating file server on your LAN. Plain `http://` URLs are rejected by the server.

## Building with `build-catalog`

The [plugins](https://github.com/ReelVault/plugins) repo ships the official build script:

```bash
bun run build-catalog
# → dist/reelvault-catalog.json
# → dist/<plugin>-<version>.zip  (one per plugin version; older ones feed the versions history)
```

For every plugin under `plugins/` it:

1. bundles `index.ts` with Bun — **keeping `@reelvault/sdk/*` external** (the host provides the SDK itself);
2. patches `plugin.json` to point at the bundled entry;
3. builds the `ui/` bundle when present;
4. zips the result, computes the sha256, and emits the catalog entry.

Per-plugin catalog metadata (`category`, `homepage`, `changelog`) lives in a `catalog.json` next to `plugin.json`.

## How installation works (on the server)

- The server fetches the manifest over https (enforced — non-https repository and download URLs are rejected; size-capped, timeout), caches it and refreshes on demand.
- The archive **checksum is verified before extraction**; extraction is guarded against path traversal; the package is staged and symlink-checked like any manual install.
- Installing = download → verify → repack into `ROOT_DIR/plugins/` → hot-load. **No server restart.**
- Every install is admin-only, shows the plugin's declared capabilities for confirmation, and lands in the audit log. Plugin code runs **in the server process** — treat installation as granting the plugin full trust.

### Private repositories

Attach an access token to the repository entry in **Admin → Plugins → Repositories**; it is sent as `Authorization: Bearer …`, encrypted at rest, and never returned by the API.

## Keep it self-contained

- **Never bundle `@reelvault/sdk/*`** — the host writes a `node_modules/@reelvault/sdk` shim into the plugins directory at boot and resolves those imports to its own SDK build. Mark them external in your bundler config.
- Bundle every *other* dependency into your entry (or ship them in `node_modules/` inside the zip).
- Secrets (provider API keys) belong in [configuration](/plugins/config) — never in UI statics; the host blocks `config.json` under `/plugins/ui/`.

## Checklist

- [ ] `plugin.json` — correct `id`, semver, narrow `capabilities`
- [ ] `catalog.json` — category, homepage, changelog
- [ ] `bun run build-catalog` passes; zip installs on a clean server
- [ ] UI (if any): schema surfaces preferred; `adminOnly` set where needed
- [ ] Host `dist/` at a stable URL and point users at **Admin → Plugins → Repositories**
