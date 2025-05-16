<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import folder_types from './folder_types.json';
	import selected from '$lib/icons/select-multiple-svgrepo-com.svg';

	export var filter: string = '';
	export var foldertype: string = 'CORDEX_raw_ind';
	export let filter_by_status: string = 'public';
	console.log('Status: ', filter_by_status);
	let current_category: string = foldertype.split('_')[0];

	//set_filter(current_category);

	var foldertypes: {
		key: string;
		display_name: string;
		description: string;
		citation: string;
		header_regex: string;
		lineage: string;
		status: string;
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
<div class="pl-4 pb-2 bg-surface-700">
	<div class="mb-4 mt-2 text-lg font-semibold">
		<h3>Model Family or Region</h3>

		<div class="text-sm ml-2">Select the model family or the region you want to explore.</div>
		<div class="flow gap-2 items-center">
			{#each categories as cat}
				<button
					type="button"
					class="btn-sm bg-[#873c07] m-1 text-lg rounded-md hover:bg-tertiary-500 {current_category ==
					cat
						? 'font-bold bg-[#873c07] underline text-white'
						: ''}"
					on:click={() => set_filter(cat)}>{cat.replace('CORDEX', 'CORDEX-CORE')}</button
				>
			{/each}
		</div>
	</div>
</div>
<div class="pl-4 pb-2 bg-surface-700 mt-2">
	<div class="mb-4 mt-2 text-lg font-semibold">
		<h3>Type of Dataset</h3>
		<div class="text-sm ml-2 pb-2">
			Select the type of data you want to explore. Raw or bias adjusted. Variables or indicator. Σ
			contain average over 20/years periods.
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
</div>
<div class="mt-6">
	<div class="flex ml-2">
		<span><img src={selected} alt="..." width="30px" class="mr-1" /></span>
		<h1 class="h4">
			{foldertypes.find((x) => x.key == foldertype)?.display_name ?? 'Please select'}
		</h1>
	</div>
	<li class="text-sm ml-10">
		{foldertypes.find((x) => x.key == foldertype)?.description ?? 'No description available'}
	</li>
	<li class="text-sm ml-10">
		{foldertypes.find((x) => x.key == foldertype)?.lineage ?? 'No lineage available'}
	</li>
	<li class="text-sm ml-10">
		Cite as: {foldertypes.find((x) => x.key == foldertype)?.citation ?? 'No citation available'}
	</li>
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
