<script>
	import { onMount } from "svelte";

	/**
	 * @type {any}
	 */
	// folder_data ... filenames of the target backend folder
	let folder_data = undefined;

	// checked state of all folder_data_checkboxes
	let folder_checkbox_bools = [];

	$: wget_request_string = "";

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
	let wget_cmd = "wget --input-file 'http://127.0.0.1:8000/climate/get_climate_txt?hash=21cd9c90faad4dc19b73c8c0ae75d51a'";
	let wget_add_args = "-r -H -N --cut-dirs=2"

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
			url = 'https://leutra.geogr.uni-jena.de/backend_geoportal/climate/search_collection?';
			font_bold_ind = '';
			font_bold_col = 'font-bold';
			query_parameter = [];
			send_query();
		} else if (search_type == 'indicator') {
			url = 'https://leutra.geogr.uni-jena.de/backend_geoportal/climate/search_indicator?';
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
		const custom_url = "https://leutra.geogr.uni-jena.de/backend_geoportal/climate/get_content"

		try {
			const res = await fetch(custom_url,
			{
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
		const custom_url = "https://leutra.geogr.uni-jena.de/backend_geoportal/climate/select_for_wget"
		let checked_boxes = []


		for (let i = 0; i < folder_checkbox_bools.length; i++) {
			if (folder_checkbox_bools[i]) {
				checked_boxes.push(folder_data['content'][i]);
			}
		}

		console.log("CHECKED: ", checked_boxes);

		// SEND REQUEST
		try {
			const res = await fetch(custom_url,
			{
				method: 'POST',
				body: JSON.stringify(checked_boxes)
			});

			let result = [];
			if (!res.ok) {
				throw new Error(`${res.status} ${res.statusText}`);
			}

			result = await res.json();

			console.log("RESULT: ", result);
			wget_request_string = result['wget-command']
		} catch (error) {
			console.log(error);
		}
	}

	// array with current geo_data['facets']['file_id']
</script>
<!-- Backend Folder Content as checkboxes -->
{#if folder_data != null}
	<div>
		{#each Object.values(folder_data['content']) as datapoint, i}
			<div class="pl-4">
				<input
					type="checkbox"
					value={i}
					id={"checkbox_" + i}
					on:change={on_folder_checkbox_change}/>
				&nbsp;{datapoint}&nbsp;<a href="https://leutra.geogr.uni-jena.de/backend_geoportal//climate/get_file?name={datapoint}" class="underline">download</a>
			<br>
			</div>
		{/each}
		<button class="btn variant-ghost-primary m-4" on:click|preventDefault={handle_checkbox_submit}>Submit</button>
	</div>

{:else}
	<div>
		<p>Loading...</p>
	</div>


{/if}
{#if wget_request_string.length > 0}
	<div style="display:flex">
		<div class="bg-[#d9edf7] border-2 border-[#bce8f1] text-[#31708f] rounded-md p-4 m-2">
			<div class="mb-2">
				<span>
					To download all objects using Wget (this is just a visual showcase and can be ignored):
				</span>
			</div>
			<span class="bg-[#f9f2f4] p-[3px] rounded-sm text-red-500 [word-spacing:6px]">
				{wget_request_string}
			</span>
			<div class="mb-1 mt-2 text-sm">
				<span>
					Additional arguments:
				</span>
			</div>
			<span class="bg-[#f9f2f4] p-[3px] rounded-sm text-red-500 text-sm [word-spacing:4px]">
				{wget_add_args}
			</span>
		</div>
	</div>
{/if}
