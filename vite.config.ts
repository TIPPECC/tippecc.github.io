import { purgeCss } from 'vite-plugin-tailwind-purgecss';
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
	plugins: [sveltekit(), purgeCss()],
	server: {
		fs: {
			// Allow serving files from one level up to the project root
			allow: ['static']
		}
	},
	build: {
		rollupOptions: {
			external: ['ol/ol.css'], // Ensure external CSS is included
		},
	},
});
