<script lang="ts">
	import { onMount } from 'svelte';
	import { API_URL } from '../../app.config';
	import { _fetch_foldercontent_by_type } from '$lib/fetch_folder_content';
	import { browser } from '$app/environment';
	import { tempresult_selection } from '../store/tempresult_store';
	import { goto } from '$app/navigation';
	import networking from '$lib/icons/networking-collaboration-svgrepo-com.svg';
	import FileQuestion from '$lib/icons/file_question.svelte';
	import Earth from '$lib/icons/earth.svelte';
	import XDisabled from '$lib/icons/x_disabled.svelte';
	import SquareCaretDown from '$lib/icons/square_caret_down.svelte';
	import CircleQuestion from '$lib/icons/circle_question.svelte';
	import FoldertypeChooser from '$lib/tempresults/folderytpe_chooser.svelte';

	// folder_data ... filenames of the target backend folder
	let folder_data: any = [];
	let cat_folder_data: any = {};

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
		wget_request_string = '';
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
			if (!folder_data[fc_index][3]) {
				folder_data[fc_index][3] = {};
			}
			folder_data[fc_index][3]['tif_cached'] = false;
			folder_data[fc_index][3]['tif_convertable'] = false;
			folder_data = [...folder_data];

			var err_msg = await res.text();
			throw new Error(`${res.status} ${res.statusText}\nReason: ${err_msg}`);
		} else {
			if (!folder_data[fc_index][3]) {
				folder_data[fc_index][3] = {};
			}
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

	function set_cat_folder_data() {
		const filePattern = /^(.+)_v(\d+)_([^_]+)/; // Regex pattern to match filenames
		cat_folder_data = {};
		let categories: any = {};
		categories['No Category'] = { files: [], toggled: false };

		for (let x = 0; x < folder_data.length; x++) {
			var filename: string = folder_data[x][0];
			const match = filename.match(filePattern);

			if (match && match.length >= 3) {
				const category = match[0];

				if (!categories[category]) {
					categories[category] = { files: [], toggled: false };
				}

				categories[category].files.push({ filename: filename, index: x });
			} else {
				categories['No Category'].files.push({ filename: filename, index: x });
			}
		}

		if (categories['No Category'].files.length == 0) {
			delete categories['No Category'];
		}
		cat_folder_data = categories;
	}

	function refresh_foldercontent() {
		folder_data = {};
		// only_convertable false fetches all files
		_fetch_foldercontent_by_type(foldertype, false /* convertable */)
			.then((result) => {
				folder_data = result.content;
				set_cat_folder_data();
			})
			.catch((error) => {
				console.log(error);
			});
	}

	// array with current geo_data['facets']['file_id']
</script>

<div class="content-div">
	<div class="flex">
		<h1 class="content-heading">Available Collections</h1>
		<img src={networking} alt="..." width="30px" />
	</div>
	<FoldertypeChooser bind:foldertype on:foldertype_changed={refresh_foldercontent} />

	<div class="mt-4 p-2">
		<input
			class="input w-full mt-4 p-2"
			type="text"
			placeholder="Filter filenames..."
			bind:value={search_term}
		/>
	</div>

	{#if folder_data.length > 0}
		{#key folder_data}
			<div class="p-2">
				{#each Object.entries(cat_folder_data) as [folder_cat, cat_obj], cat_counter}
					<div
						class="w-full flex items-center rounded-md h-8 pl-3 {cat_counter % 2 == 0
							? 'bg-emerald-700'
							: 'bg-emerald-900'} mb-1"
					>
						<button
							class="w-full flex items-left"
							on:click={() => {
								cat_folder_data[folder_cat].toggled = !cat_folder_data[folder_cat].toggled;
							}}
						>
							<h2 class="text-xl">
								{folder_cat} ({cat_obj.files.filter((a) =>
									a.filename.toLowerCase().includes(search_term.toLowerCase())
								).length})
							</h2>
						</button>
					</div>
					{#if cat_obj.toggled}
						<table class="table-fixed mb-1">
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
								{#each cat_obj.files as file_obj}
									{#if folder_data[file_obj.index][0]
										.toLowerCase()
										.includes(search_term.toLowerCase())}
										<tr class="hover:bg-slate-400">
											<!-- Checkbox and filename -->
											<td class="col-span-6 w-full break-all pl-1">
												<label
													for={'checkbox_' + file_obj.index}
													title="Select for download: {folder_data[file_obj.index][0]}"
												>
													<input
														type="checkbox"
														value={file_obj.index}
														id={'checkbox_' + file_obj.index}
														on:change={on_folder_checkbox_change}
													/>

													&nbsp;{folder_data[file_obj.index][0].replace(folder_cat, '... ')}
												</label>
											</td>
											<!-- filesize -->
											<td>
												{folder_data[file_obj.index][1]}
											</td>
											<!-- creation date -->
											<td>
												{folder_data[file_obj.index][2]}
											</td>
											<!-- download link -->
											<td class="min-w-[122px]">
												<div class="flex">
													<button
														class="mr-1 max-h-[33px] p-1 flex items-center justify-center variant-filled-tertiary hover:bg-tertiary-900 rounded-md"
													>
														<a
															href="{API_URL}/climate/get_temp_file?name={folder_data[
																file_obj.index
															][0]}&type={foldertype}&filetype=nc"
															class="flex"
														>
															<SquareCaretDown />
															<div class="ml-1 flex place-items-center justify-items-center">
																.nc
															</div>
														</a>
													</button>
													{#if !folder_data[file_obj.index][3] || (folder_data[file_obj.index][3]['tif_convertable'] && !folder_data[file_obj.index][3]['tif_cached'])}
														<!-- CASE 1: Try to generate tif. -->
														<button
															class="max-h-[33px] p-1 flex items-center justify-center bg-fuchsia-700 hover:bg-fuchsia-900 rounded-md"
															on:click={() =>
																try_to_access_tiff_file(
																	folder_data[file_obj.index][0],
																	file_obj.index
																)}
														>
															<CircleQuestion />
															<div
																class="ml-1 flex text-white place-items-center justify-items-center"
															>
																.tif
															</div>
														</button>
													{:else if folder_data[file_obj.index][3]['tif_cached']}
														<!-- CASE 2: Tif file exists. -->
														<button
															class="max-h-[33px] p-1 flex items-center justify-center variant-filled-tertiary hover:bg-tertiary-900 rounded-md"
														>
															<a
																href="{API_URL}/climate/get_temp_file?name={folder_data[
																	file_obj.index
																][0]}&type={foldertype}&filetype=tif"
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
												{#if !folder_data[file_obj.index][3] || (folder_data[file_obj.index][3]['tif_convertable'] && !folder_data[file_obj.index][3]['tif_cached'])}
													<!-- CASE 1: No data on the file. Try to generate tif. -->
													<button
														class="max-h-[33px] h-[33px] w-[80px] p-1 flex items-center justify-center variant-filled-secondary hover:bg-secondary-900 rounded-md"
														on:click={() =>
															try_to_access_tiff_file(
																folder_data[file_obj.index][0],
																file_obj.index
															)}
													>
														<FileQuestion />
														<div
															class="ml-1 flex text-white place-items-center justify-items-center"
														>
															Fetch
														</div>
													</button>
												{:else if folder_data[file_obj.index][3]['tif_cached']}
													<!-- CASE 2: Tif file exists. Jump straight to visualization. -->
													<button
														class="max-h-[33px] h-[33px] w-[80px] p-1 flex items-center justify-center variant-filled-primary hover:bg-primary-900 rounded-md"
														on:click={() => jump_to_vis(folder_data[file_obj.index][0])}
													>
														<Earth />
														<div
															class="ml-1 flex text-white place-items-center justify-items-center"
														>
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
					{/if}
				{/each}
			</div>
		{/key}

		<button
			type="button"
			class="btn bg-[#D17208] rounded-md"
			on:click|preventDefault={handle_checkbox_submit}
			>Generate Wget link for download ({folder_checkbox_bools.filter((value) => value == true)
				.length} selected)</button
		>
	{:else}
		<div>... Loading</div>
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
				<div class="mb-2">
					<span> How to use Wget on Windows and Linux: </span>
				</div>
				<span class="bg-[#f9f2f4] p-[3px] rounded-sm text-red-500 [word-spacing:6px]">
					..links
				</span>
			</div>
		</div>
	{:else}
		<div class="bg-[#d9edf7] border-2 border-[#bce8f1] text-[#31708f] rounded-md p-4 m-2">
			<span class="bg-[#f9f2f4] p-[3px] rounded-sm text-red-500 [word-spacing:6px]">
				No files selected or selection has changed. Please select files and click the button again.
			</span>
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
</div>
