<script lang="ts">
    import { API_URL } from '../../app.config';
	import { browser } from '$app/environment';
    import { onMount, tick } from 'svelte';
	import {
		_fetch_foldercontent_by_type,
		_fetch_foldercontent_force_update,
		_fetch_file_info
	} from '$lib/fetch_folder_content';
    import FileDetails from '$lib/FileDetails.svelte';

    let metadata: any = ([] = []);
    let folder_data: FileinfoFormat;
    let file_obj: Array<FileinfoFormat> = [];
	let foldertype = '';
	let file = '';

    $: if (browser) {
        const urlParams = new URLSearchParams(window.location.search);
        const type = urlParams.get('type');
        if (type) {
            foldertype = type;
        }
        const filename = urlParams.get('filename');
        if (filename) {
            file = filename;
        }
    }

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
		metadata_prov_stats?: any;
		metadata_prov_stats_exists?: boolean;
		metadata_show?: boolean;
		tabset?: number; // Added tabset property
	};

	async function loadFileInfo(foldertype: string, file: string) {
		folder_data = await _fetch_file_info(foldertype, file);
		console.log(folder_data); // Jetzt hast du das richtige Datenobjekt
		get_metadata_and_prov(file,foldertype)
	}

    async function get_metadata_and_prov(
		filename: string,
		foldertype: string,
	) {
		console.log('get_metadata_and_prov', filename, foldertype, file_obj);
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
			if (!folder_data['metadata']) {
				folder_data['metadata'] = {};
			}
			folder_data['metadata'] = {
				'currently no metadata available': 'for this file'
			};
			folder_data['metadata_exists'] = false;
			console.log(folder_data['metadata']);
			// folder_data = [...folder_data];
			// throw new Error(`${res.status} ${res.statusText}`);
		} else {
			const result = await res.json();
			metadata = result;
			await tick();
			if (!folder_data['metadata']) {
				folder_data['metadata'] = {};
			}
			folder_data['metadata_exists'] = true;
			folder_data['metadata'] = result;
			await tick();
			// folder_data = [...folder_data];
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
			if (!folder_data['metadata_prov']) {
				folder_data['metadata_prov'] = {};
			}
			folder_data['metadata_prov_exists'] = false;
			folder_data['metadata_prov'] = {
				'currently no provenance information available': 'for this file'
			};
			console.log(folder_data['metadata_prov']);
			// folder_data = [...folder_data];
			// throw new Error(`${res.status} ${res.statusText}`);
		} else {
			const result = await res2.json();
			metadata = result;
			await tick();
			if (!folder_data['metadata_prov']) {
				folder_data['metadata_prov'] = {};
			}
			folder_data['metadata_prov_exists'] = true;
			folder_data['metadata_prov'] = result;
			await tick();
			//  folder_data = [...folder_data];
			console.log(metadata);
		}

		const res3 = await fetch(
			API_URL +
				'/climate/get_temp_file?name=' +
				filename +
				'&type' +
				'=' +
				foldertype +
				'&filetype=prov_stats',
			{
				method: 'GET'
			}
		);
		if (!res3.ok) {
			if (!folder_data['metadata_prov_stats']) {
				folder_data['metadata_prov_stats'] = {};
			}
			folder_data['metadata_prov_stats_exists'] = false;
			folder_data['metadata_prov_stats'] = {
				'currently no provenance information available': 'for this file'
			};
			console.log(folder_data['metadata_prov_stats']);
			// folder_data = [...folder_data];
			// throw new Error(`${res.status} ${res.statusText}`);
		} else {
			const result = await res3.json();
			metadata = result;
			await tick();
			if (!folder_data['metadata_prov_stats']) {
				folder_data['metadata_prov_stats'] = {};
			}
			folder_data['metadata_prov_stats_exists'] = true;
			folder_data['metadata_prov_stats'] = result;
			await tick();
			// folder_data = [...folder_data];
			console.log(metadata);
		}

		folder_data['metadata_show'] = true;
		if (browser) {
				history.pushState({}, '', '?type=' + foldertype + '&filename=' + filename);
		}
	}

    onMount(() => {
		if (browser) {
			loadFileInfo(foldertype, file)
			console.log(folder_data)
		}
	});


</script>

<h1>Hello</h1>
<!-- <FileDetails {folder_data} {file_obj} {foldertype} /> -->