<script>
	export let data = null;
</script>

<div class="ml-2">
	{#each data?.['results']?.['bindings'] ?? [] as source_file}
		{#if source_file.entity}
			{#if source_file['collection_id']}
				<li class="underline">
					<a
						href="water_budget?type={source_file.collection_id
							.value}&filename={source_file.entity.value.split('/').slice(-1)[0]}.nc"
						target="_self">{source_file.entity.value.split('/').slice(-1)[0]}</a
					>
				</li>
			{:else}
				<li>{source_file.entity.value.split('/').slice(-1)[0]}</li>
			{/if}
		{/if}
	{/each}
</div>
