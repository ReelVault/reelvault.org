---
layout: home
title: ReelVault Documentation
description: Self-hosted media server — run it, use it, and extend it.

hero:
  name: "ReelVault"
  text: "Your media, on your hardware"
  tagline: Organize your movie & TV library, stream it to any screen in your home, and add extras with plugins. No programming required.
  image:
    src: /screenshots/dashboard.webp
    alt: The ReelVault web client — a movie dashboard with a featured title, posters and resume
  actions:
    - theme: brand
      text: Install & run
      link: /guide/getting-started
    - theme: alt
      text: Self-hosting guide
      link: /guide/
    - theme: alt
      text: For developers
      link: /sdk/

features:
  - icon: 🖥️
    title: Easy to run
    details: Install with Docker or an installer, add your libraries, set up profiles, and start watching. No prior media-server or programming experience assumed.
    link: /guide/getting-started
    linkText: Install & run
  - icon: 🎬
    title: Streaming that adapts
    details: Direct play or repackage whenever possible, on-the-fly conversion when it is not, hardware acceleration, HDR handling, subtitles, markers and resume.
    link: /guide/playback
    linkText: How playback works
  - icon: 🧩
    title: Plugins for everything
    details: Metadata and subtitle sources, requests, webhooks, access policies, background jobs and UI surfaces that render in the client with no rebuild.
    link: /guide/plugins
    linkText: Add plugins
  - icon: 👨‍👩‍👧
    title: Made for a household
    details: Accounts and viewing profiles, each with its own resume points, watchlist, ratings and audio/subtitle preferences. Optional PINs for kids' profiles.
    link: /guide/users-and-profiles
    linkText: Users & profiles
---

## For developers

Building on ReelVault? The SDK is a typed TypeScript package, and plugins run inside the server with a documented host API.

- [SDK overview](/sdk/) — the package, its entry points and how to consume it.
- [Write a plugin](/plugins/getting-started) — from an empty folder to a published plugin.
- [Reference](/reference/) — exact signatures for the client, host and UI.
