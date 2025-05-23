import { purgeCss } from 'vite-plugin-tailwind-purgecss';
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
import cssInjectedByJsPlugin from 'vite-plugin-css-injected-by-js';

export default defineConfig({
	plugins: [sveltekit(), purgeCss(),cssInjectedByJsPlugin()],
	server: {
		fs: {
			// Allow serving files from one level up to the project root
			allow: ['static']
		}
	},// given by ol package
    build: {
        sourcemap: true
    }
});
