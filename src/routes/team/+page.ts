export const prerender = true;

import { API_URL } from '../../app.config';
import team from '../../routes/team/team.json';

// Get datasets
export async function load() {
	try {
		// const req = await fetch(API_URL + '/layers/get_contacts_website');
		const req = await fetch(API_URL + '/layers/get_contacts_website');

		const result: Record<string, any>[] = await req.json();
		console.log({ result });
		return { result };
	} catch (err) {
		// read team.json file
		try {
			const result = team;
			console.log({ result });
			return { result };
		} catch (err) {
			console.log(err);
			return null;
		}
	}
}
