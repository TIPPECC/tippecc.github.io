<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import folder_types from './folder_types.json';

	export var filter : string = '';
	export var foldertype: string = 'CORDEX_raw_ind';

	var foldertypes: {
		key: string;
		display_name: string;
		description: string;
		citation: string;
		header_regex: string;
		lineage: string;
	}[] = folder_types;

	// filter out the folder types that are not relevant
	if (filter.length > 0) {
		foldertypes = foldertypes.filter((x) => x.key.startsWith(filter));
	}


	const dispatch = createEventDispatcher();

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
		dispatch('foldertype_changed', foldertype);
	}
</script>

<!-- Backend Folder Content as checkboxes -->
<div class="">
	<div class="flow gap-2 items-center">
		{#each foldertypes as ftype}
			<button
				type="button"
				class="btn bg-[#D17208] m-2 rounded-md {foldertype == ftype.key
					? 'font-bold bg-[#D17208] text-white'
					: ''}"
				on:click={() => set_foldertype(ftype.key)}>{ftype.display_name}</button
			>
		{/each}
	</div>
</div>
<div class="text-sm m-2">
	{foldertypes.find((x) => x.key == foldertype)?.description ?? 'No description available'}
</div>
<div class="text-sm m-2">
	{foldertypes.find((x) => x.key == foldertype)?.lineage ?? 'No lineage available'}
</div>
<div class="text-sm m-2">
	{foldertypes.find((x) => x.key == foldertype)?.citation ?? 'No citation available'}
</div>
