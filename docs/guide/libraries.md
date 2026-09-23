---
title: Libraries & scanning
description: Add your media folders, choose how metadata is stored, and keep the library up to date.
outline: [2, 3]
---

# Libraries & scanning

A **library** is a set of folders with a type. Movies and TV shows are scanned differently — a movie folder holds films, a TV library expects seasons and episodes — so give each kind its own library.

Create and manage them in **Admin → Libraries**.

<Screenshot
  caption="Admin → Libraries"
  hint="Library list with paths, file counts and total size."
  src="/screenshots/admin-libraries.png"
  alt="The libraries admin page with two library cards, storage totals and source directories"
/>

## Create a library

1. Give it a name (shown in navigation) and a **type**: `movies` or `tv_shows`.
2. Add one or more **paths** — the folders the server should watch. A path can be a network mount, as long as the server process can read it.
3. Choose how metadata is stored (see below).
4. Save, then run a **scan**.

Folder layout is flexible. For TV, folder and file names are parsed to work out the series, season and episode; release-name extras like resolution or source are picked up by media analyzers.

## Where metadata is written

Each library (and each path) picks one of:

| Mode | What happens |
|---|---|
| `database` | Everything stays in ReelVault's database. Nothing is written next to your media. |
| `sidecar` | Metadata is written to `.nfo` files next to the media. |
| `database_and_sidecar` | Both — read from the database, mirrored to sidecar files. |

Sidecar-writing libraries also pick a **flavor** in the library's create/edit form:

| Flavor | Files written |
|---|---|
| `reelvault` (default) | `movie.reelvault.nfo`, `tvshow.reelvault.nfo`, `season01-reelvault.nfo`, `<basename>.reelvault.nfo` |
| `kodi` | `movie.nfo`, `tvshow.nfo`, `season01.nfo`, `<basename>.nfo` |

The `kodi` flavor writes plain Jellyfin/Kodi-compatible XML — that is what makes a library portable to other media servers. The `reelvault` flavor is a richer round-trip format for ReelVault itself. Either way, sidecars mean writing files into your media folders; for read-only mounts, use `database`.

## Scanning

- **Manual scan** — start one from the library page whenever you have added files.
- **Auto-watcher** — with `scanning.autoWatcherEnabled` on, the server notices new files by itself. To avoid rescanning while a big copy is still running, it waits out a short debounce and then a cooldown before scanning (both configurable in **Admin → Server settings**).

The scan walks each path, ignores files it has already seen by size and modification time, and queues fingerprinting (ffprobe). Dot-prefixed hidden files and hidden folders (`.hidden.mkv`, `.trash/`, …) are skipped entirely. Progress and per-file results show up in the library and in **Admin → Background jobs**.

## Importing from local NFO files (Jellyfin/Kodi)

If your folders already carry `.nfo` sidecars (e.g. migrated from Jellyfin or Kodi), the scan reads them **before** reaching out to any metadata provider:

- `movie.nfo` / `<basename>.nfo` next to a film, `tvshow.nfo` for a series, `season01.nfo` (or `season.nfo`) for a season and `<basename>.nfo` for an episode.
- Titles, release dates, genres, ratings and imdb/tmdb ids come from the NFO; the imdb/tmdb id pins the match so rescans never create duplicates — even fully offline, with no providers configured.
- Local artwork (`folder.jpg`/`poster.jpg`, `backdrop.jpg`/`landscape.jpg`/`fanart.jpg`/`backdropNN.jpg`, `<basename>-thumb.jpg` for episodes and `seasonNN-poster.jpg` — including the absolute paths Jellyfin writes into its exports) is imported into the image library automatically.

The import reads the standard Jellyfin/Kodi names above. ReelVault's own `*.reelvault.nfo` sidecars (the `reelvault` flavor above) are a write format and are not picked up by scans.

Files a scan could not ingest (unknown structure, wrong library type, no metadata match) are listed per library under **Needs attention** in the admin libraries view, with a one-click rescan.

## Cleaning up

- **Admin → Media files** lists every file the server knows about, with its path, technical data and identification state. Use it to find files that failed to match or look wrong.
- **Ignored assets** are files the server skipped on purpose (extras, samples, trailers, hidden files). You can review and un-ignore them from the library.
- If a file disappears from disk, the server marks it unavailable rather than deleting the entry, so history and progress survive a drive swap.

## Next steps

- [Metadata & providers](/guide/metadata) — make titles look right.
- [Playback & transcoding](/guide/playback) — tune how files are streamed.
