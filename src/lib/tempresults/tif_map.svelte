<script lang="ts">
	import 'ol/ol.css';
	import { OSM, GeoTIFF as GeoTIFF_OL } from 'ol/source';
	import Map from 'ol/Map.js';
	import View from 'ol/View';
	import TileLayer from 'ol/layer/WebGLTile.js';
	import { _fetch_foldercontent_by_type } from '$lib/fetch_folder_content';
	import { onMount } from 'svelte';
	import { API_URL } from '../../app.config';
	// import * as GeoTIFF_JS from 'geotiff';
	import ColorGradientPicker from '$lib/ColorGradientPicker.svelte';
	import CustomSliderPicker from '$lib/CustomSliderPicker.svelte';
	import { browser } from '$app/environment';
	import FoldertypeChooser from './folderytpe_chooser.svelte';
	import EarthAfrica from '$lib/icons/earth_africa.svelte';
	import LoadingRing from '$lib/LoadingRing.svelte';

	const TWELVE_HOURS = 43200000; // 12 hours in ms, for date calculation

	let metadata_loaded: boolean = false;
	let loading_map: boolean = false;
	export let selected_file: string = '';
	export let foldertype: string = 'water_budget';
	let folder_data: any[any] = [];
	let selected_tif_url: string = '';
	let horizontal_scala: boolean = true;
	let old_layer: any = null;
	let layer: any = null;

	let virtual_data_url: string = '';
	let slider_value: any;
	let slider_index: any;
	let slider_value_diff: any;
	let slider_index_diff: any;
	let selected_band: number = 1;
	let selected_band_diff: number = 1;
	let current_metadata: any = {};
	let band_slider_values: any[] = [];

	let map: Map;
	let diff_mode: boolean = false;

	let base_view = new View({
		center: [25, -15],
		projection: 'EPSG:4326',
		zoom: 4.7
	});

	let current_band_metainfo = {
		min: 0,
		max: 0
	};

	let current_diff_band_metainfo = {
		min: 0,
		max: 0
	};

	let cg_picker: ColorGradientPicker;
	let color_steps: any;

	$: color_steps, rebuild_map();

	let opacity_value = 1.0;

	function update_layer_opacity() {
		if (!layer) {
			return;
		}
		layer.setOpacity(opacity_value);
	}

	function rebuild_map() {
		if (!color_steps) {
			return;
		}
	}

	onMount(() => {
		refresh_foldercontent();
	});

	onMount(() => {
		initialize_map();
	});

	onMount(() => {
		if (browser) {
			update_layer_opacity();
		}
	});

	onMount(() => {
		if (browser) {
			// if we come from another page and already know the selected file:
			//	- trigger file_selected
			if (selected_file != '') {
				// <Select> does not fire changed when setting selected_file manually
				file_selected();
			}
		}
	});

	function initialize_map() {
		map = new Map({
			target: 'map',
			layers: [
				new TileLayer({
					source: new OSM()
				})
			],
			view: base_view
		});
	}

	async function fetch_file_as_blob(geotiff_url: string) {
		if (geotiff_url == '') {
			throw new Error('Empty url!');
		}

		const response = await fetch(geotiff_url); // fetch the file from the URL
		const res_blob = await response.blob(); // create blob from fetched file

		// create virtual url from blob
		virtual_data_url = URL.createObjectURL(res_blob);

		// not needed right now, but very useful
		// const arrayBuffer = await response.arrayBuffer(); // Convert to array buffer
		// const tiff = await GeoTIFF_JS.fromArrayBuffer(arrayBuffer); // Create a GeoTIFF instance
		// const tiff = await GeoTIFF_JS.fromBlob(res_blob);
		// const image = await tiff.getImage();

		// actually the library geotiff does not seem to be needed at all
		// but it is very very useful for more complex handling or reading of file metadata e.g.
	}

	function set_color_bounds() {
		if (diff_mode) {
			cg_picker.set_bounds(
				// this metric is very unrealistic, but is ok for now
				// maybe add a hint for the user to calibrate with custom max/min values
				current_band_metainfo.min - current_diff_band_metainfo.max,
				current_band_metainfo.max - current_diff_band_metainfo.min
			);
		} else {
			cg_picker.set_bounds(current_band_metainfo.min, current_band_metainfo.max);
		}
	}

	function refresh_band_metadata() {
		var band_metadata = current_metadata.band_metadata;
		current_band_metainfo.min = band_metadata[selected_band].min;
		current_band_metainfo.max = band_metadata[selected_band].max;
		set_color_bounds();
	}

	function refresh_dif_band_metadata() {
		var band_metadata = current_metadata.band_metadata;
		current_diff_band_metainfo.min = band_metadata[selected_band_diff].min;
		current_diff_band_metainfo.max = band_metadata[selected_band_diff].max;
		set_color_bounds();
	}

	async function file_selected(e?) {
		// when a file is selected, we usually want to reset everything
		console.log('Selected file: ', selected_file);
		metadata_loaded = false;
		loading_map = true;

		// demand access to the tif file
		var access_tif_url =
			API_URL + '/climate/access_tif?type=' + foldertype + '&name=' + selected_file;
		const res = await fetch(access_tif_url, {
			method: 'GET'
		});

		let result = [];
		if (!res.ok) {
			loading_map = false;

			var err_msg = await res.text();
			throw new Error(`${res.status} ${res.statusText}\nReason: ${err_msg}`);
		}

		result = await res.json();

		// on success, fetch metadata of the currently selected file
		var metadata_url =
			API_URL + '/climate/get_temp_file_metadata?type=' + foldertype + '&name=' + selected_file;
		const meta_res = await fetch(metadata_url, {
			method: 'GET'
		});

		let meta_result = [];
		if (!meta_res.ok) {
			loading_map = false;

			var err_msg = await res.text();
			throw new Error(`${meta_res.status} ${meta_res.statusText}\nReason: ${err_msg}`);
		}

		meta_result = await meta_res.json();
		// console.log("Meta_result: ", meta_result);
		// succesfully gained access to tif file and fetched metadata..
		//		- -> now assemble metadata and visualize

		if (!meta_result.metadata) {
			loading_map = false;
			throw new Error('No metadata on the current metadata response.');
		}

		current_metadata = meta_result.metadata;
		// console.log("Current Metadata: ", current_metadata);

		// check keys
		if (
			!current_metadata.band_metadata ||
			!current_metadata.net_cdf_times ||
			!current_metadata.timestamp_begin
		) {
			loading_map = false;
			throw new Error('Missing key-value pairs on metadata response object!');
		}

		// assign band_metadata and read net_cdf_times
		var band_metadata = current_metadata.band_metadata;
		try {
			var net_cdf_times = JSON.parse(current_metadata.net_cdf_times);
		} catch (error) {
			console.log(`Could not parse net_cdf_times found in current_metadata:\n ${error}`);
		}

		// console.log("net_cdf_times: ", net_cdf_times);
		// console.log("Type net_cdf_times: ", typeof(net_cdf_times));

		// console.log("MIN: ", band_metadata[selected_band].min)
		// console.log("MAX: ", band_metadata[selected_band].max)

		// read minimum and maximum from metadata
		try {
			var meta_min = parseFloat(band_metadata[selected_band].min);
			var meta_max = parseFloat(band_metadata[selected_band].max);

			if (isNaN(meta_min) || isNaN(meta_max)) {
				loading_map = false;
				throw new Error('Meta_min or Meta_max evaluated to NaN.');
			}

			current_band_metainfo.min = meta_min;
			current_band_metainfo.max = meta_max;
		} catch (error) {
			console.log(
				`Could not parse meta_min ${band_metadata[selected_band].min} or meta_max ${band_metadata[selected_band].max}.`
			);
			console.log(`Reason: ${error}`);
		}

		current_band_metainfo.min = band_metadata[selected_band].min;
		current_band_metainfo.max = band_metadata[selected_band].max;

		// read timestamp and calculated values for the bandslider
		band_slider_values = [];

		// start date of the metadata timestamp in milliseconds
		const start_date = Date.parse(current_metadata.timestamp_begin);

		if (isNaN(start_date)) {
			// console.log("Could not parse metadata timestamp.")
			current_metadata.timestamp_begin = '';
			// throw new Error('Metadata timestamp is invalid.');
		}

		try {
			if (current_metadata.timestamp_begin == '') {
				// invalid timestamp -> default to raw net_cdf_time values as bandslider values
				for (let i = 0; i < net_cdf_times.length; i++) {
					band_slider_values.push(parseFloat(net_cdf_times[i]));
				}
			} else {
				// valid timestamp -> calculate years (for now) and assign to bandslider values
				for (let i = 0; i < net_cdf_times.length; i++) {
					band_slider_values.push(
						new Date(start_date + parseFloat(net_cdf_times[i]) * TWELVE_HOURS * 2).getFullYear()
					);
				}
			}
		} catch (error) {
			console.log(`Encountered error while assigning net_cdf_values to bandslider: ${error}`);
		}

		// set ColorGradientPicker bounds to file metadata min and max
		cg_picker.set_bounds(current_band_metainfo.min, current_band_metainfo.max);

		// assign direct file url
		selected_tif_url = result.filedata.route;
		// console.log("Fetching route for file: \n", selected_tif_url);

		// fetch the full file with geotiff
		fetch_file_as_blob(selected_tif_url)
			.then(() => {
				// console.log("Loading file metadata succeeded!")
				// console.log("Virtual URL: ", virtual_data_url)

				// fetching file succesful -> visualize
				metadata_loaded = true;
				visualize_band();

				loading_map = false;
				// console.log('selected_tif_url: ', selected_tif_url);
			})
			.catch((error) => {
				metadata_loaded = false;
				loading_map = false;
				console.log(
					`Encountered an error while trying to fetch file ${selected_tif_url}:\n ${error}`
				);
			});
	}

	function on_slider_change(e?) {
		selected_band = parseInt(slider_index) + 1;
		refresh_band_metadata();
		visualize_band();
	}

	function on_dif_slider_change(e?) {
		selected_band_diff = parseInt(slider_index_diff) + 1;
		refresh_dif_band_metadata();
		visualize_band();
	}

	function generate_openlayers_case_stops(color_stops: any[], layerinfo: any[]) {
		var color_cases = ['case', ['==', layerinfo, 0], [0, 0, 0, 0]];
		for (let i = 0; i < color_stops.length; i++) {
			if (i % 2 == 0) {
				// current range of values
				// console.log("Current UB: ", color_stops[i], " current LB: ", color_stops[i][1]);
				color_cases.push(['between', layerinfo, color_stops[i][0], color_stops[i][1]]);
			} else {
				// corresponding color
				color_cases.push(color_stops[i]);
			}
		}

		// adding limits
		color_cases.push(['<', layerinfo, color_stops[0][0]]);
		color_cases.push(color_stops[1]);

		color_cases.push(['>', layerinfo, color_stops[color_stops.length - 2][1]]);
		color_cases.push(color_stops[color_stops.length - 1]);

		// fallback value for the 'case' operator (transparent)
		color_cases.push([0, 0, 0, 0]);

		return color_cases;
	}

	function color_stops_changes_helper() {
		if (metadata_loaded) {
			visualize_band();
		}
	}

	function visualize_band() {
		// console.log('Visualizing: ');
		// console.log('selected_band: ', selected_band);
		// console.log('selected_band_diff: ', selected_band_diff);
		// console.log('diff_mode: ', diff_mode);
		// console.log("selected url: ", selected_tif_url);

		// Important note:
		// band selection is a bit tricky here..
		// - band numbers always start at 1
		// - in the GeoTIFF source itself, bands are indexed as they are in the file
		// - in the TileLayer however they are referenced as they are loaded into the source
		// 		- thus when loading 2 bands into the source with e.g. band-number 4 and 50,
		//		they will be re-indexed in the TileLayer to 1 and 2 respectively

		// band selection
		var bands_helper = [];
		if (diff_mode) {
			bands_helper = [selected_band, selected_band_diff];
		} else {
			bands_helper = [selected_band];
		}

		// create new source with current url and band selection
		const source = new GeoTIFF_OL({
			normalize: false,
			sources: [
				{
					bands: bands_helper,
					// url: selected_tif_url
					url: virtual_data_url
				}
			]
		});

		// band selection for color_stops
		var info = [];
		if (diff_mode) {
			// (difference) band 1 - band 2
			info = ['-', ['band', 1], ['band', 2]];
		} else {
			// raw values of band 1
			info = ['band', 1];
		}

		const layerinfo = info;

		// build a color object for openlayers based on the current configuration
		const color_thing = generate_openlayers_case_stops(cg_picker.get_color_stops(), layerinfo);

		// create new layer, with the newly created source and style
		layer = new TileLayer({
			source: source,
			style: {
				color: color_thing
			}
		});

		// TODO: - maybe move that, or at least make sure that it is triggered
		//		 during an error case, else map visualization can become inconsistent
		// removing the old layer if there is one
		if (old_layer != null) {
			map.removeLayer(old_layer);
			map.addLayer(layer);
			old_layer = layer;
		} else {
			map.addLayer(layer);
			old_layer = layer;
		}

		layer.setOpacity(opacity_value);

		// setting the view (not the intended way, but works)
		map.setView(base_view);
	}

	function refresh_foldercontent() {
		// only_convertable true only fetches convertable files
		_fetch_foldercontent_by_type(foldertype, true /* convertable */)
			.then((result) => {
				folder_data = result.content;
			})
			.catch((error) => {
				console.log(error);
			});
	}
</script>

<div class="flex px-4">
	<h1 class="content-heading">Data Visualization</h1>
	<div class="flex-center">
		<EarthAfrica w="38" />
	</div>
</div>

<div class="px-2">
	<FoldertypeChooser bind:foldertype on:foldertype_changed={refresh_foldercontent} />
</div>

<div class="lg:flex px-4 pt-4 w-full">
	{#if foldertype}
		<label
			class="flex max-w-[100px] place-items-center justify-center variant-outline-tertiary p-1"
			for="fileselect">Select file:</label
		>

		<!--TODO: Bare Select will probably not be enough for mobile
	layouts if needed here. Needs replacement by something better. -->
		<select
			id="fileselect"
			class="bg-primary-500 rounded-md p-1 max-lg:max-w-[100%] max-w-[80%] max-lg:mt-1 lg:ml-2"
			bind:value={selected_file}
			on:change={file_selected}
		>
			{#if folder_data}
				{#each folder_data as file_entry}
					<option value={file_entry[0]}>
						{file_entry[0]}
					</option>
				{/each}
			{/if}
		</select>

		{#if metadata_loaded && band_slider_values.length > 1}
			{#if diff_mode}
				<div>
					<button
						class="variant-filled-tertiary p-1 px-2 lg:ml-2 max-lg:mt-1 rounded-md"
						on:click={() => {
							diff_mode = !diff_mode;
						}}>Normal mode</button
					>
				</div>
			{:else}
				<div>
					<button
						class="variant-filled-tertiary hover:bg-tertiary-600 p-1 px-2 lg:ml-2 max-lg:mt-1 rounded-md"
						on:click={() => {
							diff_mode = !diff_mode;
						}}>Compare layer</button
					>
				</div>
			{/if}
		{/if}
	{/if}

	{#if loading_map}
		<div class="flex-center ml-2">
			<LoadingRing size="24px" />
		</div>
	{/if}
</div>

{#if band_slider_values && metadata_loaded}
	{#if band_slider_values.length >= 2}
		<div class="md:flex w-full pl-4 pr-4">
			<div
				class="variant-outline-tertiary min-w-[128px] md:max-w-[128px] mt-2 px-2 pt-1 max-md:grid max-md:grid-cols-1 max-md:justify-items-center"
			>
				<h2>Layer meta data <b>#{selected_band}:</b></h2>
				<div id="band_min">MIN: {current_band_metainfo['min']}</div>
				<div id="band_min">MAX: {current_band_metainfo['max']}</div>
			</div>
			<div class="px-2 variant-outline-tertiary mt-2 pt-1 md:ml-1 w-full">
				<CustomSliderPicker
					valMap={band_slider_values}
					bind:slider_value
					bind:slider_index
					on:slider_changed={on_slider_change}
				/>
			</div>
		</div>

		<!-- If in diff mode .. display a second bandslider to choose the diff band. -->
		{#if diff_mode}
			<div class="md:flex w-full pl-4 pr-4">
				<div
					class="variant-outline-tertiary min-w-[128px] md:max-w-[128px] mt-2 px-2 pt-1 max-md:grid max-md:grid-cols-1 max-md:justify-items-center"
				>
					<h2>Layer meta data <b>#{selected_band_diff}:</b></h2>
					<div id="band_min">MIN: {current_diff_band_metainfo['min']}</div>
					<div id="band_min">MAX: {current_diff_band_metainfo['max']}</div>
				</div>
				<div class="px-2 variant-outline-tertiary mt-2 pt-1 md:ml-1 w-full">
					<CustomSliderPicker
						valMap={band_slider_values}
						bind:slider_value={slider_value_diff}
						bind:slider_index={slider_index_diff}
						on:slider_changed={on_dif_slider_change}
					/>
				</div>
			</div>
		{/if}
	{:else if band_slider_values.length == 1}
		<div class="w-full px-4 mt-2">
			<div class="variant-outline-tertiary grid grid-cols-1 justify-items-center p-2">
				<h2>Single layer metadata</h2>
				<div id="band_min">MIN: {current_band_metainfo['min']}</div>
				<div id="band_min">MAX: {current_band_metainfo['max']}</div>
				<div id="band_timestamp">Start: {current_metadata.timestamp_begin}</div>
			</div>
		</div>
	{/if}
{/if}

<div class={horizontal_scala ? '' : 'flex'}>
	<div class="flex justify-center items-center">
		<ColorGradientPicker
			bind:this={cg_picker}
			bind:color_steps
			bind:horizontal={horizontal_scala}
			on:color_stops_changed={color_stops_changes_helper}
		/>
	</div>

	<div class="px-4 pt-4 w-full relative">
		<div class="absolute z-10 align-top right-[16px] px-1 text-black bg-[#ffffff88]">
			<label>
				Layer opacity {opacity_value.toFixed(2)}
				<input
					on:input={update_layer_opacity}
					bind:value={opacity_value}
					id="opacity-input"
					type="range"
					min="0"
					max="1"
					step="0.01"
				/>
			</label>
		</div>
		<div id="map" class="map" />
	</div>
</div>

<style>
	.map {
		width: 100%;
		height: 800px;
	}
</style>
