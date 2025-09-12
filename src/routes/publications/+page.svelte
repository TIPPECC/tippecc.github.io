<script>
	import Book from '$lib/icons/book-svgrepo-com.svelte';
	const paper = [
		{
			authors: 'Engelbrecht FA, Steinkopf J, Padavatan J, Midgley GF',
			year: '2024',
			title:
				'Projections of Future Climate Change in Southern Africa and the Potential for Regional Tipping Points',
			journal:
				'Sustainability of Southern African Ecosystems under Global Change: Science for Management and Policy Interventions',
			pages: '169-190',
			publisher: 'Springer International Publishing',
			doi: 'https://doi.org/10.1007/978-3-031-10948-5_7',
			citation:
				'Engelbrecht, F.A., Steinkopf, J., Padavatan, J., Midgley, G.F. (2024). Projections of Future Climate Change in Southern Africa and the Potential for Regional Tipping Points. In: von Maltitz, G.P., et al. Sustainability of Southern African Ecosystems under Global Change. Ecological Studies, vol 248. Springer, Cham. https://doi.org/10.1007/978-3-031-10948-5_7'
		},
		{
			authors:
				'Wassenaar T, Van der Waal C, Ndapulamo W, Tjiningire K, Dentlinger D, Tjiseua V, Engelbrecht FA',
			year: '2024',
			title: 'Determining risk of a regime shift in a coupled arid Social-Ecological System',
			journal: 'Journal Namibia Scientific Society',
			publisher: 'Namibia Scientific Society',
			volume: '70',
			pages: '9-28',
			doi: 'https://library.namscience.com/cgi-bin/koha/opac-detail.pl?biblionumber=97135'
		}
	];
	const conferences = [
		{
			authors:
				'Biskop S., Schreiter F., Zander F., Weber T., Remedio A., Kralisch S., Steinkopf J. and Engelbrecht F.',
			year: '2025',
			title: 'A Robust Signal of Soil Drying across Southern Africa in a Warmer World',
			conference:
				'International Conference on Southern Hemisphere Meteorology and Oceanography (ICSHMO)',
			date: '31 March – 4 April 2025',
			location: 'Cape Town, South Africa'
		},
		{
			authors: 'Engelbrecht F., Steinkopf J. and Biskop S.',
			year: '2024',
			title: 'Can a climate-change induced megadrought bring "day-zero" to Gauteng?',
			conference:
				'38th Annual Conference of South African Society for Atmospheric Sciences (SASAS)',
			date: '29-30 October 2024',
			location: 'Potchefstroom, South Africa'
		},
		{
			authors:
				'Perkins J., Remedio A., Weber T., Steinkopf J., Goikantswemang T., Buti K., Mashabane B., Montsiemang B. and Engelbrecht F.',
			year: '2024',
			title: 'Following the Ancient Footsteps to Survive the Anthropocene',
			conference: '38th Annual Conference of the South African Society for Atmospheric Sciences',
			date: '29-30 October 2024',
			location: 'Potchefstroom, South Africa'
		},
		{
			authors:
				'Remedio A., Weber T., Sein D., Steinkopf J., Padvatan J., Goikantswemang T., Dhliwayo M., Perkins J. and Engelbrecht F.',
			year: '2024',
			title:
				'Representing Historical Drought Conditions using the Latest High-Resolution Regional Climate Simulations over Southern Africa',
			conference: '38th Annual Conference of the South African Society for Atmospheric Sciences',
			date: '29-30 October 2024',
			location: 'Potchefstroom, South Africa'
		},
		{
			authors: 'Biskop S., Kralisch S., Lumsden T., Malherbe J., Moseki C. and Engelbrecht F.',
			year: '2024',
			title:
				'Hydrological projections for a ‘day-zero drought’ risk assessment in the Integrated Vaal River System, South Africa',
			conference: '9th GEWEX Open Science Conference',
			date: '8-12 July 2024',
			location: 'Sapporo, Japan'
		},
		{
			authors: 'Biskop S. and Engelbrecht F.',
			year: '2024',
			title: 'Methodologies in Attribution Modelling of Hydrological Extremes',
			conference:
				'Caribbean Climate Science Workshop Series: Detection & Attribution Science Workshop',
			date: '10-14 June 2024',
			location: 'Kingston, Jamaica'
		},
		{
			authors:
				'Remedio A., Weber T., Engelbrecht F., Biskop S., Steinkopf J., Padvatan J., Van der Waal C., Wassenaar W., Banda K., Tlhalerwa K. and Perkins J.',
			year: '2024',
			title:
				'Projected climate change signals for selected hotspot regions using regional climate simulations in southern Africa',
			conference: 'EGU General Assembly Conference Abstracts',
			date: '2024',
			location: 'Vienna, Austria'
		},
		{
			authors: 'Biskop S., Kralisch S., Weber T., Remedio A. and Engelbrecht F.',
			year: '2023',
			title:
				'Projected hydrological changes for agricultural risk assessment over southern Africa in a warmer world',
			conference: 'International Conference on Regional Climate ICRC-CORDEX 2023',
			date: '25-29 September 2023',
			location: 'Trieste, Italy'
		},
		{
			authors:
				'Engelbrecht F.A., Chang N., Steinkopf J., Malherbe J., Padavatan J., Thatcher M., Biskop S. and McGregor J.L.',
			year: '2023',
			title:
				'An African-based climate change event-attribution system using a regional climate Model',
			conference: 'International Conference on Regional Climate ICRC-CORDEX 2023',
			date: '25-29 September 2023',
			location: 'Trieste, Italy'
		},
		{
			authors: 'Remedio et al.',
			year: '2023',
			title:
				'Projected climate change signals for hotspot regions in southern Africa using regional climate simulations',
			conference: 'International Conference on Regional Climate ICRC-CORDEX 2023',
			date: '25-29 September 2023',
			location: 'Trieste, Italy'
		},
		{
			authors: 'Steinkopf J.A., Thatcher M., McGregor J.L. and Engelbrecht F.A.',
			year: '2023',
			title:
				'The latest projected climate change signal over Southern Africa using the Conformal Cubic Atmospheric Model (CCAM)',
			conference: 'International Conference on Regional Climate ICRC-CORDEX 2023',
			date: '25-29 September 2023',
			location: 'Trieste, Italy'
		}
	];
</script>

<div class="content-div">
	<div class="flex items-center">
		<h1 class="content-heading">Publications</h1>
		<Book />
	</div>

	<blockquote class="content-blockquote mb-4">
		This page provides an overview of the scientific output by members of the TIPPECC project. These
		contributions reflect the project’s research focus on hydrological modelling, extrem events,
		climate change impacts, tipping points and regional climate modelling in southern Africa. The
		list highlights the interdisciplinary and collaborative nature of the TIPPECC research team.
	</blockquote>

	<h1 class="content-heading">Peer-Reviewed Publications</h1>
	{#each paper as p}
		<div class="card p-4 m-2 mt-4 border border-5 border-[#D17208]">
			<div class="text-left mt-[-28px]">
				<span class="chip static-courser bg-[#D17208]"><b>{p.year}</b></span>
			</div>
			<div class="flex">
				<b class="text-lg underline underline-offset-4 decoration-[#D17208] ml-2">{p.title}</b><br
				/>
			</div>
			<blockquote class="mt-1 text-sm">
				<em>{p.authors}</em>. {p.year}. <br /><br />
				{p.journal}. {p.pages}. {p.publisher}.
				{#if p.doi}
					<a href={p.doi} target="_blank" class="underline">link</a>.<br />
				{/if}
			</blockquote>
		</div>
	{/each}

	<h1 class="content-heading">Conferences</h1>

	{#each conferences as c}
		<div class="card p-4 m-2 mt-4 border border-5 border-[#D17208]">
			<div class="text-left mt-[-28px]">
				<span class="chip static-courser bg-[#D17208]"><b>{c.year}</b></span>
			</div>
			<div class="flex">
				<b class="text-lg underline underline-offset-4 decoration-[#D17208] ml-2">{c.title}</b><br
				/>
			</div>
			<blockquote class="mt-1 text-sm">
				{c.authors}. {c.year}. <br /><br />
				{c.conference}. {c.date}. {c.location}.
				{#if c.doi}
					<a href={c.doi} target="_blank" class="underline">link</a>.<br />
				{/if}
			</blockquote>
		</div>
	{/each}
</div>
