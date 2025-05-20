<script>
	export let color = '';
	export let icon = '';
	export let wp = '';
	export let title = '';
	export let description = '';
	export let link = true;
</script>

{#if link == true}
	<a
		class="card p-4 m-2 border border-5 border-[{color}] hover:bg-surface-600"
		href="/work_packages/{wp.replaceAll(' ', '').toLowerCase()}"
		title="click to learn more"
	>
		<div class="text-left mt-[-28px]"><span class="chip bg-[{color}]"><b>{wp}</b></span></div>
		<div class="flex">
			<span><img src={icon} alt="..." width="40px" class="mt-2" /></span>

			<b class="text-lg underline underline-offset-4 decoration-[{color}] ml-2">{title}</b><br />
		</div>

		<blockquote class="mt-1 text-sm">
			{description}
		</blockquote>
	</a>
{:else}
	<span class="card p-4 m-2 border border-5 border-[{color}] hover:bg-surface-600">
		<div class="text-left mt-[-28px]"><span class="chip bg-[{color}] static-courser"><b>{wp}</b></span></div>
		<div class="flex">
			<span><img src={icon} alt="..." width="40px" class="mt-2" /></span>

			<b class="text-lg underline underline-offset-4 decoration-[{color}] ml-2">{title}</b><br />
		</div>

		<blockquote class="mt-1 text-sm">
			{description}
		</blockquote>
	</span>
{/if}
