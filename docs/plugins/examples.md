---
title: Bundled plugins
description: The first-party plugins — what each does and which SDK parts it exercises.
outline: [2, 3]
---

# Bundled plugins

The [plugins](https://github.com/ReelVault/plugins) repository holds the first-party plugins. They double as the SDK's reference implementations: each one is a small, complete example of a different plugin shape. The catalog manifest they generate is what servers browse in **Admin → Plugins → Available**.

| Plugin | Category | What it does | SDK features it exercises |
|---|---|---|---|
| **tmdb** | metadata | Metadata provider backed by The Movie Database API | `MetadataProvider` (search, details, seasons, episodes, images, discovery, genres) + config schema |
| **omdb** | metadata | OMDb API provider — IMDb, Rotten Tomatoes and Metacritic ratings in one response | `MetadataProvider` with multi-rating `ratings[]`, `getDetailsByExternalIds` (`imdb` namespace), `test()` |
| **cinemamode** | integrations | Plays random trailers of similar titles from your library before a movie starts | `playbackPreRoll`, `providerAccess` (`discover` for similar titles), storage, HTTP routes |
| **trailers** | integrations | On-demand trailer lookup and playback for catalog titles | HTTP routes, `host.metadata`, storage, jobs; declarative schema page + dialog, `details-action-bar` slot |
| **media-requests** | automation | Users request missing movies and series; admins approve; users get notified when a title lands in the library | HTTP routes with user/admin access, `providerAccess` (search, details, seasons, genres, discovery), `media.file.ready` fulfillment, notifications, realtime, storage, jobs, custom-element pages, `searchProvider` |
| **community-markers** | metadata | Community-shared intro, credits and recap markers with upvote/downvote voting | `host.markers`, realtime broadcasts, HTTP routes, storage, custom-element admin page + dialog |
| **bug-reports** | other | In-app bug reporting that lands straight in the admin panel | Declarative schema page + dialog + slot, `context.pageUrl` / `context.device` capture, HTTP routes, scheduled tasks, notifications |
| **webhooks** | automation | Sends server event notifications to user-configured endpoints (Discord, Telegram, any JSON API) | `eventHandler` subscriptions, outbound `host.http.fetch`, storage, declarative schema admin page |

## Reading them as documentation

Each plugin directory is a complete, working example:

```
plugins/media-requests/
├── plugin.json         # capabilities: httpRoute, storage, jobs, eventHandler, notification, providerAccess
├── index.ts            # definePlugin — registers routes, event handlers, scheduled tasks
├── config.ts           # admin-configurable settings (defineConfig)
├── src/                # subsystems (request manager, availability checker, …)
├── ui.json             # pages (discover, requests, admin) rendered by custom elements + global search provider
├── ui/                 # frontend sources (Vite → ui/dist)
└── catalog.json        # category / homepage / changelog
```

Where to look, by topic:

- **Writing a metadata provider?** `tmdb` for the full contract, `omdb` for external-id recognition and multi-source ratings.
- **Need a TMDb token?** The `tmdb` plugin needs a free **Read Access Token** from [themoviedb.org](https://www.themoviedb.org/settings/api) — paste it into the plugin settings, then reload the plugin. On a fresh install it reports a failed load until the token is provided.
- **Building a request/approval workflow?** `media-requests` is the end-to-end case study: routes + events + notifications + a full UI.
- **Extending playback?** `cinemamode` is the `playbackPreRoll` example (trailers before a movie); `community-markers` shows `host.markers` plus live voting over realtime.
- **Reacting to server events?** `webhooks` subscribes generically with `host.events.on` and pushes outbound with `host.http.fetch`.
- **A small schema-only UI?** `bug-reports` does almost everything with declarative schemas.

## Adding yours

Start from the standalone [`plugin-template`](https://github.com/ReelVault/plugin-template) repo (minimal backend + schema UI), then see [Publishing & catalogs](/plugins/publishing) to ship it. Your plugin can live in its own repository — the catalog format is open, and a server can browse any manifest URL. For cataloged plugins, the sources live in [plugins](https://github.com/ReelVault/plugins).
