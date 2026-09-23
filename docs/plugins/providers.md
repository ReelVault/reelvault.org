---
title: Metadata & subtitle providers
description: The provider contracts — MetadataProvider, SubtitleProvider, MediaAnalyzer — priority, merging, ratings and external identifiers.
outline: [2, 3]
---

# Metadata & subtitle providers

Metadata providers are the most common plugin kind, and the one most people start with. The server is **agnostic about sources**: TMDB, IMDb, TVDB, AniList and MAL are all ordinary plugins that implement the `MetadataProvider` contract and register it with `host.providers.register(provider)`. ReelVault itself ships none — you install the ones you want.

## MetadataProvider contract

```ts
interface MetadataProvider {
  readonly id: string;          // provider namespace, e.g. "tmdb" — used in external ids
  readonly name: string;
  readonly version: string;
  readonly supportedTypes?: CatalogMediaType[];   // restrict to "movie" / "tv_show"

  initialize(context: MetadataProviderContext): void | Promise<void>;
  dispose?(): void | Promise<void>;

  search(type, query, year?): Promise<ProviderSearchResult[]>;
  getDetails(type, externalId): Promise<ProviderMetadataResult | null>;
  getSeasonDetails(externalId, seasonNumber): Promise<ProviderSeasonResult | null>;
  getEpisodeDetails(externalId, seasonNumber, episodeNumber): Promise<ProviderEpisodeResult | null>;

  // optional
  getDetailsByExternalIds?(type, identifiers: ExternalIdentifiers): Promise<ProviderMetadataResult | null>;
  getImages?(type, externalId): Promise<ProviderImageResult[]>;
  getPersonDetails?(externalId): Promise<ProviderPersonResult | null>;
  discover?(request: ProviderDiscoveryRequest): Promise<ProviderDiscoveryPage>;
  getGenres?(type): Promise<ProviderResultGenre[]>;
  test?(): Promise<boolean>;    // quick configuration check (e.g. API key)
}
```

`initialize` receives `{ logger, http, config }` — `http` is the host's SSRF-guarded fetch and `config` your [plugin configuration](/plugins/config) (API keys live here).

### Priority and merging

Provider order is set by the administrator (Admin → Metadata providers; lower value = higher priority). The server fetches details from **all** providers with an acceptable match and merges by priority:

- scalars, artwork, seasons, and lists (cast, genres, studios, keywords) → the first provider with a non-empty value wins; lower priority only fills gaps;
- ratings → union from all sources, deduplicated by `source`.

For series, seasons and episodes are fetched from **every** associated provider using that provider's own series identifier — a title can be anchored in one source while episodes come from another (e.g. main TMDB without episodes, filled from IMDb).

### Multiple ratings from one source

`ProviderMetadataResult.ratings` is an array — one provider can return several ratings (OMDb: IMDb, Rotten Tomatoes, Metacritic):

```ts
ratings: [
  { source: "imdb", label: "IMDb", value: 5.7, maxValue: 10, votes: 61557, url: "https://www.imdb.com/title/tt30955489" },
  { source: "rottentomatoes", label: "Rotten Tomatoes", value: 52, maxValue: 100 },
  { source: "metacritic", label: "Metacritic", value: 47, maxValue: 100 },
],
```

- `source` — stable id, the deduplication key across providers;
- `value` / `maxValue` — rating and scale (normalized to /10 in the UI);
- `votes` — influences the aggregate rating (strategy configurable in server settings);
- `label` / `url` — displayed next to the rating.

When `ratings` is absent, the server derives a single rating from `voteAverage` / `voteCount` under the provider's id.

### External identifiers (namespaces)

`ExternalIdentifiers` is a `{ namespace: id }` map, with **no closed list of services** by design:

```ts
{ imdb: "tt30955489", tmdb: "123456", mal: "5114", anilist: "167698" }
```

Your `id` is your namespace. `getDetailsByExternalIds(type, identifiers)` should return an entity when any key belongs to your namespace (the OMDb provider uses `imdb`), or when your returned `externalId` matches one of the values. Jellyfin sidecars (`<imdbid>`, `<tmdbid>`) map to the `imdb` / `tmdb` keys.

### Discovery (optional)

Implement `discover` to power curated feeds and filtered browsing. Categories: `trending`, `popular`, `upcoming`, `top_rated`, `now_playing`, `recommendations`, `similar`; requests carry `page`, `window` (trending), `externalId` (recommendations/similar), `genreId`, `year`, `language`, `region`. Return a `ProviderDiscoveryPage` (`items`, `page`, `totalPages`, `totalResults`) — omit the method (or return null for a category) and the server skips you for that feed.

## Consuming installed providers (`providerAccess`)

A plugin can use the providers installed by other plugins without knowing any API keys. Declare the `providerAccess` capability, then call `host.providers`:

```ts
const { items, totalPages } = (await host.providers.discover({
  type: "movie",
  category: "trending",
  window: "day",
})) ?? { items: [], totalPages: 0 };

const responses = await host.providers.search({ type: "tv_show", query: "Severance" });
const details = await host.providers.getDetails("tmdb", "movie", "157336");
const season = await host.providers.getSeasonDetails("tmdb", "157336", 1);
const genres = await host.providers.getGenres("movie");
```

Feeds resolve through the enabled providers in configured priority order; a provider that does not implement `discover`/`getGenres` is skipped, so callers must handle a `null` discovery result (e.g. show an "install a metadata provider" hint) rather than fail. `getDetails`/`getSeasonDetails` look up a single provider's **own id namespace**; `resolveDetails(type, title, year?)` aggregates a best match across providers.

## Subtitle providers

```ts
interface SubtitleProvider {
  readonly id: string;
  readonly name: string;
  readonly version: string;
  initialize(context: SubtitleProviderContext): void | Promise<void>;
  dispose?(): void | Promise<void>;
  search(request: SubtitleSearchRequest): Promise<SubtitleSearchResult[]>;
  download(subtitleId: string): Promise<SubtitleDownload | null>;
}
```

`search` receives `{ media, languages? }` and returns lightweight results (`id`, `language`, `format`, `isForced?`, `isHearingImpaired?`); `download` fetches the content (`Blob | Uint8Array`) for the chosen result. Register with `host.subtitles.register(provider)`; users then search/download your results from the title's subtitle panel.

## Media analyzers

An analyzer inspects a file name/path and derives presentation metadata — a classic "release name" parser:

```ts
host.media.registerAnalyzer({
  id: "release-name-parser",
  name: "Release Name Parser",
  version: "1.0.0",
  analyze({ media, logger }) {
    return {
      source: "BluRay",       // or null
      edition: "Extended",
      qualityTag: "1080p",
    };
  },
});
```

Return `undefined`/`null` fields when you can't conclude anything — analyzers run alongside the built-in one and results are merged. Cache expensive work on [`host.media.getRevision`](/plugins/host-api#hostmedia) and invalidate on `media.file.technical-data-updated`.
