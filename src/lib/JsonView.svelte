<script>
	import JsonView from '$lib/JsonView.svelte';
	export let data;
</script>

<ul class="text-sm space-y-1 ml-2">
	{#each Object.entries(data) as [key, val]}
		<li>
			<span class="font-semibold text-label">{key}:</span>
			{#if typeof val === 'object' && val !== null}
				<!-- recursive call for nested object or array -->
				<JsonView data={val} />
			{:else}
				<span class="ml-1">{val}</span>
			{/if}
		</li>
	{/each}
</ul>
