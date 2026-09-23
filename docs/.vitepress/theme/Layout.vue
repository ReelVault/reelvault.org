<script setup lang="ts">
import DefaultTheme from "vitepress/theme";

import CopyPageMenu from "./components/CopyPageMenu.vue";
import NotFound from "./components/NotFound.vue";

const { Layout } = DefaultTheme;
</script>

<template>
	<Layout>
		<template #doc-before>
			<CopyPageMenu />
		</template>
		<template #not-found>
			<NotFound />
		</template>
	</Layout>
</template>
