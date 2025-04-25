<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import folder_types from './folder_types.json';

	export var filter: string = '';
	export var foldertype: string = 'CORDEX_raw_ind';

	var foldertypes: {
		key: string;
		display_name: string;
		description: string;
		citation: string;
		header_regex: string;
		lineage: string;
	}[] = folder_types;
	const foldertypes_full = foldertypes;
	// filter out the folder types that are not relevant
	if (filter.length > 0) {
		foldertypes = foldertypes.filter((x) => x.key.startsWith(filter));
	}
	let categories: string[] = [];
	for (let x = 0; x < foldertypes.length; x++) {
		let cat = foldertypes[x].key.split('_')[0];
		if (!categories.includes(cat)) {
			categories.push(cat);
		}
	}
	const dispatch = createEventDispatcher();
	let current_foldertype = {};
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
	}
</script>

<!-- Backend Folder Content as checkboxes -->
<div class="">
	<h3>1. Filter Categories</h3>
	<div class="flow gap-2 items-center">
		{#each categories as cat}
			<button
				type="button"
				class="btn bg-[#078715] m-2 rounded-md {foldertype == cat
					? 'font-bold bg-[#078715] text-white'
					: ''}"
				on:click={() => set_filter(cat)}>{cat}</button
			>
		{/each}
	</div>
	<div>
		<h3>2. Select Collections</h3>
		{#each foldertypes as ftype}
			<button
				type="button"
				class="btn bg-[#5e0787] m-2 rounded-md {foldertype == ftype.key
					? 'font-bold bg-[#5e0787] text-white'
					: ''}"
				on:click={() => set_foldertype(ftype.key)}>{ftype.display_name}</button
			>
		{/each}
	</div>
</div>
<h3>Selected Collections: {foldertype}</h3>
<div class="text-sm m-2">
	{foldertypes.find((x) => x.key == foldertype)?.description ?? 'No description available'}
</div>
<div class="text-sm m-2">
	{foldertypes.find((x) => x.key == foldertype)?.lineage ?? 'No lineage available'}
</div>
<div class="text-sm m-2">
	{foldertypes.find((x) => x.key == foldertype)?.citation ?? 'No citation available'}
</div>
