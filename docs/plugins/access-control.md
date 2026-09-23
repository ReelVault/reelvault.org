---
title: Access control
description: Access policies — veto stream playback before it starts (e.g. parental controls, quotas).
outline: [2, 3]
---

# Access control

With the `accessPolicy` capability, a plugin can veto playback **before** a stream starts. This is the hook for parental controls, watch-quota plugins, "homework first" locks, per-profile time windows, and so on.

```ts
await host.access.register({
  id: "bedtime-policy",
  beforeAccess(context) {
    if (isPastBedtime(context.profileId)) {
      return { allowed: false, code: "BEDTIME", message: "It's past bedtime." };
    }
    // return undefined → allowed
  },
});
```

## Policy shape

```ts
interface PluginAccessPolicy {
  id: string;
  beforeAccess(
    context: Readonly<PluginAccessContext>,
  ): PluginAccessDenial | undefined | Promise<PluginAccessDenial | undefined>;
}

interface PluginAccessContext {
  userId: string;
  profileId?: string;
  resource: "stream";   // today the only guarded resource
  action: "play";
  mediaFileId?: string;
}

interface PluginAccessDenial {
  allowed: false;
  code: string;         // machine-readable — clients translate it
  message: string;      // human-readable fallback
}
```

Return `undefined` to allow. Return a denial to abort the play request — the server refuses to start the stream and surfaces `code` to the client (clients translate the code into their own text; the `message` is for server logs), so use a stable, translatable `code` and a clear `message`.

All registered policies run; **the first denial wins**. Keep policies fast and side-effect-free — they sit on the hot path of every play request. If you need bookkeeping (quotas, "watched minutes today"), persist it in [`host.storage`](/plugins/host-api#hoststorage) from playback lifecycle events instead of writing during `beforeAccess`.

## Testing

The [testing host](/sdk/testing) evaluates your policies the same way production does:

```ts
const denial = await host.checkAccess({ userId: "u1", resource: "stream", action: "play", mediaFileId: "mf-1" });
expect(denial?.code).toBe("BEDTIME");
```
