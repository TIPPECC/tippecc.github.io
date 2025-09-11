<script>
	import { TabGroup, Tab, TabAnchor } from '@skeletonlabs/skeleton';
	import { API_URL } from '../app.config.js';
	import Download from '$lib/icons/download.svelte';
	import Map from '$lib/tempresults/tif_map.svelte';
	import MetadataDisplay from '$lib/MetadataDisplay.svelte';
	import CitationView from '$lib/CitationView.svelte';
	import ProvenanceView from '$lib/ProvenanceView.svelte';
	import ProvenanceListView from '$lib/ProvenanceListView.svelte';
	// import { json } from 'stream/consumers';
	export let folder_data;
	export let file_obj;
	export let foldertype;
	$: selected_file = folder_data[file_obj.index]['filename'];
	let tabSet = folder_data[file_obj.index]['tabset']; // default tab
	let random_id = Math.random().toString(36).substring(2, 15); // Generate a random ID
</script>

<div class="dark:bg-surface-700">
	<div class="flex flex-wrap items-center gap-2 w-full">
		<TabGroup class="flex flex-wrap gap-2 grow">
			<Tab bind:group={tabSet} name="tab1" value={0}>
				<svelte:fragment slot="lead" />
				<span class={tabSet === 0 ? 'font-bold' : ''}>Metadata</span>
			</Tab>
			<Tab bind:group={tabSet} name="tab2" value={1}
				><span class={tabSet === 1 ? 'font-bold' : ''}>Related Datasets</span></Tab
			>
			<Tab bind:group={tabSet} name="tab3" value={2}
				><span class={tabSet === 2 ? 'font-bold' : ''}>Provenance</span></Tab
			>
			<Tab bind:group={tabSet} name="tab4" value={3}
				><span class={tabSet === 3 ? 'font-bold' : ''}>Citation</span></Tab
			>
			{#if folder_data[file_obj.index]['tif_convertable']}
				<Tab bind:group={tabSet} name="tab5" value={4}
					><span class={tabSet === 4 ? 'font-bold' : ''}>Map</span></Tab
				>
			{/if}
		</TabGroup>
		{#if folder_data[file_obj.index]['metadata_exists']}
			<div class="ml-auto">
				<a
					href="/climate_services_gateway/file_info?type={foldertype}&filename={selected_file}"
					class="px-3 p-1 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
					style="margin-top: 5px; margin-right: 2px; margin-left: auto; display: block; width: max-content;"
				>
					File Information View
				</a>
			</div>
		{/if}
	</div>
	<TabGroup>
		<!-- Tab Panels --->
		<svelte:fragment slot="panel">
			{#if tabSet === 0}
				{#if folder_data[file_obj.index]['metadata_exists']}
					<button
						class="ml-2 mr-1 max-h-[33px] p-1 flex items-center justify-center variant-filled-tertiary hover:bg-tertiary-900 rounded-md"
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
						<MetadataDisplay data={folder_data[file_obj.index]['metadata']} />
					{/if}
				{:else}
					currently no metadata available
				{/if}
			{:else if tabSet === 1}
				{#if folder_data[file_obj.index]['metadata_prov_stats']}
					<div class="bg-box" id="base_for_entities_{random_id}">
						<h2 class="text-lg font-semibold mb-3 flex items-center gap-2">
							ℹ️ Available files based on this file
						</h2>
						<ProvenanceListView
							data={folder_data[file_obj.index]['metadata_prov_stats']?.['base_for_entities']}
							only_links={true}
						/>
					</div>
					<div class="bg-box" id="base_for_entities_{random_id}">
						<h2 class="text-lg font-semibold mb-3 flex items-center gap-2">
							ℹ️ Available files used to create this file
						</h2>
						<ProvenanceListView
							data={folder_data[file_obj.index]['metadata_prov_stats']?.['source_entities']}
							only_links={true}
						/>
						<ProvenanceListView
							data={folder_data[file_obj.index]['metadata_prov_stats']?.['result_entities']}
							only_links={true}
						/>
					</div>
				{:else}
					currently no related datasets available
				{/if}
			{:else if tabSet === 2}
				{#if folder_data[file_obj.index]['metadata_prov_exists'] && folder_data[file_obj.index]['metadata_show']}
					<button
						class="ml-2 mr-1 max-h-[33px] p-1 flex items-center justify-center variant-filled-tertiary hover:bg-tertiary-900 rounded-md"
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
					{#if folder_data[file_obj.index]['metadata_prov_stats']}
						<ProvenanceView
							bind:metadata_prov={folder_data[file_obj.index]['metadata_prov']}
							bind:metadata_prov_stats={folder_data[file_obj.index]['metadata_prov_stats']}
						/>
					{/if}
				{:else}
					currently no provenance data available
				{/if}
			{:else if tabSet === 3}
				{#if folder_data[file_obj.index]['metadata'] && folder_data[file_obj.index]['metadata']['file'] && folder_data[file_obj.index]['metadata_show']}
					<CitationView file={folder_data[file_obj.index]['metadata']['file']} />
				{/if}
			{:else if tabSet === 4}
				{#if selected_file && selected_file != ''}
					{#key selected_file}
						<Map {foldertype} bind:selected_file show_varinfos={false} />
					{/key}
				{/if}
			{/if}
		</svelte:fragment>
	</TabGroup>
</div>

<style>
	.text-label {
		color: #60a5fa; /* Die gewünschte Farbe, hier entspricht es Tailwinds "text-label" */
	}
</style>
