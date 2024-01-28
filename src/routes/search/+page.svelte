<script>
	// HARDCODED DATA, DELETE LATER
	let testData1 = {"hits":[{"score":0.0,"title":"GERICS-REMO2015_v1"}],
		"facets":{
			"variable_abbr":[
				{"name":"hurs","count":1},
				{"name":"pr","count":1},
				{"name":"prf","count":1},
				{"name":"rsds","count":1},
				{"name":"sfcwind","count":1},
				{"name":"tas","count":1},
				{"name":"tasmax","count":1},
				{"name":"tasmin","count":1}],
			"file_id":[
				{"name":"hurs_251_549","count":1},
				{"name":"pr_251_550","count":1},
				{"name":"prf_251_556","count":1},
				{"name":"rsds_251_554","count":1},
				{"name":"sfcwind_251_555","count":1},
				{"name":"tas_251_551","count":1},
				{"name":"tasmax_251_552","count":1},
				{"name":"tasmin_251_553","count":1}],
			"scenario":[{"name":"RCP8.5","count":1}],
			"gcm":[{"name":"MPI-M-MPI-ESM-LR","count":1}],
			"rcm":[{"name":"GERICS-REMO2015_v1","count":1}],
			"processing_method":[{"name":"Bias corrected","count":1}]},
		"facets_ordered":[
			{"name":"variable_abbr","order":21},
			{"name":"file_id","order":22},
			{"name":"scenario","order":17},
			{"name":"gcm","order":13},
			{"name":"rcm","order":14},
			{"name":"processing_method","order":18}]}


	/**
	 * @type {any[]}
	 */
	let flavours = [];
	/**
	 * @type {any[]}
	 */
	let geo_data = [];
	let query = "";
	testQuery();


	async function testQuery() {
		// HARDCODED URL, CHANGE LATER
// variable_abbr=pr&rcm=GERICS-REMO2015_v1&gcm=MPI-M-MPI-ESM-LR&scenario=RCP8.5&processing_method=Bias%20corrected
		query = "";
		for (let i = 0; i < flavours.length; i++) {
			query = query + "&" + flavours[i].replace("%", "=");
		}
		// let test_url = "https://leutra.geogr.uni-jena.de/backend_geoportal/climate/search_collection?" + query;
		let test_url = "https://leutra.geogr.uni-jena.de/backend_geoportal/climate/search_indicator?" + query;
		try {
			const res = await fetch(test_url);
			console.log(res);
			let result = [];
			if (!res.ok) {
				throw new Error(`${res.status} ${res.statusText}`);
			}

			result = await res.json();
			console.log("result", result);
			if (result.hasOwnProperty('hits')){
				geo_data['hits'] = result.hits;
			}

			if (result.hasOwnProperty('facets')){
				geo_data['facets'] = result.facets;
			}

			if (result.hasOwnProperty('facets_ordered')){
				geo_data['facets_ordered'] = result.facets_ordered;
			}
			geo_data = geo_data;
			console.log("geo_data", geo_data);
			// DELETE LATER
			//geo_data = testData;

			return result;
		} catch (error) {
			// DELETE LATER
			//geo_data = testData;
			console.log(error);
			return [];
		}
	}
</script>

<div>
	{geo_data}
	{#if geo_data['hits']}
		{#each geo_data['hits'] as hit}
				<li>
					Title: {hit['title']} Score: {hit['score']}
				</li>
		{/each}

	{/if}

	{#if geo_data['facets']}
		{#each Object.entries(geo_data['facets']) as [key, value]}
			{#if key != 'file_id'}
				<b>{key}</b> <br>
				{#each value as facet_value}
				<div class="pl-4">
					<input type="checkbox" bind:group={flavours} value={key + "%" + facet_value['name']} on:change={testQuery}/> &nbsp; {facet_value['name']}  <em>({facet_value['count']})</em>
				</div>
				{/each}
			{/if}
		{/each}

	{/if}
</div>