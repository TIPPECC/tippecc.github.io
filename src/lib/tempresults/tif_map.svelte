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

	let metadata_loaded: boolean = false;
	let selected_file: string = '';
	let folder_data: any[] = [];
	let foldertype: string = 'water_budget';
	let selected_tif_url: string = '';
	let horizontal_scala: boolean = true;
	let old_layer: any = null;

	let map: Map;

	let base_view = new View({
		center: [0, 0],
		zoom: 2
	});

	let current_band_metainfo = {
		min: 0,
		max: 0
	};

	let cg_picker: ColorGradientPicker;
	let color_stops: any;

	$: color_stops, rebuild_map();

	function rebuild_map() {
		if (!color_stops) {
			return;
		}
	}

	onMount(() => {
		// REPLACE TYPE HERE to fetch specific folders
		_fetch_foldercontent_by_type('water_budget')
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
			throw new Error(`${res.status} ${res.statusText}`);
		}

		result = await res.json();

		var metadata_url =
			API_URL + '/climate/get_temp_file_metadata?type=' + foldertype + '&name=' + selected_file;
		const meta_res = await fetch(metadata_url, {
			method: 'GET'
		});

		let meta_result = [];
		if (!meta_res.ok) {
			throw new Error(`${meta_res.status} ${meta_res.statusText}`);
		}

		meta_result = await meta_res.json();

		var band_metadata = meta_result.metadata.band_metadata;
		current_band_metainfo.min = band_metadata[1].min;
		current_band_metainfo.max = band_metadata[1].max;

		console.log('meta_result: ', meta_result);

		cg_picker.set_bounds(current_band_metainfo.min, current_band_metainfo.max);

		// console.log("Tif result: ", result);
		selected_tif_url = result.filedata.route;
		visualize_band();
		console.log('selected_tif_url: ', selected_tif_url);

		// let selected_file_url =
		// 	API_URL + '/tippecctmp/cache/water_budget/' + selected_file;
	}

	function createTileLayer_singleBand() {}

	function visualize_band() {
		var band_number: number = 1;
		var s_band_number: String = band_number.toString();

		console.log(
			'Creating visualization with band_number: ',
			band_number,
			' and s_band_number: ',
			s_band_number
		);

		const source = new GeoTIFF_OL({
			normalize: false,
			sources: [
				{
					bands: [band_number],
					url: selected_tif_url
					// url: "https://leutra.geogr.uni-jena.de/tippecc_data/tmp/water_budget/" + "CLMcom-KIT-CCLM5-0-15_v1_MOHC-HadGEM2-ES__evspsblpot_all__mm__yearsum_mean_2080_2099.tif"
				}
			]
		});

		const layerbandinfo = ['band', 1];
		const layer = new TileLayer({
			source: source,
			style: {
				color: [
					'case',
					['==', ['band', 1], 0],
					[0, 0, 0, 0],

					// https://openlayers.org/workshop/en/cog/ndvi.html
					['interpolate', ['linear'], layerbandinfo, ...cg_picker.get_color_stops()]
				]
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

		// map.setView(layer.getSource().getView());
		// map.setView(base_view);
	}
</script>

<div class="px-4 pt-4 w-full">
	<label for="fileselect">Select file:</label>
	<select
		id="fileselect"
		class="bg-primary-500 rounded-md p-1"
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
</div>

<div class="rounded-md bg-primary-500 border-white border-[1px] p-2 mt-4 mb-2">
	<h2>Band meta data:</h2>
	<div id="band_min">MIN: {current_band_metainfo['min']}</div>
	<div id="band_min">MAX: {current_band_metainfo['max']}</div>
</div>

<div class={horizontal_scala ? '' : 'flex'}>
	<div class="flex justify-center items-center">
		<ColorGradientPicker
			bind:this={cg_picker}
			bind:color_stops
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
