# ReelVault Documentation

Documentation site for [ReelVault](https://github.com/ReelVault) — a self-hosted media server. Two audiences, deliberately kept apart:

- **Self-hosting ReelVault** (`docs/guide/`) — install, configure, run and use the server. For users and admins.
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

## Deploy (GitHub Pages, custom domain)

A push to `main` runs [.github/workflows/deploy.yml](.github/workflows/deploy.yml), which builds the site and deploys it via GitHub Actions to **https://reelvault.org**.

One-time setup: **Settings → Pages → Source: GitHub Actions**, and **Settings → Pages → Custom domain: reelvault.org** (or rely on `docs/public/CNAME`). DNS needs a CNAME record for `www`/apex pointing at `<owner>.github.io` per GitHub's instructions. The site builds with the default base `/` — no `DOCS_BASE` needed for a custom domain (only a project-site deploy under `/<repo>/` would set it; `SITE_URL` in `llms.txt` links likewise defaults to `https://reelvault.org`).

## Layout

```
docs/
├── .vitepress/config.mts       # nav, sidebars, search, base path
├── .vitepress/theme/           # custom theme (brand colours, copy-page menu, Screenshot slot)
├── public/                     # favicon / web manifest (mirrored from website)
├── index.md                    # landing page
├── guide/                      # self-hosting: install, config, library, admin (users)
├── sdk/                        # @reelvault/sdk docs (client, common, ui, testing)
├── plugins/                    # plugin authoring (manifest, host API, UI, publishing)
└── reference/                  # Reference: signatures, contracts, glossary
scripts/generate-llms.ts        # post-build: copies .md into dist/, emits llms.txt
```
