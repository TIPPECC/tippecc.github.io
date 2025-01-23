<script>
	export let data;
	import RecursiveDisplay from './RecursiveDisplay.svelte';
	/** @type {Record<string, boolean>} */
	let collapsed = {};

	// Toggle collapse state for a given key
	/**
	 * @param {string} key
	 */
	function toggleCollapse(key) {
		collapsed[key] = !collapsed[key];
	}
</script>

{#if typeof data === 'object' && !Array.isArray(data)}
	{#each Object.entries(data) as [key, value]}
		{#if key != 'NETCDF_DIM_time_VALUES'}
			<div
				class="ml-4 collapsible"
				role="button"
				tabindex="0"
				on:click={() => toggleCollapse(key)}
				on:keydown={(e) => e.key === 'Enter' && toggleCollapse(key)}
			>
				<strong>{key}:</strong>
				<div class={collapsed[key] ? 'collapsed' : ''}>
					<div class="content">
						<RecursiveDisplay data={value} />
					</div>
				</div>
			</div>
		{/if}
	{/each}
{:else if Array.isArray(data)}
	<ul class="ml-4">
		{#each data as item, index}
			<li>
				<div class="collapsible">
					<div>
						<div class="content">
							<RecursiveDisplay data={item} />
						</div>
					</div>
				</div>
			</li>
		{/each}
	</ul>
{:else}
	<span>{data}</span>
{/if}

<style>
	.collapsible {
		cursor: pointer;
		user-select: none;
	}
	.collapsed > .content {
		display: none;
	}
</style>
