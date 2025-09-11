<script lang="ts">
	import { onMount } from 'svelte';

	// Import necessary types
	/**
	 * Hint: - you would want to type annotate this as an Array
	 *       - but i can not get it working without ts errors
	 * @type {any}
	 */
	export let nav_elements;

	/**
	 * @type {string}
	 */
	export let current: string;

	/**
	 * @type {boolean}
	 */
	export let verticality: boolean;

	let zoomLevel = 1;

	function increaseZoom() {
		zoomLevel += 0.1;
		document.body.style.zoom = zoomLevel.toString();
	}

	function decreaseZoom() {
		zoomLevel = Math.max(0.1, zoomLevel - 0.1);
		document.body.style.zoom = zoomLevel.toString();
	}

	let isDrawerOpen = false; // State to toggle the drawer menu

	function toggleDrawer() {
		isDrawerOpen = !isDrawerOpen;
	}

	// replace local theme handling with shared store
	import { theme, toggleTheme, initTheme, setTheme } from '$lib/stores/theme';

	onMount(() => {
		// initialize theme store (will sync html.dark and localStorage)
		initTheme();

		let saved: string | null = null;
		try {
			saved = localStorage.getItem('theme');
		} catch (e) {
			saved = null;
		}

		if (saved === 'dark' || saved === 'light') {
			// use store helper to set theme
			setTheme(saved as 'dark' | 'light');
		} else {
			// adopt current html class (do NOT overwrite other attributes)
			const initial = document.documentElement.classList.contains('dark') ? 'dark' : 'light';
			setTheme(initial);
		}
	});
</script>

{#if verticality}
	<div class="z-40 bg-primary-900 grow w-full overflow-hidden bg-opacity-60 flex">
		<div class="grow-0 float-left">
			<ul title="Main Navigation">
				{#each nav_elements as el}
					<li
						class="float-left {current === el['label']
							? 'bg-secondary-500'
							: 'bg-primary-900 bg-transparent '}"
					>
						<a class="grow flex" href={el['path']}>
							<div class="m-3">
								{el['label']}
							</div>
						</a>
					</li>
				{/each}
			</ul>
		</div>

		<!-- Zoom Controls + Theme Toggle -->
		<div class="grow float-right items-center">
			<div class="zoom-controls flex justify-between items-center float-right pr-4 pt-4">
				<span class="text-white text-lg">A<span class="text-sm">A</span></span>
				<button
					class="zoom-icon text-white text-xl px-2 font-bold"
					on:click={decreaseZoom}
					title="Decrease Zoom">-</button
				>
				<button
					class="zoom-icon text-white text-xl px-2 font-bold"
					on:click={increaseZoom}
					title="Increase Zoom">+</button
				>

				<!-- Theme toggle button -->
				<button
					class="ml-3 px-2 py-1 rounded text-white"
					on:click={toggleTheme}
					aria-label={`Switch to ${$theme === 'light' ? 'dark' : 'light'} theme`}
					title={`Switch to ${$theme === 'light' ? 'dark' : 'light'} theme`}
				>
					{#if $theme === 'dark'}
						<!-- sun icon (white via currentColor) -->
						<svg
							xmlns="http://www.w3.org/2000/svg"
							width="18"
							height="18"
							viewBox="0 0 24 24"
							fill="none"
							aria-hidden="true"
							focusable="false"
							class="inline-block"
						>
							<g
								stroke="currentColor"
								stroke-width="1.6"
								stroke-linecap="round"
								stroke-linejoin="round"
								fill="none"
							>
								<circle cx="12" cy="12" r="4" stroke="currentColor" fill="currentColor" />
								<path
									d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"
									stroke="currentColor"
								/>
							</g>
						</svg>
					{:else}
						<!-- moon icon (white via currentColor) -->
						<svg
							xmlns="http://www.w3.org/2000/svg"
							width="18"
							height="18"
							viewBox="0 0 24 24"
							fill="currentColor"
							aria-hidden="true"
							focusable="false"
							class="inline-block"
						>
							<path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" fill="currentColor" />
						</svg>
					{/if}
				</button>
			</div>
		</div>
		<div class="">
			<div class="float-right pr-10">
				<figure>
					<section class="img-bg" />
					<svg
						xmlns:dc="http://purl.org/dc/elements/1.1/"
						xmlns:cc="http://creativecommons.org/ns#"
						xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#"
						xmlns:svg="http://www.w3.org/2000/svg"
						xmlns="http://www.w3.org/2000/svg"
						xmlns:sodipodi="http://sodipodi.sourceforge.net/DTD/sodipodi-0.dtd"
						xmlns:inkscape="http://www.inkscape.org/namespaces/inkscape"
						viewBox="0 0 276.90433 156.91885"
						height="50"
						xml:space="preserve"
						id="svg2"
						version="1.1"
						sodipodi:docname="Präsentation2.svg"
						inkscape:version="1.0.2-2 (e86c870879, 2021-01-15)"
						><sodipodi:namedview
							pagecolor="#ffffff"
							bordercolor="#666666"
							borderopacity="1"
							objecttolerance="10"
							gridtolerance="10"
							guidetolerance="10"
							inkscape:pageopacity="0"
							inkscape:pageshadow="2"
							inkscape:window-width="1436"
							inkscape:window-height="950"
							id="namedview50"
							showgrid="false"
							inkscape:zoom="0.82421875"
							inkscape:cx="608.31487"
							inkscape:cy="332.1487"
							inkscape:window-x="0"
							inkscape:window-y="0"
							inkscape:window-maximized="0"
							inkscape:current-layer="svg2"
						/><metadata id="metadata8"
							><rdf:RDF
								><cc:Work rdf:about=""
									><dc:format>image/svg+xml</dc:format><dc:type
										rdf:resource="http://purl.org/dc/dcmitype/StillImage"
									/><dc:title /></cc:Work
								></rdf:RDF
							></metadata
						><defs id="defs6"
							><clipPath id="clipPath18" clipPathUnits="userSpaceOnUse"
								><path
									style="clip-rule:evenodd"
									id="path16"
									d="M 0,1.2207e-4 H 960 V 540.00012 H 0 Z"
								/></clipPath
							><clipPath id="clipPath30" clipPathUnits="userSpaceOnUse"
								><path
									style="clip-rule:evenodd"
									id="path28"
									d="M 1.4305e-5,0 H 960.00001 V 540 H 1.4305e-5 Z"
								/></clipPath
							></defs
						><g id="g24" transform="matrix(1.2865718,0,0,-1.2142531,-102.0548,590.234)"
							><g clip-path="url(#clipPath30)" id="g26"
								><text
									id="text34"
									style="font-variant:normal;font-weight:bold;font-size:39.96px;font-family:Arial;-inkscape-font-specification:GillSansMT-Bold;writing-mode:lr-tb;fill:#ed7d31;fill-opacity:1;fill-rule:nonzero;stroke:none"
									transform="matrix(1,0,0,-1,79.728,393.77)"
									><tspan
										id="tspan32"
										y="0"
										x="0 34.765202 54.025921 86.153763 118.2816 149.57028 186.37344">TIPPECC</tspan
									></text
								>
							</g></g
						><path
							id="path36"
							style="fill:none;stroke:#41719c;stroke-width:2.84975;stroke-linecap:butt;stroke-linejoin:miter;stroke-miterlimit:10;stroke-dasharray:none;stroke-opacity:1"
							d="m 61.249755,1.3455264 c -9.44344,3.29063 -18.88687,6.56911 -24.57352,7.74694 -5.67378,1.1778196 -4.74745,-4.69916 -9.50777,-0.70427 -4.74873,3.9948896 -14.78399,18.6630696 -19.0103797,24.6493396 -4.22639,5.98627 -5.54641,7.27337 -6.33894,11.26827 -0.79253,3.98275 -0.26375,9.73831 1.58506,12.6768 1.8488,2.92635 6.8664297,2.22208 9.5077597,4.92987 2.64133,2.69564 1.45254,9.73831 6.33894,11.256119 4.8864,1.52996 17.56685,-1.760659 22.98332,-2.112799 5.4036,-0.35213 6.20128,-0.35213 9.50776,0 3.29363,0.35214 8.58144,0.24285 10.29258,2.112799 1.72401,1.88209 -1.58248,5.52485 0,9.15547 1.58248,3.64276 8.452783,7.74694 9.507763,12.6768 1.05499,4.92987 -3.692463,10.794715 -3.16496,16.902415 0.52749,6.10769 3.5638,13.15036 6.3428,19.71947 2.76613,6.56911 6.99895,15.846 10.29257,19.71947 3.30649,3.87346 5.41647,5.03915 9.50777,3.52133 4.0913,-1.52996 11.489082,-8.4512 15.052892,-12.6768 3.57667,-4.2256 4.63166,-8.57263 6.3428,-12.6768 1.724,-4.10418 2.84332,-8.03836 3.96264,-11.97254"
						/><path
							id="path38"
							style="fill:#5b9bd5;fill-opacity:1;fill-rule:evenodd;stroke:none;stroke-width:1.24989"
							d="m 42.993305,57.006886 c 0,-4.99058 4.97903,-9.03404 11.11598,-9.03404 6.13694,0 11.11598,4.04346 11.11598,9.03404 0,4.99058 -4.97904,9.03405 -11.11598,9.03405 -6.13695,0 -11.11598,-4.04347 -11.11598,-9.03405 z"
						/><path
							id="path40"
							style="fill:none;stroke:#8faadc;stroke-width:3.74967;stroke-linecap:butt;stroke-linejoin:miter;stroke-miterlimit:10;stroke-dasharray:none;stroke-opacity:1"
							d="m 42.993305,57.006886 c 0,-4.99058 4.97903,-9.03404 11.11598,-9.03404 6.13694,0 11.11598,4.04346 11.11598,9.03404 0,4.99058 -4.97904,9.03405 -11.11598,9.03405 -6.13695,0 -11.11598,-4.04347 -11.11598,-9.03405 z"
						/></svg
					>
				</figure>
			</div>
		</div>
	</div>
{:else}
	<!-- Drawer Button for Mobile Screens -->
	<button on:click={toggleDrawer} class="btn-icon z-40 bg-surface-900 btn-icon-sm lg:!hidden p-2">
		<i class="fa-solid fa-bars text-xl" />Menu
	</button>

	<!-- Theme toggle next to drawer button on small screens -->
	<button
		on:click={toggleTheme}
		class="btn-icon z-40 btn-icon-sm lg:!hidden p-2 ml-2"
		aria-label={`Switch to ${$theme === 'light' ? 'dark' : 'light'} theme`}
		title={`Switch to ${$theme === 'light' ? 'dark' : 'light'} theme`}
	>
		{#if $theme === 'light'}
			<!-- sun icon (white) -->
			<svg
				xmlns="http://www.w3.org/2000/svg"
				width="18"
				height="18"
				viewBox="0 0 24 24"
				fill="none"
				aria-hidden="true"
				focusable="false"
				class="inline-block text-white"
			>
				<g stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
					<circle cx="12" cy="12" r="4" stroke="currentColor" fill="currentColor" />
					<path
						d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"
						stroke="currentColor"
					/>
				</g>
			</svg>
		{:else}
			<!-- moon icon (white) -->
			<svg
				xmlns="http://www.w3.org/2000/svg"
				width="18"
				height="18"
				viewBox="0 0 24 24"
				fill="currentColor"
				aria-hidden="true"
				focusable="false"
				class="inline-block text-white"
			>
				<path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" fill="currentColor" />
			</svg>
		{/if}
	</button>

	<!-- Horizontal Navbar for Mobile Screens -->
	{#if isDrawerOpen}
		<div class="z-40 bg-primary-600 grow overflow-hidden">
			<div class="grow">
				<ul class="flex flex-col">
					{#each nav_elements as el}
						<li
							class="flex items-center {current === el['label']
								? 'bg-secondary-500'
								: 'bg-transparent'}"
						>
							<a class="grow flex" href={el['path']}>
								<div class="m-3 ml-7">
									{el['label']}
								</div>
							</a>
						</li>
					{/each}
				</ul>
			</div>
		</div>
	{/if}
{/if}
