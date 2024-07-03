<script lang="ts">
	import { createEventDispatcher } from 'svelte';

	const dispatch = createEventDispatcher();
	// Define custom slider steps
	export let valMap: any[];
	export let onSliderChangeFunction = onSliderChange;
	// const valMap = [0, 1, 3, 5, 10, 15, 20, 30, 50];

	// This is the default position of the slider
	export let slider_index: number = 0;
	export let slider_value: number = 0;

	function onSliderChange(e?) {
		// Update the internal slider value based on input change
		slider_index = e.target.value;
		if (valMap) {
			slider_value = valMap[slider_index];
			dispatch('slider_changed', {});
		}
	}

	// var intervalId = window.setInterval(function(){
	// 	if (slider_index < valMap.length){
	// 		slider_index += 1;
	// 		dispatch('slider_changed', {});
	// 	}
	// }, 5000);
</script>

{#if valMap != undefined}
	<div class="variant-outline-tertiary mt-2 px-20">
		<h4 class="h4 text-center">Bandslider</h4>
		<div class="slider-container mt-6">
			<!-- Slider input with custom steps -->
			<input
				type="range"
				class="slider"
				min="0"
				max={valMap.length - 1}
				step="1"
				bind:value={slider_index}
				on:change={onSliderChangeFunction}
			/>

			<!-- Labels for the slider steps -->
			{#each valMap as val, idx}
				{#if idx % 10 == 0 || idx == valMap.length - 1}
					<div class="slider-label" style="left: {(idx / (valMap.length - 1)) * 100}%">
						{val}
					</div>
				{/if}
			{/each}
		</div>
		<div class="grid grid-cols-1 place-items-center">
			Value: {valMap[slider_index]} || Band: {slider_index}
		</div>
	</div>
{/if}

<style>
	/* Slider styling */
	.slider-container {
		position: relative;
		height: 40px;
	}

	.slider {
		width: 100%;
		background: transparent;
		position: relative;
		height: 20px;
	}

	.slider::-webkit-slider-thumb {
		-webkit-appearance: none;
		background: #4caf50;
		width: 20px;
		height: 20px;
		border-radius: 50%;
		cursor: pointer;
	}

	.slider-label {
		position: absolute;
		top: -20px;
		transform: translateX(-50%);
	}
</style>
