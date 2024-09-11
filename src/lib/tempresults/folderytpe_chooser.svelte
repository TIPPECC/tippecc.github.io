<script lang="ts">
	import { createEventDispatcher } from 'svelte';

	export var foldertype: string = 'water_budget';
	var foldertypes: any[] = ['water_budget', 'water_budget_bias', 'kariba', 'vaal' ,'cmip6', 'paper'];

	const dispatch = createEventDispatcher();

	function set_foldertype(new_type: string) {
		for (let x = 0; x < foldertypes.length; x++) {
			if (new_type == foldertypes[x]) {
				console.log('NEW: ', new_type, ' ftype: ', foldertypes[x]);
				foldertype = new_type;
				dispatch('foldertype_changed', foldertype);
				return;
			}
		}

		// default
		foldertype = foldertypes[0];
		dispatch('foldertype_changed', foldertype);
	}
</script>

<!-- Backend Folder Content as checkboxes -->
<div class="h-14">
	<div class="flex gap-2 items-center">
		{#each foldertypes as ftype}
			<button
				type="button"
				class="btn bg-[#D17208] m-2 rounded-md {foldertype == ftype
					? 'font-bold bg-[#D17208] text-white'
					: ''}"
				on:click={() => set_foldertype(ftype)}>{ftype}</button
			>
		{/each}
	</div>
</div>
