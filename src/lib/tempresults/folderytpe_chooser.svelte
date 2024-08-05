<script lang="ts">
	import { createEventDispatcher } from 'svelte';

	export var foldertype: string = 'water_budget';
	var foldertypes: any[] = ['water_budget', 'water_budget_bias', 'kariba', 'vaal'];

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
<div class="btn-group variant-ghost-primary h-10 px-2 m-1">
	<div class="flex gap-1 items-center btn-group">
		{#each foldertypes as ftype}
			<button
				type="button"
				class="btn h-[28px] variant-filled-tertiary {foldertype == ftype
					? 'font-bold border-l-2 border-cyan-300'
					: 'border-l-2 border-red-500'}"
				on:click={() => set_foldertype(ftype)}>{ftype}</button
			>
		{/each}
	</div>
</div>
