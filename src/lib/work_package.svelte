<script>
	export let color = '';
	export let icon;
	export let wp = '';
	export let title = '';
	export let description = '';
	export let link = true;
</script>

{#if link === true}
	<a
		class="card p-4 m-2 border border-5 hover:bg-surface-600"
		href={'/work_packages/' + wp.replaceAll(' ', '').toLowerCase()}
		title="click to learn more"
		style="border-color: {color};"
	>
		<div class="text-left mt-[-28px]">
			<span class="chip" style="background-color: {color};"><b>{wp}</b></span>
		</div>
		<div class="flex">
			{#if icon}
				{#if typeof icon === 'string'}
					<span><img src={icon} alt="icon" width="40" class="mt-2" /></span>
				{:else}
					<span><svelte:component this={icon} width={40} class="mt-2" /></span>
				{/if}
			{:else}
				<!-- fallback if no icon provided -->
				<span class="mt-2 w-10 h-10 bg-gray-200 rounded" />
			{/if}

			<b class="text-lg underline underline-offset-4 ml-2" style="text-decoration-color: {color};"
				>{title}</b
			><br />
		</div>

		<blockquote class="mt-1 text-sm">
			{description}
		</blockquote>
	</a>
{:else}
	<span class="card p-4 m-2 border border-5 hover:bg-surface-600" style="border-color: {color};">
		<div class="text-left mt-[-28px]">
			<span class="chip static-courser" style="background-color: {color};"><b>{wp}</b></span>
		</div>
		<div class="flex">
			{#if icon}
				{#if typeof icon === 'string'}
					<span><img src={icon} alt="icon" width="40" class="mt-2" /></span>
				{:else}
					<span><svelte:component this={icon} width={40} class="mt-2" /></span>
				{/if}
			{:else}
				<span class="mt-2 w-10 h-10 bg-gray-200 rounded" />
			{/if}

			<b class="text-lg underline underline-offset-4 ml-2" style="text-decoration-color: {color};"
				>{title}</b
			><br />
		</div>

		<blockquote class="mt-1 text-sm">
			{description}
		</blockquote>
	</span>
{/if}
