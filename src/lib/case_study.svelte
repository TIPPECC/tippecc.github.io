<script>
	export let color = '';
	export let icon;
	export let wp = '';
	export let title = '';
	export let description = 'no';
</script>

{#if description === 'no'}
	<div class="card p-4 m-2 border border-5 border-[{color}]">
		<div class="text-left mt-[-28px] text-white">
			<span class="chip bg-[{color}]"><b>{wp}</b></span>
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

			<b class="text-lg underline underline-offset-4 decoration-[{color}] ml-2">{title}</b><br />
		</div>
		<!--<img src={image} alt="..." class="mt-2" />-->

		<blockquote class="mt-1 text-sm" />
	</div>
{:else}
	<a
		class="card p-4 m-2 border border-5 border-[{color}] hover:bg-surface-600"
		href="/case_studies/{wp.replaceAll(' ', '').toLowerCase()}"
		title="click to learn more"
	>
		<div class="text-left mt-[-28px] text-white">
			<span class="chip bg-[{color}]"><b>{wp}</b></span>
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

			<b class="text-lg underline underline-offset-4 decoration-[{color}] ml-2">{title}</b><br />
		</div>
		<!--<img src={image} alt="..." class="mt-2" />-->

		<blockquote class="mt-1 text-sm">
			{description}
		</blockquote>
	</a>
{/if}
