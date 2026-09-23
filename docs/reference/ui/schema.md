---
title: UI schema
description: Every declarative UI node, field, action, condition and builder.
outline: [2, 3]
---

# UI schema

A declarative schema is **data** describing a surface, rendered by the host's own components. It cannot execute code: data is fetched and mutations run through your plugin's backend routes. Build schemas with the type-safe helpers from `reelvault-sdk/ui/schema` (or `reelvault-sdk/ui`) and let the build emit JSON.

Helper signatures are flatter than the node shapes below — for example `stats(items)`, `tabs(items)`, `when(condition, content, otherwise?)` and `embed(src, options?)` take their node's payload positionally. When in doubt, check the helper's parameters in `reelvault-sdk/ui/schema`; the rendered node always matches the shapes documented here.

## Surface

```ts
interface PluginUiSchemaSurface {
  data?: Record<string, PluginSchemaDataSource>;  // named GET sources, fetched on mount and refresh
  body: PluginSchemaNode[];
  onMount?: PluginSchemaAction[];                 // actions run once on mount
}

interface PluginSchemaDataSource {
  path: string;                       // plugin-relative route
  query?: Record<string, string>;
}
```

## Nodes

Each node has a `type` discriminant.

### Layout

| Node | Shape |
|---|---|
| `stack` | `{ children, gap? }` — vertical |
| `row` | `{ children, gap?, align?: "start" \| "center" \| "end" \| "between" }` |
| `grid` | `{ children, columns?: 1 \| 2 \| 3 \| 4, gap? }` |
| `card` | `{ children, title?, description? }` |
| `section` | `{ children, title?, description? }` |
| `tabs` | `{ tabs: Array<{ label, icon?, children }> }` |
| `separator` | `{}` |

### Text

| Node | Shape |
|---|---|
| `heading` | `{ text, level?: 2 \| 3 }` |
| `text` | `{ text, variant?: "default" \| "muted" }` |
| `badge` | `{ text, variant?: "default" \| "secondary" \| "outline" \| "destructive", icon? }` |
| `alert` | `{ title?, description?, variant?: "default" \| "destructive" }` |

### Data display

| Node | Shape |
|---|---|
| `stats` | `{ items: Array<{ label, value, icon? }> }` |
| `table` | `{ source, columns: Array<{ label, value, variant?: "text" \| "muted" \| "badge" }>, empty?, rowActions?: PluginSchemaNode[] }` |
| `list` | `{ source, item: PluginSchemaNode[], empty? }` |
| `embed` | `{ src, title?, aspect?: "video" \| "square" }` — `src` is a URL template |
| `empty` | `{ title?, description? }` |

### Control flow

| Node | Shape |
|---|---|
| `foreach` | `{ source, item: PluginSchemaNode[] }` |
| `if` | `{ condition, content: PluginSchemaNode[], otherwise?: PluginSchemaNode[] }` |

### Actions

`button` is the action node: `{ label, action, icon?, variant?: "default" \| "outline" \| "secondary" \| "destructive" \| "ghost", disabledIf?, hiddenIf? }`.

## Fields

`field` nodes carry the form value and are submitted by a `submit` action.

```ts
interface PluginSchemaField {
  name: string;
  input: "text" | "textarea" | "number" | "select" | "switch" | "checkbox" | "secret" | "date";
  label: PluginLocalizedText;
  description?: PluginLocalizedText;
  placeholder?: PluginLocalizedText;
  required?: boolean;
  default?: PluginSchemaValue;
  options?: Array<{ label: PluginLocalizedText; value: string | number }>;  // select
  min?: number; max?: number; step?: number;                                // number
  rows?: number;                                                            // textarea
  colspan?: 1 | 2 | 3 | 4;                                                  // inside grid
  hiddenIf?: PluginSchemaCondition;
}
```

## Actions

```ts
type PluginSchemaAction =
  | { type: "submit"; path: string; method?: "POST" | "PATCH"; body?; successToast?; close?; refresh? }
  | { type: "call"; path: string; method?: "POST" | "PUT" | "PATCH" | "DELETE"; body?; query?; confirm?; successToast?; close?; refresh? }
  | { type: "delete"; path: string; confirm?; successToast?; close?; refresh? }
  | { type: "navigate"; to: string }
  | { type: "openDialog"; dialog: string; params?: Record<string, string> }
  | { type: "close" }
  | { type: "toast"; level: "success" | "error" | "info"; message: PluginLocalizedText }
  | { type: "refresh"; sources?: string[] };
```

`path` values are plugin-relative (the host prefixes `/v1/plugins/<id>`). `refresh` lists data-source names to re-fetch after success.

## Conditions

```ts
interface PluginSchemaCondition {
  left: string;   // an expression such as "form.title" or "data.summary.total"
  op: "eq" | "neq" | "gt" | "gte" | "lt" | "lte" | "contains" | "truthy" | "falsy";
  right?: string | number | boolean | null;
}
```

Used by `if`, `hiddenIf` and `disabledIf`.

## Expressions

Interpolate values in text, paths and action bodies:

- <span v-pre>`{{form.x}}`</span> — a form field value;
- <span v-pre>`{{data.<source>.<path>}}`</span> — a fetched data source;
- <span v-pre>`{{item.x}}`</span> — the current item inside `list`, `table` or `foreach`.

Schemas run against the same ambient context as custom elements: `context.pageUrl`, `context.locale`, `context.theme`, `context.user` (`id`, `role`, `name`), `context.profile`, `context.player` and `context.device` (`userAgent`, `language`, `screenResolution`, `browser`, `os`) — handy for automatic capture, e.g. bug reports.

## Builders

Every node has an identity-typed builder. Import from `reelvault-sdk/ui/schema` to keep the bundle free of the element kit:

```ts
defineSchema(surface)

// layout
stack(children, { gap? }), row(children, { gap?, align? }), grid(children, { columns?, gap? }),
card(children, { title?, description? }), section(children, { title?, description? }),
tabs(items), separator()

// text
heading(text, level?), text(value, variant?), badge(value, options?), alert(options?),

// fields
textField, textareaField, numberField, selectField, switchField, checkboxField, secretField, dateField

// data
stats(items), table(options), list(options), embed(src, options?), empty(options?)

// control flow & actions
foreach(source, item), when(condition, content, otherwise?), button(label, action, options?)
```

```ts
export default defineSchema({
  data: { summary: { path: "/stats" } },
  body: [
    stack([
      text("Describe the problem.", "muted"),
      textField({ name: "title", label: "Title", required: true }),
      row([
        button("Cancel", { type: "close" }, { variant: "ghost" }),
        button("Submit", { type: "submit", path: "/reports", successToast: "Sent", close: true }),
      ], { align: "end" }),
    ]),
  ],
});
```

## See also

- [Frontend (ui.json)](/plugins/ui) — where schema surfaces are declared.
- [Plugin UI host](/reference/ui/host) — the custom-element escape hatch.
