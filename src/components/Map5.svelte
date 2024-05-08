<script lang="ts">
    import 'ol/ol.css';
    import { OSM, GeoTIFF as GeoTIFF_OL } from 'ol/source';
    import Map from 'ol/Map.js';
	import View from 'ol/View';
    import TileLayer from 'ol/layer/WebGLTile.js';
    import * as GeoTIFF_JS from 'geotiff';
    import colormap from "colormap";
    import { onMount } from 'svelte';
    import CustomSlider from './CustomSlider.svelte';


    /*
    * Hardcoded testfiles for now. Will later be supplied
    by backend.
    */
    let files = [
        "",
    ]

    let base_view = new View({
        center: [0, 0],
        zoom: 2
    });

    let map: Map;

    let selected_color_theme = "jet";

    let selected_file: string = "";
    let virtual_data_url: string = "";
    let gdal_metadata: any[];
    let geotiff_image: GeoTIFF_JS.GeoTIFFImage;
    let metadata_loaded: boolean = false;

    let sliderValue;
    let bands: any[] = [];
    let band_slider_values: any[] = [];
    let band_slider_helper = {
        'min': 0,
        'max': 0,
        'step': 0
    }
    let selected_band_index: string;
    let current_band_metainfo = {
        'min': 0,
        'max': 0
    }


    let type ="water_budget";
    let folder_data: any[] = [];

    onMount(() => {
		fetch_foldercontent();
	});
	async function fetch_foldercontent() {
		const custom_url =
			'https://leutra.geogr.uni-jena.de/backend_geoportal/climate/get_content?type=' + type;

		try {
			const res = await fetch(custom_url, {
				method: 'GET'
			});

			let result = [];
			if (!res.ok) {
				throw new Error(`${res.status} ${res.statusText}`);
			}

			result = await res.json();
			folder_data = result;

			//for (let i = 0; i < folder_data.length; i++) {
			//	files.push(folder_data[i]);
			//}
           // files = result;

			// sort array
			folder_data['content'].sort();

			console.log('folder_data', folder_data);
		} catch (error) {
			console.log(error);
		}
	}



    /**
    * With geotiff for now. Later will work without additional code via backend.
    */
    async function load_file_metadata(geotiff_url: string) {
        if (geotiff_url == "") {
            throw new Error('Empty url!');
        }

        const response = await fetch(geotiff_url); // Fetch the file from the URL
        const res_blob = await response.blob();
        // const arrayBuffer = await response.arrayBuffer(); // Convert to array buffer
        // const tiff = await GeoTIFF_JS.fromArrayBuffer(arrayBuffer); // Create a GeoTIFF instance
        const tiff = await GeoTIFF_JS.fromBlob(res_blob);
        virtual_data_url = URL.createObjectURL(res_blob);

        const image = await tiff.getImage();

        return image
    }

    onMount(() => {
        initialize_map();
    });

    function initialize_map() {
        map = new Map({
            target: 'map',
            layers: [new TileLayer({
      source: new OSM(),
    }),],
            view: base_view
        });
    }

    // @ts-ignore
    function getColorStops(name, min, max, steps, reverse) {
        // stepwidth per color change
        const delta = (max - min) / (steps - 1);
        // helper array holding ranges and colors (return value)
        const stops = new Array(steps * 2);
        // interpolated colors from colormap (lookup)
        const colors = colormap({ colormap: name, nshades: steps, format: "hex" });

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

    function createTileLayer_singleBand() {
        var band_number: number = parseInt(selected_band_index) + 1;
        var s_band_number: String = band_number.toString();

        console.log("Creating visualization with band_number: ", band_number, " and s_band_number: ", s_band_number);

        const source = new GeoTIFF_OL({
            normalize: false,
            sources: [
                {
                    bands:[band_number],
                    url: virtual_data_url
                },
            ],
        });

        const layer = ["band", 1];
        console.log("Layer: ", invert_colors);
        return new TileLayer({
            source: source,
            style: {
                color: [
                    "case",
                    ["==", ["band", 1], 0],
                    [0, 0, 0, 0],

                    // https://openlayers.org/workshop/en/cog/ndvi.html
                    [
                        "interpolate",
                        ["linear"],
                        layer,
                        ...getColorStops(selected_color_theme, current_band_metainfo.min, current_band_metainfo.max, 50, invert_colors)
                    ]
                ]
            }
        });
    }

    function setup_band_data(n: number, band_times: string[]) {
        bands = [];
        band_slider_values = [];
        for (let i=0; i < n; i++) {
            let band_data = {
                'index': i,
                'time': band_times[i]
            }
            bands.push(band_data);
            band_slider_values.push(parseFloat(band_times[i]));
        }


        if (bands.length >= 2) {
            console.log("Bands: ", bands);
            band_slider_helper.min = parseFloat(bands[0].time);
            band_slider_helper.max = parseFloat(bands[bands.length-1].time);
            band_slider_helper.step = parseFloat(bands[1].time) - parseFloat(bands[0].time);

            console.log("band_slider_helper: ", band_slider_helper);
        }



    }
    let layer_old = null;
    function visualize_band() {
        const layer = createTileLayer_singleBand();
        layer_old = layer;
        if (layer_old != null) {
            map.removeLayer(layer_old);
            layer_old = null;
        }
        map.addLayer(layer);

        //map.setView(layer.getSource().getView());
        //map.setView(base_view);
    }

    async function band_selected(e?) {
        var band_select = document.getElementById("bandselect");
        if (band_select != null) {
            console.log("Chose band with index: ", band_select.value);
            selected_band_index = band_select.value;
            update_band_data_and_visualize();
        }
    }

    function get_index_from_band_via_value(v: string) {
        for (let i in bands) {
            console.log("v: ", v, " band.time: ", bands[i].time);
            if (v == bands[i].time) {
                return bands[i].index
            }
        }

        return -1
    }

    async function band_selected_via_slider(e?) {
        // console.log("band_selected_via_slider: ", e.target.value);
        console.log("band_selected_via_slider: ", band_slider_values[sliderValue]);
        let band_index_helper = get_index_from_band_via_value(band_slider_values[sliderValue].toString());
        if (band_index_helper == -1) {
            throw new Error('Failed to retrieve correct band index.');
        } else {
            selected_band_index = band_index_helper;
            update_band_data_and_visualize();
        }

    }

    async function update_band_data_and_visualize() {
        let band_index_helper = parseInt(selected_band_index);
        const options = {
                samples: [band_index_helper],
            };
        const current_rasters = await geotiff_image.readRasters(options);

        let { min: band_minimum, max: band_maximum } = get_min_max(current_rasters[0]);
        current_band_metainfo.min = band_minimum;
        current_band_metainfo.max = band_maximum;
        visualize_band();
    }

    function color_theme_selected(e?) {
        console.log("Color theme changed to: ", selected_color_theme);
        update_band_data_and_visualize();
    }

    function file_selected(e?) {
        metadata_loaded = false;
        console.log("Event: ", e);
        console.log("Selected file: ", selected_file);
        let selected_file_url = "https://leutra.geogr.uni-jena.de/tippecc_data/tmp/water_budget/"+ selected_file;

        // begin card assembling
        load_file_metadata(selected_file_url).then((result) => {
            console.log("Loading file metadata succeeded!")
            geotiff_image = result;
            gdal_metadata = geotiff_image.getGDALMetadata();
            const number_of_bands = geotiff_image.getSamplesPerPixel();

            // loading band timestamps (string) and convert to array
            let helper: String = gdal_metadata['NETCDF_DIM_time_VALUES'];
            const band_times = helper.substring(1, helper.length-1).split(',');

            setup_band_data(number_of_bands, band_times);

            selected_band_index = "0";
            // console.log("Band_times: ", band_times);
            metadata_loaded = true;
            update_band_data_and_visualize()
        }).catch((error) => {
            metadata_loaded = false;
            console.log("Error during virtual_data_url: ", error);
        });
    }

    /**
     * Helper that returns min and max elements of arr
     * @param arr
     */
    function get_min_max(arr: number[]) {
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

    let invert_colors = false;
</script>

<div class="px-4 pt-4 w-full">
    <label for="fileselect">Select file:</label>
    <select id="fileselect" class="bg-primary-500 rounded-md p-1"
            bind:value={selected_file}
            on:change={file_selected}>

        {#if folder_data['content']}
            {#each folder_data['content'] as file_entry}
                {#if file_entry[0].includes(".tif") && !file_entry[0].includes("COG")}
                <option value={file_entry[0]}>
                    {file_entry[0]}
                </option>
                {/if}
            {/each}
        {/if}
    </select>

    {#if metadata_loaded}
        <div class="rounded-md bg-primary-500 border-white border-[1px] p-2 mt-4 mb-2">
            <h2>File meta data:</h2>
            <div>#BANDS: {geotiff_image.getSamplesPerPixel()}</div>
            <div id="begin_time_value">Begin time: {gdal_metadata['time#units']}</div>
            <div>Height x Width: {geotiff_image.getHeight()} x {geotiff_image.getWidth()}</div>
        </div>

        <!-- <label for="bandselect">Select Band:</label>
        <select id="bandselect" class="bg-secondary-500 rounded-md p-1"
                on:change={band_selected}>
            {#each bands as band}
                <option value={band.index}>
                    Band: {band.index} || {band.time} days..
                </option>
            {/each}
        </select> -->
        {#if bands.length >= 2}
        <div class="px-4">
            <CustomSlider
                valMap={band_slider_values}
                onSliderChangeFunction={band_selected_via_slider}
                bind:sliderValue
            />
        </div>
        {/if}


        <div class="rounded-md bg-primary-500 border-white border-[1px] p-2 mt-4 mb-2">
            <h2>Band meta data:</h2>
            <div id="band_min">MIN: {current_band_metainfo['min']}</div>
            <div id="band_min">MAX: {current_band_metainfo['max']}</div>
        </div>

        <div class="rounded-md bg-primary-500 border-white border-[1px] p-2 mt-4 mb-2">
            <h2>Visualization options:</h2>
<div class="flex">
            <select id="visualization_select"
                    class="bg-tertiary-500 rounded-md p-1 my-2 mr-4"
                    bind:value={selected_color_theme}
                    on:change={color_theme_selected}
            >
                <option value="jet">Jet</option>
                <option value="hot">Hot</option>
                <option value="cool">Cool</option>
            </select>
              {#if selected_color_theme == "jet"}
            <!-- JET -->
            <svg width="150" height="30">
                <rect width="30" height="30" fill="#000083" x="0" y="0"></rect>
                <rect width="30" height="30" fill="#039ed5" x="30" y="0"></rect>
                <rect width="30" height="30" fill="#82ff80" x="60" y="0"></rect>
                <rect width="30" height="30" fill="#fd8000" x="90" y="0"></rect>
                <rect width="30" height="30" fill="#800000" x="120" y="0"></rect>
            </svg>
            {:else if selected_color_theme == "hot"}
            <!-- HOT -->
            <svg width="150" height="30">
                <rect width="30" height="30" fill="#000000" x="0" y="0"></rect>
                <rect width="30" height="30" fill="#e60000" x="30" y="0"></rect>
                <rect width="30" height="30" fill="#f78c00" x="60" y="0"></rect>
                <rect width="30" height="30" fill="#ffe155" x="90" y="0"></rect>
                <rect width="30" height="30" fill="#ffffff" x="120" y="0"></rect>
            </svg>
            {:else if selected_color_theme == "cool"}
            <!-- COOL -->
            <svg width="150" height="30">
                <rect width="30" height="30" fill="#7d00b3" x="0" y="0"></rect>
                <rect width="30" height="30" fill="#624aed" x="30" y="0"></rect>
                <rect width="30" height="30" fill="#00ccc5" x="60" y="0"></rect>
                <rect width="30" height="30" fill="#00ff58" x="90" y="0"></rect>
                <rect width="30" height="30" fill="#93ff00" x="120" y="0"></rect>
            </svg>
            {/if}
            <label class="ml-2" for="invert_colors">invert colors</label>
            <input class="checkbox ml-4" type="checkbox" id="invert_colors" name="invert_colors" bind:checked={invert_colors} on:change={color_theme_selected}>


        </div>
    </div>
    {/if}
</div>

<div class="px-4 pt-4 w-full">
    <div id="map" class="map"></div>
</div>

<style>
	.map {
		width: 100%;
		height: 800px;
	}

</style>
