<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from "vue";
import { useData } from "vitepress";

const { page, site } = useData();

const open = ref(false);
const copied = ref(false);
const root = ref<HTMLElement | null>(null);

const isHome = computed(() => page.value.frontmatter.layout === "home");

/** The raw markdown copy the build writes next to every rendered page. */
const rawPath = computed(() => `${site.value.base}${page.value.relativePath}`);

function absolute(path: string): string {
	if (typeof window === "undefined") return path;
	return new URL(path, window.location.origin).toString();
}

const prompt = computed(() =>
	encodeURIComponent(`Read ${absolute(rawPath.value)} and answer my questions about it.`),
);

const chatgpt = computed(() => `https://chatgpt.com/?q=${prompt.value}`);
const claude = computed(() => `https://claude.ai/new?q=${prompt.value}`);
const perplexity = computed(() => `https://www.perplexity.ai/?q=${prompt.value}`);

async function copyPage(): Promise<void> {
	try {
		const response = await fetch(rawPath.value);
		const markdown = await response.text();
		await navigator.clipboard.writeText(markdown);
		copied.value = true;
		setTimeout(() => (copied.value = false), 2000);
		open.value = false;
	} catch (error) {
		console.error("Failed to copy page", error);
	}
}

function closeOnClickOutside(event: MouseEvent): void {
	if (root.value && !root.value.contains(event.target as Node)) open.value = false;
}

function closeOnEscape(event: KeyboardEvent): void {
	if (event.key === "Escape") open.value = false;
}

onMounted(() => {
	document.addEventListener("click", closeOnClickOutside);
	document.addEventListener("keydown", closeOnEscape);
});

onBeforeUnmount(() => {
	document.removeEventListener("click", closeOnClickOutside);
	document.removeEventListener("keydown", closeOnEscape);
});
</script>

<template>
	<div v-if="!isHome" ref="root" class="copy-page">
		<button
			type="button"
			class="copy-page__trigger"
			:aria-expanded="open"
			aria-haspopup="menu"
			@click="open = !open"
		>
			<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
				<rect x="9" y="9" width="11" height="11" rx="2" />
				<path d="M5 15V5a2 2 0 0 1 2-2h10" />
			</svg>
			<span>{{ copied ? "Copied!" : "Copy page" }}</span>
			<svg class="copy-page__chevron" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
				<path d="m6 9 6 6 6-6" />
			</svg>
		</button>

		<div v-if="open" class="copy-page__menu" role="menu">
			<button type="button" class="copy-page__item" role="menuitem" @click="copyPage">
				<strong>Copy page</strong>
				<span>Copy page as Markdown for LLMs</span>
			</button>
			<a class="copy-page__item" role="menuitem" :href="rawPath" target="_blank" rel="noopener">
				<strong>View as markdown <span aria-hidden="true">↗</span></strong>
				<span>View this page as plain text</span>
			</a>
			<a class="copy-page__item" role="menuitem" :href="chatgpt" target="_blank" rel="noopener">
				<strong>Open in ChatGPT <span aria-hidden="true">↗</span></strong>
				<span>Ask questions about this page</span>
			</a>
			<a class="copy-page__item" role="menuitem" :href="claude" target="_blank" rel="noopener">
				<strong>Open in Claude <span aria-hidden="true">↗</span></strong>
				<span>Ask questions about this page</span>
			</a>
			<a class="copy-page__item" role="menuitem" :href="perplexity" target="_blank" rel="noopener">
				<strong>Open in Perplexity <span aria-hidden="true">↗</span></strong>
				<span>Ask questions about this page</span>
			</a>
		</div>
	</div>
</template>
