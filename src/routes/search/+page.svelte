<script>
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

	// set default search type
	select_search_type('collection');

	// initial query
	send_query();

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

	// array with current geo_data['facets']['file_id']
</script>

<div>
	<div><h1>Test Search Page</h1></div>

	<div class="btn-group variant-ghost-primary [&>*+*]:border-red-500 h-6">
		<button
			type="button"
			class="btn variant-filled-tertiary {font_bold_col}"
			on:click={() => select_search_type('collection')}>Search</button
		>
		<button
			type="button"
			class="btn variant-filled-tertiary {font_bold_ind}"
			on:click={() => select_search_type('indicator')}>Indicator</button
		>
	</div>
</div>
<div style="display:flex">
	<div>
		{#if geo_data['facets']}
			{#each Object.entries(geo_data['facets']) as [key, value]}
				{#if key != 'file_id' && key != 'title'}
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
	</div>
	<div>
		{#if geo_data['facets']}
			{#each Object.entries(geo_data['facets']) as [key, value]}
				{#if key == 'title'}
					<b>{key}</b> <br />
					{#each value as facet_value}
						<div class="pl-4">
							<input
								disabled
								type="checkbox"
								bind:group={query_parameter}
								value={key + '%' + facet_value['name']}
								on:change={send_query}
							/>
							&nbsp; {facet_value['name']}
							<a
								href="https://leutra.geogr.uni-jena.de/tippec_data/{facet_value['name'].split('/')}"
								>Download</a
							>
						</div>
					{/each}
				{/if}
			{/each}
		{/if}
		{#if geo_data['hits']}
			{#each geo_data['hits'] as hit}
				<li>
					Title: {hit['title']}
				</li>
			{/each}
		{/if}
	</div>
</div>
