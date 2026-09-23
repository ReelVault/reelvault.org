---
title: Testing host
description: "@reelvault/sdk/testing — an in-memory PluginHost for unit-testing plugins."
outline: [2, 3]
---

# Testing host — `@reelvault/sdk/testing`

`PluginTestHost` is an in-memory implementation of the whole `PluginHost` interface. Run your plugin's `setup` against it in unit tests and assert on what the plugin registered, enqueued and wrote — no server, no database, no filesystem.

```ts
import { describe, expect, test } from "bun:test";
import { createPluginTestHost } from "@reelvault/sdk/testing";
import plugin from "../src/index";

describe("my plugin", () => {
  test("registers its route and job", async () => {
    const host = createPluginTestHost({ apiKey: "test" }); // ← becomes host.config
    await plugin.setup(host);

    expect(host.registeredRoutes).toHaveLength(1);
    expect(host.registeredJobs.map((job) => job.name)).toContain("my-job");
  });
});
```

## What it records

Every registration is recorded on a public, readonly array:

| Field | Records |
|---|---|
| `registeredProviders` | metadata providers (`host.providers.register`) |
| `registeredSubtitleProviders` | subtitle providers |
| `registeredMediaAnalyzers` | media analyzers |
| `registeredJobs` | job definitions (`host.jobs.register`) |
| `registeredRoutes` | HTTP routes (`host.routes.register`) |
| `registeredAccessPolicies` | access policies |
| `createdNotifications` | notifications sent through `host.notifications.create` |
| `enqueuedJobs` | `{ name, data, options }` for every `host.jobs.enqueue` / `enqueueMany` |

## State you can set

- `host.config` — the plugin configuration (constructor argument).
- `host.setMediaFile(...)` / `host.setMetadataItem(...)` — seed media files and metadata, read back with `host.media.get(id)` / `host.metadata.get(id)`.
- `host.storage` — real key/value and blob semantics in memory (`get/set/delete/list`, `putBlob/getBlob/deleteBlob` with expiry metadata).
- `host.markers` — in-memory marker storage per media file.
- `host.artifacts.write(...)` — stores content in memory and runs registered `beforeArtifactCreate` hooks first, exactly like production.

## Driving events and hooks

```ts
// Fire a typed event at every registered handler:
await host.emit("media.file.ready", {
  libraryId: "lib-1",
  mediaFileId: "mf-1",
  metadataId: "md-1",
});

// Run the registered before* hooks over a candidate (returns the transformed candidate):
const candidate = await host.runBeforeMetadataSave({ type: "movie", title: "Arrival", /* … */ });

// Evaluate access policies:
const denial = await host.checkAccess({ userId: "u1", resource: "stream", action: "play", mediaFileId: "mf-1" });
```

`emit` wraps payloads in the same envelope production uses (`eventId`, `payloadVersion: 1`, `occurredAt`, `correlationId`), so handlers receive exactly what they would in the server.

## Unconfigured lookups return empty

Lookups that were never set up return empty results — `providers.search → []`, `media.get → null`, `ffmpeg.runAnalyse → { exitCode: 0, stderr: "" }` — and the logger swallows output. When a test needs a non-trivial provider response, set it explicitly:

```ts
host.providers.getDetails = async (_providerId, type, externalId) =>
  type === "movie" ? makeFakeDetails(externalId) : null;
```

`PluginTestHost` lives in the SDK repo at [`testing/`](https://github.com/ReelVault/sdk/tree/main/testing) and is exercised by the SDK's own `types.test.ts`, which is a good reference for realistic setups.
