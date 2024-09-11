<script>
	export let color = '';
	export let icon = '';
	export let wp = '';
	export let title = '';
	export let description = 'no';
	export let image = '';
</script>

{#if description === 'no'}
	<div class="card p-4 m-2 border border-5 border-[{color}]">
		<div class="text-left mt-[-28px]"><span class="chip bg-[{color}]"><b>{wp}</b></span></div>
		<div class="flex">
			<span><img src={icon} alt="..." width="40px" class="mt-2" /></span>

			<b class="text-lg underline underline-offset-4 decoration-[{color}] ml-2">{title}</b><br />
		</div>
		<!--<img src={image} alt="..." class="mt-2" />-->

		<blockquote class="mt-1 text-sm">

		</blockquote>
	</div>
{:else}
	<a
		class="card p-4 m-2 border border-5 border-[{color}] hover:bg-surface-600"
		href="/case_studies/{wp.replaceAll(' ', '').toLowerCase()}"
		title="click to learn more"
	>
		<div class="text-left mt-[-28px]"><span class="chip bg-[{color}]"><b>{wp}</b></span></div>
		<div class="flex">
			<span><img src={icon} alt="..." width="40px" class="mt-2" /></span>

			<b class="text-lg underline underline-offset-4 decoration-[{color}] ml-2">{title}</b><br />
		</div>
		<!--<img src={image} alt="..." class="mt-2" />-->

		<blockquote class="mt-1 text-sm">
			{description}
		</blockquote>
	</a>
{/if}
