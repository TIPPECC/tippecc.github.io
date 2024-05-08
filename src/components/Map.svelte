<script>
	import 'ol/ol.css';
	import { GeoTIFF as GeoTIFF_OL } from 'ol/source';
	import * as GeoTIFF_JS from 'geotiff';
	import Map from 'ol/Map.js';
	import TileLayer from 'ol/layer/WebGLTile.js';
	import XYZ from 'ol/source/XYZ';
	import View from 'ol/View';
	import colormap from 'colormap';
	import { onMount } from 'svelte';

	// later maybe hold map as a global variable
	// let map;
	// let test_url = 'http://127.0.0.1:5173/test6.tif'
	let test_url = 'test_big_7.tif';
	// let test_url = 'bigtest/CLMcom-KIT-CCLM5-0-15_v1_MOHC-HadGEM2-ES_pr_2000__yearsum_COG.tif'
	// let test_url = 'https://sentinel-cogs.s3.us-west-2.amazonaws.com/sentinel-s2-l2a-cogs/36/Q/WD/2020/7/S2A_36QWD_20200701_0_L2A/TCI.tif'
	// let test_url = 'test6.tif'
	// let test_url = 'ol-example.tif'
	// let test_url = 'venice_multispectral.tif'

	/**
	 * @type {string}
	 */
	let virtual_data_url;

	/**
	 * @type {GeoTIFF_JS.GeoTIFFImage | undefined}
	 */
	let geotiff_image = undefined;

	let tiff_loaded = false;

	let gdal_metadata;

	// any other way to embed the view into the map results in
	// dragging and zooming functionality breaking.. (no idea why)
	let view = new View({
		center: [0, 0],
		zoom: 2
	});

	async function load_tiff_image(geotiff_url) {
		const response = await fetch(geotiff_url); // Fetch the file from the URL
		const res_blob = await response.blob();
		// const arrayBuffer = await response.arrayBuffer(); // Convert to array buffer
		// const tiff = await GeoTIFF_JS.fromArrayBuffer(arrayBuffer); // Create a GeoTIFF instance
		const tiff = await GeoTIFF_JS.fromBlob(res_blob);
		virtual_data_url = URL.createObjectURL(res_blob);

		const image = await tiff.getImage();
		// Only read the first band
		// const options = {
		//     samples: [3],
		// };

		// const rasters = await image.readRasters(options);
		// const rasters = await image.readRasters();

		// let { min, max } = get_min_max(rasters[2]);
		// console.log("CURRENT MIN: ", min);
		// console.log("CURRENT MAX: ", max);
		// const rasters = await image.readRasters();

		let rasters = [];

		return [image, rasters];
	}

	async function load_one_band(geotiff_url) {
		const response = await fetch(geotiff_url); // Fetch the file from the URL
		const res_blob = await response.blob();
		// const arrayBuffer = await response.arrayBuffer(); // Convert to array buffer
		// const tiff = await GeoTIFF_JS.fromArrayBuffer(arrayBuffer); // Create a GeoTIFF instance
		const tiff = await GeoTIFF_JS.fromBlob(res_blob);
		virtual_data_url = URL.createObjectURL(res_blob);

		const image = await tiff.getImage();
		// Only read the first band
		const options = {
			samples: [0]
		};
		const rasters = await image.readRasters(options);
		let { min, max } = get_min_max(rasters[0]);

		const normalizedRaster = rasters[0].map((value) => {
			return (value - min) / (max - min);
		});

		console.log('MIN,MAX: ', min + ' ' + max);

		let { min: minx, max: maxx } = get_min_max(normalizedRaster);
		console.log('MIN,MAX: ', minx + ' ' + maxx);

		// console.log("normalizedRaster: ", normalizedRaster);

		return virtual_data_url;
	}

	function get_min_max(arr) {
		let min = Infinity; // Initialize to a large number
		let max = -Infinity; // Initialize to a low number

		for (let i = 0; i < arr.length; i++) {
			if (arr[i] == 0) {
				arr[i] = 1;
			}
		}

		for (let value of arr) {
			if (value < min) {
				min = value; // Update the minimum value
			}
			if (value > max) {
				max = value; // Update the maximum value
			}
		}

		return { min, max }; // Return the min and max values
	}

	onMount(() => {
		// tiff_loaded = true;

		// load_one_band(test_url).then((res) => {
		//     tiff_loaded = true;
		// }).catch((error) => {
		//     console.log("load_one_band error: ", error);
		// });

		// return;

		// @ts-ignore
		load_tiff_image(test_url)
			.then((res) => {
				geotiff_image = res[0];

				gdal_metadata = geotiff_image.getGDALMetadata();

				let helper = gdal_metadata['NETCDF_DIM_time_VALUES'];

				var result = helper.substring(1, helper.length - 1);
				const band_times = result.split(',');
				console.log('Band_times: ', band_times);

				// console.log("GDAL MD TYPE: ", typeof(gdal_metadata));

				// console.log("#Rasters-obj: ", res[1]);
				// console.log("#Bands: ", geotiff_image.getSamplesPerPixel());
				// console.log("GDAL Metadata: ", geotiff_image.getGDALMetadata());
				// console.log("GDAL noData value: ", geotiff_image.getGDALNoData());
				// console.log(": ", geotiff_image.getArrayForSample());
				// console.log(": ", geotiff_image.getBlockHeight());
				// console.log("BlockWidth: ", geotiff_image.getBlockWidth());
				// console.log("BitsPerSample: ", geotiff_image.getBitsPerSample());
				// console.log("BoundingBox: ", geotiff_image.getBoundingBox());
				// console.log("BytesPerPixel: ", geotiff_image.getBytesPerPixel());
				// console.log("FileDirectory: ", geotiff_image.getFileDirectory());
				// console.log("GeoKeys: ", geotiff_image.getGeoKeys());
				// console.log("Height: ", geotiff_image.getHeight());
				// console.log("Width: ", geotiff_image.getWidth());
				// console.log("Origin: ", geotiff_image.getOrigin());
				// console.log("Resolution: ", geotiff_image.getResolution());
				// console.log(": ", geotiff_image.getSampleByteSize());
				// console.log("SampleFormat: ", geotiff_image.getSampleFormat());
				// console.log("TiePoints: ", geotiff_image.getTiePoints());
				// console.log("TileHeight: ", geotiff_image.getTileHeight());
				// console.log("TileWidth: ", geotiff_image.getTileWidth());
				// console.log(": ", geotiff_image.getTileOrStrip);
				console.log('Virtual Data URL: ', virtual_data_url);

				tiff_loaded = true;
			})
			.catch((error) => {
				console.log('Error: ', error);
			});
	});

	// @ts-ignore
	async function setupMap(_node, _id) {
		// let source_viewOptions;
		// await source.getView().then(response => {
		//     console.log("Response: ", response, " typeof: ", typeof(response));
		//     source_viewOptions = response;
		// });

		// console.log(source_viewOptions.getProjection());
		// if (source_viewOptions != undefined) {
		//     console.log("SV ZOOM: ", source_viewOptions.zoom);
		//     console.log("SV CENTER: ", source_viewOptions.center);
		//     console.log("SV MINZOOM: ", source_viewOptions.MINZOOM);
		// }

		// source_viewOptions.showFullExtent = false;
		// source_viewOptions.smoothExtentConstraint = false;
		// source_viewOptions.constrainOnlyCenter = false;
		// source_viewOptions.extent = new Array(-1000000.0, -1000000.0, 1000000.0, 1000000.0);
		// source_viewOptions.minResolution = 0.0001;
		// source_viewOptions.maxResolution = 1000000.0;
		// source_viewOptions.resolutions = new Array(1.0, 0.9, 0.8, 0.7, 0.6, 0.5, 0.4, 0.2, 0.1, 0.05, 0.005, 0.0005);

		// let source_view = new View(
		//     source_viewOptions
		// )

		// source_view.maxResolution = 1000000.0;
		// source_view.minResolution = 0.00001;

		// console.log("SV MINZOOM: ", source_view.getMinZoom());
		// console.log("SV MAXZOOM: ", source_view.getMaxZoom());

		// console.log("Source_View: ", source_view);
		// console.log("View: ", view);

		console.log('VIRTUAL URL: ', virtual_data_url);
		// console.log("ID: ", _id);
		if (_id == 0) {
			const source = new GeoTIFF_OL({
				normalize: false,
				sources: [
					{
						bands: [1],
						url: virtual_data_url,
						nodata: NaN
					}
				]
			});
			const layer = ['band', 1];

			const map = new Map({
				target: 'map',
				layers: [
					new TileLayer({
						source: source,
						style: {
							// ?????
							color: [
								// in the case of a band value being exactly 0 ...
								// --> choose invisible ([0,0,0,0] -- RGBA format)
								// ?????
								'case',
								// ?????
								['==', ['band', 1], 0],
								// ?????
								[0, 0, 0, 0],

								// https://openlayers.org/workshop/en/cog/ndvi.html
								['interpolate', ['linear'], layer, ...getColorStops('jet', -1, 1, 50, true)]
							]
						}
					})
				],

				// view: source.getView(),
				// view: source_view,
				view: view
			});

			// console.log("map: ", map);
			// for (var key in map) {
			//     if (map.hasOwnProperty(key)) {
			//         /* useful code here */
			//         console.log(map[key]);
			//     }
			// }
		}

		if (_id == 1) {
			const map = new Map({
				target: 'map',
				layers: [
					new TileLayer({
						source: source
					})
				],
				view: view
			});
			console.log('CustomView: ', view);
		} else if (_id == 2) {
			const map = new Map({
				target: 'map2',
				layers: [
					new TileLayer({
						source: source
					})
				],
				view: source_view
			});
			console.log('SourceView: ', source_view);
		}

		if (_id == 3) {
			const map = new Map({
				target: 'map',
				layers: [
					new TileLayer({
						source: source
					})
				],
				view: source.getView()
			});
		}

		if (_id == 4) {
			const layer = ['band', 1];
			const map = new Map({
				target: 'map',
				layers: [
					new TileLayer({
						source: new XYZ({
							url: test_url
						}),

						style: {
							// ?????
							color: [
								// in the case of a band value being exactly 0 ...
								// --> choose invisible ([0,0,0,0] -- RGBA format)
								// ?????
								'case',
								// ?????
								['==', ['band', 1], 0],
								// ?????
								[0, 0, 0, 0],

								// https://openlayers.org/workshop/en/cog/ndvi.html
								['interpolate', ['linear'], layer, ...getColorStops('jet', -1, 1, 50, true)]
							]
						}
					})
				],
				view: view
			});
		}

		// bind feature hover to ol-map action
		// map.on('pointermove', function (evt) {
		// 	if (evt.dragging) {
		// 		return;
		// 	}
		// });

		// return {
		// 	destroy() {
		// 		if (map) {
		// 			// unset the map render target and map itself on destroy
		// 			map.setTarget(undefined);
		// 			// map = null;
		// 		}
		// 	}
		// };
	}

	// @ts-ignore
	function getColorStops(name, min, max, steps, reverse) {
		// stepwidth per color change
		const delta = (max - min) / (steps - 1);
		// helper array holding ranges and colors (return value)
		const stops = new Array(steps * 2);
		// interpolated colors from colormap (lookup)
		const colors = colormap({ colormap: name, nshades: steps, format: 'rgba' });

		// simply revert colors array (reverted coloring scheme)
		if (reverse) {
			colors.reverse();
		}

		// #steps times iterate and fill stops with [range1, color1, ..., rangeN, colorN]
		for (let i = 0; i < steps; i++) {
			stops[i * 2] = min + i * delta;
			stops[i * 2 + 1] = colors[i];
		}

		return stops;
	}
</script>

{#if geotiff_image}
	<div class="pl-52 grid grid-cols-2 w-[70%]">
		<div>#BANDS:</div>
		<div>{geotiff_image.getSamplesPerPixel()}</div>
		<div>GDAL noData value:</div>
		<div>{geotiff_image.getGDALNoData()}</div>
		<div>BitsPerSample:</div>
		<div>{geotiff_image.getBitsPerSample()}</div>
		<div>BytesPerPixel:</div>
		<div>{geotiff_image.getBytesPerPixel()}</div>
		<div>BlockWidth:</div>
		<div>{geotiff_image.getBlockWidth()}</div>
		<div>BoundingBox:</div>
		<div>{geotiff_image.getBoundingBox()}</div>
		<div>Height x Width:</div>
		<div>{geotiff_image.getHeight()} x {geotiff_image.getWidth()}</div>
		<div>Origin:</div>
		<div>{geotiff_image.getOrigin()}</div>
		<div>Resolution:</div>
		<div>{geotiff_image.getResolution()}</div>
		<div>SampleFormat:</div>
		<div>{geotiff_image.getSampleFormat()}</div>
		<div>TileHeight x TileWidth:</div>
		<div>{geotiff_image.getTileHeight()} x {geotiff_image.getTileWidth()}</div>

		{#if gdal_metadata != null && gdal_metadata != undefined}
			{#each Object.entries(gdal_metadata) as [key, value]}
				<div>{key}</div>
				<div>{value}</div>
			{/each}
		{/if}
	</div>
{:else}
	FALSE TEST: {geotiff_image}
{/if}

{#if tiff_loaded}
	<div id="map" class="map" />
	<!-- <div id="map2" class="map"></div> -->

	<div use:setupMap={0} />
	<!-- <div use:setupMap={1} /> -->
	<!-- <div use:setupMap={2} /> -->
	<!-- <div use:setupMap={3} /> -->
	<!-- <div use:setupMap={4} /> -->
{/if}

<style>
	.map {
		width: 100%;
		height: 800px;
	}
</style>
