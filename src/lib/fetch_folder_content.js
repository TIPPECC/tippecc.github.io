import { API_URL } from '../app.config';

/**
 * @param {string | undefined} [type]
 */
export async function _fetch_foldercontent_by_type(type, convertable = false) {
	var helper = API_URL + '/climate/get_content?type=' + type;
	if (convertable) {
		helper += '&convertable=true';
	}

	const custom_url = helper;

	const res = await fetch(custom_url, {
		method: 'GET'
	});

	let result = [];
	if (!res.ok) {
		var msg = await res.text();
		throw new Error(`${res.status} ${res.statusText}\nReason: ${msg}`);
	}

	result = await res.json();

	// sort array
	result['content'].sort();

	// console.log('folder_data', result['content']);

	return result;
}
