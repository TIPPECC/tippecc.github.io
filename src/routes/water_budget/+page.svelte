<script>
	import { onMount } from 'svelte';
	import { API_URL } from '../../app.config';

	/**
	 * @type {any}
	 */
	// folder_data ... filenames of the target backend folder
	let folder_data = undefined;

	// checked state of all folder_data_checkboxes
	/**
	 * @type {any[]}
	 */
	let folder_checkbox_bools = [];

	$: wget_request_string = '';

	/**
	 * @type {any[]}
	 */
	let query_parameter = [];

	/**
	 * @type {Object.<string, any>}
	 */
	let geo_data = [];
	let query = '';

	let font_bold_col = 'font-bold';
	let font_bold_ind = '';

	let url = '';

	// PLACEHOLDER showcase for wget display styling
	let wget_cmd =
		"wget --input-file 'http://127.0.0.1:8000/climate/get_climate_txt?hash=21cd9c90faad4dc19b73c8c0ae75d51a'";
	let wget_add_args = '-r -H -N --cut-dirs=2';

	let type = 'water_budget';

	// set default search type
	// select_search_type('collection');

	// initial query
	// send_query();

	onMount(() => {
		fetch_foldercontent();
	});

	/**
	 * @param {string} search_type
	 */
	function select_search_type(search_type) {
		if (search_type == 'collection') {
			url = API_URL + '/climate/search_collection?';
			font_bold_ind = '';
			font_bold_col = 'font-bold';
			query_parameter = [];
			send_query();
		} else if (search_type == 'indicator') {
			url = API_URL + '/climate/search_indicator?';
			font_bold_col = '';
			font_bold_ind = 'font-bold';
			query_parameter = [];
			send_query();
		}
	}

	async function send_query() {
		query = '';
		for (let i = 0; i < query_parameter.length; i++) {
			query = query + '&' + query_parameter[i].replace('%', '=');
		}

		try {
			const res = await fetch(url + query);
			console.log(res);
			let result = [];
			if (!res.ok) {
				throw new Error(`${res.status} ${res.statusText}`);
			}

			result = await res.json();
			console.log('result', result);
			if (result.hasOwnProperty('hits')) {
				geo_data['hits'] = result.hits;
			}

			if (result.hasOwnProperty('facets')) {
				geo_data['facets'] = result.facets;
			}

			if (result.hasOwnProperty('facets_ordered')) {
				geo_data['facets_ordered'] = result.facets_ordered;
			}
			geo_data = geo_data;
			console.log('geo_data', geo_data);

			return result;
		} catch (error) {
			console.log(error);
			return [];
		}
	}

	async function fetch_foldercontent() {
		const custom_url = API_URL + '/climate/get_content?type=' + type;

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

			for (let i = 0; i < folder_data.length; i++) {
				folder_checkbox_bools.push(false);
			}

			// sort array
			folder_data['content'].sort();

			console.log('folder_data', folder_data);
		} catch (error) {
			console.log(error);
		}
	}

	let search_term = '';
	function filter_folder_data() {
		//folder_data.filter(( /** @type {(string | string[])[]} */ data) => data[0].includes(search_term));
		const folder_data_new = Object.values(folder_data).filter((item) =>
			item[0].includes(search_term)
		);
		folder_data = folder_data_new;
	}

	/**
	 * @param {{ srcElement: { value: string; checked: any; }; }} e
	 */
	function on_folder_checkbox_change(e) {
		// just for better readability, bcs. this is a nightmare :)
		let helper_index = parseInt(e.srcElement.value);
		let checked_state = e.srcElement.checked;

		folder_checkbox_bools[helper_index] = checked_state;
	}

	// submit all checkboxes with checked state true
	// this writes a txt file in the backend, remembering all selected files
	// this txt file is saved with a 32 char hex hash form uuid
	// the response of this request is a string containing a wget request with the
	// mentioned hash, that should download all selected files from our server
	async function handle_checkbox_submit() {
		const custom_url = API_URL + '/climate/select_for_wget?type=' + type;
		let checked_boxes = [];

		for (let i = 0; i < folder_checkbox_bools.length; i++) {
			if (folder_checkbox_bools[i]) {
				checked_boxes.push(folder_data['content'][i][0]);
			}
		}

		console.log('CHECKED: ', checked_boxes);

		// SEND REQUEST
		try {
			const res = await fetch(custom_url, {
				method: 'POST',
				body: JSON.stringify(checked_boxes)
			});

			let result = [];
			if (!res.ok) {
				throw new Error(`${res.status} ${res.statusText}`);
			}

			result = await res.json();

			console.log('RESULT: ', result);
			wget_request_string = result['wget-command'];
		} catch (error) {
			console.log(error);
		}
	}

	/**
	 * @param {string} new_type
	 */
	function set_type(new_type) {
		if (new_type == 'water_budget') {
			font_bold_ind = '';
			font_bold_col = 'font-bold';
			type = new_type;
		} else if (new_type == 'water_budget_bias') {
			font_bold_col = '';
			font_bold_ind = 'font-bold';
			type = new_type;
		}
		fetch_foldercontent();
	}

	// array with current geo_data['facets']['file_id']
</script>

<!-- Backend Folder Content as checkboxes -->
<div class="btn-group variant-ghost-primary [&>*+*]:border-red-500 h-6">
	<button
		type="button"
		class="btn variant-filled-tertiary {font_bold_col}"
		on:click={() => set_type('water_budget')}>Water Budget</button
	>
	<button
		type="button"
		class="btn variant-filled-tertiary {font_bold_ind}"
		on:click={() => set_type('water_budget_bias')}>Water Budget bias adjusted</button
	>
</div>
<div>
	<input
		class="input w-full mt-4"
		type="text"
		placeholder="Filter filenames..."
		bind:value={search_term}
	/>
</div>

{#if folder_data != null}
	<div class="grid grid-cols-9">
		<div class="col-span-6">Filename</div>
		<div>Filesize</div>
		<div>Last modified</div>
		<div>Download Link</div>
		{#each Object.values(folder_data['content']) as datapoint, i}
			{#if datapoint[0].toLowerCase().includes(search_term.toLowerCase())}
				<!-- Checkbox and filename -->
				<div class="col-span-6">
					<input
						type="checkbox"
						value={i}
						id={'checkbox_' + i}
						on:change={on_folder_checkbox_change}
					/>
					&nbsp;{datapoint[0]}
				</div>
				<!-- filesize -->
				<div>
					{datapoint[1]}
				</div>
				<!-- creation date -->
				<div>
					{datapoint[2]}
				</div>
				<!-- download link -->
				<div>
					&nbsp;<a
						href="{API_URL}/climate/get_file?name={datapoint[0]}&type={type}"
						class="underline">download</a
					>
				</div>
			{/if}
		{/each}
	</div>
	<button
		type="button"
		class="btn variant-ghost-primary"
		on:click|preventDefault={handle_checkbox_submit}>Generate Wget link for download</button
	>
{:else}
	<div>
		<p>Loading...</p>
	</div>
{/if}
{#if wget_request_string.length > 0}
	<div style="display:flex">
		<div class="bg-[#d9edf7] border-2 border-[#bce8f1] text-[#31708f] rounded-md p-4 m-2">
			<div class="mb-2">
				<span> To download all objects using Wget: </span>
			</div>
			<span class="bg-[#f9f2f4] p-[3px] rounded-sm text-red-500 [word-spacing:6px]">
				{wget_request_string}
			</span>
			<div class="mb-1 mt-2 text-sm">
				<span> Additional arguments: </span>
			</div>
			<span class="bg-[#f9f2f4] p-[3px] rounded-sm text-red-500 text-sm [word-spacing:4px]">
				{wget_add_args}
			</span>
		</div>
	</div>
{/if}
