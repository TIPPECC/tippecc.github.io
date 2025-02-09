<script lang="ts">
	import { onMount, tick } from 'svelte';
	import { API_URL } from '../../app.config';
	import {
		_fetch_foldercontent_by_type,
		_fetch_foldercontent_force_update
	} from '$lib/fetch_folder_content';
	import { browser } from '$app/environment';
	import { tempresult_selection } from '../store/tempresult_store';
	import { goto } from '$app/navigation';
	import networking from '$lib/icons/networking-collaboration-svgrepo-com.svg';
	import FolderTree from '$lib/icons/folder_tree.svelte';
	import FileQuestion from '$lib/icons/file_question.svelte';
	import Earth from '$lib/icons/earth.svelte';
	import XDisabled from '$lib/icons/x_disabled.svelte';
	import SquareCaretDown from '$lib/icons/square_caret_down.svelte';
	import Download from '$lib/icons/download.svelte';
	import CircleQuestion from '$lib/icons/circle_question.svelte';
	import FoldertypeChooser from '$lib/tempresults/folderytpe_chooser.svelte';
	import CaretDown from '$lib/icons/caret_down.svelte';
	import CaretRight from '$lib/icons/caret_right.svelte';
	import SquareCheckmark from '$lib/icons/square_checkmark.svelte';
	import SquareEmpty from '$lib/icons/square_empty.svelte';
	import LoadingRing from '$lib/LoadingRing.svelte';
	import folder_types from '$lib/tempresults/folder_types.json';
	import RecursiveDisplay from '$lib/RecursiveDisplay.svelte';
	import FileDetails from '$lib/FileDetails.svelte';


	type FileinfoFormat = {
		fileversion: string;
		num_bands: number;
		creation_date: string;
		filename: string;
		filesize: string;
		in_limit_conversion: boolean;
		dirty: boolean;
		filesuffix: string;
		dat_exists: boolean;
		tif_exists: boolean;
		tif_convertable: boolean;
		metadata_exists: boolean;
		metadata: any;
		metadata_prov: any;
		metadata_prov_exists: boolean;
		metadata_show?: boolean;
	};

	type CatfilesItem = {
		filename: string;
		index: number;
	};

	type CatfolderItem = {
		files: Array<CatfilesItem>;
		toggled: boolean;
	};

	interface CatFormat {
		[key: string]: CatfolderItem;
	}

	// folder_data ... filenames of the target backend folder
	let folder_data: Array<FileinfoFormat> = [];
	let cat_folder_data: CatFormat = {};

	// checked state of all folder_data_checkboxes
	let selected_files: Array<boolean>;

	$: wget_request_string = '';
	let download_tiff = false;
	let num_download_dropped = 0;

	let query_parameter: any[] = [];
	let geo_data: any = [];
	let query = '';

	let url = '';

	let tabSet: number = 0;

	// PLACEHOLDER showcase for wget display styling
	// let wget_cmd =
	// 	"wget --input-file 'http://127.0.0.1:8000/climate/get_temp_urls?hash=21cd9c90faad4dc19b73c8c0ae75d51a'";
	let wget_add_args = '-r -H -N --cut-dirs=2';

	let foldertype = 'water_budget';
	// set from URL url type ?type=cmip6_raw
	$: if (browser) {
		const urlParams = new URLSearchParams(window.location.search);
		const type = urlParams.get('type');
		if (type) {
			foldertype = type;
		}
	}

	let loading = false;

	let variables: any = ([] = []);
	let metadata: any = ([] = []);
	// initial query
	// send_query();

	onMount(() => {
		if (browser) {
			tempresult_selection.subscribe((_value: any) => {});
		}
	});

	onMount(() => {
		refresh_foldercontent(false);
	});

	async function send_query() {
		query = '';
		for (let i = 0; i < query_parameter.length; i++) {
			query = query + '&' + query_parameter[i].replace('%', '=');
		}

		try {
			const res = await fetch(url + query);
			// console.log(res);
			let result = [];
			if (!res.ok) {
				throw new Error(`${res.status} ${res.statusText}`);
			}

			result = await res.json();
			// console.log('result', result);
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

	async function try_to_generate_dat_file(filename: string, fc_index: number) {
		var api_dat = API_URL + '/climate/generate_dat_file?name=' + filename + '&type=' + foldertype;
		console.log(api_dat);
		const res = await fetch(api_dat, {
			method: 'GET'
		});

		if (!res.ok) {
			folder_data[fc_index]['dat_exists'] = false;
			folder_data = [...folder_data];

			var err_msg = await res.text();
			throw new Error(`${res.status} ${res.statusText}\nReason: ${err_msg}`);
		} else {
			folder_data[fc_index]['dat_exists'] = true;
			folder_data = [...folder_data];
		}
	}

	let search_term = '';
	function filter_folder_data() {
		//folder_data.filter(( /** @type {(string | string[])[]} */ data) => data[0].includes(search_term));
		const folder_data_new = Object.values(folder_data).filter((item) =>
			item['filename'].includes(search_term)
		);
		folder_data = folder_data_new;
	}

	/**
	 * @param {{ srcElement: { value: string; checked: any; }; }} _e
	 */
	function on_folder_checkbox_change(_e: any) {
		wget_request_string = '';
	}

	function select_all_files() {
		for (var i = 0; i < selected_files.length; i++) {
			selected_files[i] = true;
		}
	}

	function unselect_all_files() {
		for (var i = 0; i < selected_files.length; i++) {
			selected_files[i] = false;
		}
	}

	function expand_all_categories() {
		for (const [key, value] of Object.entries(cat_folder_data)) {
			cat_folder_data[key].toggled = true;
		}
	}

	function close_all_categories() {
		for (const [key, value] of Object.entries(cat_folder_data)) {
			cat_folder_data[key].toggled = false;
		}
	}

	// submit all checkboxes with checked state true
	// this writes a txt file in the backend, remembering all selected files
	// this txt file is saved with a 32 char hex hash form uuid
	// the response of this request is a string containing a wget request with the
	// mentioned hash, that should download all selected files from our server
	async function handle_checkbox_submit() {
		const custom_url = API_URL + '/climate/select_temp_urls?type=' + foldertype;
		let checked_boxes = [];

		num_download_dropped = 0;

		for (let i = 0; i < selected_files.length; i++) {
			if (selected_files[i]) {
				var f_type = folder_data[i]['filesuffix'];
				var requested_filetype = folder_data[i]['filename'].split('.').pop();
				var requested_filename = folder_data[i]['filename'];

				if (download_tiff && f_type == '.nc') {
					if (!folder_data[i]['in_limit_conversion']) {
						// requested file too big to convert
						num_download_dropped += 1;
						continue;
					}
					requested_filetype = 'tif';
				}
				checked_boxes.push([requested_filename, requested_filetype]);
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

	async function get_metadata_and_prov(filename: string, foldertype: string, file_obj: any) {
		const res = await fetch(
			API_URL +
				'/climate/get_temp_file?name=' +
				filename +
				'&type' +
				'=' +
				foldertype +
				'&filetype=meta',
			{
				method: 'GET'
			}
		);
		if (!res.ok) {
			if (!folder_data[file_obj.index]['metadata']) {
				folder_data[file_obj.index]['metadata'] = {};
			}
			folder_data[file_obj.index]['metadata'] = {
				'currently no metadata available': 'for this file'
			};
			folder_data[file_obj.index]['metadata_exists'] = false;
			console.log(folder_data[file_obj.index]['metadata']);
			folder_data = [...folder_data];
			// throw new Error(`${res.status} ${res.statusText}`);
		} else {
			const result = await res.json();
			metadata = result;
			await tick();
			if (!folder_data[file_obj.index]['metadata']) {
				folder_data[file_obj.index]['metadata'] = {};
			}
			folder_data[file_obj.index]['metadata_exists'] = true;
			folder_data[file_obj.index]['metadata'] = result;
			await tick();
			folder_data = [...folder_data];
			console.log(metadata);
		}

		const res2 = await fetch(
			API_URL +
				'/climate/get_temp_file?name=' +
				filename +
				'&type' +
				'=' +
				foldertype +
				'&filetype=prov',
			{
				method: 'GET'
			}
		);
		if (!res2.ok) {
			if (!folder_data[file_obj.index]['metadata_prov']) {
				folder_data[file_obj.index]['metadata_prov'] = {};
			}
			folder_data[file_obj.index]['metadata_prov_exists'] = false;
			folder_data[file_obj.index]['metadata_prov'] = {
				'currently no provenance information available': 'for this file'
			};
			console.log(folder_data[file_obj.index]['metadata_prov']);
			folder_data = [...folder_data];
			// throw new Error(`${res.status} ${res.statusText}`);
		} else {
			const result = await res2.json();
			metadata = result;
			await tick();
			if (!folder_data[file_obj.index]['metadata_prov']) {
				folder_data[file_obj.index]['metadata_prov'] = {};
			}
			folder_data[file_obj.index]['metadata_prov_exists'] = true;
			folder_data[file_obj.index]['metadata_prov'] = result;
			await tick();
			folder_data = [...folder_data];
			console.log(metadata);
		}
		folder_data[file_obj.index]['metadata_show'] = true;
	}

	async function try_to_access_tiff_file(filename: string, fc_index: number) {
		// demand access to the tif file
		var access_tif_url = API_URL + '/climate/access_tif?type=' + foldertype + '&name=' + filename;
		const res = await fetch(access_tif_url, {
			method: 'GET'
		});

		if (!res.ok) {
			folder_data[fc_index]['tif_exists'] = false;
			folder_data[fc_index]['tif_convertable'] = false;
			folder_data = [...folder_data];

			var err_msg = await res.text();
			throw new Error(`${res.status} ${res.statusText}\nReason: ${err_msg}`);
		} else {
			folder_data[fc_index]['tif_exists'] = true;
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
		// Regex pattern to match filenames
		let filePattern = /(^(.+)_v(\d+)_([^_]+))|^((.+)_day_([^_]+)|^(.+))/; // Regex pattern to match filenames
		const folder_type = folder_types.find((x) => x.key == foldertype);
		if (folder_type && folder_type.header_regex.length > 2) {
			filePattern = new RegExp(folder_type.header_regex.replace(/\\/g, '\\'));
		} else {
			// console.error(`Folder type ${foldertype} not found.`);
		}
		console.log('filePattern: ', filePattern);
		cat_folder_data = {};
		let categories: any = {};
		variables = [];

		categories['No Category'] = { files: [], toggled: false };

		for (let x = 0; x < folder_data.length; x++) {
			var filename: string = folder_data[x]['filename'];
			const match = filename.match(filePattern);

			if (match && match.length >= 3) {
				const category = match[0];
				// match first part of filename under first "__" and save it as variable ( e.g. __evspsblpot_all__mm__yearsum_mean_2080_2099.nc, __water_budget_all__mm__yearsum_mean_1981_2000.nc, ...)
				const regex = /^(_*[^_]*_[^_]+)/g;
				let matches = filename.replace(match[0], '').replace('.nc', '').match(regex);
				let variable = '';
				if (matches) {
					// console.log('matches: ', matches);
					variable = matches[0]
						.replace(/_\d{4}/g, '')
						.replace(/^_+/, '')
						.replace('_Afr', '');
					if (!variables.includes(variable)) {
						variables.push(variable);
					}
				}
				// console.log('matches: ', match[1]);

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
		variables = [...variables];
	}

	async function refresh_foldercontent(force_update = false) {
		folder_data = {};
		variables = [];
		search_term = '';
		// only_convertable false fetches all files

		// block further clicking on page
		loading = true;

		try {
			if (force_update) {
				var result = await _fetch_foldercontent_force_update(foldertype, false);
			} else {
				var result = await _fetch_foldercontent_by_type(foldertype, false);
			}

			folder_data = result.content;
			// sort by filename
			folder_data.sort((a, b) =>
				a.filename.replace('.nc', '').localeCompare(b.filename.replace('.nc', ''))
			);

			set_cat_folder_data();
			// reset selected files after fetching new folder
			selected_files = folder_data.map(() => false);
			// console.log(folder_data, '\n', cat_folder_data, '\n', selected_files);

			// add foldetype to url in browser
			if (browser) {
				history.pushState({}, '', '?type=' + foldertype);
			}
		} catch (error) {
			console.log('Refreshing folder content failed.');
		} finally {
			loading = false;
		}
	}

	function toggle_download_tiff(_event: any) {
		download_tiff = !download_tiff;
	}

	function toggle_folder_category(category: string) {
		cat_folder_data[category].toggled = !cat_folder_data[category].toggled;
	}

	function set_search_term(variable: string) {
		search_term = variable;
	}

	// array with current geo_data['facets']['file_id']
</script>

<div class="content-div">
	<div class="flex">
		<h1 class="content-heading">Available Collections</h1>
		<div class="flex-center">
			<FolderTree />
		</div>
	</div>

	<FoldertypeChooser bind:foldertype on:foldertype_changed={() => refresh_foldercontent(false)} />
	<div>
		<button
			class="w-[120px] h-[30px] flex-center variant-filled-tertiary hover:bg-tertiary-900 rounded-md"
			on:click={() => refresh_foldercontent(true)}
		>
			Force Update
		</button>
	</div>
	<div class="flex gap-4 mt-2 p-2">
		<div>
			<button
				class="w-[120px] h-[30px] flex-center variant-filled-tertiary hover:bg-tertiary-900 rounded-md"
				on:click={() => expand_all_categories()}
			>
				<CaretRight /> &nbsp; Expand All
			</button>
		</div>
		<div>
			<button
				class="w-[120px] h-[30px] flex-center variant-filled-tertiary hover:bg-tertiary-900 rounded-md"
				on:click={() => close_all_categories()}
			>
				<CaretDown /> &nbsp; Close All
			</button>
		</div>
		<div>
			<button
				class="w-[120px] h-[30px] flex-center variant-filled-tertiary hover:bg-tertiary-900 rounded-md"
				on:click={() => select_all_files()}
			>
				<SquareCheckmark /> &nbsp; Select All
			</button>
		</div>
		<div>
			<button
				class="w-[120px] h-[30px] flex-center variant-filled-tertiary hover:bg-tertiary-900 rounded-md"
				on:click={() => unselect_all_files()}
			>
				<SquareEmpty /> &nbsp; Unselect All
			</button>
		</div>
	</div>

	<div class="p-2">
		<input
			class="input w-full mt-4 p-2"
			type="text"
			placeholder="Type to filter filenames..."
			bind:value={search_term}
		/>
	</div>
	{#if variables.length > 0}
		<div>
			<div class="flow gap-2 items-center">
				{#each variables as variable}
					<button
						class="w-[120px] h-[30px] variant-filled-surface hover:bg-tertiary-900 rounded-md mt-2 mr-2"
						on:click={set_search_term(variable)}>{variable}</button
					>
				{/each}
			</div>
		</div>
	{/if}

	{#if folder_data.length > 0}
		{#key folder_data}
			<div class="p-2">
				{#each Object.entries(cat_folder_data) as [folder_cat, cat_obj], cat_counter}
					{#if cat_obj && cat_obj.files.filter((a) => a.filename
								.toLowerCase()
								.includes(search_term.toLowerCase())).length > 0}
						<div
							class="w-full h-[36px] flex items-center rounded-md pl-3 {cat_counter % 2 == 0
								? 'bg-emerald-700'
								: 'bg-emerald-900'} mb-1"
						>
							<button
								class="w-full flex items-left"
								on:click={() => toggle_folder_category(folder_cat)}
							>
								<div class="flex-center w-[18px] h-[28px]">
									{#if cat_obj.toggled}
										<CaretDown h="28px" w="26px" />
									{:else}
										<CaretRight h="24px" />
									{/if}
								</div>
								<h2 class="text-xl ml-2">
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
										<th class="text-left min-w-[80px] max-w-[80px]">Metadata</th>
										<th class="text-left min-w-[80px] max-w-[80px]">Filesize</th>
										<th class="text-left min-w-[140px] max-w-[140px]">Last modified</th>
										<th class="text-left min-w-[122px] max-w-[122px]">Download Link</th>
										<th class="text-left min-w-[86px] max-w-[86px]">Visualize</th>
									</tr>
								</thead>
								<tbody>
									{#each cat_obj.files as file_obj}
										{#if folder_data[file_obj.index]['filename']
											.toLowerCase()
											.includes(search_term.toLowerCase())}
											<tr
												class="hover:bg-slate-400"
												style={download_tiff &&
												!folder_data[file_obj.index]['in_limit_conversion'] &&
												selected_files[file_obj.index]
													? 'background: #000000'
													: ''}
											>
												<!-- Checkbox and filename -->
												<td class="col-span-7 w-full break-all pl-1">
													<label
														for={'checkbox_' + file_obj.index}
														title="Select for download: {folder_data[file_obj.index]['filename']}"
													>
														<input
															type="checkbox"
															value={file_obj.index}
															id={'checkbox_' + file_obj.index}
															bind:checked={selected_files[file_obj.index]}
															on:change={on_folder_checkbox_change}
														/>
														&nbsp; ... {folder_data[file_obj.index]['filename']
															.replace(folder_cat, '')
															.replace(/^_+/, '')}
													</label>
												</td>
												<td>
													{#if !folder_data[file_obj.index]['metadata_show']}
														<button
															class="ml-5 max-h-[33px] p-1 flex items-center justify-center variant-filled-surface hover:bg-tertiary-900 rounded-md"
															title="Show metadata and provenance information"
															on:click={() =>
																get_metadata_and_prov(
																	folder_data[file_obj.index]['filename'],
																	foldertype,
																	file_obj
																)}
															>Show
														</button>
													{:else}
														<button
															class="ml-5 max-h-[33px] p-1 flex items-center justify-center variant-filled-surface hover:bg-tertiary-900 rounded-md"
															title="Show metadata and provenance information"
															on:click={() =>
																(folder_data[file_obj.index]['metadata_show'] = false)}
															>Hide
														</button>
													{/if}
												</td>
												<!-- filesize -->
												<td>
													{folder_data[file_obj.index]['filesize']}
												</td>
												<!-- creation date -->
												<td>
													{folder_data[file_obj.index]['creation_date']}
												</td>
												<!-- download link -->
												<td class="min-w-[122px]">
													<div class="flex">
														{#if folder_data[file_obj.index]['filesuffix'] == '.nc'}
															<button
																class="mr-1 max-h-[33px] p-1 flex items-center justify-center variant-filled-tertiary hover:bg-tertiary-900 rounded-md"
															>
																<a
																	href="{API_URL}/climate/get_temp_file?name={folder_data[
																		file_obj.index
																	]['filename']}&type={foldertype}&filetype=nc"
																	class="flex"
																	title="Download .nc file"
																>
																	<Download />
																	<div class="ml-1 flex place-items-center justify-items-center">
																		.nc
																	</div>
																</a>
															</button>
															{#if folder_data[file_obj.index]['dat_exists']}
																<button
																	class="mr-1 max-h-[33px] p-1 flex items-center justify-center variant-filled-tertiary hover:bg-tertiary-900 rounded-md"
																>
																	<a
																		href="{API_URL}/climate/get_temp_file?name={folder_data[
																			file_obj.index
																		]['filename']}&type={foldertype}&filetype=dat"
																		class="flex"
																		title="Download .dat file"
																	>
																		<Download />
																		<div class="ml-1 flex place-items-center justify-items-center">
																			.dat
																		</div>
																	</a>
																</button>
															{:else if folder_data[file_obj.index]['in_limit_conversion']}
																<button
																	class="mr-1 max-h-[33px] p-1 flex items-center justify-center bg-fuchsia-700 hover:bg-fuchsia-900 rounded-md"
																	on:click={() =>
																		try_to_generate_dat_file(
																			folder_data[file_obj.index]['filename'],
																			file_obj.index
																		)}
																	title="Generate .dat file for download"
																>
																	<!-- <a
																	href="{API_URL}/climate/generate_dat_file?name={folder_data[
																		file_obj.index
																	][0]}&type={foldertype}"
																	class="flex"
																> -->
																	<Download />
																	<div class="ml-1 flex place-items-center justify-items-center">
																		.dat
																		<!-- </a> -->
																	</div></button
																>
															{:else}
																<div class="flex w-full pr-2 items-center justify-center">
																	<XDisabled />
																</div>
															{/if}

															{#if folder_data[file_obj.index]['tif_convertable'] && !folder_data[file_obj.index]['tif_exists']}
																<!-- CASE 1: Try to generate tif. -->
																<button
																	class="max-h-[33px] p-1 flex items-center justify-center bg-fuchsia-700 hover:bg-fuchsia-900 rounded-md"
																	on:click={() =>
																		try_to_access_tiff_file(
																			folder_data[file_obj.index]['filename'],
																			file_obj.index
																		)}
																	title="Generate TIFF file for download (might fail)"
																>
																	<Download />
																	<div
																		class="ml-1 flex text-white place-items-center justify-items-center"
																	>
																		.tif
																	</div>
																</button>
															{:else if folder_data[file_obj.index]['tif_exists']}
																<!-- CASE 2: Tif file exists. -->
																<button
																	class="max-h-[33px] p-1 flex items-center justify-center variant-filled-tertiary hover:bg-tertiary-900 rounded-md"
																>
																	<a
																		href="{API_URL}/climate/get_temp_file?name={folder_data[
																			file_obj.index
																		]['filename']}&type={foldertype}&filetype=tif"
																		class="flex"
																		title="Download TIFF file"
																	>
																		<Download />
																		<div class="ml-1 flex place-items-center justify-center">
																			.tif
																		</div>
																	</a>
																</button>
															{:else}
																<!-- CASE 3: Tif not creatable. -->
																<div class="flex w-full pr-2 items-center justify-center">
																	<XDisabled />
																</div>
															{/if}
															<!-- Other Filetypes -->
														{:else}
															<button
																class="mr-1 max-h-[33px] p-1 flex items-center justify-center variant-filled-tertiary hover:bg-tertiary-900 rounded-md"
															>
																<a
																	href="{API_URL}/climate/get_temp_file?name={folder_data[
																		file_obj.index
																	]['filename']}&type={foldertype}&filetype=dat"
																	class="flex"
																>
																	<Download />
																	<div class="ml-1 flex place-items-center justify-items-center">
																		{folder_data[file_obj.index]['filesuffix']}
																	</div>
																</a>
															</button>
														{/if}
													</div>
												</td>
												<td class="min-w-[86px] max-w-[86px]">
													{#if folder_data[file_obj.index]['filesuffix'] == '.nc'}
														{#if folder_data[file_obj.index]['tif_convertable'] && !folder_data[file_obj.index]['tif_exists']}
															<!-- CASE 1: No data on the file. Try to generate tif. -->
															<button
																class="max-h-[33px] h-[33px] w-[100px] p-1 flex items-center justify-center variant-filled-secondary hover:bg-secondary-900 rounded-md"
																on:click={() =>
																	try_to_access_tiff_file(
																		folder_data[file_obj.index]['filename'],
																		file_obj.index
																	)}
																title="Generate TIFF file and visualize (might fail)"
															>
																<FileQuestion />
																<div
																	class="ml-1 flex text-white place-items-center justify-items-center"
																>
																	Generate
																</div>
															</button>
														{:else if folder_data[file_obj.index]['tif_exists']}
															<!-- CASE 2: Tif file exists. Jump straight to visualization. -->
															<button
																class="max-h-[33px] h-[33px] w-[80px] p-1 flex items-center justify-center variant-filled-primary hover:bg-primary-900 rounded-md"
																on:click={() =>
																	jump_to_vis(folder_data[file_obj.index]['filename'])}
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
													{/if}
												</td>
											</tr>
											<tr>
												<td colspan="7" class="p-2">
													{#if folder_data[file_obj.index]['metadata'] && folder_data[file_obj.index]['metadata_show']}
														<FileDetails  {folder_data} {file_obj} {foldertype} />
													{/if}
												</td>
											</tr>
										{/if}
									{/each}
								</tbody>
							</table>
						{/if}
					{/if}
				{/each}
			</div>
		{/key}

		<div class="flex gap-x-1">
			<button
				type="button"
				class="btn bg-[#D17208] rounded-md"
				on:click|preventDefault={handle_checkbox_submit}
				>Generate Wget link for download ({selected_files.filter((value) => value == true).length} selected)</button
			>
			<button
				type="button"
				class="btn bg-tertiary-500 hover:bg-tertiary-900 rounded-md"
				on:click|preventDefault={toggle_download_tiff}
				>{download_tiff ? 'Filetype .nc as .tiff' : 'Filetype .nc as .nc'}
			</button>

			<!-- TODO CHECKBOX -->
			<!-- <label
				for={'checkbox_' + file_obj.index}
				title="Select for download: {folder_data[file_obj.index]['filename']}"
			>
				<input
					type="checkbox"
					value={file_obj.index}
					id={'checkbox_' + file_obj.index}
					bind:checked={selected_files[file_obj.index]}
					on:change={on_folder_checkbox_change}
				/>
				&nbsp;{}
			</label> -->
		</div>
	{:else}
		<div class="flex-center">
			<LoadingRing />
		</div>
	{/if}

	{#if wget_request_string.length > 0}
		<div style="display:flex">
			<div class="bg-[#d9edf7] border-2 border-[#bce8f1] text-[#31708f] rounded-md p-4 m-2">
				{#if num_download_dropped > 0}
					({num_download_dropped}) of your selected files were too big and are thus dropped from the
					download.
				{/if}
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
		<div class="flex items-center mb-2">
			<SquareCaretDown />&nbsp; Download file in .[format]
		</div>
		<div class="flex items-center mb-2"><Earth />&nbsp; View file on map</div>
		<div class="flex items-center mb-2">
			<FileQuestion />&nbsp; Generate TIFF file and visualize (might fail)
		</div>
		<div class="flex items-center mb-2">
			<CircleQuestion />&nbsp; Generate TIFF file and download (might fail)
		</div>
		<div class="flex items-center">
			<XDisabled />&nbsp; TIFF file not creatable (no download/visualization)
		</div>
	</div>
</div>
