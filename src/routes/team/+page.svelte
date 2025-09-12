<script>
	import { base } from '$app/paths';
	import Group from '$lib/icons/group-svgrepo-com.svelte';
	import OrcidIcon from '$lib/icons/orcid-svgrepo-com.svelte';
	import WebsiteIcon from '$lib/icons/web-svgrepo-com.svelte';
	import { API_URL } from '../../app.config';
	//	import team from '../team/team.json';

	/** @type {import('./$types').PageData} */
	export let data;

	/**
	 * @type {any[string]}
	 */
	let color = [];
	color['WITS-GCI'] = 'bg-violet-500';
	color['GERICS'] = 'bg-green-500';
	color['Uni Jena'] = 'bg-yellow-500';
	color['UNZA-IWRMC'] = 'bg-blue-500';
	color['Gobabeb'] = 'bg-red-500';
	color['NUST'] = 'bg-red-500';
	color['UB'] = 'bg-indigo-500';

	/**
	 * @type {any[string]}
	 */
	let team_array = [];
	let filter_value = '';
	let team = data.result;
	team_array = team.reverse();
	team_array = team_array.sort(compare);
	// @ts-ignore
	team_array.sort(
		(/** @type {{ related_org: string; }} */ a, /** @type {{ related_org: string; }} */ b) =>
			//	b.last_name.toLowerCase() - a.last_name.toLowerCase() ||
		
			(b.related_org === 'GERICS') - (a.related_org === 'GERICS') ||
			(b.related_org === 'Uni Jena') - (a.related_org === 'Uni Jena') ||
			(b.related_org === 'WITS-GCI') - (a.related_org === 'WITS-GCI') ||
			(b.related_org === 'NUST') - (a.related_org === 'NUST') ||
			(b.related_org === 'Gobabeb') - (a.related_org === 'Gobabeb')
	);

	function compare(a, b) {
		if (a.last_name < b.last_name) {
			return -1;
		}
		if (a.last_name > b.last_name) {
			return 1;
		}
		return 0;
	}

	// team_array  = team_array.filter((team) => team.org =="Uni Jena")

	/**
	 * @param {string} value
	 */
	function set_filter(value) {
		filter_value = value;
		team_array = team.filter(
			(/** @type {{ related_org: string; }} */ team) => team.related_org == value
		);
	}
	function remove_filter() {
		filter_value = '';
		team_array = team;
	}
</script>

<div class="content-div">
	<div class="flex items-center">
		<h1 class="content-heading">Team</h1>
		<Group />
	</div>
	<blockquote class="content-blockquote mb-4">
		TIPPECC is coordinated by: <br />
		<div class="pl-4 italic">
			Global Change Institute (GCI) at University of the Witwatersrand (WITS) in South Africa
			<button on:click={() => set_filter('WITS-GCI')} title="filter by"
				><span class="chip {color['WITS-GCI']} pl-2"><b> WITS-GCI</b></span></button
			>
		</div>
		<br />

		Collaborating partners:<br />
		<div class="pl-4 italic">
			Climate Service Center Germany (GERICS), Helmholtz-Zentrum Hereon Hamburg, Germany
			<button on:click={() => set_filter('GERICS')} title="filter by"
				><span class="chip {color['GERICS']} pl-2"><b> GERICS</b></span></button
			>
		</div>
		<div class="pl-4 italic">
			Friedrich Schiller University Jena, Germany
			<button on:click={() => set_filter('Uni Jena')} title="filter by"
				><span class="chip {color['Uni Jena']} pl-2"><b> Uni Jena</b></span></button
			>
		</div>
		<div class="pl-4 italic">
			University of Zambia
			<button on:click={() => set_filter('UNZA-IWRMC')} title="filter by"
				><span class="chip {color['UNZA-IWRMC']} pl-2"><b> UNZA-IWRMC</b></span></button
			>
		</div>
		<div class="pl-4 italic">
			Gobabeb Namib Research Institute
			<button on:click={() => set_filter('Gobabeb')} title="filter by"
				><span class="chip {color['Gobabeb']} pl-2"><b> Gobabeb</b></span></button
			>
			<button on:click={() => set_filter('NUST')} title="filter by"
				><span class="chip {color['NUST']} pl-2"><b> NUST</b></span></button
			>
		</div>
		<div class="pl-4 italic">
			University of Botswana
			<button on:click={() => set_filter('UB')} title="filter by"
				><span class="chip {color['UB']} pl-2"><b> UB</b></span></button
			>
		</div>
	</blockquote>
	{#if filter_value != ''}
		<div>
			Filtered by: <span class="chip static-courser {color[filter_value]}"
				><b>{filter_value}</b></span
			><button on:click={() => remove_filter()} class="pl-4"
				><span class="underline"><em>remove filter</em></span></button
			>
		</div>
	{/if}
	<section>
		<div class="w-full text-token grid grid-cols-1 md:grid-cols-2 gap-4 pt-10">
			{#each team_array as member}
				{#if member.first_name}
					<div
						id={member.first_name.toLowerCase() + '_' + member.last_name.toLowerCase()}
						class="card mt-4 p-2 flex flex-col w-full border border-5 border-white scroll-m-6"
					>
						{#if member.related_org}
							<div class="text-left mt-[-28px]">
								<span class="chip static-courser {color[member.related_org]}"
									><b>{member.related_org}</b></span
								>
							</div>
						{/if}

						<div class="flex">
							<div>
								<figure
									class="avatar flex aspect-square text-surface-50 font-semibold justify-center items-center overflow-hidden isolate bg-surface-400-500-token w-20 rounded-full"
									data-testid="avatar"
								>
									<img
										class="avatar-image w-full h-full object-cover"
										src={member.image ? API_URL + member.image : '/rain.png'}
										alt=""
										style=""
									/>
								</figure>
							</div>
							<div class="pl-5">
								<h3 class="h3">
									{#if member.title}{member.title} {/if}{member.first_name}
									{member.last_name}
								</h3>
								{#if member.website}
									<a
										href={member.website}
										target="_blank"
										rel="noopener noreferrer"
										class="pl-1 underline flex items-center gap-1 whitespace-nowrap"
									>
										<WebsiteIcon />
										<span>website</span>
									</a>
								{/if}
								{#if member.person_orcid}
									<a
										href={"https://orcid.org/" + member.person_orcid}
										target="_blank"
										rel="noopener noreferrer"
										class="pl-1 underline flex items-center gap-1 whitespace-nowrap"
									>
										<OrcidIcon />
										<span>{member.person_orcid}</span>
									</a>
								{/if}
							</div>
						</div>
						<div />
						<hr class="m-2" />
						<div class="">
							<div class="pb-2"><em>{member.position}</em></div>
						</div>
						<div class="pt-2 mt-auto w-full">
							<div class="flex justify-end">
								[
								{#each member.work_packages as wp}
									<a href="/work_packages/{wp?.toLowerCase()}" class="m-1 underline">{wp}</a>
								{/each}
								]
							</div>
						</div>
					</div>
				{/if}
			{/each}
		</div>
	</section>
</div>
