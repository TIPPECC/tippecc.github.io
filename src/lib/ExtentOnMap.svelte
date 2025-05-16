<script>
	import { onMount } from 'svelte';
	import { Feature } from 'ol';
	import { Polygon } from 'ol/geom';
	import { Vector as VectorSource } from 'ol/source';
	import VectorLayer from 'ol/layer/Vector';
	import { Style, Stroke, Fill } from 'ol/style';
	import Map from 'ol/Map';
	import TileLayer from 'ol/layer/Tile';
	import OSM from 'ol/source/OSM';
	import 'ol/ol.css';
	import View from 'ol/View';

	export let extent;
	/**
	 * Draws a bounding box on an OpenLayers map from extent.
	 * @param {Map} map - OpenLayers map instance
	 * @param {[number, number, number, number]} extent - [minX, minY, maxX, maxY]
	 * @param {string} [projection='EPSG:4326'] - Coordinate projection of extent
	 */
	export function drawExtentBox(map, extent, projection = 'EPSG:4326') {
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
				}),
				fill: new Fill({
					color: 'rgba(255, 120, 0, 0.2)'
				})
			})
		});

		map.addLayer(vectorLayer);
		map.getView().fit(polygon, { padding: [20, 20, 20, 20] });

		return vectorLayer;
	}

	onMount(() => {
		let map = new Map({
			target: 'map',
			layers: [
				new TileLayer({
					source: new OSM()
				})
			],
			view: new View({
				center: [0, 0],
				zoom: 2,
				projection: 'EPSG:3857'
			})
		});

		drawExtentBox(map, extent);
	});
</script>

<div id="map" />

<style>
	#map {
		width: 100%;
		height: 400px;
		border-radius: 1rem;
		box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
		margin: 1rem 0;
	}
</style>
