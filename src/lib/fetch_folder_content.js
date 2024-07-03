import { API_URL } from '../app.config';

/**
 * @param {string | undefined} [type]
 */
export async function _fetch_foldercontent_by_type(type) {
	const custom_url = API_URL + '/climate/get_content?type=' + type;

	const res = await fetch(custom_url, {
		method: 'GET'
	});

	let result = [];
	if (!res.ok) {
		throw new Error(`${res.status} ${res.statusText}`);
	}

	result = await res.json();

	// sort array
	result['content'].sort();

	// console.log('folder_data', result['content']);

	return result;
}
