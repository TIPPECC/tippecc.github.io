<script>
	import { Accordion, AccordionItem } from '@skeletonlabs/skeleton';
	import collaboration_svg from '$lib/icons/collaboration-picture-visualize-person-svgrepo-com.svg';
	import weather from '$lib/icons/weather-temperature-forecast-svgrepo-com .svg';
	import graph from '$lib/icons/graph-analytics-business-2-svgrepo-com.svg';
	import networking from '$lib/icons/networking-collaboration-svgrepo-com.svg';
	import change_without from '$lib/icons/change_without_return-svgrepo-com.svg';
	import host_website from '$lib/icons/host-website-se-svgrepo-com.svg';
	import move from '$lib/icons/move-up-svgrepo-com_change.svg';
	import { goto } from '$app/navigation';
	import WorkPackage from '$lib/work_package.svelte';

	// Workaround for missing tailwind classes
	// bg-[#D17208] border-[#D17208] decoration-[#D17208]
	// bg-[#B93F4A] border-[#B93F4A] decoration-[#B93F4A]
	// bg-[#98B1D8] border-[#98B1D8] decoration-[#98B1D8]
	// bg-[#26D7D9] border-[#26D7D9] decoration-[#26D7D9]
	// bg-[#6B9B2A] border-[#6B9B2A] decoration-[#6B9B2A]
</script>

<div class="content-div">
	<div class="flex">
		<h1 class="content-heading">Work Packages</h1>
		<img src={networking} alt="..." width="30px" />
	</div>

	<blockquote class="content-blockquote mb-4">
		The TIPPECC project is organized into five work packages (WPs) that will closely work together
		to achieve the project objectives.
	</blockquote>

	<div class="grid md:grid-cols-2 max-md:grid-cols-1 pt-4">
		<WorkPackage
			wp="WP 1"
			color="#D17208"
			icon={move}
			title="Regional projections of future climate change"
			description="This WP will set the data foundation that is needed to derive the climate indicators for the
        analysis of climate impacts (WP2), regional tipping points (WP4) and the web-portal based
        climate services (WP3)."
		/>

		<WorkPackage
			wp="WP 2"
			color="#B93F4A"
			icon={graph}
			title="Synthesis of comprehensive information on climate change impacts"
			description="This WP will develop a range of indicators of climate change impacts across the sectors of
        water, agriculture and biodiversity that will be used to inform engagements with various
        actors to co-develop appropriate adaptation actions."
		/>
		<WorkPackage
			wp="WP 3"
			color="#98B1D8"
			icon={host_website}
			title="Climate Services Gateway through co-production"
			description="The objective of this WP is the development of a web-based Climate Service Gateway with and
        for scientists and stakeholders, which will serve as a platform for easy access to
        projections of regional climate change and climate impact indicators related to water and
        food security and biodiversity conservation."
		/>
		<WorkPackage
			wp="WP 4"
			color="#26D7D9"
			icon={change_without}
			title="Regional Tipping Points and co-development of adaptation options"
			description="The WP will analyse regional tipping points in the southern African region towards the
        provision of climate services such as informing adaptation actions and policy. This will
        be done through a series of engagements with various actors within case studies to co-develop appropriate
        adaptation actions."
		/>
		<WorkPackage
			wp="WP 5"
			color="#6B9B2A"
			icon={collaboration_svg}
			title="Stakeholder engagements (continuos participatory co-production)"
			description="This WP will ensure that the project is co-produced with stakeholders and that the project
            activities are aligned with the needs of the stakeholders."
		/>

		<!--		<div
			class="card p-4 m-1 border border-5 border-[#8B910A] mt-5

    "
		>
		<div class="flex">
				<img src="static/images/leadership-svgrepo-com.svg" alt="..." width="30px" />
				<b class="text-lg underline underline-offset-4 decoration-[#8B910A] ml-2">General Facts</b>
			</div>
			<blockquote class="mt-1 text-sm">
				<ul class="list">
					<li>
						<span>&#8226;</span>
						<span class="flex-auto"
							><span class="font-bold pr-4">Project leader:</span>Francois Engelbrecht</span
						>
					</li>
					<li>
						<span>&#8226;</span>
						<span class="flex-auto"
							><span class="font-bold pr-4">Project period:</span> 3 years</span
						>
					</li>
					<li>
						<span>&#8226;</span>
						<span class="flex-auto"
							><span class="font-bold pr-4">Project founder:</span>BMBF ..</span
						>
					</li>
				</ul>
			</blockquote>
		</div>-->
	</div>
</div>
