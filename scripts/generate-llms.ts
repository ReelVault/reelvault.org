/**
 * Post-build step for AI-friendly documentation:
 *
 * 1. Copies every source `.md` into the built `dist/` preserving paths, so the
 *    raw markdown is served next to the rendered HTML:
 *    `https://…/sdk/client/getting-started.md`
 * 2. Generates `llms.txt` (a short, linked index) and `llms-full.txt`
 *    (every page concatenated) following the https://llmstxt.org convention.
 *
 * Configuration (env):
 * - `DOCS_BASE`  — base path the site was built with (same as the VitePress build).
 * - `SITE_URL`   — origin the site is served from (default: https://reelvault.org).
 */
import { mkdirSync, readFileSync, readdirSync, copyFileSync, writeFileSync } from "node:fs";
import { join, relative, resolve } from "node:path";

const DOCS_ROOT = resolve(import.meta.dir, "../docs");
const DIST = resolve(DOCS_ROOT, ".vitepress/dist");

const base = (process.env.DOCS_BASE ?? "/").replace(/\/?$/, "/");
const siteUrl = (process.env.SITE_URL ?? "https://reelvault.org").replace(/\/$/, "");
const site = `${siteUrl}${base}`;

const SECTIONS: Array<{ file: string; path: string; title: string; description?: string }> = [];
const MD_PAGES: Array<{ path: string; title: string; description?: string; markdown: string }> = [];

function parseFrontmatter(markdown: string): { title: string; description?: string; body: string } {
	const match = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?/.exec(markdown);
	if (!match) return { title: "", body: markdown };
	const frontmatter = match[1];
	const title = /^title:\s*["']?(.+?)["']?\s*$/m.exec(frontmatter)?.[1] ?? "";
	const description = /^description:\s*["']?(.+?)["']?\s*$/m.exec(frontmatter)?.[1];
	return { title, description, body: markdown.slice(match[0].length) };
}

function walk(dir: string): string[] {
	return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
		const full = join(dir, entry.name);
		if (entry.isDirectory()) return walk(full);
		return entry.name.endsWith(".md") ? [full] : [];
	});
}

const files = walk(DOCS_ROOT)
	.map((file) => relative(DOCS_ROOT, file).replaceAll("\\", "/"))
	.filter((rel) => !rel.startsWith(".vitepress"))
	.sort((a, b) => {
		// Landing page first, then guide → sdk → plugins; folder index pages first within a section.
		const section = (p: string) => (p === "index.md" ? 0 : p.startsWith("guide/") ? 1 : p.startsWith("sdk/") ? 2 : p.startsWith("plugins/") ? 3 : 4);
		const rank = (p: string) => (p.endsWith("index.md") ? 0 : 1);
		return section(a) - section(b) || rank(a) - rank(b) || a.localeCompare(b);
	});

for (const rel of files) {
	const sourcePath = join(DOCS_ROOT, rel);
	const outPath = join(DIST, rel);
	mkdirSync(resolve(outPath, ".."), { recursive: true });
	copyFileSync(sourcePath, outPath);

	const markdown = readFileSync(sourcePath, "utf8");
	const { title, description, body } = parseFrontmatter(markdown);
	const urlPath = rel === "index.md" ? "index" : rel.replace(/\.md$/, "");
	MD_PAGES.push({
		path: rel,
		title: title || rel,
		description,
		markdown: body,
	});
	SECTIONS.push({
		file: rel,
		path: `${site}${urlPath}.md`,
		title: title || rel,
		description,
	});
}

// Group pages by top-level folder for the llms.txt index.
const groups = new Map<string, typeof SECTIONS>();
for (const page of SECTIONS) {
	const group = page.file.includes("/") ? page.file.split("/")[0] : "Overview";
	const bucket = groups.get(group) ?? [];
	bucket.push(page);
	groups.set(group, bucket);
}

const GROUP_LABELS: Record<string, string> = {
	Overview: "Start here",
	guide: "Self-hosting ReelVault (users & admins)",
	sdk: "Develop — SDK",
	plugins: "Develop — Plugins",
};

let llms = "# ReelVault Documentation\n\n";
llms += "> ReelVault is a self-hosted media server (movies & TV, HLS streaming, transcoding, multi-user).\n";
llms += "> The guide covers running and using the server. The develop section covers the typed TypeScript SDK (`reelvault-server`) and the runtime plugin system.\n\n";
for (const [group, pages] of groups) {
	llms += `## ${GROUP_LABELS[group] ?? group}\n\n`;
	for (const page of pages) {
		llms += `- [${page.title}](${page.path})${page.description ? `: ${page.description}` : ""}\n`;
	}
	llms += "\n";
}
llms += "## Raw markdown\n\n- Every page is also available as plain markdown at `<url>.md` (same path, `.md` extension).\n";
llms += `- Full contents in a single file: ${site}llms-full.txt\n`;

writeFileSync(join(DIST, "llms.txt"), llms);

let full = "# ReelVault Documentation — full contents\n\n";
for (const page of MD_PAGES) {
	const urlPath = page.path === "index.md" ? "index" : page.path.replace(/\.md$/, "");
	full += `\n\n---\n\n# ${page.title}\n\n(${site}${urlPath}.md)\n\n${page.markdown.trim()}\n`;
}
writeFileSync(join(DIST, "llms-full.txt"), full);

console.log(`generate-llms: ${MD_PAGES.length} markdown pages → dist/, llms.txt, llms-full.txt (site: ${site})`);
