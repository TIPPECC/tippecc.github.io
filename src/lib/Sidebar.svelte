<script lang="ts">
	import folder_types from '$lib/tempresults/folder_types.json';

	export let foldertype;
	export let search_term;
	export let search_time;
	export let search_aggregation;
	export let bbox;
	export let startDate;
	export let endDate;

	// Define the folder types
	var foldertypes: {
		key: string;
		display_name: string;
		description: string;
		citation: string;
		header_regex: string;
		lineage?: string;
		status: string;
	}[] = folder_types;

	// Initialize the label-value array
	var label_value_arr: { [key: string]: { [key: string]: string } } = {};

	// Climate Model / Region
	label_value_arr[0] = {};
	label_value_arr[0]['Category'] = 'Climate Model / Region';
	label_value_arr[0]['Category_Key'] = '#collection';

	// Category filtering
	label_value_arr[1] = {};
	label_value_arr[1]['Category'] = 'Filter';
	label_value_arr[1]['Category_Key'] = '#filter';

	// Download Extent
	label_value_arr[2] = {};
	label_value_arr[2]['Category'] = 'Download Extent';
	label_value_arr[2]['Category_Key'] = '#download-extent';

	// announce array change on each variable change
	$: {
		label_value_arr[0]['Model / Region'] =
			foldertypes.find((x) => x.key == foldertype)?.display_name ?? 'Please select';
		label_value_arr[0]['Processing_Level'] = foldertypes
			.find((x) => x.key == foldertype)
			?.key.includes('_bias')
			? 'Bias adjusted'
			: 'Raw (model output)';
		label_value_arr[0]['Type'] = foldertypes.find((x) => x.key == foldertype)?.key.includes('_ind')
			? 'Indicator'
			: 'Variables';
		label_value_arr[0]['Aggregation'] = foldertypes
			.find((x) => x.key == foldertype)
			?.key.includes('_stat')
			? 'Yes'
			: 'No';
		label_value_arr[0]['Description'] =
			foldertypes.find((x) => x.key == foldertype)?.description ?? 'No description available';
		label_value_arr[0]['Lineage'] =
			foldertypes.find((x) => x.key == foldertype)?.lineage ?? 'No lineage available';
		label_value_arr[0]['Citation'] =
			foldertypes.find((x) => x.key == foldertype)?.citation ?? 'No citation available';

		label_value_arr[1]['Variable / Term'] = formatValue(search_term);
		label_value_arr[1]['Time'] = formatValue(search_time.replaceAll('_', '-'));
		label_value_arr[1]['Aggregation'] = formatValue(search_aggregation);

		label_value_arr[2]['Download Extent'] =
			formatValue(bbox[0]) +
			', ' +
			formatValue(bbox[1]) +
			', ' +
			formatValue(bbox[2]) +
			', ' +
			formatValue(bbox[3]);
		label_value_arr[2]['Start Date'] = formatValue(startDate);
		label_value_arr[2]['End Date'] = formatValue(endDate);
	}

	// fallback for empty/invalid values
	function formatValue(value: string | null | undefined) {
		if (value === null || value === undefined || value === '' || value === '_') {
			return '-';
		}
		return value;
	}

	// format coordinates with 2 decimals or fallback
	function formatCoord(value: number | null | undefined) {
		if (value === null || value === undefined || isNaN(value)) {
			return '-';
		}
		return Number(value).toFixed(2);
	}
</script>

<div class="md:hidden mb-5" />
<!-- Spacer for mobile to avoid overlap with burger button -->
<h2 class="text-xl font-bold border-b border-gray-600 pb-2 mb-4">Dataset Collection</h2>
<nav class="">
	{#each Object.keys(label_value_arr) as cat}
		{#if label_value_arr[cat]['Category']}
			<div class="items-center mt-4 font-semibold text-lg italic">
				{label_value_arr[cat]['Category']}
				<a href={label_value_arr[cat]['Category_Key']} class="font-bold hover:underline"
					><span class="ml-2 text-sm font-semibold italic">(show)</span></a
				>
			</div>
		{/if}
		<ul class="ml-4 dark:text-gray-300 list-disc mt-1">
			{#each Object.keys(label_value_arr[cat]) as label}
				{#if label != 'Category' && label != 'Category_Key'}
					<li class="mt-1 ml-2">
						<span class="font-light">{label}:</span>
						{#if label_value_arr[cat][label].length > 10}
							<br />
						{/if}
						<span class="italic font-bold">
							{label_value_arr[cat][label]}
						</span>
					</li>
				{/if}
			{/each}
		</ul>
	{/each}
</nav>
