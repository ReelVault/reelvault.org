---
layout: home
title: ReelVault Documentation
description: Self-hosted media server — run it, use it, and extend it.

hero:
  name: "ReelVault"
  text: "Your media, on your hardware"
  tagline: Organize your movie & TV library, stream it with on-the-fly transcoding, and extend everything with plugins and a typed TypeScript SDK.
  image:
    src: /screenshots/dashboard.png
    alt: The ReelVault web client — a movie dashboard with a featured title, posters and resume
  actions:
    - theme: brand
      text: Run ReelVault
      link: /guide/getting-started
    - theme: alt
      text: Use the SDK
      link: /sdk/
    - theme: alt
      text: Write a plugin
      link: /plugins/getting-started

features:
  - icon: 🖥️
    title: Self-hosting
    details: Install with Docker or from source, add your libraries, set up users and profiles, and expose the server safely. No prior media-server experience assumed.
    link: /guide/getting-started
    linkText: Install & run
  - icon: 🎬
    title: Streaming that adapts
    details: Direct play or remux whenever possible, on-the-fly transcoding when it is not, hardware acceleration, HDR tone-mapping, subtitles, markers and resume.
    link: /guide/playback
    linkText: How playback works
  - icon: 🧩
    title: Plugins for everything
    details: Metadata and subtitle providers, requests, webhooks, access policies, jobs and UI surfaces that render in the client with no host rebuild.
    link: /plugins/getting-started
    linkText: Write your first plugin
  - icon: 📦
    title: One typed SDK
    details: The reelvault-sdk package exposes a typed HTTP client, shared TypeBox contracts, the plugin SDK and an in-memory test host.
    link: /sdk/
    linkText: SDK overview
---
