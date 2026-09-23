<script setup lang="ts">
import DefaultTheme from "vitepress/theme";

import CopyPageMenu from "./components/CopyPageMenu.vue";

const { Layout } = DefaultTheme;
</script>

<template>
	<Layout>
		<template #doc-before>
			<CopyPageMenu />
		</template>
	</Layout>
</template>
