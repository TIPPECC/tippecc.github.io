<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import { onMount, onDestroy } from 'svelte';

	const dispatch = createEventDispatcher();
	// Define custom slider steps
	export let valMap: any[];
	export let dateMap: any[];
	export let onSliderChangeFunction = onSliderChange;
	// const valMap = [0, 1, 3, 5, 10, 15, 20, 30, 50];

	let visible_value_ids: any[] = [];
	let num_displayed_values: number = 0;

	// This is the default position of the slider
	export let slider_index: number = 0;
	export let slider_value: number = 0;

	// approximated space in px of one value label of the slider
	// higher means less labels across the slider
	export let label_space: number = 80;

	onMount(() => {
		window.addEventListener('resize', handle_resize);
		handle_resize();
	});

	onDestroy(() => {
		window.removeEventListener('resize', handle_resize);
	});

	function get_value_range(upper: number, lower: number, steps: number) {
		// console.log("Building values: ", upper, " ", lower, " ", steps);
		if (steps <= 1) {
			return false;
		}
		const difference = upper - lower;
		const increment = difference / (steps - 1);
		return [
			lower,
			...Array(steps - 2)
				.fill('')
				.map((_, index) => Math.round(lower + increment * (index + 1))),
			upper
		];
	}

	function onSliderChange(e?) {
		// Update the internal slider value based on input change
		slider_index = e.target.value;
		if (valMap) {
			slider_value = valMap[slider_index];
			dispatch('slider_changed', {});
		}
	}

	function handle_resize() {
		if (valMap) {
			var n = valMap.length;
			var slider = document.getElementById('slider-picker-input-slider');
			if (!slider) {
				throw new Error("Element with id 'slider-picker-input-slider' does not exist.");
			}

			if (!label_space || label_space <= 0) {
				var err_msg = 'Invalid label space: ' + label_space.toString();
				throw new Error(err_msg);
			}

			var w = slider.clientWidth;
			var num_helper = Math.floor(w / label_space);

			// if change, need to update visible_value_ids
			if (num_displayed_values != num_helper) {
				num_displayed_values = num_helper;

				// console.log("#Numbers: ", n, " width: ", w, " Calc: ", Math.floor(w/72));
				var helper = get_value_range(n - 1, 0, num_displayed_values);
				if (helper) {
					visible_value_ids = helper;
				}
			}
		}
	}

	// var intervalId = window.setInterval(function(){
	// 	if (slider_index < valMap.length){
	// 		slider_index += 1;
	// 		dispatch('slider_changed', {});
	// 	}
	// }, 5000);
</script>

{#if valMap}
	<div class="md:px-20 max-md:px-4">
		<h4 class="h4 text-center">Layer slider</h4>
		<div class="relative h-[40px] mt-6">
			<!-- Slider input with custom steps -->
			<input
				type="range"
				class="slider relative h-[20px] w-full bg-transparent"
				id="slider-picker-input-slider"
				min="0"
				max={valMap.length - 1}
				step="1"
				bind:value={slider_index}
				on:change={onSliderChangeFunction}
			/>
			<!-- Labels for the slider steps -->
			{#each valMap as val, idx}
				{#if visible_value_ids.includes(idx) || idx == valMap.length - 1}
					<div
						class="top-[-20px] translate-x-[-50%] absolute flex select-none"
						style="left: {(idx / (valMap.length - 1)) * 100}%"
					>
						{val}
					</div>
				{/if}
			{/each}
		</div>
		<div class="grid grid-cols-1 place-items-center">
			{`${new Date(dateMap[+slider_index]).toDateString()} (Layer #${(+slider_index + 1)})`}
		</div>
	</div>
{/if}

<style>
	/* Slider styling */
	.slider::-webkit-slider-thumb {
		cursor: pointer;
	}
</style>
