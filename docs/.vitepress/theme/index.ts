import type { Theme } from "vitepress";
import DefaultTheme from "vitepress/theme";

import Layout from "./Layout.vue";
import Screenshot from "./components/Screenshot.vue";
import "./style.css";

export default {
	extends: DefaultTheme,
	Layout,
	enhanceApp({ app }) {
		// Available in any markdown page as `<Screenshot caption="…" />`.
		app.component("Screenshot", Screenshot);
	},
} satisfies Theme;
