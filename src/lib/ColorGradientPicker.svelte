<script lang="ts">
	import {
		prec_div,
		chem_div,
		cryo_div,
		misc_div,
		slev_div,
		temp_div,
		wind_div
	} from './color_gradients';
	import { createEventDispatcher } from 'svelte';

	const dispatch = createEventDispatcher();

	let color_scheme = prec_div;
	let steps = 21;
	let input_steps = 21;

	export let cmin = -100;
	export let cmax = 100;
	export let CENTER_VALUE = 0;
	export let show_in_bounds = true;
	export let horizontal = true;
	let value_stops: any[] = [];
	export let color_stops: any[] = [];
	export let odd_middle_mode: boolean = true;

	function hexToRgb(hex) {
		var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
		return result
			? {
					r: parseInt(result[1], 16),
					g: parseInt(result[2], 16),
					b: parseInt(result[3], 16)
			  }
			: null;
	}

	function rgbToHex(c) {
		return '#' + ((1 << 24) | (c[0] << 16) | (c[1] << 8) | c[2]).toString(16).slice(1);
	}

	export function set_bounds(min = cmin, max = cmax) {
		cmin = min;
		cmax = max;
		set_value_stops();
		console.log('SETTING BOUNDS: ', cmin, ' ', cmax);
	}

	function set_color_scheme(e?) {
		if (!e) {
			return;
		}

		var scheme = e.target.value;
		console.log('Type: ', typeof scheme);

		if (scheme == 'prec_div') {
			color_scheme = prec_div;
		} else if (scheme == 'chem_div') {
			color_scheme = chem_div;
		} else if (scheme == 'cryo_div') {
			color_scheme = cryo_div;
		} else if (scheme == 'misc_div') {
			color_scheme = misc_div;
		} else if (scheme == 'slev_div') {
			color_scheme = slev_div;
		} else if (scheme == 'temp_div') {
			color_scheme = temp_div;
		} else if (scheme == 'wind_div') {
			color_scheme = wind_div;
		} else {
			color_scheme = [];
		}

		console.log('Set color scheme to: ', scheme, color_scheme);
		set_color_stops();
	}

	export function get_color_stops() {
		const stops = new Array(steps * 2);
		console.log('value_stops: ', value_stops);
		console.log('color_stops: ', color_stops);

		for (let i = 0; i < steps; i++) {
			stops[i * 2] = value_stops[i];
			stops[i * 2 + 1] = color_stops[i];
		}

		// console.log("STOPS: ", stops);

		return stops;
		// stepwidth per color change
		// const delta = (max - min) / (n - 1);
		// // helper array holding ranges and colors (return value)
		// const stops = new Array(n * 2);

		// // #steps times iterate and fill stops with [range1, color1, ..., rangeN, colorN]
		// for (let i = 0; i < n; i++) {
		// 	stops[i * 2] = min + i * delta;
		// 	stops[i * 2 + 1] = color_stops[i];
		// }

		// return stops;
		// n = Math.round(n);
		// var scheme_len = color_scheme.length;
		// var stepwidth = Math.floor(scheme_len/n);

		// console.log(scheme_len, stepwidth);
	}

	function get_color_stops_linear() {}

	function get_color_stops_from_middle(min, max) {
		var abs_max = Math.max(Math.abs(min), Math.abs(max));

		const stops = new Array(steps * 2);
		for (let i = 0; i < steps; i++) {
			var cur_value = -abs_max + i * Math.round((abs_max * 2) / steps);
			stops[i * 2] = cur_value;
			stops[i * 2 + 1] = color_stops[i];
		}

		// console.log("stops: ", stops);
		return stops;
	}

	function change_steps(e?) {
		var n = parseInt(e.target.value);
		console.log('Changing steps: ', steps);

		if (odd_middle_mode) {
			if (steps >= n) {
				if (n % 2 == 0) {
					steps = n - 1;
				} else {
					steps = n;
				}
			} else if (steps < n) {
				if (n % 2 == 0) {
					steps = n + 1;
				} else {
					steps = n;
				}
			}

			if (steps < 3) {
				steps = 3;
			}
		} else {
			steps = n;
		}

		if (steps < 1) {
			steps = 1;
		} else if (steps > 21) {
			steps = 21;
		}
		console.log(' to: ', steps);
		input_steps = steps;

		set_color_stops();
		set_value_stops();
	}

	set_color_stops();
	get_color_stops_from_middle(-10, 100);

	function set_color_stops() {
		if (odd_middle_mode) {
			set_color_stops_from_middle();
			set_value_stops_from_middle();
		} else {
			set_color_stops_zero_to_end();
			set_value_stops_zero_to_end();
		}

		dispatch('color_stops_changed', {});
	}

	function set_color_stops_zero_to_end() {
		color_stops = [];
		// console.log("setting color stops to n=", n)

		var scheme_len = color_scheme.length;
		var stepwidth = Math.floor(scheme_len / (steps - 1));
		// console.log("scheme_len: ", scheme_len)
		// console.log("stepwidth: ", stepwidth)

		color_stops = [...color_stops, color_scheme[0]];
		for (let i = 1; i < steps - 1; i += 1) {
			// color_stops.push(color_scheme[i]);
			var cur_index = Math.round((scheme_len / (steps - 1)) * i);
			// console.log("i: ", i, " index: ", cur_index)
			color_stops = [...color_stops, color_scheme[cur_index]];
		}

		color_stops = [...color_stops, color_scheme[color_scheme.length - 1]];

		// console.log("stops len: ", color_stops.length)
		// console.log(color_stops);
		// color_stops = color_stops;
	}

	function set_color_stops_from_middle() {
		color_stops = [];
		var scheme_len = color_scheme.length;
		var middle = Math.ceil(scheme_len / 2);
		var step_half = Math.floor(steps / 2);
		// console.log("scheme_len:", scheme_len)
		// console.log("middle:", middle)
		// console.log("step_half:", step_half)

		color_stops = [...color_stops, color_scheme[0]];
		for (let i = 1; i < step_half; i += 1) {
			var cur_index = Math.round((scheme_len / (steps - 1)) * i);
			// console.log("i: ", i, " index: ", cur_index)
			color_stops = [...color_stops, color_scheme[cur_index]];
		}
		color_stops = [...color_stops, color_scheme[middle]];
		for (let i = 1; i < step_half; i += 1) {
			var cur_index = Math.round((scheme_len / (steps - 1)) * i) + middle;
			// console.log("i: ", i, " index: ", cur_index)
			color_stops = [...color_stops, color_scheme[cur_index]];
		}
		color_stops = [...color_stops, color_scheme[color_scheme.length - 1]];

		// console.log(color_stops)
	}

	function set_value_stops() {
		if (odd_middle_mode) {
			set_value_stops_from_middle();
		} else {
			set_value_stops_zero_to_end();
		}
	}

	function set_value_stops_zero_to_end() {}

	function set_value_stops_from_middle() {
		var abs_max = Math.max(Math.abs(cmin), Math.abs(cmax));
		var step_half = Math.floor(steps / 2);

		value_stops = [];

		value_stops = [...value_stops, -abs_max];
		for (let i = 1; i < step_half; i++) {
			var cur_value = (step_half - i) * -Math.round(abs_max / step_half);
			value_stops = [...value_stops, cur_value];
		}
		value_stops = [...value_stops, CENTER_VALUE];
		for (let i = 1; i < step_half; i++) {
			var cur_value = i * Math.round(abs_max / step_half);
			value_stops = [...value_stops, cur_value];
		}
		value_stops = [...value_stops, abs_max];

		console.log('value_stops: ', value_stops);
	}
</script>

<div class="p-4 {horizontal ? 'w-[640px]' : 'w-[380px]'}">
	<div
		class="grid grid-cols-1 {horizontal
			? 'grid-cols-1 w-[640px] place-items-center'
			: 'grid-cols-2 w-[380px]'}"
	>
		<div>
			<div class="flex">
				{#if show_in_bounds}
					<button
						class="variant-outline-tertiary px-1 w-28"
						on:click={() => {
							show_in_bounds = !show_in_bounds;
						}}
						>Show all
					</button>
				{:else}
					<button
						class="variant-outline-tertiary px-1 w-28"
						on:click={() => {
							show_in_bounds = !show_in_bounds;
						}}
						>Show bounds
					</button>
				{/if}

				{#if horizontal}
					<button
						class="variant-outline-tertiary px-1 w-28"
						on:click={() => {
							horizontal = !horizontal;
						}}
						>Horizontal
					</button>
				{:else}
					<button
						class="variant-outline-tertiary px-1 w-28"
						on:click={() => {
							horizontal = !horizontal;
						}}
						>Vertical
					</button>
				{/if}
			</div>
			<div class="flex">
				<input
					on:change={change_steps}
					bind:value={input_steps}
					type="number"
					class="text-black w-10"
					max="21"
					min="0"
				/>
				<select on:change={set_color_scheme} class="text-black">
					<option value="prec_div">Precipitation</option>
					<option value="chem_div">Chemical</option>
					<option value="cryo_div">Cryosphere</option>
					<option value="misc_div">Other variables</option>
					<option value="slev_div">Sea level</option>
					<option value="temp_div">Temperature</option>
					<option value="wind_div">Wind</option>
				</select>
			</div>
		</div>

		<div
			class="grid grid-cols-1 {horizontal
				? 'grid-cols-1'
				: 'grid-cols-[40px_40px]'} place-items-center"
		>
			<div>
				<div class={horizontal ? 'flex items-center mt-2' : ''}>
					{#key color_stops}
						{#each color_stops as color, i}
							<svg width="20" height="20">
								{#if show_in_bounds && (cmin > value_stops[i] || cmax < value_stops[i])}
									<rect width="20" height="20" fill={'#444444'} x="0" y="0" />
								{:else}
									<rect width="20" height="20" fill={rgbToHex(color)} x="0" y="0" />
								{/if}
							</svg>
						{/each}
					{/key}
				</div>
			</div>

			<div>
				<div class={horizontal ? 'flex items-center' : ''}>
					{#key color_stops}
						{#each value_stops as value, i}
							{#if horizontal}
								<div class="flex items-center justify-center w-[20px] h-[20px]">
									{#if i == 0}
										<div style={value_stops.length <= 7 ? 'padding-right: 32px' : ''}>
											{value.toFixed(2)}
										</div>
									{:else if i == Math.floor(value_stops.length / 2)}
										<div style={value_stops.length <= 7 ? 'padding-top: 16px' : ''}>
											{value.toFixed(2)}
										</div>
									{:else if i == value_stops.length - 1}
										<div style={value_stops.length <= 7 ? 'padding-left: 32px' : ''}>
											{value.toFixed(2)}
										</div>
									{/if}
								</div>
							{:else}
								<div class="flex items-center justify-center w-[20px] h-[20px]">
									{value.toFixed(2)}
								</div>
							{/if}
						{/each}
					{/key}
				</div>
			</div>
		</div>
	</div>
</div>
