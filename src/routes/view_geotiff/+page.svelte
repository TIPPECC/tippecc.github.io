<script lang="ts">
	import { onMount } from 'svelte';
	import { browser } from '$app/environment';
	import { tempresult_selection } from '../store/tempresult_store';
	import TifMap from '$lib/tempresults/tif_map.svelte';
	import ShowMap from '$lib/tempresults/show_maps.svelte';
	import LoadingRing from '$lib/LoadingRing.svelte';
	import ShowMaps from '$lib/tempresults/show_maps.svelte';

	let selected_filename: string = '';
	let selected_foldertype: string = '';
	let temp_res_check: boolean = false;

	onMount(() => {
		if (browser) {
			var temp_result: any;
			tempresult_selection.subscribe((value) => {
				temp_result = value;

				// selected_foldertype = value.foldertype + "";
			});
			if (!temp_result) {
				temp_res_check = true;
				return;
			}

			selected_filename = temp_result.filename;
			selected_foldertype = temp_result.foldertype;

			if (selected_filename == null || selected_foldertype == null) {
				selected_filename = '';
				selected_foldertype = 'water_budget';
			}

			// clear selection from prior /goto call
			tempresult_selection.set({
				filename: null,
				foldertype: null
			});

			temp_res_check = true;
		}
	});
</script>

<div class="content-div">
	{#if temp_res_check}
		<ShowMaps foldertype={selected_foldertype} selected_file={selected_filename} />
	{:else}
		<div class="flex-center mt-8">
			<LoadingRing />
		</div>
	{/if}
</div>
