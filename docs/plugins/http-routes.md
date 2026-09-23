---
title: HTTP routes
description: Expose your plugin's own API endpoints under /v1/plugins/<pluginId>/*.
outline: [2, 3]
---

# HTTP routes

With the `httpRoute` capability your plugin exposes endpoints under **`/v1/plugins/:pluginId/*`**. The host dispatches to them with authentication already resolved — every handler receives the authenticated user.

Schemas are TypeBox (`t` is re-exported from `@reelvault/sdk/plugin`). When you attach a schema, the host validates the request and hands your handler the parsed, statically-typed value:

```ts
import { definePlugin, ok, route, t } from "@reelvault/sdk/plugin";

await host.routes.register(
  route({
    method: "GET",                    // DELETE | GET | PATCH | POST | PUT
    path: "/requests",                // → /v1/plugins/org.example.requests/requests
    access: "user",                   // "user" (default) | "admin"
    query: t.Object({ status: t.Optional(t.String()) }),
    handler: async ({ query, user }) => ok(await listRequests(user.id, query.status)),
  }),
);
```

## Route shape

| Field | Meaning |
|---|---|
| `method` | `GET`, `POST`, `PUT`, `PATCH`, `DELETE` |
| `path` | Sub-path below `/v1/plugins/<pluginId>`; supports params like `/requests/:id` |
| `access` | `"admin"` — requires the admin role; `"user"` (default) — any authenticated user |
| `body` / `query` / `params` | Optional TypeBox schemas; the handler gets the parsed values, typed |
| `response` | Optional TypeBox schema; when present the host validates your returned body |
| `handler` | `(req) => PluginHttpResponse \| Promise<PluginHttpResponse>` |

## Handlers

```ts
interface PluginHttpRequest {
  params: Record<string, string>;   // typed as Static<params schema> when provided
  query: Record<string, string>;    // typed as Static<query schema> when provided
  headers?: Record<string, string>;
  body: unknown;                    // typed as Static<body schema> when provided
  user: { id: string; role: string; profileId?: string };
}
```

Return a response object directly, or use the helpers:

| Helper | Result |
|---|---|
| `ok(body, { headers? })` | `200` with `body` |
| `created(body)` | `201` with `body` |
| `fail(status, code, params?)` | `{ statusCode, code, params? }` with the given status |
| `{ status, headers, body }` | Anything custom |

Auth and profile come pre-resolved in `req.user` — never trust client-supplied user ids. **Scoping is your job**: `access: "user"` means "logged in", not "owns the resource"; check ownership (`req.user.id`) or role (`req.user.role === "admin"`) inside the handler.

```ts
await host.routes.register(
  route({
    method: "DELETE",
    path: "/requests/:id",
    params: t.Object({ id: t.String() }),
    handler: async ({ params, user }) => {
      const request = await requests.get(params.id);
      if (!request) return fail(404, "not_found");
      if (request.userId !== user.id && user.role !== "admin") return fail(403, "forbidden");
      await requests.delete(params.id);
      return ok({ success: true });
    },
  }),
);
```

Without a schema the handler receives the raw request (`body: unknown`, string params/query) — useful for passthrough endpoints.

## Calling your routes

From the website's plugin UI, the host bridge calls your routes for you:

- declarative schema actions (`submit` / `call` / `delete`) reference paths relative to your plugin root;
- custom elements call `host.api.call("/requests", { method: "POST", body })` — see [Plugin UI kit](/sdk/ui#the-host-api);
- the SDK client exposes the same thing generically: `api.plugins.call(pluginId, path, options)`.

Paths in all three cases are plugin-relative — the host prefixes `/v1/plugins/<pluginId>`.

## Practical notes

- Attach `response` only when the shape is worth enforcing; a mismatch is reported as a plugin error.
- Version your own paths (`/v1-2/…`) if you ever need breaking changes; the host path is stable per plugin id.
- Long-running work belongs in [jobs](/plugins/jobs-and-events#jobs) — return `202`-style responses and enqueue instead of blocking the request.
