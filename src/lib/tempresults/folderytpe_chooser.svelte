<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import folder_types from './folder_types.json';
	import selected from '$lib/icons/select-multiple-svgrepo-com.svg';
	import SelectBoundingBox from '$lib/components/SelectBoundingBox.svelte';

	export var filter: string = '';
	export var foldertype: string = 'CORDEX_raw_ind';
	export let filter_by_status: string = 'public';
	console.log('Status: ', filter_by_status);
	let current_category: string = foldertype.split('_')[0];
	export let bbox = [null, null, null, null];
	export let startDate = '';
	export let endDate = '';
	let showBoundingBox = false;

	//set_filter(current_category);

	var foldertypes: {
		key: string;
		display_name: string;
		description: string;
		citation: string;
		header_regex: string;
		lineage?: string;
		status: string;
		bbox?: string;
	}[] = folder_types;
	const foldertypes_full = foldertypes;
	// filter out the folder types that are not relevant
	console.log('Filter: ', filter_by_status);
	foldertypes = foldertypes
		.filter((x) => x.key.startsWith(filter))
		.filter((x) => x.status == filter_by_status || x.status == 'public');

	let categories: string[] = [];
	for (let x = 0; x < foldertypes.length; x++) {
		let cat = foldertypes[x].key.split('_')[0];
		if (!categories.includes(cat)) {
			categories.push(cat);
		}
	}
	const dispatch = createEventDispatcher();
	let current_foldertype = {};
	foldertypes = foldertypes_full.filter((x) => x.key.startsWith(current_category));

	function set_foldertype(new_type: string) {
		for (let x = 0; x < foldertypes.length; x++) {
			if (new_type == foldertypes[x].key) {
				console.log('NEW: ', new_type, ' ftype: ', foldertypes[x].key);
				foldertype = new_type;
				dispatch('foldertype_changed', foldertype);
				return;
			}
		}

		// default
		foldertype = foldertypes[0].key;
		current_foldertype = foldertypes[0];
		dispatch('foldertype_changed', foldertype);
	}

	function set_filter(filter: string) {
		foldertypes = foldertypes_full.filter((x) => x.key.startsWith(filter));
		current_category = filter;
	}
</script>

<!-- Backend Folder Content as checkboxes -->
<div class="bg-surface-600 z-30 ml-2">
	<div class="pl-2 pb-2 bg-surface-700">
		<div class="mb-1 mt-2 text-lg">
			<h3>1. Climate Model / Region</h3>

			<div class="text-sm ml-2">Select the climate model or region you want to explore.</div>
			<div class="flow gap-2 items-center">
				{#each categories as cat}
					<button
						type="button"
						class="btn-sm bg-[#873c07] m-1 text-lg rounded-md hover:bg-tertiary-500 {current_category ==
						cat
							? 'font-bold bg-[#873c07] underline text-white'
							: ''}"
						on:click={() => set_filter(cat)}
						>{cat.replace('CORDEX', 'CORDEX-CORE (RCM)').replace('CMIP6', 'CMIP6 (GCM)')}</button
					>
				{/each}
			</div>
			<div class="text-sm ml-2 italic mt-2">
				(GCM: Global Climate Model RCM: Regional Climate Model)
			</div>
		</div>
	</div>
	<div class="pl-2 pr-4 pb-2 bg-surface-700 mt-2">
		<div class="mb-1 mt-2 text-lg">
			<h3>2. Dataset Processing Level, Type & Aggregation</h3>

			<div class="text-sm ml-2 pb-2">
				Select the processing level: raw (model output) / bias-adjusted of data you want to explore,
				as well as the type (variables or indicators) and aggregation.
			</div>

			{#each foldertypes as ftype}
				<button
					type="button"
					class="btn-sm bg-[#b05803] m-1 text-lg rounded-md hover:bg-tertiary-500 {foldertype ==
					ftype.key
						? 'font-bold bg-[#b05803] underline text-white'
						: ''}"
					on:click={() => set_foldertype(ftype.key)}
					>{ftype.display_name.replace(current_category, '').replace('-CORE', '')}</button
				>
			{/each}
		</div>
		<div class="text-sm ml-2 italic mt-2">
			(Σ contain yearly, monthly, and seasonal aggregates as well as averages over 20/30-year
			periods)
		</div>
	</div>
	<div class="pl-2 pr-4 pb-2 bg-surface-700 mt-2 hidden md:block">
		<div class="mb-1 mt-2 text-lg" id="download-extent">
			<h3>3. Download Extent</h3>

			<div class="text-sm ml-2 pb-2">Set the spatial and/or temporal extent for your download.</div>
			<button
				type="button"
				class="btn-sm bg-[#b05803] m-1 text-lg rounded-md hover:bg-tertiary-500"
				on:click={() => (showBoundingBox = !showBoundingBox)}
			>
				{showBoundingBox ? 'Hide' : 'Show'} Bounding Box & Time Selection
			</button>
			{#if showBoundingBox}
				<SelectBoundingBox
					bind:boundingBox={bbox}
					bind:startDate
					bind:endDate
					startingExtent={JSON.parse(
						foldertypes.find((x) => x.key == foldertype)?.bbox ?? '[10, -35, 51, -5]'
					)}
				/>
			{/if}
		</div>
		<div class="text-sm ml-2 italic mt-2" />
	</div>
</div>

<div class="mt-6 w-[50%] border-t-2 border-white pt-1 border-l-2">
	<div class="flex ml-2">
		<span><img src={selected} alt="..." width="30px" class="mr-1" /></span>
		<h1 class="h4">
			Selected: {foldertypes.find((x) => x.key == foldertype)?.display_name ?? 'Please select'}
		</h1>
	</div>
	<ul class="list-disc">
		<li class="text-sm ml-10">
			{foldertypes.find((x) => x.key == foldertype)?.description ?? 'No description available'}
		</li>
		<li class="text-sm ml-10">
			{foldertypes.find((x) => x.key == foldertype)?.lineage ?? 'No lineage available'}
		</li>
		<li class="text-sm ml-10">
			Cite as: {foldertypes.find((x) => x.key == foldertype)?.citation ?? 'No citation available'}
		</li>
	</ul>
</div>

<style>
	.content-blockquote {
		border-left: 0px solid #93989a;
		padding-left: 2rem;
		margin-bottom: 1rem;
	}

	.content-blockquote h3 {
		margin-top: 0;
	}

	.btn-sm {
		padding: 0.25rem 0.5rem;
		font-size: 0.875rem;
	}
</style>
