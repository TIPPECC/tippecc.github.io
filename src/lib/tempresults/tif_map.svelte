<script lang="ts">
	import { writable } from 'svelte/store';
	import 'ol/ol.css';
	import { OSM, GeoTIFF as GeoTIFF_OL } from 'ol/source';
	import Map from 'ol/Map.js';
	import View from 'ol/View';
	import TileLayer from 'ol/layer/WebGLTile.js';
	import { _fetch_foldercontent_by_type } from '$lib/fetch_folder_content';
	import { onMount } from 'svelte';
	import { API_URL } from '../../app.config';
	// import * as GeoTIFF_JS from 'geotiff';
	import CustomGradientPicker from '$lib/CustomGradientPicker.svelte';
	import CustomSliderPicker from '$lib/CustomSliderPicker.svelte';
	import { browser } from '$app/environment';
	import FoldertypeChooser from './folderytpe_chooser.svelte';
	import EarthAfrica from '$lib/icons/earth_africa.svelte';
	import LoadingRing from '$lib/LoadingRing.svelte';
	import { tick } from 'svelte';
	import { Fill, Stroke, Style } from 'ol/style.js';
	import Select from 'ol/interaction/Select.js';
	import { Point } from 'ol/geom';
	import Feature from 'ol/Feature';
	import VectorSource from 'ol/source/Vector';
	import VectorLayer from 'ol/layer/Vector';
	import { fromUrl } from 'geotiff';
	import CircleStyle from 'ol/style/Circle';
	import Chart from 'chart.js/auto';
	import 'chartjs-plugin-trendline';
	import annotationPlugin from 'chartjs-plugin-annotation';
	import regression from 'regression';
	Chart.register(annotationPlugin);

	const TWELVE_HOURS = 43200000; // 12 hours in ms, for date calculation
	let time_interval_mode = 0; // 0 .. years, 1 .. months, 2 .. days

	let metadata_loaded: boolean = false; // trigger variable indicating metadata is loaded
	let loading_map: boolean = false; // trigger variable indicating map is loaded
	let horizontal_scala: boolean = true; // bool indicating horizontal/vertical scala
	let diff_mode: boolean = false; // bool indicating diff- (comparing 2 bands), or normal-mode (1 band only)

	let folder_data: any[any] = []; // choosable files
	let fildered_folder_data: any[] = []; // filtered files
	export let foldertype: string = 'water_budget'; // string of selected foldertype
	export let selected_file: string = ''; // string of selected file
	let selected_tif_url: string = ''; // url of selected file
	let virtual_data_url: string = ''; // helper variable carrying selected file as virtual url
	let file_search_term: string = ''; // current string input in file search field
	let file_selector: HTMLSelectElement;

	let slider_value: any; // slider value of main slider
	let slider_index: any; // slider index of main slider
	let slider_value_diff: any; // slider value of diff slider
	let slider_index_diff: any; // slider index of diff slider
	let selected_band: number = 1; // selected main band
	let selected_band_diff: number = 1; // selected diff band
	let band_slider_values: any[] = []; // array carrying timestamps for main band
	let band_slider_dates: any[] = []; // array carrying timestamps for diff band

	let cg_picker: CustomGradientPicker; // Color Picker

	let old_layer: any = null; // helper variable for removing layer
	let layer: any = null; // layer for TIFF data
	let opacity_value = 1.0; // opacity for TIFF data layer
	let file_metadata: any = {}; // dict carrying file metadata

	let map: Map; // openlayers map

	// predefined custom base view
	let base_view = new View({
		center: [25, -15],
		projection: 'EPSG:4326',
		zoom: 4.7
	});

	// min/max of current main band
	let current_band_metainfo = {
		min: 0,
		max: 0,
		noDataValue: NaN
	};

	// min/max of current diff band
	let current_diff_band_metainfo = {
		min: 0,
		max: 0,
		noDataValue: NaN
	};

	// Create a vector source and layer for the selected point
	const vectorSource = new VectorSource();
	const vectorLayer = new VectorLayer({
		source: vectorSource,
		style: new Style({
			image: new CircleStyle({
				radius: 6,
				fill: new Fill({
					color: 'rgba(255, 0, 0, 0.5)'
				}),
				stroke: new Stroke({
					color: 'rgba(255, 0, 0, 1)',
					width: 2
				})
			})
		})
	});

	function update_layer_opacity() {
		if (!layer) {
			return;
		}
		layer.setOpacity(opacity_value);
	}

	onMount(() => {
		refresh_foldercontent();
	});

	onMount(() => {
		initialize_map();
		// TEST
		changeInteraction();
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

	let chart; // Chart object
	onMount(() => {
		let ctx = document.getElementById('chart').getContext('2d');
		let highlightIndex = 2; // Index of highlighted point
		chart = new Chart(ctx, {
			type: 'line',
			data: {
				labels: [],
				datasets: [
					{
						label: 'Value',
						data: [],
						borderColor: 'lightgreen'
					},
					{ label: 'Trendline', data: [], borderColor: 'red', borderDash: [5, 5], fill: false },

					{
						label: 'Moving Average (10)',
						data: [],
						borderColor: 'lightblue',
						borderDash: [5, 10],
						fill: false
					}
				]
			},
			options: {
				responsive: true,
				scales: {
					x: {
						title: { display: true, text: 'Year', color: 'white' },
						ticks: { color: 'white' }
					},
					y: {
						title: { display: true, text: 'Value', color: 'white' },
						ticks: { color: 'white' }
					}
				},
				plugins: {
					legend: {
						labels: {
							color: 'white'
						}
					},
					annotation: {
						annotations: {
							highlightLine: {
								type: 'line',
								xMin: highlightIndex,
								xMax: highlightIndex,
								borderColor: 'red',
								borderWidth: 2,
								display: true, // Hide initially
								label: {
									content: 'Highlighted Time',
									enabled: true,
									position: 'top'
								}
							}
						}
					}
				}
			}
		});
	});
	/**
	 * Update the chart with new data.	Add trendline and moving average.
	 * @param data
	 */

	let show_chart = writable(false);
	function updateChart(
		data:
			| string
			| any[]
			| Int8Array<ArrayBuffer>
			| Uint8Array<ArrayBuffer>
			| Uint16Array<ArrayBuffer>
			| Int16Array<ArrayBuffer>
			| Uint32Array<ArrayBuffer>
			| Int32Array<ArrayBuffer>
			| Float32Array<ArrayBuffer>
			| Float64Array<ArrayBuffer>
	) {
		const years = band_slider_values; // Example years

		// Calculate trendline
		const regressionData = years.map((year, i) => [year, data[i]]);
		const trend = regression.linear(regressionData);
		const trendValues = years.map((year) => trend.predict(year)[1]); // Get y-values for trendline

		// Moving Window Average
		let ema = [];
		let windowSize = 10;
		let multiplier = 2 / (windowSize + 1);

		// First EMA value is just the first data point
		ema[0] = data[0];

		for (let i = 1; i < data.length; i++) {
			ema[i] = (data[i] - ema[i - 1]) * multiplier + ema[i - 1];
		}

		$show_chart = true;
		chart.data.labels = years;

		// Set data for the chart
		chart.data.datasets[0].data = data;
		chart.data.datasets[1].data = trendValues;
		chart.data.datasets[2].data = ema;

		chart.update();
	}

	// Function to update highlight dynamically
	function updateHighlight(highlightIndex: number) {
		//const highlightIndex = index;
		if (!chart) {
			return;
		}
		chart.options.plugins.annotation.annotations.highlightLine.xMin = highlightIndex;
		chart.options.plugins.annotation.annotations.highlightLine.xMax = highlightIndex;
		chart.options.plugins.annotation.annotations.highlightLine.display = true; // Show the line
		chart.update();
	}

	let coordinates = writable<number[]>([]);
	/**
	 * Run once on page init. Creates the map object for openlayers and
	 * connects input events.
	 */
	function initialize_map() {
		map = new Map({
			target: 'map',
			layers: [
				new TileLayer({
					source: new OSM()
				}),
				vectorLayer
			],
			view: base_view
		});

		// pointermove trigger function to read hovered data point
		function displayPixelValue(event) {
			if (!layer) {
				return;
			}
			const data = layer.getData(event.pixel);
			if (!data) {
				return;
			}

			// the current data point of the raster
			const data_zero = data[0];

			var hov_pix_x = document.getElementById('hovering_pixel_x');
			var hov_pix_y = document.getElementById('hovering_pixel_y');
			if (hov_pix_x != null) {
				hov_pix_x.textContent = event.pixel[0].toFixed(0);
			}

			if (hov_pix_y != null) {
				hov_pix_y.textContent = event.pixel[1].toFixed(0);
			}

			var hov_val = document.getElementById('hovering_value');
			if (hov_val != null) {
				if (diff_mode) {
					var data_one = 0.0;
					if (data.length > 2) {
						data_one = data[1];
						hov_val.textContent = (data_zero - data_one).toFixed(2).toString();
					}
				} else {
					hov_val.textContent = data_zero.toFixed(2);
				}
			}
			coordinates.set([...event.coordinate]);
		}
		map.on(['pointermove', 'click'], displayPixelValue);

		// click trigger function to read clicked data point and show time series
		map.on('click', async (event) => {
			const coordinate = event.coordinate; // Get map coordinates
			console.log(coordinate);
			//const pixel = map.getPixelFromCoordinate(coordinate);
			const data = await getTimeSeriesFromGeoTIFF(coordinate);

			if (data) {
				// console.log(data);
				updateChart(data);

				// Add a point to the map at the selected location
				const point = new Point(coordinate);
				const feature = new Feature(point);
				vectorSource.clear(); // Clear previous points
				vectorSource.addFeature(feature);
			}
		});
	}

	/**
	 * Helper function to fetch a tiff file and generate a blob into a virtual data
	 * url of the file used for openlayers visualization.
	 * @param geotiff_url URL of the chosen file
	 */
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
		// TODO:
		// 		- check if visualization is still possible with direct url instead of virtual geotiff url
		//		- depending on the outcome, maybe remove geotiff entirely
	}

	/**
	 * Helper function to forward an external change in bounds to the GradientPicker.
	 */
	async function set_color_bounds() {
		await tick();

		if (diff_mode) {
			cg_picker.set_bounds_real(
				// this metric is very unrealistic, but is ok for now
				// maybe add a hint for the user to calibrate with custom max/min values
				current_band_metainfo.min - current_diff_band_metainfo.max,
				current_band_metainfo.max - current_diff_band_metainfo.min,
				true
			);
		} else {
			cg_picker.set_bounds_real(current_band_metainfo.min, current_band_metainfo.max, true);
		}
	}

	async function refresh_band_metadata() {
		var band_metadata = file_metadata['bands'];
		current_band_metainfo.min = band_metadata[selected_band].min;
		current_band_metainfo.max = band_metadata[selected_band].max;
		await set_color_bounds();
	}

	async function refresh_dif_band_metadata() {
		var band_metadata = file_metadata['bands'];
		current_diff_band_metainfo.min = band_metadata[selected_band_diff].min;
		current_diff_band_metainfo.max = band_metadata[selected_band_diff].max;
		await set_color_bounds();
	}

	function evaluate_timestamp_data(timestemp: any, net_cdf_times: any) {
		// read timestamp and calculated values for the bandslider
		band_slider_values = [];

		var timestamp_begin = file_metadata['time#units'];
		var timestamp_data = timestamp_begin.split(' ');

		// timestamp_data is an arbitrary string array which we first want to analyze
		const regex = /^[^0-9]*$/;

		function doesNotContainNumber(str: string) {
			return regex.test(str);
		}

		var start_date = NaN;
		var time_prefix = 'days';
		// we assume always some form of "days/years since timestemp..."
		for (var i = 0; i < timestamp_data.length; i++) {
			var cur_el: string = timestamp_data[i];
			if (doesNotContainNumber(cur_el)) {
				if (cur_el != 'since') {
					if (cur_el == 'years' || cur_el == 'days') {
						time_prefix = cur_el;
					} else {
						console.log('Encountered new Time Prefix: ', cur_el);
					}
				}
			} else {
				start_date = Date.parse(cur_el);
				if (isNaN(start_date)) {
					// console.log("NaN Start Date: ", cur_el)
				} else {
					// console.log("Start Date: ", cur_el, " ", start_date);
					// For now we finish here, take the date, and assume a current
					// clocktime of 00:00:00
					break;
				}
			}
		}

		if (isNaN(start_date)) {
			console.log('Could not parse metadata timestamp.');
			timestamp_begin = '';
			throw new Error('Metadata timestamp is invalid.');
		}

		var time_prefix_multiplier = 1.0;
		// days of a year after gregorian calendar - multiplier
		if (time_prefix == 'years') time_prefix_multiplier = 365.2425;
		// console.log("Time Prefix and Multi: ", time_prefix, " ", time_prefix_multiplier);

		try {
			var last_date = parseFloat(net_cdf_times[net_cdf_times.length - 1]);
			if (last_date > 365.0) {
				time_interval_mode = 0;
			} else {
				time_interval_mode = 1;
			}
			if (timestamp_begin == '') {
				// invalid timestamp -> default to raw net_cdf_time values as bandslider values
				for (let i = 0; i < net_cdf_times.length; i++) {
					band_slider_values.push(parseFloat(net_cdf_times[i]));
				}
			} else {
				// valid timestamp -> calculate years (for now) and assign to bandslider values
				for (let i = 0; i < net_cdf_times.length; i++) {
					if (time_interval_mode == 0) {
						band_slider_values.push(
							new Date(
								start_date +
									parseFloat(net_cdf_times[i]) * TWELVE_HOURS * 2 * time_prefix_multiplier
							).getFullYear()
						);
					} else if (time_interval_mode == 1) {
						band_slider_values.push(
							new Date(
								start_date +
									parseFloat(net_cdf_times[i]) * TWELVE_HOURS * 2 * time_prefix_multiplier
							).toLocaleDateString()
						);
					}

					band_slider_dates.push(
						start_date + parseFloat(net_cdf_times[i]) * TWELVE_HOURS * 2 * time_prefix_multiplier
					);
				}
			}
		} catch (error) {
			console.log(`Encountered error while assigning net_cdf_values to bandslider: ${error}`);
		}
	}

	/**
	 * Try to interprate file metadata (min, max, timestamp, bands, netcdf_times, ..).
	 */
	async function evaluate_file_metadata() {
		// console.log("FILE META:\n");
		// console.log(file_metadata);
		// check keys
		if (
			!file_metadata.bands ||
			!file_metadata.NETCDF_DIM_time_VALUES ||
			!file_metadata['time#units']
		) {
			loading_map = false;
			throw new Error(
				'Missing either bands, NETCDF_DIM_time_VALUES or time#units on metadata. Visualization impossible.. Aborting.'
			);
		}

		// assign band_metadata and read net_cdf_times
		var band_metadata = file_metadata.bands;
		try {
			var net_cdf_times = file_metadata.NETCDF_DIM_time_VALUES;
		} catch (error) {
			console.log(
				`Could not parse NETCDF_DIM_time_VALUES. Visualization impossible.. Aborting. Reason:\n ${error}`
			);
		}

		// read minimum and maximum from metadata
		try {
			var meta_min = parseFloat(band_metadata[selected_band].min);
			var meta_max = parseFloat(band_metadata[selected_band].max);
			var noDataValue = parseFloat(band_metadata[selected_band].noDataValue);
			var noDataValueDiff = parseFloat(band_metadata[selected_band_diff].noDataValue);

			if (isNaN(meta_min) || isNaN(meta_max)) {
				loading_map = false;
				throw new Error('Meta_min or Meta_max evaluated to NaN.');
			}

			current_band_metainfo.min = meta_min;
			current_band_metainfo.max = meta_max;
			current_band_metainfo.noDataValue = noDataValue;
			current_diff_band_metainfo.noDataValue = noDataValueDiff;

			current_diff_band_metainfo.min = meta_min;
			current_diff_band_metainfo.max = meta_max;
		} catch (error) {
			console.log(
				`Could not parse meta_min ${band_metadata[selected_band].min} or meta_max ${band_metadata[selected_band].max}.`
			);
			console.log(`Reason: ${error}`);
			console.log(
				'Defaulting to min: -1000.0 and max: +1000.0 ... Change them in the Colorpicker as needed.'
			);
			current_band_metainfo.min = -1000.0;
			current_band_metainfo.max = 1000.0;
			current_diff_band_metainfo.min = -1000.0;
			current_diff_band_metainfo.max = 1000.0;
		}

		evaluate_timestamp_data(file_metadata['time#units'], net_cdf_times);

		// // read timestamp and calculated values for the bandslider
		// band_slider_values = [];

		// var timestamp_begin = file_metadata['time#units'];
		// var timestamp_data = timestamp_begin.split(' ');
		// console.log('TIMESTAMP DATA: \n', timestamp_data);

		// // start date of the metadata timestamp in milliseconds
		// var start_date = NaN;
		// for (var i = 0; i < timestamp_data.length; i++) {
		// 	start_date = Date.parse(timestamp_data[i]);
		// 	if (!isNaN(start_date)) {
		// 		break;
		// 	}
		// }

		// if (isNaN(start_date)) {
		// 	console.log('Could not parse metadata timestamp.');
		// 	timestamp_begin = '';
		// 	throw new Error('Metadata timestamp is invalid.');
		// }

		// try {
		// 	var last_date = parseFloat(net_cdf_times[net_cdf_times.length - 1]);
		// 	if (last_date > 365.0) {
		// 		time_interval_mode = 0;
		// 	} else {
		// 		time_interval_mode = 1;
		// 	}
		// 	if (timestamp_begin == '') {
		// 		// invalid timestamp -> default to raw net_cdf_time values as bandslider values
		// 		for (let i = 0; i < net_cdf_times.length; i++) {
		// 			band_slider_values.push(parseFloat(net_cdf_times[i]));
		// 		}
		// 	} else {
		// 		// valid timestamp -> calculate years (for now) and assign to bandslider values
		// 		for (let i = 0; i < net_cdf_times.length; i++) {
		// 			if (time_interval_mode == 0) {
		// 				band_slider_values.push(
		// 					new Date(start_date + parseFloat(net_cdf_times[i]) * TWELVE_HOURS * 2).getFullYear()
		// 				);
		// 			} else if (time_interval_mode == 1) {
		// 				band_slider_values.push(
		// 					new Date(
		// 						start_date + parseFloat(net_cdf_times[i]) * TWELVE_HOURS * 2
		// 					).toLocaleDateString()
		// 				);
		// 			}

		// 			band_slider_dates.push(start_date + parseFloat(net_cdf_times[i]) * TWELVE_HOURS * 2);
		// 		}
		// 	}
		// } catch (error) {
		// 	console.log(`Encountered error while assigning net_cdf_values to bandslider: ${error}`);
		// }
	}

	/**
	 * A file was selected. Try to request file from server, read metadata,
	 * and trigger visualization.
	 * @param _e select option event
	 */
	async function file_selected(_e?: any) {
		// when a file is selected, we usually want to reset everything
		// console.log('Selected file: ', selected_file);
		metadata_loaded = false;
		loading_map = true;
		await tick();

		// reset global helper variables
		selected_band = 1;
		selected_band_diff = 1;
		slider_index = 0;
		slider_index_diff = 0;
		diff_mode = false;

		// reset chart
		chart.data.labels = [];
		chart.data.datasets[0].data = [];
		chart.data.datasets[1].data = [];
		chart.data.datasets[2].data = [];
		chart.update();

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

		if (!meta_result.metadata) {
			loading_map = false;
			throw new Error('No metadata on the current metadata response.');
		}

		// succesfully gained access to tif file and fetched metadata..
		//		- -> now assemble metadata and visualize
		file_metadata = meta_result.metadata;
		await evaluate_file_metadata();

		// set CustomGradientPicker bounds to file metadata min and max
		cg_picker.set_bounds_real(current_band_metainfo.min, current_band_metainfo.max, true);

		// assign direct file url
		selected_tif_url = result.filedata.route;
		// console.log('Fetching route for file: \n', selected_tif_url);

		// Trigger svelte to show loaded metadata
		metadata_loaded = true;
		loading_map = false;

		// fetch the full file with geotiff and trigger band visualization
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

	/**
	 * Event for when the slider picker of the MAIN BAND was moved.
	 * @param _e Sliderpicker moved
	 */
	async function on_slider_change(_e?: any) {
		await tick();
		selected_band = parseInt(slider_index) + 1;
		await refresh_band_metadata();
		visualize_band();
		updateHighlight(selected_band - 1); // update highlight	in chart
	}

	/**
	 * Event for when the slider picker of the DIFF BAND was moved.
	 * @param _e Sliderpicker moved
	 */
	async function on_dif_slider_change(_e?: any) {
		await tick();
		selected_band_diff = parseInt(slider_index_diff) + 1;
		await refresh_dif_band_metadata();
		visualize_band();
	}

	/**
	 * Custom object generation function for openlayers color style object.
	 * Documented under: https://openlayers.org/en/latest/apidoc/module-ol_style_expressions.html
	 * @param color_stops
	 * @param layerinfo
	 * @param noDataValue
	 */
	function generate_openlayers_case_stops(color_stops: any[], layerinfo: any[], noDataValue: any) {
		// only 0.00 default noDataValue
		var color_cases = ['case', ['==', layerinfo, 0], [0, 0, 0, 0]];
		if (isNaN(noDataValue) || noDataValue == 'NaN') {
			// do nothing
		} else {
			// 0.00 default noDataValue + band specific
			color_cases = [
				'case',
				['==', layerinfo, 0],
				[0, 0, 0, 0],
				['==', layerinfo, noDataValue],
				[0, 0, 0, 0]
			];
		}

		for (let i = 0; i < color_stops.length; i++) {
			if (i % 2 == 0) {
				// current range of values
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

	/**
	 * Helper function to forward the color_stops_changed signal of the GradientPicker.
	 */
	function color_stops_changed_signaler() {
		if (metadata_loaded) {
			visualize_band();
		}
	}

	/**
	 * Invert the state of diff_mode.
	 * Triggers a slider change to re-evaluate color calculation and map visualization.
	 */
	async function toggle_diff_mode() {
		diff_mode = !diff_mode;
		if (diff_mode) {
			cg_picker.set_bounds_real(
				current_band_metainfo.min - current_diff_band_metainfo.max,
				current_band_metainfo.max - current_diff_band_metainfo.min
			);
			await on_dif_slider_change();
		} else {
			cg_picker.set_bounds_real(current_band_metainfo.min, current_band_metainfo.max);
			await on_slider_change();
		}
	}

	// select interaction working on "singleclick"
	const selectSingleClick = new Select({ style: selectStyle });
	let select = selectSingleClick; // ref to currently selected interaction

	const selected = new Style({
		fill: new Fill({
			color: '#eeeeee'
		}),
		stroke: new Stroke({
			color: 'rgba(255, 255, 255, 0.7)',
			width: 2
		})
	});

	function selectStyle(feature) {
		const color = feature.get('COLOR') || '#eeeeee';
		selected.getFill()?.setColor(color);
		return selected;
	}

	const changeInteraction = function () {
		map.addInteraction(select);

		select.on('select', function (e) {
			document.getElementById('status').innerHTML =
				'&nbsp;' +
				e.target.getFeatures().getLength() +
				' selected features (last operation selected ' +
				e.selected.length +
				' and deselected ' +
				e.deselected.length +
				' features)';
		});
	};

	/**
	 * (Re)-build and (re)-place layer and source for the map.
	 */
	function visualize_band() {
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
			// NOTE:
			//	- sadly openlayers does not natively understand custom noDataValues like -9999 here
			//	- this results in many falsely colored pixels when e.g. the pixel in band 1 has a value
			//	but the pixel in the diff band 2 has a noDataValue of -9999 -> openlayers just substracts these
			//	creating a senseless result which we can not prevent currently....
			//	- gpt suggested overwriting the band-diff function from ol.source.Rastere as a solution
			bands_helper = [selected_band, selected_band_diff];
		} else {
			bands_helper = [selected_band];
		}

		// create new source with current url and band selection
		const source = new GeoTIFF_OL({
			// all of these 3 are very important
			// without these, data might be adulterated
			projection: 'EPSG:4326',
			normalize: false,
			interpolate: false,

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

		// console.log('CG_STOPS: \n', cg_picker.get_color_boundaries('rgb'));
		// build a color object for openlayers based on the current configuration
		const color_thing = generate_openlayers_case_stops(
			cg_picker.get_color_boundaries('rgb'),
			layerinfo,
			current_band_metainfo['noDataValue']
		);
		// console.log('GENERATED STOPS: \n', color_thing);

		// create new layer, with the newly created source and style
		layer = new TileLayer({
			source: source,
			style: {
				color: color_thing
			}
		});

		// removing the old layer if there is one (currently does not trigger in error case)
		if (old_layer != null) {
			map.removeLayer(old_layer);
			map.removeLayer(vectorLayer);
			map.addLayer(layer);
			map.addLayer(vectorLayer);
			old_layer = layer;
		} else {
			map.removeLayer(vectorLayer);
			map.addLayer(layer);
			map.addLayer(vectorLayer);
			old_layer = layer;
		}

		layer.setOpacity(opacity_value);
		map.setView(base_view);

		// console.log("Source Keys: \n", source.getKeys()); // empty
		// console.log("Source Properties: \n", source.getProperties()); // empty
		// console.log("Source TileGrid: \n", source.getTileGrid()); // null
		// console.log("Source getTilePixelRatio: \n", source.getTilePixelRatio(1)); // ??? returns 1 usually
		// console.log("Source extent: \n", source.getExtent()); //

		// console.log(":", layer.getSource().getExtent());

		// console.log("Layer extent: \n", layer.getExtent()); // null (normally) ... this returns the LAYER's extent

		// const helper_projection = source.getProjection();
		// if (helper_projection != null) {
		// 	console.log("Source getTile: \n", source.getTile(0, 0, 0, source.getTilePixelRatio(0), helper_projection)); // ??? returns 1 usually
		// }
	}

	/**
	 * Fetches choosable files for display.
	 */
	async function refresh_foldercontent() {
		// only_convertable true only fetches convertable files
		await _fetch_foldercontent_by_type(foldertype, true /* convertable */)
			.then((result) => {
				folder_data = result.content;
			})
			.catch((error) => {
				console.log(error);
			});

		// when we change the folder we clear the filename search
		file_search_term = '';
		filesearch_input_changed();
	}

	function filesearch_input_changed() {
		fildered_folder_data = [];
		var search_term_bits = file_search_term.split(' ');
		// console.log("Searching: ", search_term_bits);

		for (var key in folder_data) {
			var f_name = folder_data[key]['filename'];
			var f_name_helper: string = f_name.toLowerCase();
			var ignore_file: boolean = false;
			for (var i in search_term_bits) {
				if (!f_name_helper.includes(search_term_bits[i].toLowerCase())) {
					ignore_file = true;
					continue;
				}
			}
			if (!ignore_file) {
				// console.log("F-Name: ", f_name);
				fildered_folder_data.push(f_name);
			}
		}

		fildered_folder_data = fildered_folder_data;
		set_cat_folder_data();
	}

	/**
	 * Fetches time series data from a GeoTIFF file at a given coordinate.
	 * @param coordinate
	 */
	async function getTimeSeriesFromGeoTIFF(coordinate) {
		const tiff = await fromUrl(virtual_data_url);
		const image = await tiff.getImage();
		const rasterData = await image.readRasters();

		const bbox = image.getBoundingBox();
		const width = image.getWidth();
		const height = image.getHeight();
		const [x_res, y_res] = image.getResolution(); // Get resolution
		const isFlipped = y_res < 0; // Check if Y-axis is flipped

		// Convert map coordinates to pixel coordinates
		let x = Math.round(((coordinate[0] - bbox[0]) / (bbox[2] - bbox[0])) * (width - 1));
		let y = Math.round(((coordinate[1] - bbox[1]) / (bbox[3] - bbox[1])) * (height - 1));

		// Flip Y index if necessary
		if (isFlipped) {
			y = height - 1 - y;
		}

		// Ensure x and y are within bounds
		x = Math.max(0, Math.min(x, width - 1));
		y = Math.max(0, Math.min(y, height - 1));

		let values = rasterData.map((band) => band[y * width + x]);

		return values; // Time series data
	}
	let cat_folder_data: any = [];
	let variables: any = [];
	let categories: any = [];
	let full_var: any = [];
	import folder_types from '$lib/tempresults/folder_types.json';
	function set_cat_folder_data() {
		// Regex pattern to match filenames
		let filePattern = /(^(.+)_v(\d+)_([^_]+))|^((.+)_day_([^_]+)|^(.+))/; // Regex pattern to match filenames
		const folder_type = folder_types.find((x) => x.key == foldertype);
		if (folder_type && folder_type.header_regex.length > 2) {
			filePattern = new RegExp(folder_type.header_regex.replace(/\\/g, '\\'));
		} else {
			// console.error(`Folder type ${foldertype} not found.`);
		}
		console.log('filePattern: ', filePattern);
		cat_folder_data = {};
		categories: [];
		variables = [];
		full_var = [];

		// categories['No Category'] = { files: [], toggled: false };

		for (let x = 0; x < folder_data.length; x++) {
			var filename: string = folder_data[x]['filename'];
			const match = filename.match(filePattern);

			if (match && match.length >= 3) {
				const category = match[0];

				// match first part of filename under first "__" and save it as variable ( e.g. __evspsblpot_all__mm__yearsum_mean_2080_2099.nc, __water_budget_all__mm__yearsum_mean_1981_2000.nc, ...)
				const regex = /^(_*[^_]*_[^_]+)/g;
				let matches = filename.replace(match[0], '').replace('.nc', '').match(regex);
				let variable = '';
				if (matches) {
					// console.log('matches: ', matches);
					variable = matches[0]
						.replace(/_\d{4}/g, '')
						.replace(/^_+/, '')
						.replace('_Afr', '');
					if (!variables.includes(variable)) {
						variables.push(variable);
					}

					if (
						!full_var.includes(
							filename
								.replace(match[0], '')
								.replace(matches[0], '')
								.replace(/^_+/, '')
								.replace('.nc', '')
						)
					) {
						full_var.push(
							filename
								.replace(match[0], '')
								.replace(matches[0], '')
								.replace(/^_+/, '')
								.replace('.nc', '')
						);
					}
				}
				// console.log('matches: ', match[1]);

				if (!categories.includes(category)) {
					categories.push(category);
				}

				//categories[category].files.push({ filename: filename, index: x });
			}
		}

		categories = [...categories];
		variables = [...variables];
		full_var.sort();
		full_var = [...full_var];
		console.log('variables: ', variables);
		console.log('cat_folder_data: ', cat_folder_data);
	}
	function set_search_term(variable: string) {
		file_search_term = variable;
		filesearch_input_changed();
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

<div class="p-2">
	<input
		class="input w-full mt-4 p-2"
		type="text"
		placeholder="Type to filter filenames..."
		bind:value={file_search_term}
		on:input={filesearch_input_changed}
		on:change={filesearch_input_changed}
	/>
</div>
<div class="overflow-y-auto max-h-[120px]">
	{#if categories.length > 0}
		<div>
			<div class="flow gap-2 items-center">
				{#each categories as variable}
					<button
						class="w-[300px] h-[60px] variant-filled-surface hover:bg-tertiary-900 rounded-md mt-2 mr-2"
						on:click={set_search_term(variable)}>{variable}</button
					>
				{/each}
			</div>
		</div>
	{/if}
	{#if variables.length > 0}
		<div>
			<div class="flow gap-2 items-center">
				{#each variables as variable}
					<button
						class="w-[120px] h-[30px] variant-filled-surface hover:bg-tertiary-900 rounded-md mt-2 mr-2"
						on:click={set_search_term(variable)}>{variable}</button
					>
				{/each}
			</div>
		</div>
	{/if}
	{#if full_var.length > 0}
		<!-- max height and all scroll -->

		<div>
			<div class="flow gap-2 items-center">
				{#each full_var as variable}
					<button
						class="w-[520px] h-[30px] variant-filled-surface hover:bg-tertiary-900 rounded-md mt-2 mr-2"
						on:click={set_search_term(variable)}>{variable}</button
					>
				{/each}
			</div>
		</div>
	{/if}
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
			bind:this={file_selector}
			bind:value={selected_file}
			on:change={file_selected}
		>
			{#if folder_data}
				{#each fildered_folder_data as f_name}
					<option value={f_name}>
						{f_name}
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
							toggle_diff_mode();
						}}>Normal mode</button
					>
				</div>
			{:else}
				<div>
					<button
						class="variant-filled-tertiary hover:bg-tertiary-600 p-1 px-2 lg:ml-2 max-lg:mt-1 rounded-md"
						on:click={() => {
							toggle_diff_mode();
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
				<div id="band_max">MAX: {current_band_metainfo['max']}</div>
				<div id="noDataValue">
					nDV: {parseFloat(current_band_metainfo['noDataValue'].toFixed(3)).toExponential()}
				</div>
			</div>
			<div class="px-2 variant-outline-tertiary mt-2 pt-1 md:ml-1 w-full">
				<CustomSliderPicker
					valMap={band_slider_values}
					dateMap={band_slider_dates}
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
					<div id="noDataValue">
						nDV: {parseFloat(current_diff_band_metainfo['noDataValue'].toFixed(3)).toExponential()}
					</div>
				</div>
				<div class="px-2 variant-outline-tertiary mt-2 pt-1 md:ml-1 w-full">
					<CustomSliderPicker
						valMap={band_slider_values}
						dateMap={band_slider_dates}
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
				<div id="noDataValue">
					nDV: {parseFloat(current_band_metainfo['noDataValue'].toFixed(3)).toExponential()}
				</div>
				<div id="band_timestamp">Start: {file_metadata['time#units']}</div>
			</div>
		</div>
	{/if}

	<div class="w-full px-4 mt-2">
		<div class="variant-outline-tertiary p-2">
			<!--<span>Hovering Pixel: [</span>
			<span id="hovering_pixel_x" />,
			<span id="hovering_pixel_y" />]-->

			{#if $coordinates.length > 0}
				&nbsp;&nbsp;Coordinates: [{$coordinates[0].toFixed(2)}, {$coordinates[1].toFixed(2)}]

				<span> &nbsp;&nbsp;Value: </span><span id="hovering_value" />
			{:else}
				<span><em>Hover over map to get pixel value</em></span>
			{/if}

			<span><em> / Click on map to view timeseries</em></span>
		</div>
	</div>
{/if}
<div class="w-full px-4 mt-2">
	<div class="variant-outline-tertiary p-2">
		<canvas id="chart" width="400" height="100" class:hidden={!$show_chart} />
	</div>
</div>
<div class={horizontal_scala ? '' : 'flex'}>
	<div class="flex justify-center items-center">
		<CustomGradientPicker
			cmin_real={current_band_metainfo.min}
			cmax_real={current_band_metainfo.max}
			bind:this={cg_picker}
			bind:horizontal={horizontal_scala}
			num_digits={2}
			init_color_scheme="prec_div"
			on:color_stops_changed={color_stops_changed_signaler}
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

<div class="mt-4">
	<table>
		{#if file_metadata['varinfo'] != null}
			<tr><td><b>Varinfo:</b></td><td /></tr>
			<tr><td>Varname:</td> <td>{file_metadata['varinfo']['NETCDF_VARNAME']}</td></tr>
			<tr><td>Long name:</td> <td>{file_metadata['varinfo']['long_name']}</td></tr>
			<tr><td>Stand. name:</td> <td>{file_metadata['varinfo']['standard_name']}</td></tr>
			<tr><td>Type:</td> <td>{file_metadata['varinfo']['type']}</td></tr>
			<tr><td>Units:</td> <td>{file_metadata['varinfo']['unit']}</td></tr>
		{:else}
			<tr><td><b>Varinfo:</b></td><td>null</td></tr>
		{/if}

		{#if file_metadata['cornerCoordinates']}
			<tr><td><b>CornerCoordinates:</b></td><td /></tr>
			<tr
				><td>center:</td>
				<td>
					[{file_metadata['cornerCoordinates']['center'][0]}, {file_metadata['cornerCoordinates'][
						'center'
					][1]}]</td
				></tr
			>
			<tr
				><td>lowerLeft:</td>
				<td>
					[{file_metadata['cornerCoordinates']['lowerLeft'][0]}, {file_metadata[
						'cornerCoordinates'
					]['lowerLeft'][1]}]</td
				></tr
			>
			<tr
				><td>lowerRight:</td>
				<td>
					[{file_metadata['cornerCoordinates']['lowerRight'][0]}, {file_metadata[
						'cornerCoordinates'
					]['lowerRight'][1]}]</td
				></tr
			>
			<tr
				><td>upperLeft:</td>
				<td>
					[{file_metadata['cornerCoordinates']['upperLeft'][0]}, {file_metadata[
						'cornerCoordinates'
					]['upperLeft'][1]}]</td
				></tr
			>
			<tr
				><td>upperRight:</td>
				<td>
					[{file_metadata['cornerCoordinates']['upperRight'][0]}, {file_metadata[
						'cornerCoordinates'
					]['upperRight'][1]}]</td
				></tr
			>
		{:else}
			<tr><td><b>CornerCoordinates:</b></td><td>null</td></tr>
		{/if}

		{#if file_metadata['extent']}
			<tr><td><b>Extent:</b></td><td /></tr>
			<tr><td>Type:</td> <td> {file_metadata['extent']['type']}</td></tr>
			<tr><td>Coordinates:</td> <td> {file_metadata['extent']['coordinates']}</td></tr>
		{:else}
			<tr><td><b>Extent:</b></td><td>null</td></tr>
		{/if}

		{#if file_metadata['time#units']}
			<tr><td><b>Time#Units:</b></td><td>{file_metadata['time#units']}</td></tr>
		{:else}
			<tr><td><b>Time#Units:</b></td><td>null</td></tr>
		{/if}

		{#if file_metadata['time#calendar']}
			<tr><td><b>Time#Calendar:</b></td><td>{file_metadata['time#calendar']}</td></tr>
		{:else}
			<tr><td><b>Time#Calendar:</b></td><td>null</td></tr>
		{/if}

		{#if file_metadata['size']}
			<tr><td><b>Size:</b></td><td>[{file_metadata['size'][0]}, {file_metadata['size'][1]}]</td></tr
			>
		{:else}
			<tr><td><b>Size:</b></td><td>null</td></tr>
		{/if}
	</table>
</div>

<style>
	.map {
		width: 100%;
		height: 800px;
	}
	.hidden {
		display: none;
	}
</style>
