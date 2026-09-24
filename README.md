# ReelVault Documentation

Documentation site for [ReelVault](https://github.com/ReelVault) — a self-hosted media server. Two audiences, deliberately kept apart:

- **Self-hosting ReelVault** (`docs/guide/`) — install, run and use the server. For users *and* admins: the everyday pages come first, and the technical ones are grouped under **Administration** so non-technical readers can ignore them.
- **Develop** (`docs/sdk/`, `docs/plugins/`, `docs/reference/`) — the typed TypeScript SDK (`@reelvault/sdk`) and the runtime plugin system. For developers.

**Live:** https://reelvault.org

## For AI agents & LLMs

All content is plain markdown (no MDX), and every page is available in raw form:

| Resource | URL |
|---|---|
| Short index (`llms.txt` convention) | [`/llms.txt`](https://reelvault.org/llms.txt) |
| Full contents in one file | [`/llms-full.txt`](https://reelvault.org/llms-full.txt) |
| Raw markdown of any page | same path as the HTML page, with a `.md` extension, e.g. [`/sdk/client/getting-started.md`](https://reelvault.org/sdk/client/getting-started.md) |

The markdown sources live in [`docs/`](docs/) — point an agent (or a clone) straight at that folder.

## Screenshots

Pages use a `<Screenshot>` component so screenshots can be added without editing prose. While a page has no image it renders a labelled placeholder:

```md
<Screenshot caption="Admin → Workers" hint="Active jobs, operations and scheduled tasks." />
```

When you have the real image, drop it in `docs/public/` and add the `src` (and optionally `alt`, `ratio`):

```md
<Screenshot src="/screenshots/admin-workers.png" caption="Admin → Workers" />
```

The component is registered globally by the theme (`docs/.vitepress/theme/components/Screenshot.vue`).

## Develop

Requires [Bun](https://bun.sh).

```bash
bun install
bun run dev        # dev server with hot reload
bun run build      # build → docs/.vitepress/dist (+ .md copies, llms.txt, llms-full.txt)
bun run preview    # serve the production build locally
```

## Deploy

Deploys automatically to **https://reelvault.org** on every push to `main`, via [GitHub Actions](.github/workflows/deploy.yml).

## Layout

```
docs/
├── .vitepress/config.mts       # nav, sidebars, search, base path
├── .vitepress/theme/           # custom theme (brand colours, copy-page menu, Screenshot slot)
├── public/                     # favicon / web manifest (mirrored from website)
├── index.md                    # landing page
├── guide/                      # self-hosting: start here, your library, people, extras, administration, help
├── sdk/                        # @reelvault/sdk docs (client, common, ui, testing)
├── plugins/                    # plugin authoring (manifest, host API, UI, publishing)
└── reference/                  # Reference: signatures, contracts, glossary
scripts/generate-llms.ts        # post-build: copies .md into dist/, emits llms.txt
```
