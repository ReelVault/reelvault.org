---
title: API reference
description: Exact signatures, types, limits and defaults for the ReelVault SDK, plugin host, UI kit and events.
outline: [2, 3]
---

# API reference

This section is the lookup table. The **Develop** guides explain how things fit together; these pages give you the exact shape of each symbol — signature, parameters, return type, required capability, and limits — so you do not have to open the source.

Everything here is derived from the TypeScript sources of the [`ReelVault/sdk`](https://github.com/ReelVault/sdk) repository:

- **`reference/client/*`** — [`@reelvault/sdk/client`](/reference/client/configuration): configuration, errors and the resource clients.
- **[`reference/plugin/host`](/reference/plugin/host)** — the `PluginHost` (`host.*`) every backend plugin receives.
- **[`reference/plugin/events`](/reference/plugin/events)** — every server event and hook.
- **[`reference/ui/host`](/reference/ui/host)** — the live host object a plugin's custom elements receive.
- **[`reference/ui/schema`](/reference/ui/schema)** — every declarative UI node, field and action.
- **[`reference/config`](/reference/config)** — `plugin.json`, config schemas and catalog entries.
- **[Glossary](/reference/glossary)** — every term these docs use, explained plainly.

## Conventions used on these pages

- Signatures are copied from the SDK's TypeScript types. `?` marks an optional member; `readonly` means the host owns the value.
- **Capability** names (`metadataProvider`, `jobs`, …) gate which `host.*` namespaces a plugin may touch. They are the only gate and are declared in `plugin.json` — see [Manifest](/plugins/manifest).
- Limits (sizes, quotas, timeouts) come from the server's own constants and are enforced at runtime.

## See also

- [SDK overview](/sdk/) — how the package is structured and consumed.
- [Host API](/plugins/host-api) — the task-oriented tour.
- [Frontend (ui.json)](/plugins/ui) — declaring UI surfaces.
