<script>
	import Search_pin from '$lib/icons/search-pin-svgrepo-com.svelte';
	import Water from '$lib/icons/water-drop-svgrepo-com.svelte';
	import Income from '$lib/icons/other-income-svgrepo-com.svelte';
	import Fence from '$lib/icons/fence-for-horses-jumps-svgrepo-com.svelte';
	import Cow from '$lib/icons/cow-silhouette-svgrepo-com.svelte';
	import No_water from '$lib/icons/no-water-svgrepo-com.svelte';
	import Maize from '$lib/icons/corn-svgrepo-com.svelte';
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
	<div class="flex items-center">
		<h1 class="content-heading">Case Studies</h1>
		<Search_pin />
	</div>

	<blockquote class="content-blockquote mb-4">
		TIPPECC will look within WP 4 into several case studies on different scales in southern Africa.
		This will include the investigation of tipping points and related adaptation options related to
		“day zero” events, to the cattle industry, and to the maize crop in southern Africa, to rural
		water security in the upper Zambezi, to livelihoods in arid Namibia and to the conservation of
		mammal biodiversity.
	</blockquote>

	<div class="grid md:grid-cols-2 max-md:grid-cols-1 pt-4">
		<CaseStudy
			wp="Case Study 1"
			color="#D17208"
			icon={Water}
			title="Rural water supply (Upper Zambezi / Barotse floodplain)"
			description=""
			image="{base}/IMG_2338.webp"
		/>

		<CaseStudy
			wp="Case Study 2"
			color="#B93F4A"
			icon={Income}
			title="Livelihoods of communities living in semi-arid regions"
			description=""
			image="{base}/case_study_2.webp"
		/>
		<CaseStudy
			wp="Case Study 3"
			color="#98B1D8"
			icon={Fence}
			title="Transboundary conservation"
			description=""
			image="{base}/IMG_2338.webp"
		/>
		<CaseStudy
			wp="Case Study 4"
			color="#98B1D8"
			icon={No_water}
			title="“day zero” events"
			description="no"
			image="{base}/IMG_2338.webp"
		/>
		<CaseStudy
			wp="Case Study 5"
			color="#98B1D8"
			icon={Cow}
			title="cattle industry"
			description="no"
			image="{base}/IMG_2338.webp"
		/>
		<CaseStudy
			wp="Case Study 6"
			color="#98B1D8"
			icon={Maize}
			title="maize crop"
			description="no"
			image="{base}/IMG_2338.webp"
		/>
	</div>
</div>
