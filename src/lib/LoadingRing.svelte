<script>
	// code from:
	// https://github.com/thetrisatria/svelte-loading-animation/blob/master/src/Ring.svelte

	export let size = '64px';
	export let color = '#10b981';
</script>

<div class="loadingRing" style="--color:{color};--size:{size}">
	<div />
	<div />
	<div />
	<div />
</div>

<style>
	.loadingRing {
		position: relative;
		display: inline-flex;
		justify-content: center;
		align-items: center;
		width: var(--size);
		height: var(--size);
	}
	.loadingRing div {
		width: calc(var(--size) * 0.8);
		height: calc(var(--size) * 0.8);
		box-sizing: border-box;
		display: block;
		position: absolute;
		margin: 4px;
		border: calc(var(--size) * 0.125) solid var(--color);
		border-radius: 50%;
		border-color: var(--color) transparent transparent transparent;
		animation: rotate 1.2s cubic-bezier(0.5, 0, 0.5, 1) infinite;
	}
	.loadingRing div:nth-child(1) {
		animation-delay: -0.45s;
	}
	.loadingRing div:nth-child(2) {
		animation-delay: -0.3s;
	}
	.loadingRing div:nth-child(3) {
		animation-delay: -0.15s;
	}
	@keyframes rotate {
		0% {
			transform: rotate(0deg);
		}
		100% {
			transform: rotate(360deg);
		}
	}
</style>
