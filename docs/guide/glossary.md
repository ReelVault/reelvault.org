---
title: Glossary
description: The words these docs use, explained in plain language.
outline: [2, 3]
---

# Glossary

Terms that show up across the guide, explained without assuming you already know them. If a page uses a word you do not recognise, it is probably here.

## Media & playback

**Library** — a set of folders you tell ReelVault to watch, marked as either movies or TV shows. Each library is scanned and identified on its own.

**Title** — a recognised movie or show, with its artwork, plot, cast and ratings.

**Direct play** — streaming a file exactly as it is. The cheapest option; the server just sends the bytes.

**Remux** — repackaging a file into a different wrapper without changing the video or audio. Used when the device understands the tracks but not the file format.

**Transcode** — decoding and re-encoding the video or audio on the fly. The heaviest option, used only when the device cannot play the original.

**Codec** — the format a video or audio track is stored in (H.264, HEVC, AV1, AAC…). A device has to support the codec to play it.

**Container** — the file wrapper that holds the tracks (MP4, MKV, WebM…). Not to be confused with a Docker container below.

**HLS** — the streaming format the player receives: a playlist plus short segments. It is what makes seeking and remote playback work. You never deal with it directly.

**ffmpeg / ffprobe** — the tools ReelVault uses to convert files and to inspect them. They come bundled with the installers and images.

**Hardware acceleration** — using a graphics card (GPU) to do the converting instead of the processor (CPU). Faster and lighter; optional.

**HDR / tone-mapping** — a very wide range of brightness and colour. If your screen cannot show HDR, the server converts it down to SDR, which always needs a transcode.

**Trickplay** — the little thumbnail previews that appear when you drag along the timeline.

**Marker** — a saved timestamp range for an intro, recap or credits, so the player can offer a "Skip" button.

**Sidecar / NFO** — a small metadata file saved next to your media instead of inside ReelVault's database. Useful if you also use other media servers.

## Your account & viewing

**Account** — someone who can sign in, with an email, a password and a role.

**Profile** — a viewing identity inside an account, with its own resume points, watchlist and preferences. One account can hold several, like profiles on a streaming service.

**Administrator** — an account that can open the admin panel and change the server. Regular users can watch and keep their own lists, but cannot change settings.

**Session** — an active playback, or a signed-in device. Which one is meant is usually clear from the context.

**Admin panel** — the part of the app, behind the **Admin** button, where the server is configured. You only need it if you look after the server.

## Running the server

**Environment variable** — a setting passed to the server when it starts, written as a name and a value (for example `APP_PORT=3030`). Covered in [Server configuration](/guide/configuration).

**ROOT_DIR** — the folder where the server keeps its database, secrets, plugins and cached images. Your media is separate and is never moved.

**Bind address** — which network addresses the server listens on. The default only listens on the machine itself.

**Reverse proxy** — a separate web server that sits in front of ReelVault, usually to add HTTPS and a real domain name. Only needed for access from the internet.

**TLS / HTTPS** — the encryption that makes a padlock appear in the browser. Required before exposing a server to the internet.

**Worker / job** — background work that is not part of a page request: scanning folders, fetching metadata, generating previews. See [Background jobs](/guide/tasks-and-workers).

**Docker container** — a packaged, self-contained copy of an app. "Run the container" means run ReelVault without installing its pieces by hand.

## Plugins

**Plugin** — an add-on that extends ReelVault: a metadata source, subtitle source, media requests, webhooks, extra pages. Installing one is an administrator action.

**Provider** — a plugin that supplies metadata (artwork, plot, cast) or subtitles, such as TMDB or OMDb. ReelVault ships none by default.

**Catalog** — a list of plugins the server can install from, served as a file from a web address.

## See also

- [What is ReelVault?](/guide/introduction) — the plain-language overview.
- [Reference glossary](/reference/glossary) — the more technical terms used by plugin and SDK authors.
