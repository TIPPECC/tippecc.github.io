<script>
	import { TabGroup, Tab, TabAnchor } from '@skeletonlabs/skeleton';
	import { API_URL } from '../app.config.js';
	import Download from '$lib/icons/download.svelte';
	import { auto_description } from '$lib/auto_description.js';
	import { sizeofFmt, round } from '$lib/toolbox';
	import Map from '$lib/tempresults/tif_map.svelte';
	import MetadataDisplay from '$lib/MetadataDisplay.svelte';
	import CitationView from '$lib/CitationView.svelte';
	import ProvenanceView from '$lib/ProvenanceView.svelte';
	import ProvenanceListView from '$lib/ProvenanceListView.svelte';
	import ExtentOnMap from './ExtentOnMap.svelte';
	import FileIcon from '$lib/icons/file-info-alt-1-svgrepo-com.svelte';
	// import { json } from 'stream/consumers';
	export let folder_data;
	export let file_obj;
	export let foldertype;
	export let in_main_page;

	let show_geo = true;

	if (file_obj != null) {
		folder_data = folder_data[file_obj.index];
	}
	$: selected_file = folder_data['filename'];
	let description = 'No description available';
	if (!in_main_page) {
		try {
			description = auto_description(folder_data['filename'], foldertype, folder_data['metadata']);
		} catch (e) {
			console.log(e);
		}
	}
	let random_id = Math.random().toString(36).substring(2, 15); // Generate a random ID
	let tabSet = folder_data['tabset']; // default tab

	/**
	 * @param {any} value
	 */
	function format_c_bound(value) {
		if (typeof value == 'object') {
			const start = value[0].split('-')[0];
			const end = value[1].split('-')[0];
			return start + ' - ' + end;
		} else {
			const parts = value.split('-');
			const start = parts[0];
			return start;
		}
	}
</script>

<br />
<div class="">
	<div class="flex flex-col md:flex-row items-start md:items-center justify-between mb-3 gap-2">
		<h2 class="text-lg text-label font-semibold flex items-center gap-2 max-w-full break-words">
			<FileIcon />
			<span class="break-all">{folder_data['filename']}</span>
		</h2>

		<a
			href={"/climate_services_gateway/collections/?type=" + foldertype + "&filename=" + folder_data['filename']}
			class="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 whitespace-normal"
		>
			Collection View
		</a>
	</div>
	<div class="dark:bg-surface-700 rounded-lg p-4">
		<span class="font-semibold">{description}</span>
	</div>
	<div
		class="grid grid-cols-1 md:grid-cols-2 gap-y-2 gap-x-4 mt-4 bg-surface-200 dark:bg-surface-800 rounded-lg"
	>
		<div class="p-4">
			<div class="font-bold text-lg">Variable</div>
			<div>
				<span class="font-bold ml-4 text-blue-400">Short Name:</span>
				<span class="ml-2">{folder_data['metadata']['file']['short_variable_name']}</span>
			</div>
			<div>
				<span class="font-bold ml-4 text-blue-400">Long Name:</span>
				<span class="ml-2">{folder_data['metadata']['file']['long_name']}</span>
			</div>
			<div>
				<span class="font-bold ml-4 text-blue-400">Unit:</span>
				<span class="ml-2">{folder_data['metadata']['file']['unit']}</span>
			</div>
			<div>
				<span class="font-bold ml-4 text-blue-400">Cell Method:</span>
				<span class="ml-2">{folder_data['metadata']['file']['cell_methods']}</span>
			</div>
			<div>
				<span class="font-bold ml-4 text-blue-400">Global Min / Max:</span>
				<span class=""
					>{round(folder_data['metadata']['file']['global_min'], 2)} / {round(
						folder_data['metadata']['file']['global_max'],
						2
					)}</span
				>
			</div>
			<div>
				<span class="font-bold ml-4 text-blue-400">Experiment ID:</span>
				<span class="ml-2">{folder_data['metadata']['file']['experiment_id']}</span>
			</div>
			<div>
				<span class="font-bold ml-4 text-blue-400">Bias Correction:</span>
				<span class="ml-2">{folder_data['metadata']['file']['bias_correction']}</span>
			</div>
			<div>
				<span class="font-bold ml-4 text-blue-400">Indicator:</span>
				<span class="ml-2">{folder_data['metadata']['file']['indicator']}</span>
			</div>
			<div class="font-bold text-lg mt-4">Spatial</div>
			<div>
				<span class="font-bold ml-4 text-blue-400">Resolution:</span>
				<span class="ml-2">{folder_data['metadata']['file']['nominal_resolution']}</span>
			</div>

			<div class="font-bold text-lg mt-4">Time</div>
			<div>
				<span class="font-bold ml-4 text-blue-400">Coverage:</span>
				<span class="ml-2"
					>{folder_data['metadata']['file']['time_coverage_start']} - {folder_data['metadata'][
						'file'
					]['time_coverage_end']}</span
				>
			</div>
			<div>
				<span class="font-bold ml-4 text-blue-400">Frequency:</span>
				<span class="ml-2">{folder_data['metadata']['file']['frequency']} </span>
			</div>
			<div>
				<span class="font-bold ml-4 text-blue-400">Number of time steps:</span>
				<span class="ml-2">{folder_data['metadata']['file']['num_time_steps']} </span>
			</div>
			<div>
				<span class="font-bold ml-4 text-blue-400">Units:</span>
				<span class="ml-2">{folder_data['metadata']['file']['time_units']}</span>
			</div>
			<div>
				<span class="font-bold ml-4 text-blue-400">Calendar:</span>
				<span class="ml-2">{folder_data['metadata']['file']['time_calendar']} </span>
			</div>

			<div>
				<span class="font-bold ml-4 text-blue-400">Resolution sfsfsdf:</span>
				<span class="ml-2">{folder_data['metadata']['file']['nominal_resolution']}</span>
			</div>
			{#if folder_data['metadata']['file']['climatology_bounds']}
				<div>
					<span class="font-bold ml-4 text-blue-400">Climatology Bounds Start:</span>
					<span class="ml-2"
						>{format_c_bound(folder_data['metadata']['file']['climatology_bounds'][0][0])}</span
					>
				</div>
				<div>
					<span class="font-bold ml-4 text-blue-400">Climatology Bounds End:</span>
					<span class="ml-2"
						>{format_c_bound(folder_data['metadata']['file']['climatology_bounds'][0][1])}</span
					>
				</div>
			{/if}
			{#if folder_data['metadata']['file']['climatology_bounds_details']}
				<div>
					<span class="font-bold ml-4 text-blue-400">Climatology Bounds 1st Period:</span>
					<span class="ml-2"
						>{format_c_bound(
							folder_data['metadata']['file']['climatology_bounds_details'][0]
						)}</span
					>
				</div>
				<div>
					<span class="font-bold ml-4 text-blue-400">Climatology Bounds 2nd Period:</span>
					<span class="ml-2"
						>{format_c_bound(
							folder_data['metadata']['file']['climatology_bounds_details'][1]
						)}</span
					>
				</div>
			{/if}
			<div class="font-bold text-lg mt-4">File</div>
			<div>
				<span class="font-bold ml-4 text-blue-400">Format:</span>
				<span class="ml-2">{folder_data['metadata']['file']['file_format']}</span>
			</div>
			<div>
				<span class="font-bold ml-4 text-blue-400">Size:</span>
				<span class="ml-2">{sizeofFmt(folder_data['metadata']['file']['file_size'])}</span>
			</div>
			<div>
				<span class="font-bold ml-4 text-blue-400">Created:</span>
				<span class="ml-2">{folder_data['metadata']['file']['birth_time']}</span>
			</div>
			<div>
				<span class="ffont-bold ml-4">Last Modified:</span>
				<span class="ml-2">{folder_data['metadata']['file']['last_modification_time']}</span>
			</div>
		</div>
		<div class="p-4">
			<ExtentOnMap
				extent={[
					folder_data['metadata']['file']['geospatial_lon_min'],
					folder_data['metadata']['file']['geospatial_lat_min'],
					folder_data['metadata']['file']['geospatial_lon_max'],
					folder_data['metadata']['file']['geospatial_lat_max']
				]}
			/>

			<h2 class="text-lg font-semibold mb-3 flex items-center gap-2">ℹ️ Cite as:</h2>
			<div>
				<span class="font-bold text-blue-400">Reference:</span>
				<span>please contact the TIPPECC team</span>
			</div>
		</div>
	</div>
	<CitationView file={folder_data['metadata']['file']} in_main_page={false} />
	<div class="grid grid-cols-1 md:grid-cols-2 gap-y-2 gap-x-4 text-zinc-200 mt-3" />
</div>

<TabGroup labelledby="Tabs for additional information">
	<Tab bind:group={tabSet} name="tab1" value={0} title="Other Metadata">
		<svelte:fragment slot="lead" />
		<span>Other Metadata</span>
	</Tab>
	<Tab bind:group={tabSet} name="tab1" value={1} title="Related Datasets">Related Datasets</Tab>
	<Tab bind:group={tabSet} name="tab2" value={2} title="Provenance">Provenance</Tab>
	{#if folder_data['tif_convertable']}
		<Tab bind:group={tabSet} name="tab4" value={3} title="Map">Map</Tab>
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
					<MetadataDisplay data={folder_data['metadata']} {in_main_page} />
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
						{in_main_page}
					/>
				</div>
				<div class="bg-box" id="base_for_entities_{random_id}">
					<h2 class="text-lg font-semibold mb-3 flex items-center gap-2 text-white">
						ℹ️ Available files used to create this file
					</h2>
					<ProvenanceListView
						data={folder_data['metadata_prov_stats']?.['source_entities']}
						only_links={true}
						{in_main_page}
					/>
					<ProvenanceListView
						data={folder_data['metadata_prov_stats']?.['result_entities']}
						only_links={true}
						{in_main_page}
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
						{in_main_page}
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
