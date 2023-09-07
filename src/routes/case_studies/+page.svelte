<script>
	import { Accordion, AccordionItem } from '@skeletonlabs/skeleton';
	import search_pin from '$lib/icons/search-pin-svgrepo-com.svg';
	import water from '$lib/icons/water-drop-svgrepo-com.svg';
	import income from '$lib/icons/other-income-svgrepo-com.svg';
	import fence from '$lib/icons/fence-for-horses-jumps-svgrepo-com.svg';
	import cow from '$lib/icons/cow-silhouette-svgrepo-com.svg';
	import no_water from '$lib/icons/no-water-svgrepo-com.svg';
	import maize from '$lib/icons/corn-svgrepo-com.svg';
	import CaseStudy from '$lib/case_study.svelte';
	import { base } from '$app/paths';

	// Workaround for missing tailwind classes
	// bg-[#D17208] border-[#D17208] decoration-[#D17208]
	// bg-[#B93F4A] border-[#B93F4A] decoration-[#B93F4A]
	// bg-[#98B1D8] border-[#98B1D8] decoration-[#98B1D8]
	// bg-[#26D7D9] border-[#26D7D9] decoration-[#26D7D9]
	// bg-[#6B9B2A] border-[#6B9B2A] decoration-[#6B9B2A]
</script>

<div class="content-div">
	<div class="flex">
		<h1 class="content-heading">Case Studies</h1>
		<img src={search_pin} alt="..." width="30px" />
	</div>

	<blockquote class="content-blockquote mb-4">
		TIPPECC will look within WP 4 into several case studies on different scales in southern Africa.
		This will include the investigation of tipping points related to “day zero” events in southern
		Africa, to the cattle industry in southern Africa, to the maize crop in southern Africa, to
		rural water security in the upper Zambezi, to livelihoods in arid Namibia and to the
		conservation of mammal biodiversity and related adaptation options.
	</blockquote>

	<div class="grid md:grid-cols-2 max-md:grid-cols-1 pt-4">
		<CaseStudy
			wp="Case Study 1"
			color="#D17208"
			icon={water}
			title="Rural water supply (Upper Zambezi / Barotse floodplain)"
			description="."
			image="{base}/IMG_2338.JPEG"
		/>

		<CaseStudy
			wp="Case Study 2"
			color="#B93F4A"
			icon={income}
			title="Livelihoods of communities living in semi-arid regions"
			description=""
			image="{base}/IMG_2338.JPEG"
		/>
		<CaseStudy
			wp="Case Study 3"
			color="#98B1D8"
			icon={fence}
			title="Transboundary conservation"
			description=""
			image="{base}/IMG_2338.JPEG"
		/>
		<CaseStudy
			wp="Case Study 4"
			color="#98B1D8"
			icon={no_water}
			title="“day zero” events"
			description=""
			image="{base}/IMG_2338.JPEG"
		/>
		<CaseStudy
			wp="Case Study 5"
			color="#98B1D8"
			icon={cow}
			title="cattle industry"
			description=""
			image="{base}/IMG_2338.JPEG"
		/>
		<CaseStudy
			wp="Case Study 6"
			color="#98B1D8"
			icon={maize}
			title="maize crop"
			description=""
			image="{base}/IMG_2338.JPEG"
		/>
	</div>
</div>
