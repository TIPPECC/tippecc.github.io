<script>
	import { TabGroup, Tab, TabAnchor } from '@skeletonlabs/skeleton';
	import { API_URL } from '../app.config.js';
	import Download from '$lib/icons/download.svelte';
	import RecursiveDisplay from '$lib/RecursiveDisplay.svelte';
	import Map from '$lib/tempresults/tif_map.svelte';
	export let folder_data;
	export let file_obj;
	export let foldertype;
	$: selected_file = folder_data[file_obj.index]['filename'];
	let tabSet = 3; // default tab
</script>

<div class="bg-surface-700">
	<TabGroup>
		<Tab bind:group={tabSet} name="tab1" value={0}>
			<svelte:fragment slot="lead" />
			<span>Metadata</span>
		</Tab>
		<Tab bind:group={tabSet} name="tab2" value={1}>Provenance</Tab>
		<Tab bind:group={tabSet} name="tab3" value={2}>Citation</Tab>
		<Tab bind:group={tabSet} name="tab3" value={3}>Map</Tab>
		<!-- Tab Panels --->
		<svelte:fragment slot="panel">
			{#if tabSet === 0}
				{#if folder_data[file_obj.index]['metadata_exists']}
					<button
						class="mr-1 max-h-[33px] p-1 flex items-center justify-center variant-filled-tertiary hover:bg-tertiary-900 rounded-md"
					>
						<a
							href="{API_URL}/climate/get_temp_file?name={folder_data[file_obj.index][
								'filename'
							]}&type={foldertype}&filetype=meta"
							class="flex"
							title="Download metadata file"
						>
							<Download />
							<div class="ml-1 flex place-items-center justify-items-center">metadata</div>
						</a>
					</button>

					{#if folder_data[file_obj.index]['metadata'] && folder_data[file_obj.index]['metadata_show']}
						<RecursiveDisplay data={folder_data[file_obj.index]['metadata']} />
					{/if}
				{/if}
			{:else if tabSet === 1}
				{#if folder_data[file_obj.index]['metadata_prov_exists'] && folder_data[file_obj.index]['metadata_show']}
					<button
						class="mr-1 max-h-[33px] p-1 flex items-center justify-center variant-filled-tertiary hover:bg-tertiary-900 rounded-md"
					>
						<a
							href="{API_URL}/climate/get_temp_file?name={folder_data[file_obj.index][
								'filename'
							]}&type={foldertype}&filetype=prov"
							class="flex"
							title="Download metadata file"
						>
							<Download />
							<!--icon download-->

							<div class="ml-1 flex place-items-center justify-items-center">provenance</div>
						</a>
					</button>
					{#if folder_data[file_obj.index]['metadata_prov'] && folder_data[file_obj.index]['metadata_show']}
						<!--tab select metadata or provenance object content-->
						{#if folder_data[file_obj.index]['metadata_prov']}
							<!-- print object-->
							<RecursiveDisplay data={folder_data[file_obj.index]['metadata_prov']} />
						{/if}
					{/if}
				{/if}
			{:else if tabSet === 2}
				coming soon
			{:else if tabSet === 3}
				{#if selected_file && selected_file != ''}
					{#key selected_file}
						<Map {foldertype} bind:selected_file show_varinfos={false} />
					{/key}
				{/if}
			{/if}
		</svelte:fragment>
	</TabGroup>
</div>
