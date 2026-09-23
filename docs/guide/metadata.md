---
title: Metadata & providers
description: Where artwork and descriptions come from, how providers are prioritised, and how to fix a bad match.
outline: [2, 3]
---

# Metadata & providers

ReelVault does not ship metadata itself. Everything — titles, descriptions, posters, cast, ratings — comes from **providers**, and providers are plugins. Install the ones you want from **Admin → Plugins → Available**; the official catalog has [TMDB and OMDb](/plugins/examples) to start with.

<Screenshot
  caption="A title's details page"
  hint="Artwork, cast, ratings and the edit/rematch controls."
  src="/screenshots/details-the-martian.png"
  alt="A movie details page with poster, plot, genres, studios, keywords and provider badge"
/>

## Providers

Manage them in **Admin → Metadata providers**:

- **Enable / disable** a provider globally.
- **Reorder** them. Lower in the list means higher priority (the number shown is the priority).
- **Configure** each one — API keys and language live in the plugin's settings.

### How sources are merged

When a file is identified, the server asks every enabled provider for details and merges the answers by priority:

- **Single values and artwork** (title, overview, poster, cast, genres…) — the highest-priority provider with a value wins; lower-priority ones only fill blanks.
- **Ratings** — collected from all providers and de-duplicated by source, so OMDb's IMDb, Rotten Tomatoes and Metacritic scores can all appear next to each other.

For series, seasons and episodes are requested from each associated provider using that provider's own id, so a show can be anchored in one source while episodes come from another.

## Matching files to titles

Recognition starts from the file and folder names. Release-name parsers (built-in plus any [media analyzer plugins](/plugins/providers#media-analyzers)) pull out the title, year, season and episode.

When the guess is wrong:

1. Open the title in **Admin → Metadata**.
2. Use **Rematch** to search providers again and pick the right entry.
3. For stubborn cases, **link a provider** id manually or merge two entries that should be one.

The **Identify** flow is also available from the media file view.

## Artwork

Titles usually arrive with a poster and backdrop. On the title page you can:

- **Choose a different image** from the options the providers returned.
- **Upload your own**.
- **Refresh images** to pull the latest set.

Images are cached on disk and re-encoded to the sizes the UI needs. The cache has its own eviction, so it will not grow without bound.

## Collections and taxonomies

**Admin → Collections, Genres, Keywords, People, Companies** let you curate the things metadata connects. You can rename, reorder collections, refresh a person's filmography, and remove entries pulled in by a bad match.

## Discover

The **Discover** page is built from providers that implement curated feeds — trending, popular, upcoming, top rated, and so on. If Discover looks empty, install or enable a provider that supports it; the server skips providers that do not.

## Keeping metadata tidy

- **Refresh metadata** re-imports details for a title or a whole selection.
- **Delete orphan metadata** removes entries that no longer have any media files.
- A metadata **refresh** can be scheduled from **Admin → Background jobs** if you want it to happen regularly.

## Next steps

- [Playback & transcoding](/guide/playback)
- [Plugins (admin)](/guide/plugins)
- [Metadata & subtitle providers](/plugins/providers) — for plugin authors.
