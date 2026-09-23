---
title: Configuration
description: Declare typed plugin configuration with a schema — admin UI fields, defaults and secrets.
outline: [2, 3]
---

# Configuration

Plugins that need settings (API keys, endpoints, thresholds) declare them with `defineConfig`. The host renders a settings form in the admin panel, stores the values, and hands them to your code read-only and **typed**.

## Declare the schema

Configuration travels with the plugin entry — no separate file or manifest field:

```ts
// config.ts
import { defineConfig, field, type InferConfig } from "@reelvault/sdk/plugin";

export const config = defineConfig({
  apiKey: field.secret({
    label: "API key",
    description: "Key from the provider dashboard.",
    required: true,
    default: "",
  }),
  language: field.string({ label: "Language", default: "en-US" }),
  region: field.select({
    label: "Region",
    options: [
      { label: "US", value: "us" },
      { label: "PL", value: "pl" },
    ],
    default: "us",
  }),
  maxResults: field.number({ label: "Max results", default: 20, min: 1, max: 50 }),
  includeAdult: field.boolean({ label: "Include adult", default: false }),
});

export type HelloConfig = InferConfig<typeof config>;
```

```ts
// index.ts
import { definePlugin } from "@reelvault/sdk/plugin";
import { config } from "./config";

export default definePlugin(config, {
  async setup(host) {
    host.config.language; // string — inferred from the schema
  },
});
```

`defineConfig` derives the admin form and the runtime parser from the field specs: you never write `parse()`, type guards or defaults twice. A field **with a `default` is always present** after parsing (and typed as such); a field without one parses to `undefined` when the admin leaves it empty.

## Field types

| `type` | Builder | Rendered as | Extras |
|---|---|---|---|
| `string` | `field.string` | text input | `default`, `required`, `pattern`, `minLength`, `maxLength` |
| `number` | `field.number` | number input | `default`, `min`, `max`, `step` |
| `boolean` | `field.boolean` | toggle | `default` |
| `select` | `field.select` | dropdown | `options: { label, value }[]`, `default` |
| `secret` | `field.secret` | masked input | `default`, `required` |

All fields accept `label` and optional `description`.

## Read it in your plugin

`host.config` is your plugin's stored configuration, parsed and readonly, and **typed from the schema**:

```ts
export default definePlugin(config, {
  async setup(host) {
    const apiKey = host.config.apiKey; // string
  },
});
```

Better: hand `host.config` to your provider's `initialize(context)` — provider contexts receive the same `config` object, so the API key flows to exactly one place.

## Secrets

`secret` fields are for provider API keys and tokens. They are masked in the admin UI and **never** served as UI statics — the host blocks `config.json` under `/plugins/ui/`. Keep secrets in configuration, never hard-code them and never ship them inside your `ui/` bundle.

## Where the files live

Values are stored server-side per plugin in `config.json`. The admin edits them under the plugin's settings entry; `host.config` reflects the current values at `setup` time. Restart-free reloads (`POST /v1/admin/plugins/reload`) re-run `setup` with fresh values. Saving merges the patch into the stored values, so a redacted secret left untouched by the form keeps its value on disk.
