<script lang="ts">
	import { onMount } from 'svelte';
	import { Style, Stroke, Fill } from 'ol/style';
	import Map from 'ol/Map';
	import View from 'ol/View';
	import TileLayer from 'ol/layer/Tile';
	import OSM from 'ol/source/OSM';
	import ExtentInteraction from 'ol/interaction/Extent.js';
	import { shiftKeyOnly } from 'ol/events/condition.js';
	import { transformExtent } from 'ol/proj';
	import VectorLayer from 'ol/layer/Vector';
	import VectorSource from 'ol/source/Vector';
	import Feature from 'ol/Feature';
	import Polygon from 'ol/geom/Polygon';

	export let boundingBox = null; // [west, east, south, north]
	let aoiInput: Array<number | null> = boundingBox || [null, null, null, null]; // [minx, maxx, miny, maxy]
	export let startDate = '';
	export let endDate = '';
	export let startingExtent: [number, number, number, number];

	$: boundingBox = [...aoiInput];

	function validateInput() {
		// makesure min is always smaller than max
		if (aoiInput[0] !== null && aoiInput[1] !== null && aoiInput[0] > aoiInput[1]) {
			aoiInput[1] = aoiInput[0];
		}
		if (aoiInput[2] !== null && aoiInput[3] !== null && aoiInput[2] > aoiInput[3]) {
			aoiInput[3] = aoiInput[2];
		}
		// restrict to starting extent
		if (
			aoiInput[0] !== null &&
			(aoiInput[0] < startingExtent[0] || aoiInput[0] > startingExtent[2])
		) {
			aoiInput[0] = startingExtent[0];
		}
		if (
			aoiInput[1] !== null &&
			(aoiInput[1] > startingExtent[2] || aoiInput[1] < startingExtent[0])
		) {
			aoiInput[1] = startingExtent[2];
		}
		if (
			aoiInput[2] !== null &&
			(aoiInput[2] < startingExtent[1] || aoiInput[2] > startingExtent[3])
		) {
			aoiInput[2] = startingExtent[1];
		}
		if (
			aoiInput[3] !== null &&
			(aoiInput[3] > startingExtent[3] || aoiInput[3] < startingExtent[1])
		) {
			aoiInput[3] = startingExtent[3];
		}

		if (map_exists && extent && aoiInput.every((v) => v !== null && !isNaN(Number(v)))) {
			const extent4326: [number, number, number, number] = [
				Number(aoiInput[0]), // lon-min
				Number(aoiInput[2]), // lat-min
				Number(aoiInput[1]), // lon-max
				Number(aoiInput[3]) // lat-max
			];
			const extent3857 = transformExtent(extent4326, 'EPSG:4326', 'EPSG:3857');
			extent.setExtent(extent3857);
		}
	}

	// Round aoiInput values to two decimal places to prevent floating point artifacts
	$: aoiInput = aoiInput.map((v) =>
		v !== null && !isNaN(Number(v)) ? Math.round(Number(v) * 100) / 100 : v
	);

	let showContent = true;

	function toggleContent() {
		showContent = !showContent;
	}

	function changeExtent() {
		console.log('Extent changed');
		// [minx, miny, maxx, maxy]
		if (extent.getExtent() === null) {
			aoiInput = [null, null, null, null];
		} else {
			var lon_lat_extent = transformExtent(extent.getExtent(), 'EPSG:3857', 'EPSG:4326');

			// cut the extent to the starting extent, if one point is out of bounds, but another already inside
			if (lon_lat_extent[0] < startingExtent[0] && lon_lat_extent[2] > startingExtent[0]) {
				lon_lat_extent[0] = startingExtent[0];
				// update draw extent
				extent.setExtent(transformExtent(lon_lat_extent, 'EPSG:4326', 'EPSG:3857'));
			}
			if (lon_lat_extent[1] < startingExtent[1] && lon_lat_extent[3] > startingExtent[1]) {
				lon_lat_extent[1] = startingExtent[1];
				// update draw extent
				extent.setExtent(transformExtent(lon_lat_extent, 'EPSG:4326', 'EPSG:3857'));
			}
			if (lon_lat_extent[3] > startingExtent[3] && lon_lat_extent[1] < startingExtent[3]) {
				lon_lat_extent[3] = startingExtent[3];
				// update draw extent
				extent.setExtent(transformExtent(lon_lat_extent, 'EPSG:4326', 'EPSG:3857'));
			}
			if (lon_lat_extent[2] > startingExtent[2] && lon_lat_extent[0] < startingExtent[2]) {
				lon_lat_extent[2] = startingExtent[2];
				// update draw extent
				extent.setExtent(transformExtent(lon_lat_extent, 'EPSG:4326', 'EPSG:3857'));
			}

			// delete if finally completly outside starting extent
			if (
				lon_lat_extent[0] < startingExtent[0] ||
				lon_lat_extent[1] < startingExtent[1] ||
				lon_lat_extent[2] > startingExtent[2] ||
				lon_lat_extent[3] > startingExtent[3]
			) {
				extent.setExtent([0, 0, 0, 0]);
			}

			// update aoiInput
			aoiInput[0] = lon_lat_extent[0];
			aoiInput[1] = lon_lat_extent[2];
			aoiInput[2] = lon_lat_extent[1];
			aoiInput[3] = lon_lat_extent[3];
		}
	}
	function clearForm() {
		aoiInput = [null, null, null, null];
		startDate = '';
		endDate = '';
		if (extent) {
			// Remove and re-add the interaction to clear the extent
			// i did not find a better way to do this
			// If you find a way to remove the extent from the map without readding the options, replace this
			map.removeInteraction(extent);
			extent = new ExtentInteraction({ condition: shiftKeyOnly });
			map.addInteraction(extent);
			//	extent.on('extentchanged', changeExtant);
			// extent.setExtent(null); // entfernt die Bounding Box von der Karte
			map.on('pointerup', () => {
				if (extent.getActive()) {
					// User finished interaction
					// You can now handle the final extent
					changeExtent();
				}
			});
		}
	}

	/**
	 * @type {Map}
	 */
	let map: Map;
	/**
	 * @type {import("ol/interaction/Interaction").default}
	 */
	let extent: ExtentInteraction;
	/**
	 * @type {any[]}
	 */
	let minx: number;

	let map_exists: boolean = false;

	/**
	 * Draws a bounding box on an OpenLayers map from extent.
	 * @param {Map} map - OpenLayers map instance
	 * @param {[number, number, number, number]} extent - [minX, minY, maxX, maxY]
	 * @param {string} [projection='EPSG:4326'] - Coordinate projection of extent
	 */
	export function drawExtentBox(map: Map, extent: string | any[], projection = 'EPSG:4326') {
		if (!map || !extent || extent.length !== 4) {
			console.error('Invalid map or extent');
			return;
		}

		const [minX, minY, maxX, maxY] = extent;
		const polygon = new Polygon([
			[
				[minX, minY],
				[minX, maxY],
				[maxX, maxY],
				[maxX, minY],
				[minX, minY] // close the loop
			]
		]);

		polygon.transform(projection, map.getView().getProjection());

		const feature = new Feature(polygon);

		const vectorSource = new VectorSource({
			features: [feature]
		});

		const vectorLayer = new VectorLayer({
			source: vectorSource,
			style: new Style({
				stroke: new Stroke({
					color: 'rgba(255, 120, 0, 0.8)',
					width: 2
				})
			})
		});

		map.addLayer(vectorLayer);
		map.getView().fit(polygon, { padding: [20, 20, 20, 20] });

		return vectorLayer;
	}

	/**
	 * Returns a buffered extent around the input extent.
	 * @param {[number, number, number, number]} extent - [minX, minY, maxX, maxY]
	 * @param {number} buffer - Buffer in degrees (or units of extent)
	 * @returns {[number, number, number, number]}
	 */
	function getBufferedExtent(extent, buffer = 1) {
		return [extent[0] - buffer, extent[1] - buffer, extent[2] + buffer, extent[3] + buffer];
	}

	// Initialize the map when the component is mounted
	onMount(initializeMap);
	function initializeMap() {
		if (map_exists === false) {
			const buffer = 10; // degrees or units of startingExtent
			const bufferedExtent = getBufferedExtent(startingExtent, buffer);
			console.log('Starting Extent:', startingExtent);
			console.log('Buffered Extent:', bufferedExtent);

			map = new Map({
				target: 'map-container',
				layers: [
					new TileLayer({
						source: new OSM()
					})
				],
				view: new View({
					center: [1069792, -944278],
					extent: transformExtent(bufferedExtent, 'EPSG:4326', 'EPSG:3857')
				})
			});

			drawExtentBox(map, startingExtent);

			extent = new ExtentInteraction({
				condition: shiftKeyOnly,
				boxStyle: new Style({
					stroke: new Stroke({
						color: 'red',
						width: 3
					}),
					fill: new Fill({
						color: 'rgba(255,0,0,0.1)'
					})
				})
			});
			drawExtentBox(map, startingExtent);
			map.addInteraction(extent);
			map_exists = true;

			// Debounce function
			const debounce = (func: { (): void; apply?: any }, wait: number | undefined) => {
				let timeout: string | number | NodeJS.Timeout | undefined;
				return (...args: any) => {
					clearTimeout(timeout);
					timeout = setTimeout(() => func.apply(undefined, args), wait);
				};
			};

			const debouncedChangeExtent = debounce(changeExtent, 300);

			extent.on('extentchanged', debouncedChangeExtent);
		}
	}
</script>

<div class="card">
	<div class="card-body pb-3 pl-3 pr-3 pt-2 bg-surface-700">
		<h5>a) Temporal Extent</h5>
		<div class="flex flex-row gap-4 mt-4 items-center">
			<div class="flex flex-col">
				<label for="start-date" class="text-sm font-medium mb-1">Start date:</label>
				<div class="relative">
					<input
						id="start-date"
						type="date"
						class="input input-bordered"
						bind:value={startDate}
						style="color-scheme: dark"
					/>
				</div>
			</div>
			<div class="flex flex-col">
				<label for="end-date" class="text-sm font-medium mb-1">End date:</label>
				<div class="relative">
					<input
						id="end-date"
						type="date"
						class="input input-bordered"
						bind:value={endDate}
						style="color-scheme: dark"
					/>
				</div>
			</div>
			<div class="flex flex-col justify-end mb-2 ml-auto">
				<button
					class="btn bg-red-900 btn-sm btn-error hover:bg-error/20"
					type="button"
					on:click={clearForm}
				>
					Clear All
				</button>
			</div>
		</div>
		<h5 class="mt-6 mb-2">b) Spatial Extent (Bounding Box)</h5>
		<div class="flex flex-row gap-8">
			<!-- Map column -->
			<div class="flex-1 flex items-center justify-center">
				<div class="map" class:hidden={!showContent} id="map-container" />
			</div>
			<!-- Form column -->
			<div class="flex flex-col gap-4 md:w-[350px] min-w-[250px]">
				<div class="flex flex-col gap-2 mt-2">
					<label class="mb-1 text-sm font-medium" for="lon-min">Longitude Min:</label>
					<input
						id="lon-min"
						class="input input-bordered"
						type="number"
						step="0.01"
						bind:value={aoiInput[0]}
						on:blur={validateInput}
					/>
					<label class="mb-1 text-sm font-medium" for="lon-max">Longitude Max:</label>
					<input
						id="lon-max"
						class="input input-bordered"
						type="number"
						step="0.01"
						bind:value={aoiInput[1]}
						on:blur={validateInput}
					/>
					<label class="mb-1 text-sm font-medium" for="lat-min">Latitude Min:</label>
					<input
						id="lat-min"
						class="input input-bordered"
						type="number"
						step="0.01"
						bind:value={aoiInput[2]}
						on:blur={validateInput}
					/>
					<label class="mb-1 text-sm font-medium" for="lat-max">Latitude Max:</label>
					<input
						id="lat-max"
						class="input input-bordered"
						type="number"
						step="0.01"
						bind:value={aoiInput[3]}
						on:blur={validateInput}
					/>
				</div>
				<div class="mt-4 max-md:hidden text-sm italic">
					Use Shift+Drag to draw an extent. <br />
					Use Shift+Drag on the corners of the extent to resize it.<br />
					Use Shift+Click on the extent to remove it.<br />
				</div>
			</div>
		</div>
	</div>
</div>

<style>
	@import '/node_modules/ol/ol.css';
	.map {
		width: 100%;
		height: 400px;
	}
</style>
