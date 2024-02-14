export const prerender = true;

import { API_URL } from '../../app.config';

// Get datasets
export async function load() {
	try {
		// const req = await fetch(API_URL + '/layers/get_contacts_website');
		const req = await fetch('https://leutra.geogr.uni-jena.de/backend_geoportal/climate/search_collection?variable_abbr=pr');

		const result: Record<string, any>[] = await req.json();
		console.log({ result });
		return { result };
	} catch (err) {
		console.log(err);
		return null;
	}
}
