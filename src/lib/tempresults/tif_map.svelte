<script lang="ts">
	import 'ol/ol.css';
	import { OSM, GeoTIFF as GeoTIFF_OL } from 'ol/source';
	import Map from 'ol/Map.js';
	import View from 'ol/View';
	import TileLayer from 'ol/layer/WebGLTile.js';
	import { _fetch_foldercontent_by_type } from '$lib/fetch_folder_content';
	import { onMount } from 'svelte';
	import { API_URL } from '../../app.config';
	import ColorGradientPicker from '$lib/ColorGradientPicker.svelte';
	import CustomSliderPicker from '$lib/CustomSliderPicker.svelte';

	let metadata_loaded: boolean = false;
	let selected_file: string = '';
	let folder_data: any[any] = [];
	let foldertype: string = 'water_budget';
	let selected_tif_url: string = '';
	let horizontal_scala: boolean = true;
	let old_layer: any = null;

	let slider_value: any;
	let slider_index: any;
	let slider_value_dif: any;
	let slider_index_dif: any;
	let selected_band: number = 1;
	let selected_band_dif: number = 1;
	let current_metadata: any = {};
	let band_slider_values: any[] = [];

	let map: Map;
	let dif_mode: boolean = false;

	let base_view = new View({
		center: [0, 0],
		zoom: 2
	});

	let current_band_metainfo = {
		min: 0,
		max: 0
	};

	let current_dif_band_metainfo = {
		min: 0,
		max: 0
	};

	let cg_picker: ColorGradientPicker;
	let color_steps: any;

	$: color_steps, rebuild_map();

	function rebuild_map() {
		if (!color_steps) {
			return;
		}
	}

	onMount(() => {
		// REPLACE TYPE HERE to fetch specific folders
		_fetch_foldercontent_by_type('water_budget', true)
			.then((result) => {
				folder_data = result;
				console.log(folder_data);
			})
			.catch((error) => {
				console.log(error);
			});
	});

	onMount(() => {
		initialize_map();
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

	function set_color_bounds() {
		if (dif_mode) {
			cg_picker.set_bounds(
				current_band_metainfo.min - current_dif_band_metainfo.max,
				current_band_metainfo.max - current_dif_band_metainfo.min
			);

			// cg_picker.set_bounds(current_dif_band_metainfo.min - current_band_metainfo.max,
			// 					 current_dif_band_metainfo.max - current_band_metainfo.min);
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
		current_dif_band_metainfo.min = band_metadata[selected_band_dif].min;
		current_dif_band_metainfo.max = band_metadata[selected_band_dif].max;
		set_color_bounds();
	}

	async function file_selected(e?) {
		// when a file is selected, we usually want to reset everything
		metadata_loaded = false;
		// console.log('Event: ', e);
		console.log('Selected file: ', selected_file);
		var access_tif_url =
			API_URL + '/climate/access_tif?type=' + foldertype + '&name=' + selected_file;
		const res = await fetch(access_tif_url, {
			method: 'GET'
		});

		let result = [];
		if (!res.ok) {
			var err_msg = await res.text();
			throw new Error(`${res.status} ${res.statusText}\nReason: ${err_msg}`);
		}

		result = await res.json();

		var metadata_url =
			API_URL + '/climate/get_temp_file_metadata?type=' + foldertype + '&name=' + selected_file;
		const meta_res = await fetch(metadata_url, {
			method: 'GET'
		});

		let meta_result = [];
		if (!meta_res.ok) {
			var err_msg = await res.text();
			throw new Error(`${meta_res.status} ${meta_res.statusText}\nReason: ${err_msg}`);
		}

		meta_result = await meta_res.json();

		current_metadata = meta_result.metadata;
		var band_metadata = meta_result.metadata.band_metadata;
		var net_cdf_times = JSON.parse(meta_result.metadata.net_cdf_times);

		current_band_metainfo.min = band_metadata[selected_band].min;
		current_band_metainfo.max = band_metadata[selected_band].max;

		// console.log('meta_result: ', meta_result);
		// console.log('band_metadata: ', band_metadata);
		// console.log('net_cdf_times: ', net_cdf_times);
		// console.log('net_cdf_times TYPE: ', typeof net_cdf_times);

		band_slider_values = [];
		for (let i = 0; i < net_cdf_times.length; i++) {
			band_slider_values.push(parseFloat(net_cdf_times[i]));
		}
		// console.log('band_slider_values: ', band_slider_values);
		cg_picker.set_bounds(current_band_metainfo.min, current_band_metainfo.max);

		// console.log("Tif result: ", result);
		selected_tif_url = result.filedata.route;

		// workaround for local testing
		// selected_tif_url = result.filedata.filename;

		visualize_band();
		console.log('selected_tif_url: ', selected_tif_url);

		// let selected_file_url =
		// 	API_URL + '/tippecctmp/cache/water_budget/' + selected_file;
	}

	function on_slider_change(e?) {
		selected_band = parseInt(slider_index) + 1;
		refresh_band_metadata();
		visualize_band();
	}

	function on_dif_slider_change(e?) {
		selected_band_dif = parseInt(slider_index_dif) + 1;
		refresh_dif_band_metadata();
		visualize_band();
	}

	function generate_openlayers_case_stops(color_stops: any[], layerinfo: any[]) {
		var color_cases = ['case', ['==', layerinfo, 0], [0, 0, 0, 0]];
		for (let i = 0; i < color_stops.length; i++) {
			if (i % 2 == 0) {
				// console.log("Current UB: ", color_stops[i], " current LB: ", color_stops[i][1]);
				color_cases.push(['between', layerinfo, color_stops[i][0], color_stops[i][1]]);
			} else {
				color_cases.push(color_stops[i]);
			}
		}

		// TODO:
		// 	- maybe add case here for datapoints that exceed the min-/max-values (should only
		//	be needed when custom min/max is set)
		color_cases.push(['<', layerinfo, color_stops[0][0]]);
		color_cases.push(color_stops[1]);

		color_cases.push(['>', layerinfo, color_stops[color_stops.length - 2][1]]);
		color_cases.push(color_stops[color_stops.length - 1]);
		// adding limits

		// fallback value for the 'case' operator
		color_cases.push([0, 0, 0, 0]);

		// console.log("Generated ol-stops: ", color_cases)
		return color_cases;
	}

	function visualize_band() {
		// console.log('Visualizing: ');
		// console.log('selected_band: ', selected_band);
		// console.log('selected_band_dif: ', selected_band_dif);
		// console.log('dif_mode: ', dif_mode);
		// console.log("selected url: ", selected_tif_url);

		// Important note:
		// band selection is a bit tricky here..
		// - band numbers always start at 1
		// - in the GeoTIFF source itself, bands are indexed as they are in the file
		// - in the TileLayer however they are referenced as they are loaded into the source
		// 		- thus when loading 2 bands into the source with e.g. band-number 4 and 50,
		//		they will be re-indexed in the TileLayer to 1 and 2 respectively

		var bands_helper = [];
		if (dif_mode) {
			bands_helper = [selected_band, selected_band_dif];
		} else {
			bands_helper = [selected_band];
		}

		const source = new GeoTIFF_OL({
			normalize: false,
			sources: [
				{
					// Alle baender 1,2,3,4,5,6,.....
					bands: [selected_band, selected_band_dif],
					// TODO:
					// 	- there are still some errors left with some tif files, (invalid byte order value, ..)
					url: selected_tif_url
					// url: "https://leutra.geogr.uni-jena.de/tippecc_data/tmp/water_budget/" + "CLMcom-KIT-CCLM5-0-15_v1_MOHC-HadGEM2-ES__evspsblpot_all__mm__yearsum_mean_2080_2099.tif"
					// url:
					// 	'https://leutra.geogr.uni-jena.de/tippecc_data/tmp/water_budget/bias/' +
					// 	'b_CLMcom-KIT-CCLM5-0-15_v1_MPI-M-MPI-ESM-LR__water_budget_all__mm__yearsum.tif'
					// max: current_band_metainfo.max
				}
			]
		});

		var info = [];
		if (dif_mode) {
			info = ['-', ['band', 1], ['band', 2]];
		} else {
			info = ['band', 1];
		}

		const layerinfo = info;

		const color_thing = generate_openlayers_case_stops(cg_picker.get_color_stops(), layerinfo);

		// const color_thing = [
		// 	'case',
		// 	['==', ['band', 1], 0],
		// 	[0, 0, 0, 0],
		// 	['>', ['band', 1], 0],
		// 	[0, 0, 0, 0],

		// 	// https://openlayers.org/workshop/en/cog/ndvi.html
		// 	['interpolate', ['linear'], layerbandinfo, [...cg_picker.get_color_stops()]]
		// ];

		console.log('COLOR_THING: ', color_thing);
		// const color_thing = [
		// 			// https://openlayers.org/workshop/en/cog/ndvi.html
		// 			'interpolate', ['linear'], layerbandinfo, ...cg_picker.get_color_stops()
		// 		]
		console.log('color_thing: ', color_thing);
		const layer = new TileLayer({
			source: source,
			style: {
				color: color_thing
			}
		});

		if (old_layer != null) {
			map.removeLayer(old_layer);
			map.addLayer(layer);
			old_layer = layer;
		} else {
			map.addLayer(layer);
			old_layer = layer;
		}

		console.log('MAPLAYERS: ', map.getLayers());

		// map.setView(layer.getSource().getView());
		map.setView(base_view);
	}
</script>

<div class="lg:flex px-4 pt-4 w-full">
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
		{#if folder_data['content']}
			{#each folder_data['content'] as file_entry}
				<option value={file_entry[0]}>
					{file_entry[0]}
				</option>
			{/each}
		{/if}
	</select>

	{#if dif_mode}
		<div>
			<button
				class="variant-filled-tertiary p-1 px-2 lg:ml-2 max-lg:mt-1 rounded-md"
				on:click={() => {
					dif_mode = !dif_mode;
				}}>Normal mode</button
			>
		</div>
	{:else}
		<div>
			<button
				class="variant-filled-tertiary hover:bg-tertiary-600 p-1 px-2 lg:ml-2 max-lg:mt-1 rounded-md"
				on:click={() => {
					dif_mode = !dif_mode;
				}}>Dif mode</button
			>
		</div>
	{/if}
</div>

{#if band_slider_values}
	{#if band_slider_values.length >= 2}
		<div class="md:flex w-full pl-4 pr-4">
			<div
				class="variant-outline-tertiary min-w-[128px] md:max-w-[128px] mt-2 px-2 pt-1 max-md:grid max-md:grid-cols-1 max-md:justify-items-center"
			>
				<h2>Band meta data <b>#{selected_band}:</b></h2>
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

		{#if dif_mode}
			<div class="md:flex w-full pl-4 pr-4">
				<div
					class="variant-outline-tertiary min-w-[128px] md:max-w-[128px] mt-2 px-2 pt-1 max-md:grid max-md:grid-cols-1 max-md:justify-items-center"
				>
					<h2>Band meta data <b>#{selected_band_dif}:</b></h2>
					<div id="band_min">MIN: {current_dif_band_metainfo['min']}</div>
					<div id="band_min">MAX: {current_dif_band_metainfo['max']}</div>
				</div>
				<div class="px-2 variant-outline-tertiary mt-2 pt-1 md:ml-1 w-full">
					<CustomSliderPicker
						valMap={band_slider_values}
						bind:slider_value={slider_value_dif}
						bind:slider_index={slider_index_dif}
						on:slider_changed={on_dif_slider_change}
					/>
				</div>
			</div>
		{/if}
	{/if}
{/if}

<div class={horizontal_scala ? '' : 'flex'}>
	<div class="flex justify-center items-center">
		<ColorGradientPicker
			bind:this={cg_picker}
			bind:color_steps
			bind:horizontal={horizontal_scala}
			on:color_stops_changed={visualize_band}
		/>
	</div>

	<div class="px-4 pt-4 w-full">
		<div id="map" class="map" />
	</div>
</div>

<style>
	.map {
		width: 100%;
		height: 800px;
	}
</style>
