<script lang="ts">
	import { onMount } from 'svelte';
	import { API_URL } from '../../app.config';
	import { _fetch_foldercontent_by_type } from '$lib/fetch_folder_content';
	import { browser } from '$app/environment';
	import { tempresult_selection } from '../store/tempresult_store';
	import { goto } from '$app/navigation';
	import FileQuestion from '$lib/icons/file_question.svelte';
	import Earth from '$lib/icons/earth.svelte';
	import XDisabled from '$lib/icons/x_disabled.svelte';
	import SquareCaretDown from '$lib/icons/square_caret_down.svelte';
	import CircleQuestion from '$lib/icons/circle_question.svelte';
	import FoldertypeChooser from '$lib/tempresults/folderytpe_chooser.svelte';

	// folder_data ... filenames of the target backend folder
	let folder_data: any = [];

	// checked state of all folder_data_checkboxes
	let folder_checkbox_bools: any[] = [];

	$: wget_request_string = '';

	let query_parameter: any[] = [];
	let geo_data: any = [];
	let query = '';

	let url = '';

	// PLACEHOLDER showcase for wget display styling
	// let wget_cmd =
	// 	"wget --input-file 'http://127.0.0.1:8000/climate/get_temp_urls?hash=21cd9c90faad4dc19b73c8c0ae75d51a'";
	let wget_add_args = '-r -H -N --cut-dirs=2';

	let foldertype = 'water_budget';

	// initial query
	// send_query();

	onMount(() => {
		if (browser) {
			tempresult_selection.subscribe((value) => {});
		}
	});

	onMount(() => {
		refresh_foldercontent();
	});

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
		const custom_url = API_URL + '/climate/select_temp_urls?type=' + foldertype;
		let checked_boxes = [];

		for (let i = 0; i < folder_checkbox_bools.length; i++) {
			if (folder_checkbox_bools[i]) {
				checked_boxes.push(folder_data[i][0]);
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
				var err_msg = await res.text();
				throw new Error(`${res.status} ${res.statusText}\nReason: ${err_msg}`);
			}

			result = await res.json();

			console.log('RESULT: ', result);
			wget_request_string = result['wget-command'];
		} catch (error) {
			console.log(error);
		}
	}

	async function try_to_access_tiff_file(filename: string, fc_index: number) {
		// demand access to the tif file
		var access_tif_url = API_URL + '/climate/access_tif?type=' + foldertype + '&name=' + filename;
		const res = await fetch(access_tif_url, {
			method: 'GET'
		});

		if (!res.ok) {
			folder_data[fc_index][3]['tif_cached'] = false;
			folder_data[fc_index][3]['tif_convertable'] = false;
			folder_data = [...folder_data];

			var err_msg = await res.text();
			throw new Error(`${res.status} ${res.statusText}\nReason: ${err_msg}`);
		} else {
			folder_data[fc_index][3]['tif_cached'] = true;
			folder_data = [...folder_data];
		}
	}

	function jump_to_vis(filename: string) {
		tempresult_selection.set({
			filename: filename,
			foldertype: foldertype
		});
		goto('/view_geotiff');
	}

	function refresh_foldercontent() {
		// only_convertable false fetches all files
		_fetch_foldercontent_by_type(foldertype, false /* convertable */)
			.then((result) => {
				folder_data = result.content;
			})
			.catch((error) => {
				console.log(error);
			});
	}

	// array with current geo_data['facets']['file_id']
</script>

<FoldertypeChooser 
	bind:foldertype={foldertype}
	on:foldertype_changed={refresh_foldercontent}
/>

<div>
	<input
		class="input w-full mt-4"
		type="text"
		placeholder="Filter filenames..."
		bind:value={search_term}
	/>
</div>

{#if folder_data != null}
	{#key folder_data}
		<div class="p-2">
			<table class="table-fixed">
				<thead>
					<tr>
						<th class="text-left">Filename</th>
						<th class="text-left min-w-[80px] max-w-[80px]">Filesize</th>
						<th class="text-left min-w-[140px] max-w-[140px]">Last modified</th>
						<th class="text-left min-w-[122px] max-w-[122px]">Download Link</th>
						<th class="text-left min-w-[86px] max-w-[86px]">Visualize</th>
					</tr>
				</thead>
				<tbody>
					{#each Object.values(folder_data) as datapoint, i}
						{#if datapoint[0].toLowerCase().includes(search_term.toLowerCase())}
							<tr class="hover:bg-slate-400">
								<!-- Checkbox and filename -->
								<td class="col-span-6 w-full break-all pl-1">
									<input
										type="checkbox"
										value={i}
										id={'checkbox_' + i}
										on:change={on_folder_checkbox_change}
									/>
									&nbsp;{datapoint[0]}
								</td>
								<!-- filesize -->
								<td>
									{datapoint[1]}
								</td>
								<!-- creation date -->
								<td>
									{datapoint[2]}
								</td>
								<!-- download link -->
								<td class="min-w-[122px]">
									<div class="flex">
										<button
											class="mr-1 max-h-[33px] p-1 flex items-center justify-center variant-filled-tertiary hover:bg-tertiary-900 rounded-md"
										>
											<a
												href="{API_URL}/climate/get_temp_file?name={datapoint[0]}&type={foldertype}&filetype=nc"
												class="flex"
											>
												<SquareCaretDown />
												<div class="ml-1 flex place-items-center justify-items-center">.nc</div>
											</a>
										</button>
										{#if !datapoint[3] || (datapoint[3]['tif_convertable'] && !datapoint[3]['tif_cached'])}
											<!-- CASE 1: Try to generate tif. -->
											<button
												class="max-h-[33px] p-1 flex items-center justify-center bg-fuchsia-700 hover:bg-fuchsia-900 rounded-md"
												on:click={() => try_to_access_tiff_file(datapoint[0], i)}
											>
												<CircleQuestion />
												<div class="ml-1 flex text-white place-items-center justify-items-center">
													.tif
												</div>
											</button>
										{:else if datapoint[3]['tif_cached']}
											<!-- CASE 2: Tif file exists. -->
											<button
												class="max-h-[33px] p-1 flex items-center justify-center variant-filled-tertiary hover:bg-tertiary-900 rounded-md"
											>
												<a
													href="{API_URL}/climate/get_temp_file?name={datapoint[0]}&type={foldertype}&filetype=tif"
													class="flex"
												>
													<SquareCaretDown />
													<div class="ml-1 flex place-items-center justify-center">.tif</div>
												</a>
											</button>
										{:else}
											<!-- CASE 3: Tif not creatable. -->
											<div class="flex w-full pr-2 items-center justify-center">
												<XDisabled />
											</div>
										{/if}
									</div>
								</td>
								<td class="min-w-[86px] max-w-[86px]">
									<!-- num bands (we could use basically any metadata from database/file here) -->
									{#if !datapoint[3] || (datapoint[3]['tif_convertable'] && !datapoint[3]['tif_cached'])}
										<!-- CASE 1: No data on the file. Try to generate tif. -->
										<button
											class="max-h-[33px] h-[33px] w-[80px] p-1 flex items-center justify-center variant-filled-secondary hover:bg-secondary-900 rounded-md"
											on:click={() => try_to_access_tiff_file(datapoint[0], i)}
										>
											<FileQuestion />
											<div class="ml-1 flex text-white place-items-center justify-items-center">
												Fetch
											</div>
										</button>
									{:else if datapoint[3]['tif_cached']}
										<!-- CASE 2: Tif file exists. Jump straight to visualization. -->
										<button
											class="max-h-[33px] h-[33px] w-[80px] p-1 flex items-center justify-center variant-filled-primary hover:bg-primary-900 rounded-md"
											on:click={() => jump_to_vis(datapoint[0])}
										>
											<Earth />
											<div class="ml-1 flex text-white place-items-center justify-items-center">
												View
											</div>
										</button>
									{:else}
										<!-- CASE 3: Tif not creatable. -->
										<div class="flex w-full pr-2 items-center justify-center">
											<XDisabled />
										</div>
									{/if}
								</td>
							</tr>
						{/if}
					{/each}
				</tbody>
			</table>
		</div>
	{/key}

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

<div class="p-4">
	<div class="flex items-center mb-2"><SquareCaretDown />&nbsp; Download file in (.format).</div>
	<div class="flex items-center mb-2"><Earth />&nbsp; View file on map.</div>
	<div class="flex items-center mb-2">
		<FileQuestion />&nbsp; Try to generate and visualize. (might fail)
	</div>
	<div class="flex items-center mb-2">
		<CircleQuestion />&nbsp; Try to generate tif and download. (might fail)
	</div>
	<div class="flex items-center">
		<XDisabled />&nbsp; Tiff not creatable. (no download/visualization).
	</div>
</div>
