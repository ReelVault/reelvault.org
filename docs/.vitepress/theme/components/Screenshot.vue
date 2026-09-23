<script setup lang="ts">
/**
 * Screenshot slot for the docs.
 *
 * - With `src`, renders the image with a caption.
 * - Without `src`, renders a labelled placeholder so a real screenshot can be
 *   dropped in later by only adding the `src` attribute.
 */
withDefaults(
	defineProps<{
		caption: string;
		src?: string;
		alt?: string;
		/** CSS aspect-ratio, e.g. "16 / 9" or "4 / 3". */
		ratio?: string;
		/** Short hint about what the screenshot should show. */
		hint?: string;
	}>(),
	{
		src: undefined,
		alt: undefined,
		ratio: "16 / 9",
		hint: undefined,
	},
);
</script>

<template>
	<figure class="screenshot" :style="{ '--screenshot-ratio': ratio }">
		<img v-if="src" class="screenshot__image" :src="src" :alt="alt ?? caption" loading="lazy" />
		<div v-else class="screenshot__placeholder" role="img" :aria-label="`Screenshot placeholder: ${caption}`">
			<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true">
				<rect x="3" y="4" width="18" height="16" rx="2" />
				<circle cx="9" cy="10" r="1.6" />
				<path d="m4 18 5-5 3.5 3.5L16 13l4 4" />
			</svg>
			<span class="screenshot__badge">Screenshot placeholder</span>
			<span v-if="hint" class="screenshot__hint">{{ hint }}</span>
		</div>
		<figcaption class="screenshot__caption">{{ caption }}</figcaption>
	</figure>
</template>
