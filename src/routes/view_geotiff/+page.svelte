<script>
    import Map from '../../components/Map.svelte';
    import Map2 from '../../components/Map2.svelte';
    import Map3 from '../../components/Map3.svelte'
    import Map5 from '../../components/Map5.svelte'
</script>

<!-- <script>

import 'ol/ol.css';
import GeoTIFF from 'ol/source/GeoTIFF.js';
import Map from 'ol/Map.js';
import TileLayer from 'ol/layer/WebGLTile.js';
import { Vector as VectorSource } from 'ol/source';
import { Vector as VectorLayer } from 'ol/layer';

// const source = new GeoTIFF({
//   sources: [
//     {
//       url: 'https://leutra.geogr.uni-jena.de/tippecc_data/tmp/water_budget/GERICS-REMO2015_v1_MOHC-Ha[…]evspsblpot_all__yearsum_mean_1980_2000-2080_2099_COG.tif',
//       bands: [1]
//     },
//   ],
// });

let vectorSource = new VectorSource({

});

let vectorLayer = new VectorLayer({
    source: vectorSource
});

const map = new Map({
  target: 'map',
  layers: [
      vectorLayer,
  ]
});

</script>

<div id="map" class="map"></div> -->

<!-- <Map></Map> -->
<!-- <Map2></Map2> -->
<Map5></Map5>