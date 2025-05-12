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

	let metadata_loaded: boolean = false; // trigger variable indicating metadata is loaded
	let loading_map: boolean = false; // trigger variable indicating map is loaded
	let horizontal_scala: boolean = true; // bool indicating horizontal/vertical scala
	let diff_mode: boolean = false; // bool indicating diff- (comparing 2 bands), or normal-mode (1 band only)

	let folder_data: any[any] = []; // choosable files
	let fildered_folder_data: any[] = []; // filtered files
	export let foldertype: string = 'water_budget'; // string of selected foldertype
	export let selected_file: string = ''; // string of selected file
	export let show_varinfos: boolean = true; // show variable info in the map
	let selected_tif_url: string = ''; // url of selected file
	let virtual_data_url: string = ''; // helper variable carrying selected file as virtual url
	let file_search_term: string = ''; // current string input in file search field
	let file_selector: HTMLSelectElement;

	let showScaleWarning: boolean = false;

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
	let random_id = Math.random(); // random id for the map

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
		initialize_map();
		// TEST
		// changeInteraction();
		console.log('test');
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
		let ctx = document.getElementById('chart_' + random_id).getContext('2d');
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

	let show_chart = true; // Show chart or not
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

		//$show_chart = true;
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
			target: 'map_' + random_id,
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

		map.on(['pointermove'], displayPixelValue);
		let lastCoordinate = null;

		// click trigger function to read clicked data point and show time series
		map.on('click', async (event) => {
			const coordinate = event.coordinate; // Get map coordinates
			lastCoordinate = coordinate;
			console.log(coordinate);
			//const pixel = map.getPixelFromCoordinate(coordinate);
			const data = await getTimeSeriesFromGeoTIFF(coordinate);
			console.log(coordinate);
			if (data && lastCoordinate === coordinate) {
				// console.log(data);
				updateChart(data);
				console.log(coordinate);
				// Add a point to the map at the selected location
				const point = new Point(coordinate);
				const feature = new Feature(point);
				vectorSource.clear(); // Clear previous points
				console.log('Adding feature to map');
				console.log('Feature: ', feature);
				console.log(vectorSource);
				vectorSource.addFeature(feature);
				// Force the map to refresh
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

	function parseReferenceDate(units) {
		const match = units.match(/(\w+) since (\d{4}-\d{2}-\d{2})/);
		return {
			unit: match[1],
			refDate: new Date(match[2])
		};
	}
	function convertToDate(offset, refDate, calendar) {
  const msPerDay = 86400 * 1000; // 1 day in milliseconds
  const date = new Date(refDate.getTime());

  switch (calendar) {
    case "gregorian":
    case "proleptic_gregorian":
      return new Date(refDate.getTime() + offset * msPerDay);

    case "365_day":
      // Simulate non-leap-year logic if needed
      const days = Math.floor(offset);
      const remainder = offset - days;
      date.setUTCFullYear(date.getUTCFullYear() + Math.floor(days / 365));
      date.setUTCDate(date.getUTCDate() + (days % 365));
      date.setUTCHours(24 * remainder); // approximate
      return date;

    case "360_day":
      const totalDays = offset;
      const year = refDate.getUTCFullYear() + Math.floor(totalDays / 360);
      const rem = totalDays % 360;
      const month = Math.floor(rem / 30);
      const day = Math.floor(rem % 30) + 1;
      const fraction = rem % 1;
      return new Date(Date.UTC(year, month, day, 24 * fraction));

    default:
      throw new Error("Unsupported calendar: " + calendar);
  }
}

	function fill_band_slider_error(net_cdf_times: any) {
		// invalid timestamp -> default to raw net_cdf_time values as bandslider values
		for (let i = 0; i < net_cdf_times.length; i++) {
			band_slider_values.push(parseFloat(net_cdf_times[i]));
		}
	}

	function fill_band_slider_years(net_cdf_times: any, start_date: number) {
		// var time_prefix_multiplier = 365.2425;
		const { unit, refDate } = parseReferenceDate(file_metadata['time#units']);
		const calendar = file_metadata['time#calendar'] || 'gregorian'; // Default to 'gregorian' if not specified
		const dates = net_cdf_times.map((offset) => convertToDate(offset, refDate, calendar));
		for (let i = 0; i < dates; i++) {
			band_slider_values.push(dates[i].getFullYear());
			band_slider_dates.push(dates[i]);
		}
	}

	function fill_band_slider_days(
		net_cdf_times: any,
		start_date: number,
		displayYears: boolean = false
	) {
		const { unit, refDate } = parseReferenceDate(file_metadata['time#units']);
		console.log('Unit: ', unit);
		console.log('RefDate: ', refDate);
		const calendar = file_metadata['time#calendar'] || 'gregorian'; // Default to 'gregorian' if not specified
		console.log('Calendar: ', calendar);
		console.log('NetCDF times: ', net_cdf_times);
		const dates = net_cdf_times.map((offset) => convertToDate(offset, refDate, calendar));
		console.log('Dates: ', dates);
		for (let i = 0; i < dates.length; i++) {
			var curDate = dates[i];
			var curDateStr: string = '';
			if (displayYears) {
				curDateStr = curDate.getFullYear().toString();
			} else {
				curDateStr = curDate.toLocaleDateString();
			}
			band_slider_values.push(curDateStr);

			band_slider_dates.push(dates[i]);
		}
	}

	function fill_band_slider_monthmean(net_cdf_times: any, start_date: number) {
		const { unit, refDate } = parseReferenceDate(file_metadata['time#units']);
		const calendar = file_metadata['time#calendar'] || 'gregorian'; // Default to 'gregorian' if not specified
		const dates = net_cdf_times.map((offset) => convertToDate(offset, refDate, calendar));

		for (let i = 0; i < dates.length; i++) {
			band_slider_values.push(dates[i].toLocaleDateString('en-US', { month: 'long' }));

			band_slider_dates.push(dates[i]);
		}
	}

	function getSeason(date: Date) {
		const month = date.getMonth(); // 0 for January, 11 for December
		console.log('Month: ', month);
		switch (month) {
			//case 2: // March
			case 3: // April
			case 4: // May
				return 'Autumn (MAM)';
			case 5: // June
			case 6: // July
			case 7: // August
				return 'Winter (JJA)';
			case 8: // September
			case 9: // October
			case 10: // November
				return 'Spring (SON)';
			case 11: // December
			case 0: // January
			case 1: // February
			case 2: // March
				return 'Summer (DJF)';
			default:
				return 'Unknown'; // Handle potential unexpected month values
		}
	}

	function fill_band_slider_seasons(net_cdf_times: any, start_date: number) {
		const { unit, refDate } = parseReferenceDate(file_metadata['time#units']);
		const calendar = file_metadata['time#calendar'] || 'gregorian'; // Default to 'gregorian' if not specified
		const dates = net_cdf_times.map((offset) => convertToDate(offset, refDate, calendar));
		console.log('Dates: ', dates);
		console.log('Calendar: ', file_metadata['time#calendar']);
		for (let i = 0; i < dates.length; i++) {
			var curDate = dates[i];
			// new Date(start_date + parseFloat(net_cdf_times[i]) * TWELVE_HOURS * 2);
			band_slider_values.push(getSeason(curDate));

			band_slider_dates.push(dates[i]);
		}
		console.log('Seasons: ', band_slider_values);
	}

	function evaluate_timestamp_data(net_cdf_times: any) {
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
		// we assume always some form of "days/years since timestamp..."
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

		// console.log('PREFIX: ', time_prefix);
		// console.log('timestamp_begin: ', timestamp_begin);
		// console.log('start_date: ', start_date);

		try {
			var full_band_date_diff =
				parseFloat(net_cdf_times[net_cdf_times.length - 1]) - parseFloat(net_cdf_times[0]);
			var first_band_diff = 0;

			if (net_cdf_times.length >= 2) {
				// diff between the first 2 band time values if exist
				first_band_diff = parseFloat(net_cdf_times[1]) - parseFloat(net_cdf_times[0]);
			}

			// console.log('full_band_date_diff: ', full_band_date_diff);
			// console.log('first_band_diff: ', first_band_diff);
			// console.log('net_cdf_times.length: ', net_cdf_times.length);

			// cases for different timestep interpretations
			if (timestamp_begin == '') {
				fill_band_slider_error(net_cdf_times);
			} else if (net_cdf_times.length == 12 && first_band_diff >= 28 && first_band_diff <= 32) {
				fill_band_slider_monthmean(net_cdf_times, start_date);
			} else if (net_cdf_times.length == 4 && first_band_diff >= 70 && first_band_diff <= 110) {
				fill_band_slider_seasons(net_cdf_times, start_date);
			} else if (time_prefix == 'years') {
				fill_band_slider_years(net_cdf_times, start_date);
			} else if (time_prefix == 'days') {
				if (full_band_date_diff > 365.0) {
					// displays dates as years
					fill_band_slider_days(net_cdf_times, start_date, true);
				} else {
					fill_band_slider_days(net_cdf_times, start_date);
				}
			} else {
				// case where every condition fails for example unknown time_prefix
				fill_band_slider_error(net_cdf_times);
			}
		} catch (error) {
			console.log(`Encountered error while assigning net_cdf_values to bandslider: ${error}`);
		}

		if (band_slider_values.length > 1) {
			show_chart = true;
		} else {
			show_chart = false;
		}
	}

	/**
	 * Try to interpret file metadata (min, max, timestamp, bands, netcdf_times, ..).
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

		evaluate_timestamp_data(net_cdf_times);
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
			// console.log("Visualizing band due to color_stops_changed Signal.")
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
			const statusElement = document.getElementById('status');
			if (statusElement) {
				statusElement.innerHTML =
					'&nbsp;' +
					e.target.getFeatures().getLength() +
					' selected features (last operation selected ' +
					e.selected.length +
					' and deselected ' +
					e.deselected.length +
					' features)';
			}
		});
	};

	/**
	 * (Re)-build and (re)-place layer and source for the map.
	 */
	function visualize_band() {
		if (!cg_picker) return;
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

		var _min = current_band_metainfo.min;
		var _max = current_band_metainfo.max;

		var colorScaleTrueRange = Math.max(Math.abs(_min), Math.abs(_max)) * 2.0;
		var colorScaleCoverage = _max - _min;
		var colorScaleCovPercent = (colorScaleCoverage / colorScaleTrueRange) * 100.0;

		if (colorScaleCovPercent <= 100.0 / 7.0) {
			showScaleWarning = true;
		} else {
			showScaleWarning = false;
		}

		// console.log("colorScaleTrueRange: ", colorScaleTrueRange);
		// console.log("colorScaleCoverage: ", colorScaleCoverage);
		// console.log("colorScaleCovPercent: ", colorScaleCovPercent);
		// console.log("showScaleWarning: ", showScaleWarning);

		// force gray rescale if conditions are met
		if (!cg_picker.get_forcedGrayScaleMode() && colorScaleCovPercent <= 100.0 / 21.0) {
			cg_picker.apply_gray_rescale(false, true);
			cg_picker.update_color_and_value_steps(false);
		}

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
			console.log('Removed old layer');
		} else {
			map.removeLayer(vectorLayer);
			map.addLayer(layer);
			map.addLayer(vectorLayer);
			old_layer = layer;
			console.log('Added new layer');
		}

		layer.setOpacity(opacity_value);
		map.setView(base_view);
		// console.log("Finished Visualize function.")
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

{#if band_slider_values && metadata_loaded}
	{#if band_slider_values.length >= 2}
		<div class="md:flex w-full pl-4 pr-4">
			<div
				class="variant-outline-tertiary min-w-[128px] md:max-w-[128px] mt-2 px-2 pt-1 max-md:grid max-md:grid-cols-1 max-md:justify-items-center"
			>
				<h2>Layer meta data <b>#{selected_band}:</b></h2>
				<div id="band_min">MIN: {current_band_metainfo['min']}</div>
				<div id="band_max">MAX: {current_band_metainfo['max']}</div>
				<div id="unit">Unit: {file_metadata['varinfo']['unit']}</div>
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
					<div id="unit">Unit: {file_metadata['varinfo']['unit']}</div>
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
				<div id="band_min">
					MIN - MAX: {current_band_metainfo['min']} - {current_band_metainfo['max']} (Unit: {file_metadata[
						'varinfo'
					]['unit']})
				</div>
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
{#if show_chart}
	<div class="w-full px-4 mt-2">
		<div class="variant-outline-tertiary p-2">
			<canvas id="chart_{random_id}" width="400" height="100" />
		</div>
	</div>
{/if}

<div class={horizontal_scala ? '' : 'flex'}>
	<div class="flex justify-center items-center">
		<CustomGradientPicker
			cmin_real={current_band_metainfo.min}
			cmax_real={current_band_metainfo.max}
			{showScaleWarning}
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
		<div id="map_{random_id}" class="map" />
	</div>
</div>

{#if show_varinfos}
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
				<tr
					><td><b>Size:</b></td><td>[{file_metadata['size'][0]}, {file_metadata['size'][1]}]</td
					></tr
				>
			{:else}
				<tr><td><b>Size:</b></td><td>null</td></tr>
			{/if}
		</table>
	</div>
{/if}

<style>
	.map {
		width: 100%;
		height: 600px;
	}
	.hidden {
		display: none;
	}
</style>
