<script setup lang="ts">
import { withBase } from "vitepress";
</script>

<template>
	<div class="not-found">
		<p class="not-found__code">404</p>
		<h1 class="not-found__title">Page not found</h1>
		<p class="not-found__lead">The page you were looking for does not exist, or it has moved.</p>
		<div class="not-found__links">
			<a class="not-found__btn not-found__btn--brand" :href="withBase('/guide/')">Self-hosting guide</a>
			<a class="not-found__btn" :href="withBase('/guide/faq')">FAQ</a>
			<a class="not-found__btn" :href="withBase('/guide/troubleshooting')">Troubleshooting</a>
		</div>
		<p class="not-found__hint">Or search the docs from the box in the top bar.</p>
	</div>
</template>

<style scoped>
.not-found {
	max-width: 640px;
	margin: 0 auto;
	padding: 96px 24px;
	text-align: center;
}

.not-found__code {
	font-size: 64px;
	font-weight: 700;
	line-height: 1;
	color: var(--vp-c-brand-1);
}

.not-found__title {
	margin: 12px 0 0;
	font-size: 28px;
	font-weight: 700;
	line-height: 1.2;
}

.not-found__lead {
	margin: 12px 0 0;
	color: var(--vp-c-text-2);
}

.not-found__links {
	display: flex;
	flex-wrap: wrap;
	gap: 12px;
	justify-content: center;
	margin-top: 28px;
}

.not-found__btn {
	display: inline-block;
	padding: 0 18px;
	line-height: 40px;
	border: 1px solid var(--vp-c-divider);
	border-radius: 20px;
	background: var(--vp-c-bg-soft);
	font-size: 14px;
	font-weight: 500;
	color: var(--vp-c-text-1);
	transition: border-color 0.2s, background-color 0.2s;
}

.not-found__btn:hover {
	border-color: var(--vp-c-brand-1);
}

.not-found__btn--brand {
	border-color: transparent;
	background: var(--vp-button-brand-bg);
	color: var(--vp-button-brand-text);
}

.not-found__btn--brand:hover {
	background: var(--vp-button-brand-hover-bg);
}

.not-found__hint {
	margin-top: 24px;
	font-size: 13px;
	color: var(--vp-c-text-3);
}
</style>
