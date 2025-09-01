<script lang="ts">
import { onMount } from 'svelte';
import Map from 'ol/Map';
import View from 'ol/View';
import TileLayer from 'ol/layer/Tile';
import OSM from 'ol/source/OSM';
import ExtentInteraction from 'ol/interaction/Extent.js';
import { shiftKeyOnly } from 'ol/events/condition.js';
import { transformExtent } from 'ol/proj';

export let boundingBox = null; // [west, east, south, north]
let aoiInput = boundingBox || [null, null, null, null]; // [minx, maxx, miny, maxy]
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
    if (aoiInput[0] !== null && (aoiInput[0] < startingExtent[0]|| aoiInput[0] > startingExtent[2])) {
        aoiInput[0] = startingExtent[0];
    }
    if (aoiInput[1] !== null && (aoiInput[1] > startingExtent[2] || aoiInput[1] < startingExtent[0])) {
        aoiInput[1] = startingExtent[2];
    }
    if (aoiInput[2] !== null && (aoiInput[2] < startingExtent[1] || aoiInput[2] > startingExtent[3])) {
        aoiInput[2] = startingExtent[1];
    }
    if (aoiInput[3] !== null && (aoiInput[3] > startingExtent[3] || aoiInput[3] < startingExtent[1])) {
        aoiInput[3] = startingExtent[3];
    }


    if (map_exists && extent && aoiInput.every(v => v !== null && !isNaN(v))) {
        const extent4326 = [
            aoiInput[0], // lon-min
            aoiInput[2], // lat-min
            aoiInput[1], // lon-max
            aoiInput[3]  // lat-max
        ];
        const extent3857 = transformExtent(extent4326, 'EPSG:4326', 'EPSG:3857');
        extent.setExtent(extent3857);
    }
}

// $: aoiInput = aoiInput.map(v =>
//     v !== null && !isNaN(v) ? Math.round(v * 100) / 100 : v
// );

let showContent = true;

function toggleContent() {
    showContent = !showContent;
}

function changeExtant() {
            // [minx, miny, maxx, maxy]
            if (extent.getExtent() === null) {
                aoiInput = [null, null, null, null];
            }else {
                var lon_lat_extent = transformExtent(extent.getExtent(), 'EPSG:3857', 'EPSG:4326');
                aoiInput[0] = lon_lat_extent[0]
                aoiInput[1] = lon_lat_extent[2]
                aoiInput[2] = lon_lat_extent[1]
                aoiInput[3] = lon_lat_extent[3]
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
        extent.on('extentchanged', changeExtant
        );
        // extent.setExtent(null); // entfernt die Bounding Box von der Karte
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
	// Initialize the map when the component is mounted
	onMount(initializeMap);
	function initializeMap() {
		if (map_exists === false) {
			map = new Map({
				target: 'map-container',
				layers: [
					new TileLayer({
						source: new OSM()
					})
				],
				view: new View({
                center: [1069792, -944278],
                zoom: 3,
                extent: transformExtent(startingExtent, 'EPSG:4326', 'EPSG:3857')
            })
			});

			extent = new ExtentInteraction({ condition: shiftKeyOnly });
			map.addInteraction(extent);
			map_exists = true;
			extent.on('extentchanged',changeExtant)
        }
    }
</script>

<div class="card">
    <div class="card-body pb-3 pl-3 pr-3 pt-2 bg-surface-700">
        <div class="flex flex-row gap-8">
            <!-- Formularfelder links -->
            <div class="flex flex-col gap-4 md:w-[40%]">
                <div class="flex items-center justify-between">
                <div class="card p-2 variant-filled-surface">Customized Area of Interest</div>
                <button
                    class="w-[120px] variant-filled-surface hover:bg-tertiary-900 rounded-md max-md:hidden"
                    on:click={toggleContent}
                >
                    {showContent ? "Hide" : "Show"} Map
                </button>
                <button
                    class="btn bg-red-900 btn-sm btn-error hover:bg-error/20"
                    type="button"
                    on:click={clearForm}
                >
                    Clear
                </button>
                </div>
                {#if showContent}
                <div class="flex flex-col gap-2 mt-2">
                    <label class="mb-1 text-sm font-medium">Lon (min):</label>
                    <input
                        class="input input-bordered"
                        type="number"
                        step="0.01"
                        placeholder="lon-min"
                        bind:value={aoiInput[0]}
                        on:blur={validateInput}
                    />
                    <label class="mb-1 text-sm font-medium">Lon (max):</label>
                    <input
                        class="input input-bordered"
                        type="number"
                        step="0.01"
                        placeholder="lon-max"
                        bind:value={aoiInput[1]}
                        on:blur={validateInput}
                    />
                    <label class="mb-1 text-sm font-medium">Lat (min):</label>
                    <input
                        class="input input-bordered"
                        type="number"
                        step="0.01"
                        placeholder="lat-min"
                        bind:value={aoiInput[2]}
                        on:blur={validateInput}
                    />
                    <label class="mb-1 text-sm font-medium">Lat (max):</label>
                    <input
                        class="input input-bordered"
                        type="number"
                        step="0.01"
                        placeholder="lat-max"
                        bind:value={aoiInput[3]}
                        on:blur={validateInput}
                    />
                </div>
                <div class="flex flex-col gap-2 mt-4">
                    <label>Start date:</label>
                    <input
                        type="date"
                        class="input input-bordered"
                        bind:value={startDate}
                    />
                    <label>End date:</label>
                    <input
                        type="date"
                        class="input input-bordered"
                        bind:value={endDate}
                    />
                </div>
                <div class="mt-4 max-md:hidden text-xs text-gray-600">
                    Use Shift+Drag to draw an extent. Shift+Drag on the corners or edges of the extent to resize it.<br>
                    Shift+Click off the extent to remove it.<br>
                    Example: https://openlayers.org/en/latest/examples/extent-interaction.html
                </div>
                {/if}
            </div>
            <!-- map right -->

            <div class="flex-1">
                <div class="map max-md:hidden" class:hidden={!showContent}  id="map-container"></div>
            </div>

        </div>
    </div>
</div>

<style>
	@import '/node_modules/ol/ol.css';
	.map {
		width: 75%;
		height: 600px;
	}
</style>