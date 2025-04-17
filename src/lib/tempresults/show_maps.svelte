<script lang="ts">
	import FoldertypeChooser from './folderytpe_chooser.svelte';
	import EarthAfrica from '$lib/icons/earth_africa.svelte';
	import LoadingRing from '$lib/LoadingRing.svelte';
	import { onMount } from 'svelte';
	import Map from '$lib/tempresults/tif_map.svelte';
	import { _fetch_foldercontent_by_type } from '$lib/fetch_folder_content';
	import { browser } from '$app/environment';
	let foldertype: string = 'water_budget'; // string of selected foldertype
	let selected_file: string = ''; // string of selected file
	let folder_data: any[any] = []; // choosable files
	let fildered_folder_data: any[] = []; // filtered files
	let file_search_term: string = ''; // current string input in file search field
	let file_selector: HTMLSelectElement;
	let folder_types: any = [];

	onMount(() => {
		if (browser) {
			// if we come from another page and already know the selected file:
			//	- trigger file_selected
			if (selected_file != '') {
				// <Select> does not fire changed when setting selected_file manually
				//	file_selected();
			}
		}
	});

	/**
	 * Fetches choosable files for display.
	 */
	async function refresh_foldercontent() {
		// only_convertable true only fetches convertable files
		await _fetch_foldercontent_by_type(foldertype, true /* convertable */)
			.then((result) => {
				folder_data = result.content;
			})
			.catch((error) => {
				console.log(error);
			});

		// when we change the folder we clear the filename search
		file_search_term = '';
		filesearch_input_changed();
	}

	function filesearch_input_changed() {
		fildered_folder_data = [];
		var search_term_bits = file_search_term.split(' ');
		// console.log("Searching: ", search_term_bits);

		for (var key in folder_data) {
			var f_name = folder_data[key]['filename'];
			var f_name_helper: string = f_name.toLowerCase();
			var ignore_file: boolean = false;
			for (var i in search_term_bits) {
				if (!f_name_helper.includes(search_term_bits[i].toLowerCase())) {
					ignore_file = true;
					continue;
				}
			}
			if (!ignore_file) {
				// console.log("F-Name: ", f_name);
				fildered_folder_data.push(f_name);
			}
		}

		fildered_folder_data = fildered_folder_data;
		set_cat_folder_data();
	}
	let cat_folder_data: any = [];
	let variables: any = [];
	let categories: any = [];
	let full_var: any = [];
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
		categories: [];
		variables = [];
		full_var = [];

		// categories['No Category'] = { files: [], toggled: false };

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

					if (
						!full_var.includes(
							filename
								.replace(match[0], '')
								.replace(matches[0], '')
								.replace(/^_+/, '')
								.replace('.nc', '')
						)
					) {
						full_var.push(
							filename
								.replace(match[0], '')
								.replace(matches[0], '')
								.replace(/^_+/, '')
								.replace('.nc', '')
						);
					}
				}
				// console.log('matches: ', match[1]);

				if (!categories.includes(category)) {
					categories.push(category);
				}

				//categories[category].files.push({ filename: filename, index: x });
			}
		}

		categories = [...categories];
		variables = [...variables];
		full_var.sort();
		full_var = [...full_var];
		console.log('variables: ', variables);
		console.log('cat_folder_data: ', cat_folder_data);
	}

	function set_search_term(variable: string) {
		file_search_term = variable;
		filesearch_input_changed();
	}
</script>

<div class="flex px-4">
	<h1 class="content-heading">Data Visualization</h1>
	<div class="flex-center">
		<EarthAfrica w="38" />
	</div>
</div>

<div class="px-2">
	<FoldertypeChooser bind:foldertype on:foldertype_changed={refresh_foldercontent} />
</div>

<div class="p-2">
	<input
		class="input w-full mt-4 p-2"
		type="text"
		placeholder="Type to filter filenames..."
		bind:value={file_search_term}
		on:input={filesearch_input_changed}
		on:change={filesearch_input_changed}
	/>
</div>
<div class="overflow-y-auto max-h-[120px]">
	{#if categories.length > 0}
		<div>
			<div class="flow gap-2 items-center">
				{#each categories as variable}
					<button
						class="w-[300px] h-[60px] variant-filled-surface hover:bg-tertiary-900 rounded-md mt-2 mr-2"
						on:click={set_search_term(variable)}>{variable}</button
					>
				{/each}
			</div>
		</div>
	{/if}
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
	{#if full_var.length > 0}
		<!-- max height and all scroll -->

		<div>
			<div class="flow gap-2 items-center">
				{#each full_var as variable}
					<button
						class="w-[520px] h-[30px] variant-filled-surface hover:bg-tertiary-900 rounded-md mt-2 mr-2"
						on:click={set_search_term(variable)}>{variable}</button
					>
				{/each}
			</div>
		</div>
	{/if}
</div>
<div class="lg:flex px-4 pt-4 w-full">
	{#if foldertype}
		<label
			class="flex max-w-[100px] place-items-center justify-center variant-outline-tertiary p-1"
			for="fileselect">Select file:</label
		>

		<!--TODO: Bare Select will probably not be enough for mobile
		layouts if needed here. Needs replacement by something better. -->
		<select
			id="fileselect"
			class="bg-primary-500 rounded-md p-1 max-lg:max-w-[100%] max-w-[80%] max-lg:mt-1 lg:ml-2"
			bind:this={file_selector}
			bind:value={selected_file}
		>
			{#if folder_data}
				{#each fildered_folder_data as f_name}
					<option value={f_name}>
						{f_name}
					</option>
				{/each}
			{/if}
		</select>
	{/if}
</div>

{#if selected_file && selected_file != ''}
	{#key selected_file}
		<Map {foldertype} bind:selected_file show_varinfos={true} />
	{/key}
{/if}
