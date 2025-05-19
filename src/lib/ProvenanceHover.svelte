<script>
	export let value;
	import { keyList } from '$lib/tempresults/provenanceKeys.js';
	import { popup } from '@skeletonlabs/skeleton';
    import JsonView from '$lib/JsonView.svelte';;


	// Function to stringify JSON
	/**
	 * @param {any} json
	 */
	function stringifyJSON(json) {
		return JSON.stringify(json, null, 2); // Pretty print with 2 spaces
	}
</script>

{#if value in keyList}
	<!--add tooltip-->
	<button
		class="underline decoration-dotted [&>*]:pointer-events-none"
		use:popup={{ event: 'hover', target: 'loopExample-' + value, placement: 'top' }}
	>
		{#if keyList[value]['prov:label']}
			{keyList[value]['prov:label']}
        {:else if keyList[value]['sdo:name']}
            {keyList[value]['sdo:name']}
		{:else if keyList[value]['name']}
			{keyList[value]['name']}
		{:else}
			{value}
		{/if}
	</button>
	<span class="card p-4 variant-filled-secondary" data-popup="loopExample-{value}">
		<span class="font-bold">{value}</span>
		<br />
		<hr class="my-6 border-t border-gray-300" />
        <JsonView data = {keyList[value]} />
		<!-- <ul class="text-sm space-y-1">
			{#each Object.entries(keyList[value]) as [key, val]}
				<li>
					<span class="font-semibold text-label">{key}:</span>
					<span>{val}</span>
				</li>
			{/each}
		</ul> -->
		<span class="arrow variant-filled-secondary" />
	</span>
{:else}
	{value}
{/if}
