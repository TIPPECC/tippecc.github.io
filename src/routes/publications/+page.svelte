<script>
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
			volume: '70',
			pages: '9-28',
			doi: 'https://library.namscience.com/cgi-bin/koha/opac-detail.pl?biblionumber=97135'
		}
	];
	const conferences = [
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

<svelte:head>
	<title>Publications</title>
</svelte:head>

<div class="content-div">
	<h1 class="content-heading">Publications</h1>

	{#each paper as p}
		<div class="card p-4 m-2 border border-5 border-[#D17208]">
			<div class="text-left mt-[-28px]"><span class="chip bg-[#D17208]"><b>{p.year}</b></span></div>
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
		<div class="card p-4 m-2 border border-5 border-[#D17208]">
			<div class="text-left mt-[-28px]"><span class="chip bg-[#D17208]"><b>{c.year}</b></span></div>
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
