<script>
	export let data = null;
	export let only_links = false;

	// split entity name and sort by name
	const sortedData = data?.['results']?.['bindings']?.sort((a, b) => {
		if (!b.entity || !b.entity.value) {
			return 1; // Move to the end if no value
		}
		if (!a.entity || !a.entity.value) {
			return 1; // Move to the end if no value
		}
		const nameA = a.entity.value.split('/').slice(-1)[0].toLowerCase();
		const nameB = b.entity.value.split('/').slice(-1)[0].toLowerCase();
		return nameA.localeCompare(nameB);
	});
</script>

<div class="ml-2">
	{#each sortedData ?? [] as source_file}
		{#if source_file.entity}
			{#if source_file['collection_id']}
				<li class="underline">
					<a
						href="water_budget?type={source_file.collection_id
							.value}&filename={source_file.entity.value.split('/').slice(-1)[0]}.nc"
						target="_self">{source_file.entity.value.split('/').slice(-1)[0]}</a
					>
				</li>
			{:else if !only_links}
				<li>{source_file.entity.value.split('/').slice(-1)[0]}</li>
			{/if}
		{/if}
	{/each}
</div>
