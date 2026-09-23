import { defineConfig } from "vitepress";

// Project sites on GitHub Pages are served from /<repo>/ — the deploy workflow
// sets DOCS_BASE accordingly. Locally (and for custom domains) it defaults to "/".
const base = process.env.DOCS_BASE ?? "/";
const github = "https://github.com/ReelVault";

export default defineConfig({
	base,
	lang: "en-US",
	title: "ReelVault",
	description:
		"Documentation for ReelVault — a self-hosted media server: run it, use it, and extend it with the typed SDK and runtime plugins.",
	head: [
		["link", { rel: "icon", type: "image/svg+xml", href: "/favicon.svg" }],
		["link", { rel: "icon", type: "image/png", sizes: "96x96", href: "/favicon-96x96.png" }],
		["link", { rel: "shortcut icon", href: "/favicon.ico" }],
		["link", { rel: "apple-touch-icon", sizes: "180x180", href: "/apple-touch-icon.png" }],
		["link", { rel: "manifest", href: "/site.webmanifest" }],
		["meta", { name: "theme-color", media: "(prefers-color-scheme: dark)", content: "#121316" }],
		["meta", { name: "theme-color", media: "(prefers-color-scheme: light)", content: "#f8fafc" }],
	],

	themeConfig: {
		siteTitle: "ReelVault Docs",
		logo: "/favicon.svg",
		nav: [
			{ text: "Self-hosting", link: "/guide/introduction", activeMatch: "/guide/" },
			{
				text: "Develop",
				activeMatch: "/(sdk|plugins|reference)/",
				items: [
					{ text: "SDK", link: "/sdk/" },
					{ text: "Plugins", link: "/plugins/getting-started" },
					{ text: "Reference", link: "/reference/" },
				],
			},
			{ text: "GitHub", link: github },
		],
		sidebar: {
			// Self-hosting ReelVault — for people running the server.
			"/guide/": [
				{
					text: "Getting started",
					items: [
						{ text: "What is ReelVault?", link: "/guide/introduction" },
						{ text: "Install & run", link: "/guide/getting-started" },
						{ text: "First-run setup", link: "/guide/first-run" },
						{ text: "Configuration", link: "/guide/configuration" },
						{ text: "Web & desktop clients", link: "/guide/website" },
					],
				},
				{
					text: "Your library",
					items: [
						{ text: "Libraries & scanning", link: "/guide/libraries" },
						{ text: "Metadata & providers", link: "/guide/metadata" },
						{ text: "Playback & transcoding", link: "/guide/playback" },
					],
				},
				{
					text: "People & access",
					items: [
						{ text: "Users & profiles", link: "/guide/users-and-profiles" },
						{ text: "Remote access & TLS", link: "/guide/remote-access" },
					],
				},
				{
					text: "Operations",
					items: [
						{ text: "Installing plugins", link: "/guide/plugins" },
						{ text: "Tasks & workers", link: "/guide/tasks-and-workers" },
						{ text: "Diagnostics & logs", link: "/guide/diagnostics" },
						{ text: "Backups & upgrades", link: "/guide/maintenance" },
					],
				},
				{
					text: "Help",
					items: [
						{ text: "Troubleshooting", link: "/guide/troubleshooting" },
						{ text: "FAQ", link: "/guide/faq" },
					],
				},
			],
			// Develop — the typed SDK, consumed by apps and the website.
			"/sdk/": [
				{
					text: "SDK",
					items: [
						{ text: "Overview", link: "/sdk/" },
						{
							text: "API client",
							collapsed: false,
							items: [
								{ text: "Getting started", link: "/sdk/client/getting-started" },
								{ text: "Authentication", link: "/sdk/client/authentication" },
								{ text: "Caching, retries & errors", link: "/sdk/client/caching-and-retries" },
								{ text: "Resources & realtime", link: "/sdk/client/resources" },
							],
						},
						{ text: "Shared contracts", link: "/sdk/common" },
						{ text: "Plugin UI kit", link: "/sdk/ui" },
						{ text: "Testing host", link: "/sdk/testing" },
					],
				},
			],
			// Reference — exact signatures and contracts.
			"/reference/": [
				{
					text: "Reference",
					items: [
						{ text: "Overview", link: "/reference/" },
						{
							text: "API client",
							collapsed: false,
							items: [
								{ text: "Configuration", link: "/reference/client/configuration" },
								{ text: "Errors", link: "/reference/client/errors" },
								{ text: "Resources", link: "/reference/client/resources" },
							],
						},
						{
							text: "Plugin host",
							collapsed: false,
							items: [
								{ text: "Host API", link: "/reference/plugin/host" },
								{ text: "Events & hooks", link: "/reference/plugin/events" },
							],
						},
						{
							text: "Plugin UI",
							collapsed: false,
							items: [
								{ text: "Host object", link: "/reference/ui/host" },
								{ text: "Schema", link: "/reference/ui/schema" },
							],
						},
						{ text: "Manifest & config", link: "/reference/config" },
						{ text: "Glossary", link: "/reference/glossary" },
					],
				},
			],
			// Develop — authoring plugins.
			"/plugins/": [
				{
					text: "Plugins",
					items: [
						{ text: "Getting started", link: "/plugins/getting-started" },
						{ text: "Manifest & capabilities", link: "/plugins/manifest" },
						{ text: "Host API", link: "/plugins/host-api" },
						{ text: "Metadata & subtitle providers", link: "/plugins/providers" },
						{ text: "Jobs, events & hooks", link: "/plugins/jobs-and-events" },
						{ text: "HTTP routes", link: "/plugins/http-routes" },
						{ text: "Access control", link: "/plugins/access-control" },
						{ text: "Configuration", link: "/plugins/config" },
						{ text: "Frontend (ui.json)", link: "/plugins/ui" },
						{ text: "Publishing & catalogs", link: "/plugins/publishing" },
						{ text: "Bundled plugins", link: "/plugins/examples" },
					],
				},
			],
		},
		search: {
			provider: "local",
		},
		socialLinks: [{ icon: "github", link: `${github}/reelvault.org` }],
		editLink: {
			pattern: `${github}/reelvault.org/edit/main/docs/:path`,
			text: "Edit this page on GitHub",
		},
		footer: {
			message: "Released under the GNU GPL v3.",
			copyright: "Copyright © 2025–2026 ReelVault",
		},
		outline: { level: [2, 3], label: "On this page" },
		lastUpdated: true,
		returnToTopLabel: "Back to top",
		sidebarMenuLabel: "Menu",
		docFooter: { prev: "Previous", next: "Next" },
	},

	// Keep dead-link checking strict; only localhost dev URLs are exempt.
	ignoreDeadLinks: [/^https?:\/\/localhost/, /^https?:\/\/127\.0\.0\.1/],
});
