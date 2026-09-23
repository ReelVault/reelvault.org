---
title: Naming your media
description: How to name movie and TV files so ReelVault matches them correctly the first time.
outline: [2, 3]
---

# Naming your media

::: tip In short
ReelVault works out what a file is from its name. A **title plus a year** for movies, and **S01E01** for episodes, is all it needs. Get that right and matching just works — no extra software, no renaming tools.
:::

You do not have to rename anything by hand if your library already looks reasonable. But a few small habits make matching near-perfect, and they are worth it before a first scan of a large collection.

## Why names matter

There is no separate database of your files: the server reads each file and folder name, pulls out the title, year, season and episode, then asks your metadata providers which title that is. Anything the parser cannot see — a missing year, a stray episode number — it has to guess.

## Movies

The single most useful thing you can do is **put the release year in parentheses** after the title. It disambiguates remakes and sequels.

```
Movies/
├── The Matrix (1999)/
│   ├── The Matrix (1999).mkv
│   └── The Matrix (1999).en.srt
├── Arrival (2016).mp4
└── Spirited Away (2001)/
    └── Spirited Away (2001).mkv
```

- A folder per movie or a single file — both work.
- `Title (Year).ext` is ideal; release-name extras (`1080p`, `BluRay`, `x265`) are ignored.
- Dots, underscores and dashes are fine as separators: `The.Matrix.1999.mkv` matches too.

## TV shows

Group by series, then by season, and number the episodes with `S01E01` (season 1, episode 1). This is the safest pattern for any parser.

```
TV/
├── Breaking Bad/
│   ├── Season 01/
│   │   ├── Breaking Bad S01E01.mkv
│   │   └── Breaking Bad S01E02.mkv
│   └── Season 02/
│       └── Breaking Bad S02E01.mkv
└── Severance (2022)/
    └── Season 01/
        └── Severance S01E01.mkv
```

- `S01E01`, `s01e01` and `1x01` are all understood.
- Include the series name in the file name, not just the episode title — it helps when a file sits outside its folder.
- For a series with a year in its title (a reboot), add it: `Battlestar Galactica (2003)`.

### Specials and absolute numbering

- Specials go in `Season 00` (or `Specials`) and are numbered `S00E01`.
- Some anime and long-running shows use continuous numbering: `Show Name - 001.mkv`. That works, but if a show has both seasons and absolute numbers, prefer `S01E01` to avoid ambiguity.

## Multiple versions of the same title

Keep several versions side by side — the server offers them as choices rather than duplicating the title.

```
The Matrix (1999) - 1080p.mkv
The Matrix (1999) - 2160p HDR.mkv
Blade Runner (1982) - Final Cut.mkv
Blade Runner (1982) - Theatrical.mkv
```

An edition label (`Final Cut`, `Director's Cut`, `Extended`) is kept and shown next to the version.

## Subtitles and audio

Subtitle files next to a video are picked up automatically if they share its name and add a language code:

```
The Matrix (1999).mkv
The Matrix (1999).en.srt        # English
The Matrix (1999).pl.srt        # Polish
The Matrix (1999).en.forced.srt # forced (signs/foreign dialogue only)
```

## Extras, samples and hidden files

- Files and folders named like extras — `Extras/`, `Featurettes/`, `Behind the Scenes/` — are treated as extras.
- `sample`, `trailer` and similar names are skipped on purpose and listed as **ignored assets** (you can un-ignore them).
- Files or folders starting with a dot (`.hidden.mkv`, `.trash/`) are always skipped.

## Common pitfalls

| Problem | Fix |
|---|---|
| A remake matched to the original | Add the year: `Total Recall (2012)`. |
| Episodes ended up as one title | Use `S01E01` and put the series name in the file. |
| "Part 1"/"Part 2" became separate movies | Name them as one title with a version label, or as episodes if it is a series. |
| A movie landed in a TV library (or vice versa) | Libraries are typed — check the library's type. |
| Non-Latin titles match poorly | Keep the original title and add an English/`(Year)` hint. |

## If something still matches wrong

Naming gets you most of the way; the rest is a click:

1. Open the title in **Admin → Metadata**.
2. Use **Rematch** to search again and pick the right entry.
3. For stubborn cases, link a provider id manually.

See [Artwork & descriptions](/guide/metadata) for the full flow.

## Next steps

- [Adding your media](/guide/libraries) — create libraries and scan.
- [Artwork & descriptions](/guide/metadata) — fix a bad match.
- [Troubleshooting](/guide/troubleshooting) — when a file does not appear at all.
