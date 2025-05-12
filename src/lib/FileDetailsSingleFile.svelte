<script>
	import { TabGroup, Tab, TabAnchor } from '@skeletonlabs/skeleton';
	import { API_URL } from '../app.config.js';
	import Download from '$lib/icons/download.svelte';
	import { auto_description } from '$lib/auto_description.js';
	import {sizeofFmt, round} from '$lib/toolbox'
	import Map from '$lib/tempresults/tif_map.svelte';
	import MetadataDisplay from '$lib/MetadataDisplay.svelte';
	import CitationView from '$lib/CitationView.svelte';
	import ProvenanceView from '$lib/ProvenanceView.svelte';
	import ProvenanceListView from '$lib/ProvenanceListView.svelte';
	import ExtentOnMap from './ExtentOnMap.svelte';
	// import { json } from 'stream/consumers';
	export let folder_data;
	export let file_obj;
	export let foldertype;
	export let in_main_page;

	let show_geo = true;

	if (file_obj != null){
		folder_data = folder_data[file_obj.index]
	}
	$: selected_file = folder_data['filename'];
	let description = "No description available"
	if (! in_main_page){
		try{
			description = auto_description(folder_data['filename'], foldertype, folder_data['metadata'])
		}
		catch(e){
			console.log(e)
		}
	}
	let random_id = Math.random().toString(36).substring(2, 15); // Generate a random ID
	let tabSet = folder_data['tabset']; // default tab
</script>
{#if in_main_page}
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
			<div class="ml-auto">
				<a href="/file_info?type={foldertype}&filename={folder_data['filename']}"
				class="px-3 p-1 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
				style="margin-top: 5px; margin-right: 2px; margin-left: auto; display: block; width: max-content;">
					File Information View
				</a>
			</div>
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
							in_main_page = {in_main_page}
						/>
					{/if}
				{:else}
					currently no provenance data available
				{/if}
			{:else if tabSet === 3}
				{#if folder_data['metadata'] && folder_data['metadata']['file'] && folder_data['metadata_show']}
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
{:else}
	<br>
	<div class="bg-box">
		<div class="flex items-center justify-between mb-3">
			<h2 class="text-lg text-label font-semibold flex items-center gap-2 text-white">
				📁 {folder_data['filename']}
			</h2>
			<a
				href="/water_budget?type={foldertype}&filename={folder_data['filename']}"
				class="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
			>
				Collection View
			</a>
		</div>
		<span class="font-bold">{description}</span>
		<div class="grid grid-cols-1 md:grid-cols-2 gap-y-2 gap-x-4 text-zinc-200 mt-3">
			<div>
				<span class="font-bold text-label">Format:</span>
				<span class="font-medium text-zinc-300">{folder_data['metadata']['file']['file_format']}</span>
			</div>
			<div>
				<span class="font-bold text-label">Size:</span>
				<span class="font-medium text-zinc-300">{sizeofFmt(folder_data['metadata']['file']['file_size'])}</span>
			</div>
			<div>
				<span class="font-bold text-label">Created:</span>
				<span class="font-medium text-zinc-300">{folder_data['metadata']['file']['birth_time']}</span>
			</div>
			<div>
				<span class="font-bold text-label">Last Modified:</span>
				<span class="font-medium text-zinc-300">{folder_data['metadata']['file']['last_modification_time']}</span>
			</div>
		</div>
	</div>
	<CitationView file={folder_data['metadata']['file']} in_main_page = {in_main_page}/>
	<button
		class="mt-4 bg-cyan-700 w-full h-[36px] flex items-center hover:bg-gray-700 transition"
		on:click={() => show_geo = !show_geo}
	>
		{show_geo ? '🔽 Geospatial Information' : '▶️ Geospatial Information'}
	</button>
	{#if show_geo}
	<div class="bg-box grid grid-cols-1 md:grid-cols-2 gap-y-2 gap-x-4 text-zinc-200">
		<div class="grid grid-cols-3 grid-rows-3 text-zinc-200 text-center text-sm">
			<!-- Top (Lat Max) -->
			<div />
			<div>
				<span class="font-bold text-label">{round(folder_data['metadata']['file']['geospatial_lat_max'], 4)}°</span><br
				/><span class="font-medium text-zinc-300">↑</span>
			</div>
			<div />

			<!-- Middle Row: Lon Min / Spacer / Lon Max -->
			<div>
				<span class="font-bold text-label">{round(folder_data['metadata']['file']['geospatial_lon_min'], 4)}°</span><br
				/><span class="font-medium text-zinc-300">←</span>
			</div>
			<div>
				<span class="font-bold text-label">Resolution:</span>
				<span class="font-medium text-zinc-300">{folder_data['metadata']['file']['nominal_resolution']}</span>
			</div>
			<div>
				<span class="font-bold text-label">{round(folder_data['metadata']['file']['geospatial_lon_max'], 4)}°</span><br
				/><span class="font-medium text-zinc-300">→</span>
			</div>

			<!-- Bottom (Lat Min) -->
			<div />
			<div>
				<span class="font-medium text-zinc-300">↓</span><br /><span
					class="font-bold text-label">{round(folder_data['metadata']['file']['geospatial_lat_min'], 4)}°</span
				>
			</div>
			<div />
		</div>
		<ExtentOnMap extent= {[folder_data['metadata']['file']['geospatial_lon_min'],
			folder_data['metadata']['file']['geospatial_lat_min'],
			folder_data['metadata']['file']['geospatial_lon_max'],
			folder_data['metadata']['file']['geospatial_lat_max']]}/>
	</div>
	{/if}
	<TabGroup>
		<Tab bind:group={tabSet} name="tab1" value={0}>
			<svelte:fragment slot="lead" />
			<span>Other Metadata</span>
		</Tab>
		<Tab bind:group={tabSet} name="tab1" value={1}>Related Datasets</Tab>
		<Tab bind:group={tabSet} name="tab2" value={2}>Provenance</Tab>
		{#if folder_data['tif_convertable']}
			<Tab bind:group={tabSet} name="tab4" value={3}>Map</Tab>
		{/if}
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
						<MetadataDisplay data={folder_data['metadata']} in_main_page = {in_main_page}/>
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
							in_main_page = {in_main_page}
						/>
					{/if}
				{:else}
					currently no provenance data available
				{/if}
			{:else if tabSet === 3}
				{#if selected_file && selected_file != ''}
					{#key selected_file}
						<Map {foldertype} bind:selected_file show_varinfos={false} />
					{/key}
				{/if}
			{/if}
		</svelte:fragment>
	</TabGroup>

{/if}

<style>
	.text-label {
		color: #60a5fa; /* Die gewünschte Farbe, hier entspricht es Tailwinds "text-label" */
	}
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
