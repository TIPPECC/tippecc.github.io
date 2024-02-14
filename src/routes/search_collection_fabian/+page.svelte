<script>
	import { onMount } from 'svelte';

	/**
	 * @type {any[]}
	 */
	let query_parameter = [];

	/**
	 * @type {Object.<string, any>}
	 */
	let geo_data = [];
	let query = '';

	let url = '';

	onMount(async () => {
		url = 'https://leutra.geogr.uni-jena.de/backend_geoportal/climate/search_collection?';
		// initial query
		send_query();
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

	// array with current geo_data['facets']['file_id']
</script>

<div style="display:flex">
	<div>
		{#if geo_data['facets']}
			{#each Object.entries(geo_data['facets']) as [key, value]}
				{#if key != 'file_id' && key != 'title' && key != 'variable_abbr'}
					<b>{key}</b> <br />
					{#each value as facet_value}
						<div class="pl-4">
							<input
								type="checkbox"
								bind:group={query_parameter}
								value={key + '%' + facet_value['name']}
								on:change={send_query}
							/>
							&nbsp; {facet_value['name']} <em>({facet_value['count']})</em>
						</div>
					{/each}
				{/if}
			{/each}
		{/if}

		{#if geo_data['hits'] && geo_data['hits'].length > 0}
			Number of found datasets: {geo_data['hits'].length}
		{:else}
			No datasets found
		{/if}
	</div>
</div>
