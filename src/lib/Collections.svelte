<script lang="ts">
	import { writable } from 'svelte/store';
	import { onMount, tick } from 'svelte';
	import { API_URL } from '../app.config';
	import {
		_fetch_foldercontent_by_type,
		_fetch_foldercontent_force_update
	} from '$lib/fetch_folder_content';
	import { browser } from '$app/environment';
	import { tempresult_selection } from '../routes/store/tempresult_store';
	import FolderTree from '$lib/icons/folder_tree.svelte';
	import Earth from '$lib/icons/earth.svelte';
	import Download from '$lib/icons/download.svelte';
	import FoldertypeChooser from '$lib/tempresults/folderytpe_chooser.svelte';
	import CaretDown from '$lib/icons/caret_down.svelte';
	import CaretRight from '$lib/icons/caret_right.svelte';
	import SquareCheckmark from '$lib/icons/square_checkmark.svelte';
	import Magnifier from '$lib/icons/magnifier-svgrepo-com.svelte';
	import List from '$lib/icons/list-ul-alt-svgrepo-com.svelte';
	import Process from '$lib/icons/start-process.svelte';
	import SquareEmpty from '$lib/icons/square_empty.svelte';
	import LoadingRing from '$lib/LoadingRing.svelte';
	import folder_types from '$lib/tempresults/folder_types.json';
	import FileDetails from '$lib/FileDetails.svelte';
	import FileText from '$lib/icons/file-text.svelte';
	import Sidebar from '$lib/Sidebar.svelte';
	import { pushState } from '$app/navigation';

	// Store for date and bbox selection
	export const selectionStore = writable({
		startDate: '',
		endDate: '',
		bbox: [null, null, null, null]
	});

	export let filter_by_status = '';
	console.log('Status: ', filter_by_status);

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
		dat_clipped_exists?: boolean;
		nc_clipped_exists?: boolean;
		tif_exists: boolean;
		tif_convertable: boolean;
		metadata_exists: boolean;
		metadata: any;
		metadata_prov: any;
		metadata_prov_exists: boolean;
		metadata_prov_stats?: any;
		metadata_prov_stats_exists?: boolean;
		metadata_show?: boolean;
		tabset?: number; // Added tabset property
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

	// Sidebar visibility
	let sidebarVisible_ = true;

	// folder_data ... filenames of the target backend folder
	let folder_data: Array<FileinfoFormat> = [];
	let cat_folder_data: CatFormat = {};

	// checked state of all folder_data_checkboxes
	let selected_files: Array<boolean> = [];

	let is_mobile: boolean = false; // indicating if we are at mobile layout

	$: wget_request_string = '';
	let download_tiff = false;
	let num_download_dropped = 0;

	let query_parameter: any[] = [];
	let geo_data: any = [];
	let query = '';

	let url = '';
	let scroll_to_key = 1;

	let varButtonHight: number;
	// Variable for bounding box selection
	let bbox = [null, null, null, null];

	$: selectionStore.set({ startDate, endDate, bbox });

	// Variables for date selection
	$: startDate = '';
	$: endDate = '';

	function formatBbox(bbox: any[]) {
		return bbox.map((coord) => coord.toFixed(2));
	}

	let isSmallScreen = false;

	function checkHeight() {
		isSmallScreen = window.innerHeight < 570;
	}

	$: add2FileDownloadUrl = (() => {
		// Check if start and end dates are provided
		const hasDates = startDate && endDate;

		// Check if the bounding box is valid (no null values)
		const hasBbox = bbox.every((v) => v !== null);

		// Case 1: Dates provided but no valid bounding box
		if (hasDates && !hasBbox) {
			return `&timeperiod=${startDate},${endDate}`;
		}

		// Case 2: Bounding box provided but no valid dates
		if (hasBbox && !hasDates) {
			return `&boundingbox=${formatBbox(bbox).join(',')}`;
		}

		// Case 3: Both dates and bounding box provided
		if (hasDates && hasBbox) {
			return `&timeperiod=${startDate},${endDate}&boundingbox=${formatBbox(bbox).join(',')}`;
		}

		// Case 4: Neither dates nor bounding box provided → return base URL
		return '';
	})();

	// PLACEHOLDER showcase for wget display styling
	// let wget_cmd =
	// 	"wget --input-file 'http://127.0.0.1:8000/climate/get_temp_urls?hash=21cd9c90faad4dc19b73c8c0ae75d51a'";
	let wget_add_args = '-r -H -N --cut-dirs=2';

	let foldertype = 'CMIP6_raw';
	let start_file = '';
	// Removed duplicate declaration of selected_file

	// set from URL url type ?type=cmip6_raw
	$: if (browser) {
		const urlParams = new URLSearchParams(window.location.search);
		const type = urlParams.get('type');
		if (type) {
			foldertype = type;
		}
		const filename = urlParams.get('filename');
		if (filename) {
			start_file = filename;
		}
	}
	let filter = '';

	let loading = false;
	let menuOpen = false;

	function toggleMenu() {
		menuOpen = !menuOpen;
	}
	let variables: any = ([] = []);
	let metadata: any = ([] = []);
	// initial query
	// send_query();

	let abs_change = [{ time: '1981_2000-2080_2099', show: 'false' },
		{ time: '1981_2000-2021_2040', show: 'false' },
		{ time: '1981_2000-2041_2060', show: 'false' }
	];
	let twenty_years_period = [
		{ time: '1981_2000', show: 'false', display_name: 'historical' },
		{ time: '2021_2040', show: 'false', display_name: 'near future' },
		{ time: '2041_2060', show: 'false', display_name: 'mid future' },
		{ time: '2080_2099', show: 'false', display_name: 'far future' }
	];
	let thirty_years_period = [
		{ time: '1981_2010', show: 'false', display_name: 'historical' },
		{ time: '2011_2040', show: 'false', display_name: 'near future' },
		{ time: '2041_2070', show: 'false', display_name: 'mid future' },
		{ time: '2071_2099', show: 'false', display_name: 'far future' }
	];
	let aggregation = [
		{ time: 'yearly', show: 'false' },
		{ time: 'seasonal', show: 'false' },
		{ time: 'monthly', show: 'false' }
	];

	// clipped file existence
	let clipped_dat_files_exist = false;
	let clipped_nc_files_exist = false;

	onMount(() => {
		if (browser) {
			tempresult_selection.subscribe((_value: any) => {});
		}
	});

	onMount(() => {
		refresh_foldercontent(false);
	});

	onMount(() => {
		check_mobile();

		window.addEventListener('resize', check_mobile);

		return () => window.removeEventListener('resize', check_mobile);
	});

	onMount(() => {
		checkHeight();
		window.addEventListener('resize', checkHeight);
		return () => window.removeEventListener('resize', checkHeight);
	});

	function check_mobile() {
		// don't know how to programatically access the custom layout value
		// so this is hardcoded to default tailwind layout 'md'
		is_mobile = window.innerWidth < 768;
	}

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
			// set all files true which are shown (filtered result)
			if (
				folder_data[i]['filename'].toLowerCase().includes(search_term.toLowerCase()) &&
				(folder_data[i]['filename'].includes(search_time) || search_time == '_') &&
				(folder_data[i]['filename'].includes(search_aggregation) || search_aggregation == '_')
			) {
				selected_files[i] = true;
			}
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
	// this txt file is saved with a 32 char hex form uuid
	// the response of this request is a string containing a wget request with the
	// mentioned hash, that should download all selected files from our server
	async function handle_checkbox_submit() {
		const custom_url = API_URL + '/climate/select_temp_urls?type=' + foldertype;
		let checked_boxes = [];
		let customn_area_bool = false;
		let additional_options = '';
		if (filetype == 'nc_custom') {
			customn_area_bool = true;
			requested_filetype = 'nc';
		} else {
			customn_area_bool = false;
			requested_filetype = filetype;
		}

		num_download_dropped = 0;

		for (let i = 0; i < selected_files.length; i++) {
			if (selected_files[i]) {
				var f_type = folder_data[i]['filesuffix'];
				// var requested_filetype = folder_data[i]['filename'].split('.').pop();
				var requested_filename = folder_data[i]['filename'];

				if (download_tiff && f_type == '.nc') {
					if (!folder_data[i]['in_limit_conversion']) {
						// requested file too big to convert
						num_download_dropped += 1;
						continue;
					}
					requested_filetype = 'tif';
				}
				//requested_filetype = requested_filetype == 'nc' ? filetype : requested_filetype;
				checked_boxes.push([requested_filename, requested_filetype]);
			}
		}
		if (customn_area_bool) {
			additional_options = add2FileDownloadUrl;
		}
		const request_body = JSON.stringify({
			boxes: checked_boxes,
			additional_options: additional_options
		});

		// SEND REQUEST
		try {
			const res = await fetch(custom_url, {
				method: 'POST',
				body: request_body
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

	async function get_md_part({
		url,
		key,
		folder_data,
		file_obj
	}: {
		url: string;
		key: string;
		folder_data: any;
		file_obj: any;
	}): Promise<any> {
		const res = await fetch(url);
		folder_data[file_obj.index][key] = res.ok
			? await res.json()
			: {
					[`currently no ${key} available`]: 'for this file'
			  };
		folder_data[file_obj.index][`${key}_exists`] = res.ok;
	}

	async function get_metadata_and_prov(
		filename: string,
		foldertype: string,
		file_obj: any,
		tabset: number = 0
	) {
		console.log('get_metadata_and_prov', filename, foldertype, file_obj);
		folder_data[file_obj.index]['tabset'] = tabset;

		await Promise.all([
			get_md_part({
				url:
					API_URL +
					'/climate/get_temp_file?name=' +
					filename +
					'&type' +
					'=' +
					foldertype +
					'&filetype=meta',
				key: 'metadata',
				folder_data,
				file_obj
			}),
			get_md_part({
				url:
					API_URL +
					'/climate/get_temp_file?name=' +
					filename +
					'&type' +
					'=' +
					foldertype +
					'&filetype=prov',
				key: 'metadata_prov',
				folder_data,
				file_obj
			}),
			get_md_part({
				url:
					API_URL +
					'/climate/get_temp_file?name=' +
					filename +
					'&type' +
					'=' +
					foldertype +
					'&filetype=prov_stats',
				key: 'metadata_prov_stats',
				folder_data,
				file_obj
			})
		]);

		folder_data[file_obj.index]['metadata_show'] = true;
		if (browser) {
			pushState('?type=' + foldertype + '&filename=' + filename, "");
			// history.pushState({}, '', '?type=' + foldertype + '&filename=' +);
		}

		folder_data = [...folder_data];
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

	/*function jump_to_vis(filename: string) {
		tempresult_selection.set({
			filename: filename,
			foldertype: foldertype
		});
		goto('/view_geotiff');
	}*/
	let selected_file = '';
	function jump_to_vis(filename: string, index: number) {
		selected_file = filename;
		folder_data[index]['metadata_show'] = true;
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

		// check if filename contains abs_change, 20 or 30y times and set to false for all
		uncheck_times();
		uncheck_aggregation();

		for (let x = 0; x < folder_data.length; x++) {
			// check if clipped files exist and set to true if so
			if (folder_data[x]['dat_clipped_exists'] == true) {
				clipped_dat_files_exist = true;
			}
			if (folder_data[x]['nc_clipped_exists'] == true) {
				clipped_nc_files_exist = true;
			}

			var filename: string = folder_data[x]['filename'];
			const match = filename.match(filePattern);

			// check if filename contains abs_change, 20 or 30y times and set to true if includes
			check_times(filename);
			check_aggregation(filename);

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
		let maxVarLength = Math.max(...variables.map((v: string) => show_variable(v).length));
		varButtonHight = Math.ceil(maxVarLength / 14) * 24; // 14 is the maximum ammount of caharacter per line in var button, 24 is the height for one line
		variables = [...variables];

		if (start_file.length > 0) {
			// search for file in cat_folder_data
			for (const [key, value] of Object.entries(cat_folder_data)) {
				const found = value.files.find((file) => file.filename === start_file);
				console.log('found', found);
				if (found) {
					cat_folder_data[key].toggled = true;

					// find the index of the file in folder_data
					const key2 = folder_data.findIndex((file) => file.filename === start_file);

					// find file_obj in folder_data
					const file_obj = folder_data[key2];

					// set show metadata to true
					console.log('found file in folder_data', file_obj);

					get_metadata_and_prov(folder_data[key2]['filename'], foldertype, found, 0);

					// scroll to the file
					scroll_to_key = key2;

					break;
				}
			}
		}
	}

	async function scroll_to_file(key: number) {
		const element = document.getElementById('checkbox_' + key);

		// workaround for chrome bug using scrollIntoView as it removes parts of the header.
		// For some reasons this does not occuere with firefox and edge.
		// It works using scrollIntoViewIfNeeded as intended, but this is not a standard and not
		// supported in all browsers

		if (element) {
			// Add scroll-margin-top to prevent header overlap/shrinking
			if ('scrollIntoViewIfNeeded' in element) {
				// Use type assertion to access non-standard scrollIntoViewIfNeeded
				if (typeof (element as any).scrollIntoViewIfNeeded === 'function') {
					(element as any).scrollIntoViewIfNeeded(true);
				} else {
					element.scrollIntoView({ behavior: 'smooth', block: 'center' });
				}
			} else {
				element.scrollIntoView({ behavior: 'smooth', block: 'center' });
			}
		}
	}

	async function refresh_foldercontent(force_update = false) {
		folder_data = [];
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
				history.pushState({}, '', '?type=' + foldertype + '&filename=' + start_file);
			}
		} catch (error) {
			console.log('Refreshing folder content failed.');
		} finally {
			loading = false;
			// wait 0,5 seconds to scroll to file
			setTimeout(() => {
				scroll_to_file(scroll_to_key);
				// unset scroll_to_key
				scroll_to_key = 1;
			}, 500);
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

	let search_time = '_';
	function set_search_time(variable: string) {
		if (search_time !== variable) {
			search_time = variable;
		} else {
			search_time = '_';
		}
	}

	let search_aggregation = '_';
	function set_search_aggregation(variable: string) {
		if (search_aggregation !== variable) {
			search_aggregation = variable;
		} else {
			search_aggregation = '_';
		}
	}
	function check_times(filename: string | string[]) {
		// check if filename contains abs_change times and set to true if includes
		for (let i = 0; i < abs_change.length; i++) {
			if (filename.includes(abs_change[i].time)) {
				abs_change[i].show = 'true';
			}
		}
		// check if filename contains twenty_years_period times and set to true if includes
		for (let i = 0; i < twenty_years_period.length; i++) {
			if (filename.includes(twenty_years_period[i].time)) {
				twenty_years_period[i].show = 'true';
			}
		}
		// check if filename contains thirty_years_period times and set to true if includes
		for (let i = 0; i < thirty_years_period.length; i++) {
			if (filename.includes(thirty_years_period[i].time)) {
				thirty_years_period[i].show = 'true';
			}
		}
	}

	function uncheck_times() {
		// uncheck all times
		for (let i = 0; i < abs_change.length; i++) {
			abs_change[i].show = 'false';
		}
		for (let i = 0; i < twenty_years_period.length; i++) {
			twenty_years_period[i].show = 'false';
		}
		for (let i = 0; i < thirty_years_period.length; i++) {
			thirty_years_period[i].show = 'false';
		}
		// set search_time to '_'
		search_time = '_';
	}

	function check_aggregation(filename: string | string[]) {
		// check if filename contains aggregation times and set to true if includes
		for (let i = 0; i < aggregation.length; i++) {
			if (filename.includes(aggregation[i].time)) {
				aggregation[i].show = 'true';
			}
		}
	}

	function uncheck_aggregation() {
		// uncheck all times
		for (let i = 0; i < aggregation.length; i++) {
			aggregation[i].show = 'false';
		}
		// set search_aggregation to '_'
		search_aggregation = '_';
	}

	let filetype = 'nc';
	let requested_filetype = 'nc';

	function handleFileTypeChange(event: Event) {
		const target = event.target as HTMLInputElement;
		filetype = target.value;
		// requested_filetype = filetype;
	}
	// array with current geo_data['facets']['file_id']

	function show_variable(variable: string) {
		const variableMapping: Record<string, string> = {
			ai: 'Aridity Index',
			evspsblpot: 'PET',
			evspsbl: 'Actual Evaporation',
			pr: 'Precipitation',
			tas: 'Air Temp',
			tasmax: 'Max. Air Temp',
			tasmin: 'Min. Air Temp',
			sfcWind: 'Wind Speed',
			water_budget: 'Water Budget',
			kbdi: 'KBDI',
			hurs: 'Rel. Humidity',
			rlds: 'D. Long Rad.',
			rsds: 'D. Short Rad.',
			rsus: 'Up. Short Rad.',
			rlus: 'Up. Long Rad.',
			spi: 'SPI',
			spei: 'SPEI'
		};
		for (const [key, value] of Object.entries(variableMapping)) {
			if (variable == key) {
				return variable.replace(key, value);
			}
		}
		return variable;
	}
</script>

<div class="grid grid-cols-[auto_1fr]">
	<!-- full-page loading overlay -->
	{#if loading}
		<div class="loading-overlay fixed inset-0 z-50 flex items-center justify-center">
			<div class="overlay-backdrop" aria-hidden="true" />
			<div class="overlay-content">
				<LoadingRing />
			</div>
		</div>
	{/if}

	<!-- Burger button (only mobile) 
	<button
		class="md:hidden fixed top-9 left-0 z-20 bg-gray-800 text-white p-2 rounded"
		on:click={toggleMenu}
	>
		{#if menuOpen}
			✕
		{:else}
			☰
		{/if}
	</button>-->
	<!-- Sidebar -->

	<main
		class="wrap-buttons col-span-1 dark:bg-surface-600 p-1 md:p-4 space-y-4 lg:md-[5%] lg:md:[5%] lg:pr-[10%] lg:pl-[5%]"
	>
		<div class=" dark:bg-surface-600 p-1 md:p-4">
			<div class="flex">
				<h1 class="content-heading">Available Collections</h1>
				<div class="flex-center">
					<FolderTree />
				</div>
			</div>
			<div class="p-2 mb-2">
				The Climate Services Gateway (CSG) is a platform that provides access to high resolution
				climate projections and analysis ready data for the southern African region. The Gateway
				development is still ongoing as well as the processing of datasets. Here you can explore the
				available collections of datasets by climate model or region. Please report issues and feedback
				<span class="text-bold underline">
					<a
						href="https://github.com/TIPPECC/tippecc.github.io/issues"
						target="_blank"
						rel="noopener noreferrer"
						title="Report issues and feedback (opens in new tab)"
						aria-label="Report issues and feedback (opens in new tab)"
					>
						here
						<!-- small external-link icon -->
						<svg
							class="inline-block ml-1 align-text-top"
							width="15"
							height="15"
							viewBox="0 0 24 24"
							fill="currentColor"
							xmlns="http://www.w3.org/2000/svg"
							aria-hidden="true"
							focusable="false"
						>
							<path d="M14 3h7v7h-2V6.41L10.41 15 9 13.59 18.59 4H14V3z" />
							<path d="M5 5h6v2H7v10h10v-4h2v6H5z" />
						</svg>
					</a>
				</span>
				.
			</div>
			<section id="collection" />
			<FoldertypeChooser
				bind:startDate
				bind:endDate
				bind:bbox
				bind:foldertype
				bind:filter
				bind:filter_by_status
				on:foldertype_changed={() => refresh_foldercontent(false)}
			/>
			{#if filter_by_status == 'internal'}
				<div class="ml-2 mt-2">
					<button
						class="w-[120px] h-[30px] flex-center bg-tertiary-900 hover:bg-tertiary-500 rounded-md"
						on:click={() => refresh_foldercontent(true)}
						type="button"
						title="Force update the folder content by re-scanning the backend folder"
					>
						Force Update
					</button>
				</div>
			{/if}
			<br />
			<section id="filter" />
			<div class="flex gap-2 mt-6 md:w-[25%] border-t-2 border-surface-300 pt-1 border-l-2">
				<h4 class="h4 ml-2">Dataset Filters</h4>
				<Magnifier />
				<!--<button
					class="p-1 variant-filled-surface hover:bg-tertiary-900 items-center rounded-md w-[30px] h-[30px]"
					on:click={() => {search_term = ""; search_time = "_"; search_aggregation= "_"}}
					type="button"
					>
					<img src={resetCircle} alt="Reset" class="w-5 h-5" />
				</button>-->
			</div>

			{#if variables.length > 0}
				<div
					class="grid gap-2 justify-start items-center ml-2 grid-cols-[repeat(auto-fit,minmax(120px,_120px))]"
				>
					{#each variables as variable}
						<div>
							<button
								class="w-[120px] h-[{varButtonHight}px] break-words variant-filled-surface hover:bg-tertiary-900 rounded-md mt-2 mr-2
							{search_term.includes(String(variable)) ? 'font-bold' : ''}"
								style="height: {varButtonHight}px"
								on:click={() => set_search_term(variable)}
								>{show_variable(variable).replaceAll('_', '_\u200b')}</button
							>
						</div>
					{/each}
				</div>
			{/if}
			<div class="p4">
				<div class="relative w-full ml-2">
					<input
						class="input w-full mt-4 p-2 rounded-md dark:placeholder-gray-100 placeholder:italic border-2 border-surface-300"
						type="text"
						placeholder="Type to filter filenames or click label above..."
						aria-label="Filter filenames"
						bind:value={search_term}
					/>
					<button
						class="absolute right-2 top-[60%] -translate-y-1/2 hover:text-gray-600 text-2xl"
						on:click={() => (search_term = '')}
						aria-label="Clear input"
					>
						&times;
					</button>
				</div>
			</div>
			{#if variables.length > 0}
				<div>
					<div class="flow gap-2 items-center ml-2">
						<!--check if one entry has show is true-->
						{#if abs_change.some((variable) => variable.show == 'true')}
							<!-- <span class="mr-3">⏳ Δ- ⟶⌛:</span> -->
							<span class="mr-3">⏳ Δ :</span>
						{/if}

						{#each abs_change as variable}
							{#if variable.show == 'true'}
								<button
									class="w-[220px] variant-filled-surface hover:bg-tertiary-900 rounded-md mt-2 mr-2 {search_time ===
									variable.time
										? 'font-bold'
										: ''}"
									on:click={() => set_search_time(variable.time)}>{variable.time.replace('-', ' - ').replaceAll('_', '-')}</button
								>
							{/if}
						{/each}
					</div>
					<div class="flow gap-2 items-center ml-2">
						<!--check if one entry has show is true-->
						{#if twenty_years_period.some((variable) => variable.show == 'true')}
							<!-- ⏳ 20y ⟶ ⌛: -->
							⏳ 20y:
							<button
								class="w-[120px] variant-filled-surface hover:bg-tertiary-900 rounded-md mt-2 mr-2 {search_time ===
								'20y'
									? 'font-bold'
									: ''}"
								on:click={() => set_search_time('20y')}>all 20y</button
							>
						{/if}
						{#each twenty_years_period as variable}
							{#if variable.show == 'true'}
								<button
									class="w-[200px] variant-filled-surface hover:bg-tertiary-900 rounded-md mt-2 mr-2 {search_time ===
									variable.time
										? 'font-bold'
										: ''}"
									on:click={() => set_search_time(variable.time)}
									>{variable.display_name} ({variable.time.replace('_', '-')})</button
								>
							{/if}
						{/each}
					</div>
					<div class="flow gap-2 items-center ml-2">
						<!--check if one entry has show is true-->
						{#if thirty_years_period.some((variable) => variable.show == 'true')}
							<!-- ⏳ 30y ⟶ ⌛: -->
							⏳ 30y:
							<button
								class="w-[120px] variant-filled-surface hover:bg-tertiary-900 rounded-md mt-2 mr-2 {search_time ===
								'30y'
									? 'font-bold'
									: ''}"
								on:click={() => set_search_time('30y')}>all 30y</button
							>
						{/if}
						{#each thirty_years_period as variable}
							{#if variable.show == 'true'}
								<button
									class="w-[200px] variant-filled-surface hover:bg-tertiary-900 rounded-md mt-2 mr-2 {search_time ===
									variable.time
										? 'font-bold'
										: ''}"
									on:click={() => set_search_time(variable.time)}
									>{variable.display_name} ({variable.time.replace('_', '-')})</button
								>
							{/if}
						{/each}
					</div>
					{#if aggregation.some((variable) => variable.show == 'true')}
						<div class="flow gap-2 items-center ml-2 mt-2">
							Σ Sum | Avg:
							<span class="mr-4" />
							{#each aggregation as variable}
								{#if variable.show == 'true'}
									<button
										class="w-[120px] variant-filled-surface hover:bg-tertiary-900 rounded-md mt-2 mr-2 {search_aggregation ===
										variable.time
											? 'font-bold'
											: ''}"
										on:click={() => set_search_aggregation(variable.time)}>{variable.time}</button
									>
								{/if}
							{/each}
						</div>
					{/if}
				</div>
			{/if}
			<!-- Date selection column -->
			<br />
			<section id="clipping" />

			<section id="datasets" />
			<div class="flex gap-2 mt-6 md:w-[25%] border-t-2 border-surface-300 pt-1 border-l-2">
				<h4 class="h4 ml-2">Filtered Datasets</h4>
				<List />
			</div>

			{#if folder_data.length > 0}
				<div class="flex flex-wrap gap-4 p-2">
					<div>
						<button
							class="w-[120px] h-[30px] flex-center bg-tertiary-900 hover:bg-tertiary-500 rounded-md text-white"
							on:click={() => expand_all_categories()}
						>
							<CaretRight /> &nbsp; Expand All
						</button>
					</div>
					<div>
						<button
							class="w-[120px] h-[30px] flex-center bg-tertiary-900 hover:bg-tertiary-500 rounded-md text-white"
							on:click={() => close_all_categories()}
						>
							<CaretDown /> &nbsp; Close All
						</button>
					</div>
				</div>
				<div class="p-2">
					{#each Object.entries(cat_folder_data) as [folder_cat, cat_obj], cat_counter}
						<div
							class={cat_obj.files.filter((a) =>
								[search_term.toLowerCase(), search_time, search_aggregation].every((term) =>
									a.filename.toLowerCase().includes(term)
								)
							).length > 0
								? 'visible'
								: 'hidden'}
						>
							<div
								class="w-full h-[50px] md:h-[36px] flex items-center rounded-md pl-3 text-white {cat_counter %
									2 ==
								0
									? 'bg-[#124495d4]'
									: 'bg-[#4472c4e3]'} mb-1"
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
									<h2 class="md:text-xl ml-2">
										{folder_cat} ({cat_obj.files.filter((a) =>
											[search_term.toLowerCase(), search_time, search_aggregation].every((term) =>
												a.filename.toLowerCase().includes(term)
											)
										).length})
									</h2>
								</button>
							</div>
							<div class={cat_obj.toggled ? 'visible' : 'hidden'}>
								<p id="table__{cat_counter}" class="sr-only">
									Table listing available datasets with file name, metadata, file size, last
									modified date, download and visualize options. Show metadata button loads
									additional information about the dataset and its provenance. Number of files
									available in this category: {cat_obj.files.length}
								</p>
								<table
									class="table-fixed mb-1 m-2 hidden md:block"
									aria-describedby="table__{cat_counter}"
								>
									<thead>
										<tr>
											<th scope="col" class="text-left">File Name</th>
											<th scope="col" class="text-left min-w-[85px] max-w-[85px]">Metadata</th>
											<th scope="col" class="text-left min-w-[80px] max-w-[80px]">File Size</th>
											<th scope="col" class="text-left min-w-[140px] max-w-[140px]"
												>Last Modified</th
											>
											<th scope="col" class="text-left min-w-[150px] max-w-[150px]">Download</th>
											<th scope="col" class="text-left min-w-[86px] max-w-[86px]">Visualize</th>
										</tr>
									</thead>
									<tbody>
										{#each cat_obj.files as file_obj}
											<tr
												class="hover:bg-slate-400 border-t spaced-row {[
													search_term.toLowerCase(),
													search_time,
													search_aggregation
												].every((term) =>
													folder_data[file_obj.index]['filename'].toLowerCase().includes(term)
												)
													? 'visible'
													: 'hidden'}"
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
														<span class:dark:text-blue-300={selected_files[file_obj.index]}>
															&nbsp; ... {folder_data[file_obj.index]['filename']
																.replace(folder_cat, '')
																.replace(/^_+/, '')}
														</span>
														{#if folder_data[file_obj.index]['filename'].includes('_spi_') || folder_data[file_obj.index]['filename'].includes('_spei_')}
															<span
																title="Caution: This dataset may contain errors. We are currently investigating and will replace it once the issue is resolved. "
																>⚠</span
															>
														{/if}
													</label>
												</td>
												<td>
													{#if !folder_data[file_obj.index]['metadata_show']}
														<button
															class="ml-1 max-h-[33px] p-1 flex items-center justify-center variant-filled-surface hover:bg-tertiary-900 rounded-md"
															title="Show metadata and provenance information"
															on:click={() =>
																get_metadata_and_prov(
																	folder_data[file_obj.index]['filename'],
																	foldertype,
																	file_obj
																)}
														>
															<FileText />
															Show
														</button>
													{:else}
														<button
															class="ml-1 max-h-[33px] p-1 flex items-center justify-center variant-filled-surface hover:bg-tertiary-900 rounded-md"
															title="Show metadata and provenance information"
															on:click={() =>
																(folder_data[file_obj.index]['metadata_show'] = false)}
														>
															<FileText />
															Hide
														</button>
													{/if}
												</td>
												<!-- filesize -->
												<td>
													{folder_data[file_obj.index]['filesize']}
												</td>
												<!-- creation date -->
												<td>
													{filter_by_status == 'internal'
														? folder_data[file_obj.index]['creation_date']
														: folder_data[file_obj.index]['creation_date'].split(' ')[0]}
												</td>
												<!-- download link -->
												<td class="min-w-[180px]">
													<div class="flex flex-wrap gap-1">
														{#if folder_data[file_obj.index]['filesuffix'] == '.nc'}
															<button
																class="mr-1 max-h-[33px] p-1 flex items-center bg-[#3b82f6d4] hover:bg-tertiary-900 justify-center rounded-md text-white"
																title="Download .nc file"
															>
																<a
																	href="{API_URL}/climate/get_temp_file?name={folder_data[
																		file_obj.index
																	]['filename']}&type={foldertype}&filetype=nc"
																	class="flex"
																	aria-hidden="true"
																	tabindex="-1"
																>
																	<Download />
																	<div
																		class="ml-1 flex text-white place-items-center justify-items-center"
																	>
																		.nc
																	</div>
																</a>
															</button>
															{#if add2FileDownloadUrl.length > 0}
																<button
																	class="mr-1 max-h-[33px] p-1 flex items-center bg-[#3b82f6d4] hover:bg-tertiary-900 justify-center rounded-md text-white"
																	title="Download .nc file based on selected extent"
																>
																	<a
																		href="{API_URL}/climate/get_temp_file?name={folder_data[
																			file_obj.index
																		][
																			'filename'
																		]}&type={foldertype}&filetype=nc{add2FileDownloadUrl}"
																		class="flex"
																		aria-hidden="true"
																		tabindex="-1"
																	>
																		<Download />
																		<div
																			class="ml-1 flex text-white place-items-center justify-items-center"
																		>
																			.nc(e)
																		</div>
																	</a>
																</button>
															{/if}
															{#if folder_data[file_obj.index]['nc_clipped_exists']}
																<button
																	class="mr-1 max-h-[33px] p-1 flex items-center justify-center bg-[#3b82f6d4] hover:bg-tertiary-900 rounded-md text-white"
																	title="Download clipped .nc file"
																>
																	<a
																		href="{API_URL}/climate/get_temp_file?name={folder_data[
																			file_obj.index
																		]['filename']}&type={foldertype}&filetype=nc_clipped"
																		class="flex"
																		aria-hidden="true"
																		tabindex="-1"
																	>
																		<Download />
																		<div
																			class="ml-1 flex text-white place-items-center justify-items-center"
																		>
																			.nc(c)
																		</div>
																	</a>
																</button>
															{/if}

															{#if folder_data[file_obj.index]['dat_exists']}
																<button
																	class="mr-1 max-h-[33px] p-1 flex items-center justify-center bg-[#3b82f6d4] hover:bg-tertiary-900 rounded-md text-white"
																	title="Download .dat file"
																>
																	<a
																		href="{API_URL}/climate/get_temp_file?name={folder_data[
																			file_obj.index
																		]['filename']}&type={foldertype}&filetype=dat"
																		class="flex"
																		aria-hidden="true"
																		tabindex="-1"
																	>
																		<Download />
																		<div
																			class="ml-1 flex text-white place-items-center justify-items-center"
																		>
																			.dat
																		</div>
																	</a>
																</button>
															{:else if folder_data[file_obj.index]['in_limit_conversion']}
																<button
																	class="mr-1 max-h-[33px] p-1 m flex items-center justify-center bg-[#3b82f6d4] hover:bg-fuchsia-900 rounded-md text-white"
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
																	<Process />
																	<div
																		class="flex place-items-center text-white justify-items-center"
																	>
																		.dat
																		<!-- </a> -->
																	</div></button
																>
															{:else}
																<div class="flex w-full pr-2 items-center justify-center">
																	<!--<XDisabled />-->
																</div>
															{/if}

															{#if folder_data[file_obj.index]['dat_clipped_exists']}
																<button
																	class="mr-1 max-h-[33px] mb-2 w-full p-1 flex items-center justify-center bg-[#3b82f6d4] hover:bg-tertiary-900 rounded-md text-white"
																	title="Download clipped .dat file"
																>
																	<a
																		href="{API_URL}/climate/get_temp_file?name={folder_data[
																			file_obj.index
																		]['filename']}&type={foldertype}&filetype=dat_clipped"
																		class="flex"
																		aria-hidden="true"
																		tabindex="-1"
																	>
																		<Download />
																		<div
																			class="ml-1 flex text-white place-items-center justify-items-center"
																		>
																			.dat(c)
																		</div>
																	</a>
																</button>
															{/if}

															{#if folder_data[file_obj.index]['tif_convertable'] && !folder_data[file_obj.index]['tif_exists']}
																<!-- CASE 1: Try to generate tif. -->
																<button
																	class="max-h-[33px] p-1 flex items-center justify-center bg-[#3b82f6d4] hover:bg-fuchsia-900 rounded-md text-white"
																	on:click={() =>
																		try_to_access_tiff_file(
																			folder_data[file_obj.index]['filename'],
																			file_obj.index
																		)}
																	title="Generate TIFF file for download (might fail)"
																>
																	<Process />
																	<div
																		class="flex text-white place-items-center justify-items-center"
																	>
																		.tif
																	</div>
																</button>
															{:else if folder_data[file_obj.index]['tif_exists']}
																<!-- CASE 2: Tif file exists. -->
																<button
																	class="max-h-[33px] p-1 flex items-center justify-center bg-[#3b82f6d4] hover:bg-tertiary-900 rounded-md text-white"
																	title="Download .tif file"
																>
																	<a
																		href="{API_URL}/climate/get_temp_file?name={folder_data[
																			file_obj.index
																		]['filename']}&type={foldertype}&filetype=tif"
																		class="flex"
																		aria-hidden="true"
																		tabindex="-1"
																	>
																		<Download />
																		<div
																			class="ml-1 text-white flex place-items-center justify-center"
																		>
																			.tif
																		</div>
																	</a>
																</button>
															{:else}
																<!-- CASE 3: Tif not creatable. -->
																<div class="flex w-full pr-2 items-center justify-center">
																	<!--<XDisabled />-->
																</div>
															{/if}
															<!-- Other Filetypes -->
														{:else}
															<button
																class="mr-1 max-h-[33px] p-1 flex items-center justify-center bg-[#3b82f6d4] hover:bg-tertiary-900 rounded-md text-white"
																title="Download {folder_data[file_obj.index]['filesuffix']} file"
															>
																<a
																	href="{API_URL}/climate/get_temp_file?name={folder_data[
																		file_obj.index
																	]['filename']}&type={foldertype}&filetype=dat"
																	class="flex"
																	aria-hidden="true"
																	tabindex="-1"
																>
																	<Download />
																	<div
																		class="ml-1 flex text-white place-items-center justify-items-center"
																	>
																		{folder_data[file_obj.index]['filesuffix']}
																	</div>
																</a>
															</button>
														{/if}
													</div>
												</td>
												<td class="min-w-[86px] max-w-[86px]">
													{#if folder_data[file_obj.index]['filesuffix'] == '.nc'}
														<!--{#if folder_data[file_obj.index]['tif_convertable'] && !folder_data[file_obj.index]['tif_exists']}-->
														<!-- CASE 1: No data on the file. Try to generate tif. -->
														<!-- <button
																		class="max-h-[33px] h-[33px] w-[100px] p-1 flex items-center justify-center  bg-fuchsia-700 hover:bg-fuchsia-900  rounded-md"
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
																{:else if folder_data[file_obj.index]['tif_exists']}-->
														{#if folder_data[file_obj.index]['tif_convertable']}
															<!-- CASE 2: Tif file exists. Jump straight to visualization. -->
															<button
																class="max-h-[33px] h-[33px] w-[80px] p-1 flex items-center justify-center bg-[#3b82f6d4] hover:bg-primary-900 rounded-md"
																title="Visualize on map. Note: This will download the file to your browser (~{folder_data[
																	file_obj.index
																]['filesize']})."
																on:click={() =>
																	get_metadata_and_prov(
																		folder_data[file_obj.index]['filename'],
																		foldertype,
																		file_obj,
																		4
																	)}
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
																<!--<XDisabled />-->
															</div>
														{/if}
													{/if}
												</td>
											</tr>
											{#if !is_mobile}
												<tr
													class={[search_term.toLowerCase(), search_time, search_aggregation].every(
														(term) =>
															folder_data[file_obj.index]['filename'].toLowerCase().includes(term)
													)
														? 'visible'
														: 'hidden'}
												>
													{#if folder_data[file_obj.index]['metadata'] && folder_data[file_obj.index]['metadata_show']}
														<td colspan="7">
															<FileDetails {folder_data} {file_obj} {foldertype} />
														</td>
													{/if}
												</tr>
											{/if}
										{/each}
									</tbody>
								</table>
								<!-- Card layout for smaller screens -->
								<div class="grid gap-4 md:hidden">
									{#each cat_obj.files as file_obj}
										<div class="border rounded-md p-4 shadow-md {[
													search_term.toLowerCase(),
													search_time,
													search_aggregation
												].every((term) =>
													folder_data[file_obj.index]['filename'].toLowerCase().includes(term)
												)
													? 'visible'
													: 'hidden'}">
											<div class="mb-2">
												<strong>Filename:</strong>
												<span class="break-all">{folder_data[file_obj.index]['filename']}</span>
											</div>
											<div class="mb-2">
												<div class="flex items-center">
													<strong>Metadata:</strong>
													{#if !folder_data[file_obj.index]['metadata_show']}
														<button
															class="ml-1 max-h-[33px] p-1 flex items-center justify-center variant-filled-surface hover:bg-tertiary-900 rounded-md"
															title="Show metadata and provenance information"
															on:click={() =>
																get_metadata_and_prov(
																	folder_data[file_obj.index]['filename'],
																	foldertype,
																	file_obj
																)}
														>
															<FileText />
															Show
														</button>
													{:else}
														<button
															class="ml-1 max-h-[33px] p-1 flex items-center justify-center variant-filled-surface hover:bg-tertiary-900 rounded-md"
															title="Show metadata and provenance information"
															on:click={() =>
																(folder_data[file_obj.index]['metadata_show'] = false)}
														>
															<FileText />
															Hide
														</button>
													{/if}
												</div>
											</div>
											<div class="mb-2">
												<strong>Filesize:</strong>
												{folder_data[file_obj.index]['filesize']}
											</div>
											<div class="mb-2">
												<strong>Last Modified:</strong>
												{folder_data[file_obj.index]['creation_date'].split(' ')[0]}
											</div>
											<div class="mb-2">
												<strong>Download:</strong>
												(deactivated on mobile devices)
											</div>
											<div>
												<div class="flex items-center">
													{#if folder_data[file_obj.index]['tif_convertable']}
														<strong>Visualize:</strong>
														<!-- CASE 2: Tif file exists. Jump straight to visualization. -->
														<button
															class="max-h-[33px] h-[33px] w-[80px] ml-2 mr-2 p-1 flex items-center justify-center bg-[#3b82f6d4] hover:bg-primary-900 rounded-md"
															title="Visualize on map. Note: This will download the file to your browser (~{folder_data[
																file_obj.index
															]['filesize']})."
															on:click={() =>
																get_metadata_and_prov(
																	folder_data[file_obj.index]['filename'],
																	foldertype,
																	file_obj,
																	4
																)}
														>
															<Earth />
															<div
																class="ml-1 flex text-white place-items-center justify-items-center"
															>
																View
															</div>
														</button>
														<span
															>( ⚠ {folder_data[file_obj.index]['filesize']} are downloaded)</span
														>
													{:else}
														<!-- CASE 3: Tif not creatable. -->
														<div class="flex w-full pr-2 items-center justify-center">
															<!--<XDisabled />-->
														</div>
													{/if}
												</div>
											</div>
										</div>
										{#if is_mobile}
											<div
												class="break-all {[
													search_term.toLowerCase(),
													search_time,
													search_aggregation
												].every((term) =>
													folder_data[file_obj.index]['filename'].toLowerCase().includes(term)
												)
													? 'visible'
													: 'hidden'}"
											>
												{#if folder_data[file_obj.index]['metadata'] && folder_data[file_obj.index]['metadata_show']}
													<td colspan="7">
														<FileDetails {folder_data} {file_obj} {foldertype} />
													</td>
												{/if}
											</div>
										{/if}
									{/each}
								</div>
							</div>
						</div>
					{/each}
				</div>

				<section id="wget" />

				<div class="flex flex-wrap gap-4 p-2">
					<div>
						<button
							class="w-[120px] h-[30px] flex-center bg-tertiary-900 hover:bg-tertiary-500 rounded-md text-white"
							on:click={() => select_all_files()}
						>
							<SquareCheckmark /> &nbsp; Select All
						</button>
					</div>
					<div>
						<button
							class="w-[120px] h-[30px] flex-center bg-tertiary-900 hover:bg-tertiary-500 rounded-md text-white"
							on:click={() => unselect_all_files()}
						>
							<SquareEmpty /> &nbsp; Unselect All
						</button>
					</div>
				</div>
				<div class="flex gap-2 mt-6 md:w-[30%] border-t-2 border-surface-300 pt-1 border-l-2">
					<h4 class="h4 ml-2 flex gap-2">Download with WGET<Download /></h4>
				</div>
				<div class="p-2 md:hidden">
					Download deactivated on mobile devices. Please use a desktop computer or laptop.
				</div>
				<div class="flex gap-x-1 p-2 hidden md:block">
					<fieldset>
						<legend class="text-lg font-medium mb-2">Select type of file for download:</legend>
						<div class="filetype-selector flex pb-2">
							<div>
								<!--only show if valid extent or time exists-->
								{#if add2FileDownloadUrl.length > 0}
									<label>
										<input
											type="radio"
											name="filetype"
											value="nc_custom"
											bind:group={filetype}
											on:change={handleFileTypeChange}
										/>
										File type .nc (custom time and/or time extent)
									</label>
								{/if}

								<label>
									<input
										type="radio"
										name="filetype"
										value="nc"
										bind:group={filetype}
										on:change={handleFileTypeChange}
									/>
									File type .nc
								</label>
								<!--Only show if there are clipped files available -->
								{#if clipped_nc_files_exist}
									<label>
										<input
											type="radio"
											name="filetype"
											value="nc_clipped"
											bind:group={filetype}
											on:change={handleFileTypeChange}
										/>
										File type .nc (clipped)
									</label>
								{/if}

								<label>
									<input
										type="radio"
										name="filetype"
										value="dat"
										bind:group={filetype}
										on:change={handleFileTypeChange}
									/>
									File type .dat
								</label>
								<!--Only show if there are clipped files available -->
								{#if clipped_dat_files_exist}
									<label>
										<input
											type="radio"
											name="filetype"
											value="dat_clipped"
											bind:group={filetype}
											on:change={handleFileTypeChange}
										/>
										File type .dat (clipped)
									</label>
								{/if}
								<label>
									<input
										type="radio"
										name="filetype"
										value="tif"
										bind:group={filetype}
										on:change={handleFileTypeChange}
									/>
									File type .tiff
								</label>
							</div>
						</div>
					</fieldset>
					<button
						type="button"
						class="btn bg-tertiary-900 hover:bg-tertiary-500 rounded-md text-white"
						on:click|preventDefault={handle_checkbox_submit}
						>Generate Wget link for download ({selected_files.filter((value) => value == true)
							.length} selected)</button
					>
				</div>
			{:else}
				<div class="flex-center">
					<LoadingRing />
				</div>
			{/if}

			{#if wget_request_string.length > 0}
				<div style="display:flex">
					<div class="dark:bg-surface-700 border-2 rounded-md p-4 m-2">
						{#if num_download_dropped > 0}
							({num_download_dropped}) of your selected files were too big and are thus dropped from
							the download.
						{/if}
						<div class="mb-2">
							<span> To download all selected files using Wget: </span>
						</div>
						<div class=" p-[3px] dark:bg-surface-900 [word-spacing:6px]">
							{wget_request_string}
						</div>
						<!--<div class="mb-2">
							<span> How to use Wget on Windows and Linux: </span>
						</div>
						<span class="bg-[#f9f2f4] p-[3px] rounded-sm text-red-500 [word-spacing:6px]">
							..links
						</span>-->
					</div>
				</div>
			{:else}
				<!--	<div class="bg-[#d9edf7] border-2 border-[#bce8f1] text-[#31708f] rounded-md p-4 m-2">
					<span class="bg-[#f9f2f4] p-[3px] rounded-sm text-red-500 [word-spacing:6px]">
						No files selected or selection has changed. Please select files and click the button again.
					</span>
				</div>-->
			{/if}
			<!--
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
			</div>-->
		</div>
	</main>

	<!-- Sidebar -->

	<aside
		class={`fixed md:sticky md:top-0 top-9 left-0 z-10 h-screen ${
			sidebarVisible_ ? 'w-64' : 'w-6'
		} bg-surface-200 dark:bg-surface-900 p-4 md:translate-x-0 md:static md:h-screen hidden md:block border-l-4 border-[#4472c4] transition-all duration-300 overflow-y-auto`}
		aria-label="Sidebar"
	>
		<button
			class="absolute left-0 top-1/2 -translate-y-1/2 h-12 bg-[#4472c4] text-white rounded-r focus:outline-none z-20"
			style="border:none; cursor:pointer;"
			on:click={() => (sidebarVisible_ = !sidebarVisible_)}
			aria-label="Toggle sidebar"
		>
			{sidebarVisible_ ? '>' : '<'}
		</button>

		{#if sidebarVisible_}
			<Sidebar
				{foldertype}
				{search_term}
				{search_time}
				{search_aggregation}
				{bbox}
				{startDate}
				{endDate}
			/>
		{/if}
	</aside>
</div>

<style>
	.spaced-row td {
		padding-top: 10px;
		padding-bottom: 10px;
	}

	/* Styles for the loading overlay */
	.loading-overlay {
		background-color: rgba(0, 0, 0, 0.7);
	}

	.overlay-backdrop {
		position: absolute;
		inset: 0;
		background-color: rgba(0, 0, 0, 0.5);
	}

	.overlay-content {
		position: relative;
		z-index: 10;
	}
</style>
