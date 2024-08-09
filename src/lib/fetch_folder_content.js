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

	return res;
}
