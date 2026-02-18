import { dev } from '$app/environment';

export let API_URL = '';
export let active_backend = 'leutra';

if (dev) {
	//API_URL = 'http://127.0.0.1:8000';
	API_URL = 'https://leutra.geogr.uni-jena.de/backend_geoportal';
		API_URL = 'http://sapphire.ms.wits.ac.za/backend_geoportal';
		active_backend = 'sapphire';
} else {
	if (window.location.hostname === 'leutra.geogr.uni-jena.de' || window.location.hostname === 'leutra.geogr.uni-jena.de') {
		API_URL = 'https://leutra.geogr.uni-jena.de/backend_geoportal';
		active_backend = 'leutra';
	} else if (window.location.hostname === 'sapphire.ms.wits.ac.za') {
		API_URL = 'http://sapphire.ms.wits.ac.za/backend_geoportal';
		active_backend = 'sapphire';
	} else {
		API_URL = 'https://leutra.geogr.uni-jena.de/backend_geoportal';
		active_backend = 'leutra';
	}
}
