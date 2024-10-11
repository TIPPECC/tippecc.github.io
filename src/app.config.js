import { dev } from '$app/environment';

export let API_URL = '';

if (dev) {
	API_URL = 'http://127.0.0.1:8000';
	//API_URL = 'http://leutra.geogr.uni-jena.de/backend_geoportal';
} else {
	API_URL = 'https://leutra.geogr.uni-jena.de/backend_geoportal';
}
