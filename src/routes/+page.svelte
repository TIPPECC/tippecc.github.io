<script>
	import { onMount } from 'svelte';
	import { base } from '$app/paths';
	import { browser } from '$app/environment';
	import Carousel from 'svelte-carousel';
	import goals from '$lib/icons/goals-svgrepo-com.svg';
	import background from '$lib/icons/background-svgrepo-com.svg';
	import { fade, fly, scale, blur } from 'svelte/transition';
	import { cubicInOut } from 'svelte/easing';
	import icon from '$lib/tippecc_icon.svg';
	import { Source } from 'ol/source';

	let visible = false;
	let carousel; // for calling methods of the carousel instance
	onMount(() => {
		visible = true;
	});

	function typewriter(node, { speed = 1 }) {
		const valid = node.childNodes.length === 1 && node.childNodes[0].nodeType === Node.TEXT_NODE;

		if (!valid) {
			throw new Error(`This transition only works on elements with a single text node child`);
		}

		const text = node.textContent;
		const duration = text.length / (speed * 0.01);

		return {
			duration,
			tick: (/** @type {number} */ t) => {
				const i = ~~(text.length * t);
				node.textContent = text.slice(0, i);
			}
		};
	}

	function fadeScale(node, { delay = 0, duration = 200, easing = (x) => x, baseScale = 0 }) {
		const o = +getComputedStyle(node).opacity;
		const m = getComputedStyle(node).transform.match(/scale\(([0-9.]+)\)/);
		const s = m ? m[1] : 1;
		const is = 1 - baseScale;

		return {
			delay,
			duration,
			css: (t) => {
				const eased = easing(t);
				return `opacity: ${eased * o}; transform: scale(${eased * s * is + baseScale})`;
			}
		};
	}
</script>

{#if browser}
	<div class="relative w-full grow flex h-[15rem]">
		<div class="absolute z-30 grow flex justify-center w-full pt-2 pointer-events-none">
			<!--<h1 class="max-sm:text-3xl max-lg:text-4xl lg:text-4xl">Welcome to the TIPPECC project</h1>-->
			<div class="flex items-center grow w-full justify-center max-h-[10rem]">
				<div class="space-y-10 text-center flex flex-col items-center">
					<h3 class="h3" />

					<img src={icon} alt="..." />
				</div>
			</div>
		</div>
		<!--	<Carousel
			bind:this={carousel}
			arrows={false}
			autoplay={true}
			duration="500"
			autoplayDuration="5000"
			dots={false}
		>
			<div class="flex items-center grow w-full justify-center max-h-[30rem]">
				<div class="space-y-10 text-center flex flex-col items-center max-h-96">

					<h3 class="h3" />

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
							height="156.91885"
							width="276.90433"
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
											x="0 34.765202 54.025921 86.153763 118.2816 149.57028 186.37344"
											>TIPPECC</tspan
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
			<div class="flex items-center grow w-full justify-center max-h-[30rem]">
				<img
					class="absolute object-contain h-4/5 w-4/5 z-10 pointer-events-none"
					src="{base}/IMG_2338.JPEG"
					alt="..."
				/>
				<img
					class="object-fill w-full grow z-0 blur pointer-events-none"
					src="{base}/IMG_2338.JPEG"
					alt="..."
				/>
			</div>
			<div class="flex items-center grow w-full justify-center max-h-[30rem]">
				<img
					class="absolute object-contain h-4/5 w-4/5 z-10 pointer-events-none"
					src="{base}/IMG_2306.JPEG"
					alt="..."
				/>
				<img
					class="object-fill w-full grow z-0 blur pointer-events-none"
					src="{base}/IMG_2306.JPEG"
					alt="..."
				/>
			</div>
		</Carousel>-->
	</div>
{/if}
<div class="grow flex w-full justify-center py-2 bg-primary-900/80">
	<h1 class="h3">
		Climate change information for adapting to regional tipping points in southern Africa
	</h1>
</div>

<div class="content-div">
	<div class="flex pt-4">
		<h1 class="content-heading">Goals</h1>
		<img src={goals} alt="..." width="25px" />
	</div>

	<blockquote class="content-blockquote">
		Through a process of co-production, co-development and targeted research, identify the critical
		tipping points that may exist in the southern African climate and land-use system, across the
		sectors of food security, water security and biodiversity conservation.<br /><br />
		Assess the timing and location of potential transgression of tipping point thresholds in southern
		Africa under climate change, through the use of detailed, state-of-the-art projections of regional
		climate change and a knowledge of system dynamics and tolerances.<br /><br />
		Formulate adaptation options through a co-production process with stakeholders, to increase the resilience
		of southern African food, water and biodiversity conservation systems to climate change induced tipping
		points.<br /><br />
		Develop a climate services web-portal, to disseminate authoritative climate change projections, climate
		change indices, projections of climate change impacts and adaptation options to a wide range of stakeholders
		in southern Africa, in an accessible and understandable format.
	</blockquote>

	<!--<div class="flex pt-4">
		<h1 class="content-heading">Background</h1>
		<img src={background} alt="..." width="25px" />
	</div>
	<div>
		Southern Africa has been identified as a climate change hot-spot in the recent Intergovernmental
		Panel on Climate Change Special Report on Global Warming of 1.5 °C (IPCC SR1.5; Hoegh- Guldberg
		et al., 20181). The region is currently warming at about twice the global rate and further
		drastic warming is projected to occur during the 21st century under low mitigation climate
		change futures (Engelbrecht et al., 2015). Moreover, southern Africa is likely to become
		generally drier under climate change, as concluded by the IPCC Assessment Reports Four and Five
		(AR4 and AR5) and SR1.5. Given that much of the region is semi-arid with a hot and dry climate,
		the projected further warming and drying limit the options for adaptation. This, in combination
		with generally low socioeconomic adaptive capacity of a developing region renders the southern
		Africa vulnerable to future climate change impacts. A particular risk faced by the region is
		that climate change and related impacts may not occur gradually and incrementally over the next
		few decades, but rather abruptly, irreversibly and with little warning. Such changes are
		referred to as ‘tipping points’. They can potentially occur in climatological, hydrological,
		agricultural and ecological systems, alone or collectively, with profound consequences for the
		capacity of those systems to support human wellbeing and biological diversity. An example of
		such a threshold-based risk relates to water security. Unprecedented multi-year droughts in
		combination with rising water demand resulting from urban, industrial and agricultural growth
		may lead to cities running out of allocable water, the socalled “day zero” events. These risks
		extend to very many rural areas in southern Africa where water shortages may impel
		long-resilient agricultural and livestock systems over the threshold of collapse (e.g. Funder et
		al., 2015). The livestock industry across the southern African rangelands is also at risk of
		collapse due to a tipping point imposed by physiologically-intolerable temperatures. This
		threshold in combination with multi-year droughts could also induce tipping points in the
		sustainable conservation of flora and fauna in conservation areas with fixed and artificial
		boundaries.
		<br />
		There is an urgent need in southern Africa to know which tipping points may exist in the water, food
		and biodiversity systems, to establish as far as possible the circumstances under which they could
		be transgressed, and what actions are required to avoid them or to safeguard against the collapse
		of these systems in the event this is unavoidable. These are the main aims of this project: to generate
		probabilistic projections of the occurrence of climate change induced tipping points in southern
		Africa and to provide a comprehensive range of climate services, closely informed by and co-developed
		with various actors (e.g. policymakers, water managers, commercial agriculture, rural communities
		and conservation practitioners) with co-produced adaptation options to safeguard against the occurrence
		of such tipping points. In particular, through a co-production process across the countries of Zambia,
		Namibia, Botswana and South Africa, the project will provide climate services and formulate actionable
		strategies for adaptation to selected threshold-based changes. A special focus of will be regional-scale
		adaptation, through which SADC countries can collaborate across national boundaries to enhance their
		collective resilience to climate change.
	</div>-->
</div>

<style lang="postcss">
	figure {
		@apply flex relative flex-col;
	}
	figure svg,
	.img-bg {
		@apply w-64 h-64 md:w-80 md:h-80;
	}
	/*	.img-bg {
		@apply absolute z-[-1] rounded-full blur-[50px] transition-all;
		animation: pulse 5s cubic-bezier(0, 0, 0, 0.5) infinite, glow 5s linear infinite;
	}
	@keyframes glow {
		0% {
			@apply bg-primary-400/50;
		}
		33% {
			@apply bg-secondary-400/50;
		}
		66% {
			@apply bg-tertiary-400/50;
		}
		100% {
			@apply bg-primary-400/50;
		}
	}
	@keyframes pulse {
		50% {
			transform: scale(1.5);
		}
	}*/
</style>
