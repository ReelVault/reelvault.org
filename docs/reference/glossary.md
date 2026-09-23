---
title: Glossary
description: The terms used across these docs, in plain language.
outline: [2, 3]
---

# Glossary

Terms that show up across the guides, explained without assuming you know them already.

## Media & playback

**Codec** — the format a video or audio track is encoded in (H.264, HEVC, AV1, AAC, Opus…). A device must support the codec to play it.

**Container** — the file format that wraps the tracks (MP4, MKV, WebM…). A device can support the codecs but not the container.

**Direct play** — streaming the file untouched. Cheapest option, no server work beyond sending bytes.

**Remux** — copying the tracks into a different container without re-encoding. Used when codecs are fine but the container is not.

**Transcode** — decoding and re-encoding the video or audio. The heaviest option; used when the device cannot play the source.

**HLS** — HTTP Live Streaming, the format the player receives: a playlist plus short media segments. It is what makes seeking, adaptive streams and remote playback work.

**ffmpeg / ffprobe** — the tools the server uses to transcode and to inspect files. Both must be installed and on the `PATH`.

**Hardware acceleration** — using a GPU's encoder (Quick Sync, NVENC, AMF, VideoToolbox) instead of the CPU to transcode.

**HDR / tone-mapping** — high dynamic range video. If a screen cannot show HDR, the server tone-maps it down to SDR, which always requires a transcode.

**Trickplay** — the thumbnail previews that appear when you scrub through a video.

**Marker** — a timestamp range for an intro, recap or credits, used to offer a skip button.

**Sidecar** — a metadata file stored next to the media (for example `.nfo`) instead of in the database.

## Server concepts

**Library** — a set of folders with a type (`movies` or `tv_shows`). Each library scans and identifies its own files.

**Metadata item / title** — a recognised movie or show, with its artwork, cast and descriptions.

**Provider** — a plugin that supplies metadata or subtitles (TMDB, OMDb, OpenSubtitles…). The server itself ships none.

**Profile** — a viewing identity inside an account: its own resume points, watchlist and preferences.

**Session** — an active playback, or a signed-in login. The context usually makes it obvious which.

**Worker** — a background component that runs jobs (scanning, probing, refreshing…).

**Job / operation** — a job is one unit of work; an operation groups related jobs so they can be tracked or cancelled together.

## Plugins & SDK

**Plugin** — a directory that adds backend code and optionally frontend UI to the server. Runs in the server process.

**Manifest** — `plugin.json`, read before the plugin's code loads. Declares identity, capabilities and metadata.

**Capability** — a declaration of which `host.*` namespaces a plugin uses. Using an undeclared one aborts loading. Capabilities are the only access gate — there is no separate permission list.

**Host** — the server object handed to a plugin (`PluginHost`), and the term for the generic website that renders plugin UI.

**Custom element** — a Web Component a plugin defines for UI the declarative schema cannot express.

**Declarative schema** — data describing UI; the host renders it with its own components and it cannot run code.

**SDK** — the `reelvault-sdk` package: a typed HTTP client, shared contracts, the plugin SDK and a test host.

**Contract** — a TypeBox schema in `reelvault-sdk/common` and the TypeScript type inferred from it. Server and clients share the same definition.

**Catalog** — a static URL serving a `reelvault-catalog.json`; servers browse catalogs to install plugins.

## See also

- [What is ReelVault?](/guide/introduction)
- [SDK overview](/sdk/)
- [Plugins: getting started](/plugins/getting-started)
