<script>
	import { TabGroup, Tab, TabAnchor } from '@skeletonlabs/skeleton';
	import { API_URL } from '../app.config.js';
	import Download from '$lib/icons/download.svelte';

	import Map from '$lib/tempresults/tif_map.svelte';
	import MetadataDisplay from '$lib/MetadataDisplay.svelte';
	import CitationView from '$lib/CitationView.svelte';
	import ProvenanceView from '$lib/ProvenanceView.svelte';
	import ProvenanceListView from '$lib/ProvenanceListView.svelte';
	export let folder_data;
	export let file_obj;
	export let foldertype;
	export let in_main_page; 

	if (file_obj != null){
		folder_data = folder_data[file_obj.index]
	}

	$: selected_file = folder_data['filename'];
	console.log(folder_data)
	let tabSet = folder_data['tabset']; // default tab
	let random_id = Math.random().toString(36).substring(2, 15); // Generate a random ID
</script>

<div class="bg-surface-700">
	<TabGroup>
		<Tab bind:group={tabSet} name="tab1" value={0}>
			<svelte:fragment slot="lead" />
			<span>Metadata</span>
		</Tab>
		<Tab bind:group={tabSet} name="tab1" value={1}>Related Datasets</Tab>
		<Tab bind:group={tabSet} name="tab2" value={2}>Provenance</Tab>
		<Tab bind:group={tabSet} name="tab3" value={3}>Citation</Tab>
		{#if folder_data['tif_convertable']}
			<Tab bind:group={tabSet} name="tab4" value={4}>Map</Tab>
		{/if}
		{#if in_main_page}
			<div class="ml-auto">
				<a href="/file_details?type={foldertype}&filename={folder_data['filename']}" 
				class="px-3 p-1 py-1 bg-blue-500 text-white rounded hover:bg-blue-600" 
				style="margin-top: 5px; margin-right: 2px; margin-left: auto; display: block; width: max-content;">
					File information Explorer
				</a>
			</div>
		{:else}
			<div class="ml-auto">
				<a href="/water_budget?type={foldertype}&filename={folder_data['filename']}" 
				class="px-3 p-1 py-1 bg-blue-500 text-white rounded hover:bg-blue-600" 
				style="margin-top: 5px; margin-right: 2px; margin-left: auto; display: block; width: max-content;">
					Geoportal
				</a>
			</div>
		{/if}
		<!-- Tab Panels --->
		<svelte:fragment slot="panel">
			{#if tabSet === 0}
				{#if folder_data['metadata_exists']}
					<button
						class="ml-2 mr-1 max-h-[33px] p-1 flex items-center justify-center variant-filled-tertiary hover:bg-tertiary-900 rounded-md"
					>
						<a
							href="{API_URL}/climate/get_temp_file?name={folder_data[
								'filename'
							]}&type={foldertype}&filetype=meta"
							class="flex"
							title="Download metadata file"
						>
							<Download />
							<div class="ml-1 flex place-items-center justify-items-center">metadata</div>
						</a>
					</button>

					{#if folder_data['metadata'] && folder_data['metadata_show']}
						<MetadataDisplay data={folder_data['metadata']} />
					{/if}
				{:else}
					currently no metadata available
				{/if}
			{:else if tabSet === 1}
				{#if folder_data['metadata_prov_stats']}
					<div class="bg-box" id="base_for_entities_{random_id}">
						<h2 class="text-lg font-semibold mb-3 flex items-center gap-2 text-white">
							ℹ️ Available files based on this file
						</h2>
						<ProvenanceListView
							data={folder_data['metadata_prov_stats']?.['base_for_entities']}
							only_links={true}
							in_main_page ={in_main_page}
						/>
					</div>
					<div class="bg-box" id="base_for_entities_{random_id}">
						<h2 class="text-lg font-semibold mb-3 flex items-center gap-2 text-white">
							ℹ️ Available files used to create this file
						</h2>
						<ProvenanceListView
							data={folder_data['metadata_prov_stats']?.['source_entities']}
							only_links={true}
							in_main_page ={in_main_page}
						/>
						<ProvenanceListView
							data={folder_data['metadata_prov_stats']?.['result_entities']}
							only_links={true}
							in_main_page ={in_main_page}
						/>
					</div>
				{:else}
					currently no related datasets available
				{/if}
			{:else if tabSet === 2}
				{#if folder_data['metadata_prov_exists'] && folder_data['metadata_show']}
					<button
						class="ml-2 mr-1 max-h-[33px] p-1 flex items-center justify-center variant-filled-tertiary hover:bg-tertiary-900 rounded-md"
					>
						<a
							href="{API_URL}/climate/get_temp_file?name={folder_data[
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
					{#if folder_data['metadata_prov_stats']}
						<ProvenanceView
							bind:metadata_prov={folder_data['metadata_prov']}
							bind:metadata_prov_stats={folder_data['metadata_prov_stats']}
						/>
					{/if}
				{:else}
					currently no provenance data available
				{/if}
			{:else if tabSet === 3}
				{#if folder_data['metadata']['file'] && folder_data['metadata_show']}
					<CitationView file={folder_data['metadata']['file']} />
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
	.bg-box {
		background-color: #1f2937; /* Dunkelgrau (zinc-800) als Standardhintergrund */
		border: 1px solid #374151; /* Etwas dunklerer Rand (zinc-700) */
		border-radius: 1rem; /* abgerundete Ecken */
		padding: 1rem; /* Innenabstand */
		box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); /* Schatten für den 3D-Effekt */
		margin-bottom: 1rem; /* Abstand nach unten */
		margin-top: 1rem; /* Abstand nach oben */
	}
</style>
