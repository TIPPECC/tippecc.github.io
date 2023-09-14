<script lang="ts">
	import '../app.postcss';
	import { AppShell, AppBar } from '@skeletonlabs/skeleton';
	import { page } from '$app/stores';
	import Navbar from '$lib/navbar.svelte';
	import Footer from '$lib/Footer.svelte';

	// Highlight JS
	import hljs from 'highlight.js';
	import 'highlight.js/styles/github-dark.css';
	import { storeHighlightJs } from '@skeletonlabs/skeleton';
	storeHighlightJs.set(hljs);

	// Floating UI for Popups
	import { computePosition, autoUpdate, flip, shift, offset, arrow } from '@floating-ui/dom';
	import { storePopup } from '@skeletonlabs/skeleton';
	storePopup.set({ computePosition, autoUpdate, flip, shift, offset, arrow });

	$: current_page = $page.url.pathname;
	$: current = '';

	let nav_elements = [
		{ label: 'Home', path: '/' },
		{ label: 'Work Packages', path: '/work_packages' },
		{ label: 'Case Studies', path: '/case_studies' },
		{ label: 'Data', path: '/data' },
		{ label: 'Team', path: '/team' },
		{ label: 'Publications', path: '/publications' }
	];

	$: if (undefined != current_page) {
		nav_elements.forEach((element) => {
			if (element['path'] == current_page) {
				current = element['label'];
			}
		});

		// always crop the '/'-prefix
		if (current_page.length >= 1) {
			current_page = current_page.slice(1, $page.url.pathname.length);
		}

		// index-page
		if (current_page.length <= 0) {
			current_page = 'Home';
		}
		// any other page
		else {
			current_page =
				current_page.slice(0, 1).toUpperCase() + current_page.slice(1, current_page.length);
		}
	}
</script>

<!-- App Shell -->
<AppShell>
	<svelte:fragment slot="header">
		<!-- App Bar -->
		<div class="flex">
			<Navbar {current} verticality={true} {nav_elements} />
		</div>
	</svelte:fragment>
	<!-- Page Route Content -->
	<slot />

	<svelte:fragment slot="pageFooter">
		<Footer />
	</svelte:fragment>
</AppShell>
