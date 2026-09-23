---
title: Shared contracts
description: reelvault-sdk/common — TypeBox schemas and the types inferred from them.
outline: [2, 3]
---

# Shared contracts — `reelvault-sdk/common`

`reelvault-sdk/common` is the single source of truth for every request and response shape in ReelVault. Each file exports an [Elysia](https://elysiajs.com) TypeBox schema **and** the TypeScript type inferred from it:

```ts
// sdk/common/movie.schema.ts
import { t } from "elysia";

export const MovieDetailSchema = t.Object({
  id: t.String(),
  title: t.String(),
  releaseDate: t.Nullable(t.String()),
  posterImages: t.Array(PosterImageSchema),
  // …
});

export type MovieDetail = typeof MovieDetailSchema.static;
```

Routes validate with these same schemas, so the types on the wire and the types in your editor cannot disagree. The client imports only the inferred types; the server uses the schemas for runtime validation and OpenAPI generation.

## Importing

```ts
import type { MovieDetail, PlaybackSession, RealtimeEventMap } from "reelvault-sdk/common";
// the root entry re-exports everything too:
import type { MovieDetail } from "reelvault-sdk";
```

## What's inside

The 58 contract files group into themes:

| Group | Contents |
|---|---|
| Auth & session | login/register payloads, sessions, users, profiles, profile preferences |
| Library entities | movie, season, episode, genre, people, company, keyword types |
| Media files & playback | media files, playback sessions, streams, progress, subtitles, markers, ratings, watchlist, watched history |
| Metadata & providers | metadata items and images, provider results, discovery, collections |
| Server operations | admin payloads, activity, health, downloads, processes, scheduled tasks, workers, settings, remote access, ffmpeg capabilities |
| Plugins | plugin status, catalog manifest entries |
| Infrastructure | API envelope, pagination, sorting, field projection, composite views, realtime map, logger types |

## Conventions that will bite you

- **Nullable vs optional.** Contracts distinguish "field absent" (`Optional` — not returned) from "field present but empty" (`Nullable` — `null`). Match that in your UI: `undefined` means "not loaded / unknown", `null` means "explicitly empty".
- **Field projection.** List endpoints accept a `fields` query parameter. Response types describe the *full* shape, and the client narrows per request through the generic `getAll<F>` methods — see [Resources](/sdk/client/resources).
- **Relations carry version fields.** Image-bearing relations (for example `posterImages`) include `imageId` and `updatedAt` so clients can build cache-busting URLs. Whenever you render an image from a contract field, use those.
- **Plugin entity types are narrower.** Plugin-facing file types (`PluginMediaFile`, `PluginEpisodeMediaFile`) are kept separate from the full API entities, giving plugins a stable, small view.

Everything in `common` is public API. Renaming or reshaping a contract is a breaking change for every client and plugin, so treat it like a versioned interface.
