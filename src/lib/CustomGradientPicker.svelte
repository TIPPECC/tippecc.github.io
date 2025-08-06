<script lang="ts">
	import {
		prec_div,
		chem_div,
		cryo_div,
		misc_div,
		misc_div_custom,
		slev_div,
		temp_div,
		wind_div,
		prec_seq,
		chem_seq,
		cryo_seq,
		misc_seq,
		slev_seq,
		temp_seq,
		wind_seq,
		gray_seq
	} from './color_gradients';
	import { createEventDispatcher } from 'svelte';
	import { onMount } from 'svelte';

	let color_schemes = {
		prec_div: { scheme: prec_div, orientation: 'div', name: 'Precipitation' },
		chem_div: { scheme: chem_div, orientation: 'div', name: 'Chemical' },
		cryo_div: { scheme: cryo_div, orientation: 'div', name: 'Cryosphere' },
		misc_div: { scheme: misc_div, orientation: 'div', name: 'Other variables' },
		misc_div_custom: { scheme: misc_div_custom, orientation: 'div', name: 'Other variables cust.' },
		slev_div: { scheme: slev_div, orientation: 'div', name: 'Sea level' },
		temp_div: { scheme: temp_div, orientation: 'div', name: 'Temperature' },
		wind_div: { scheme: wind_div, orientation: 'div', name: 'Wind' },
		prec_seq: { scheme: prec_seq, orientation: 'seq', name: 'Precipitation' },
		chem_seq: { scheme: chem_seq, orientation: 'seq', name: 'Chemical' },
		cryo_seq: { scheme: cryo_seq, orientation: 'seq', name: 'Cryosphere' },
		misc_seq: { scheme: misc_seq, orientation: 'seq', name: 'Other variables' },
		slev_seq: { scheme: slev_seq, orientation: 'seq', name: 'Sea level' },
		temp_seq: { scheme: temp_seq, orientation: 'seq', name: 'Temperature' },
		wind_seq: { scheme: wind_seq, orientation: 'seq', name: 'Wind' },
		gray_seq: { scheme: gray_seq, orientation: 'seq', name: 'Grayscale' }
	};

	const dispatch = createEventDispatcher();

	export let init_color_scheme = '';
	export let frame_id = '';
	let color_scheme = misc_seq; // scheme
	let color_scheme_key: string; // key for Select element
	let crect_w = 40; // length of a color bar rect when toggle_gradient false

	let mini_mode: boolean = true; // toggle for when not enough place to display all numbers

	let object_order = ['tools', 'colors']; // order of tools and colors elements
	let colorbar_order = ['colors', 'numbers']; // order of colors and numbers elements
	export let object_order_flip: boolean = false;
	export let colorbar_order_flip: boolean = false;

	export let num_digits: number = 1; // digits to round color bar numbers to
	export let toggle_gradient: boolean = false; // gradient mode

	export let showScaleWarning: boolean = false;

	let steps = 21;
	let input_steps = 21;

	export let cmin = -100; // value steps minimum
	export let cmax = 100; // value steps maximum
	export let cmin_real = -100; // real data minimum
	export let cmax_real = 100; // real data maximum
	let custom_min = 0.0;
	let custom_max = 0.0;
	export let show_in_bounds = true;
	export let horizontal = true;

	
	let value_steps: any[] = [];
	export let color_steps: any[] = [];
	
	const DATA_MODES = ['divergent', 'sequential', 'divergent_individual', 'categorical'];
	export let data_mode: string = DATA_MODES[0];
	
	export let forcedGrayScaleMode: boolean = false;
	// console.log(`Init Gradientpicker with cmin_real: ${cmin_real} data_mode: ${data_mode}`);

	// const VALUE_MODES = ['categorized', 'direct']
	// export let value_mode: string = VALUE_MODES[0];

	// called once on init, to display default colors and values
	if (init_color_scheme != '') {
		// updates colors and values on finish
		set_color_scheme_via_str(init_color_scheme);
	} else {
		update_color_and_value_steps();
	}

	if (object_order_flip) {
		object_order.reverse();
	}

	if (colorbar_order_flip) {
		colorbar_order.reverse();
	}

	onMount(() => {
		window.addEventListener('resize', handle_bar_resize);
		handle_bar_resize(); // initial call

		// destroy handling
		return () => {
			window.removeEventListener('resize', handle_bar_resize);
		};
	});

	export const handle_bar_resize = () => {
		// calculating width of color segments
		const div = document.getElementById(frame_id);

		if (div) {
			var divWidth = Math.max(0, div.offsetWidth - 38);
			crect_w = Math.floor(divWidth / steps); // example: half the width

			// if (divWidth <= 840.0) {
			// 	mini_mode = true;
			// } else {
			// 	mini_mode = false;
			// }
		}
	};

	// Converts hex string color into an [r,g,b] array color
	var h2r = function (hex) {
		var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
		return result
			? [parseInt(result[1], 16), parseInt(result[2], 16), parseInt(result[3], 16)]
			: null;
	};

	// Converts an [r,g,b] array color into a hex string color
	var r2h = function (rgb) {
		return '#' + ((1 << 24) + (rgb[0] << 16) + (rgb[1] << 8) + rgb[2]).toString(16).slice(1);
	};

	/**
	 * Sets cmin, cmax and updates color- and value-stops. Used from
	 * outside of the component.
	 * @param min
	 * @param max
	 */
	export function set_bounds(min: number = cmin, max: number = cmax) {
		var trigger_update: boolean = false;
		if (min != cmin && max != cmax) {
			trigger_update = true;
		}

		cmin = min;
		cmax = max;

		if (trigger_update) {
			update_color_and_value_steps();
		}
	}

	/**
	 * Sets cmin_real, cmax_real and updates color- and value-stops. Used from
	 * outside of the component.
	 * @param min
	 * @param max
	 */
	export function set_bounds_real(min: number, max: number, trigger_update: boolean = false) {
		cmin_real = min;
		cmax_real = max;

		var abs_max = Math.max(Math.abs(cmin_real), Math.abs(cmax_real));
		if (data_mode == 'sequential') {
			cmin = 0.0;
		} else {
			cmin = -abs_max;
		}
		cmax = abs_max;

		// console.log(`Set bounds real cmin: ${cmin} cmax: ${cmax} cmin_real: ${cmin_real} cmax_real: ${cmax_real}`);

		if (trigger_update) {
			update_color_and_value_steps();
		}
	}

	function set_custom_max(e: Event) {
		if (!e.target) {
			return;
		}

		const target = e.target as HTMLInputElement;
		var helper = Math.abs(parseFloat(target.value));

		if (isNaN(helper)) {
			custom_max = 0.0;
			update_color_and_value_steps();
			return;
		}

		if (Math.abs(helper) >= 0.01) {
			custom_max = Math.abs(helper);
			update_color_and_value_steps();
			return;
		} else {
			custom_max = 0.0;
			update_color_and_value_steps();
			return;
		}
	}

	function set_custom_min(e: Event) {
		if (!e.target) {
			return;
		}

		const target = e.target as HTMLInputElement;
		var helper = parseFloat(target.value);

		if (isNaN(helper)) {
			custom_min = 0.0;
			update_color_and_value_steps();
			return;
		}

		if (-1 * Math.abs(helper) <= -0.01) {
			custom_min = -1 * Math.abs(helper);
			update_color_and_value_steps();
			return;
		} else {
			custom_min = 0.0;
			update_color_and_value_steps();
			return;
		}
	}

	/**
	 * Sets the currently selected color_scheme via event. Error if not found.
	 * @param e ... the selected color_scheme as an event from Select element.
	 */
	function set_color_scheme(e: Event) {
		if (!e.target) {
			return;
		}

		const target = e.target as HTMLSelectElement;

		var chosen_scheme = target.value;

		for (const [key, value] of Object.entries(color_schemes)) {
			if (chosen_scheme == key) {
				color_scheme = value.scheme;
				color_scheme_key = key;
				update_color_and_value_steps();
				return;
			}
		}

		throw Error('Color scheme not imported or misspelled!');
	}

	/**
	 * Sets the currently selected color_scheme via string. Error if not found.
	 * @param sel ... the selected color_scheme as a string (key of the scheme)
	 */
	function set_color_scheme_via_str(sel: string) {
		for (const [key, value] of Object.entries(color_schemes)) {
			if (sel == key) {
				color_scheme = value.scheme;
				color_scheme_key = key;
				update_color_and_value_steps();
				return;
			}
		}

		throw Error('Color scheme not imported or misspelled!');
	}

	/**
	 * Returns a list of color-stops (value-stops with according colors).
	 * The format depends on the chosen data_mode.
	 * @param format ... either 'rgb' for RGB-format, or anything else for HEX-format
	 */
	export function get_color_boundaries(format: string) {
		if (data_mode == 'divergent') {
			return get_color_boundaries_div(format);
		} else {
			// NOTE: correct this later when needed
			return get_color_boundaries_div(format);
		}
	}

	/**
	 * Returns color stops with foregoing fix values, in the format:
	 * [[value1], [color1], [value2], [color2], ..., [value_n], [color_n]]
	 */
	function get_color_boundaries_seq(format: string) {
		const stops = new Array(steps * 2);

		// TODO: format is wrong here
		if (format == 'rbg') {
			for (let i = 0; i < steps; i++) {
				stops[i * 2] = value_steps[i];
				stops[i * 2 + 1] = color_steps[i];
			}
		} /** hex */ else {
			for (let i = 0; i < steps; i++) {
				stops[i * 2] = value_steps[i];
				stops[i * 2 + 1] = color_steps[i];
			}
		}

		return stops;
	}

	/**
	 * Returns color stops with foregoing value ranges, in the format:
	 * [[value1, value2], [color1], [value2, value3], [color2], ..., [value_n-1, value_n], [color_n]]
	 */
	function get_color_boundaries_div(format: string) {
		const stops = new Array(steps * 2);
		// console.log("RETURNING COLBOUNDS DIV format: ", format, " ", (format == 'rgb'));

		if (format == 'rbg') {
			// console.log("RGB FORMAT")
			for (let i = 0; i < steps; i++) {
				stops[i * 2] = [value_steps[i], value_steps[i + 1]];
				stops[i * 2 + 1] = h2r(color_steps[i]);
			}
		} /** hex */ else {
			// console.log("HEX FORMAT:", format, " ", (format == 'rgb'));
			for (let i = 0; i < steps; i++) {
				stops[i * 2] = [value_steps[i], value_steps[i + 1]];
				stops[i * 2 + 1] = color_steps[i];
			}
		}

		return stops;
	}

	/**
	 * Sets the number of steps used for color- and value-stops.
	 * Clamps all values between 2 and 21.
	 * In divergent mode, it rounds to the next odd number (minimum 3).
	 * @param e	... event from UI number input (comes as string value)
	 */
	function change_steps(e: Event) {
		if (!e.target) {
			return;
		}
		const target = e.target as HTMLInputElement;

		var n = parseInt(target.value);

		if (data_mode == 'divergent' || data_mode == 'divergent_individual') {
			var con_steps = steps >= n ? -1 : 1;
			var con_n = n % 2 == 0 ? 1 : 0;

			// round to next odd number (in appropriate direction)
			steps = n + con_n * con_steps;

			// divergent lower bounds check
			if (steps < 3) {
				steps = 3;
			}
		} else {
			steps = n;
		}

		// clamp
		if (steps < 2) {
			steps = 2;
		} else if (steps > 41) {
			steps = 41;
		}

		input_steps = steps;

		update_color_and_value_steps();
		handle_bar_resize();
	}

	/**
	 * Updates color_steps and value_steps when needed.
	 * Dispatches 'color_stops_changed' event.
	 */
	export function update_color_and_value_steps(signalBack: boolean = true) {
		if (data_mode == 'divergent') {
			update_color_steps_div();
			update_value_steps_div();

			// console.log("DIVERGENT:");
			// console.log("Color Steps:\n", color_steps);
			// console.log("Value Steps:\n", value_steps);
		} else if (data_mode == 'sequential') {
			// not functional rn
			update_color_steps_seq();
			update_value_steps_seq();
			// console.log("SEQUENTIAL:");
			// console.log("Color Steps:\n", color_steps);
			// console.log("Value Steps:\n", value_steps);
		} else if (data_mode == 'divergent_individual') {
			update_color_steps_indiv();
			update_value_steps_indiv();
		}

		if (signalBack) dispatch('color_stops_changed', {});
	}

	/**
	 * Update function for color_steps in data_mode == 'sequential'.
	 * Linear distributed selection based on #steps.
	 */
	function update_color_steps_seq() {
		color_steps = [];
		var scheme_len = color_scheme.length;

		for (var i = 0; i < steps; i++) {
			var color_index = Math.round(i * (scheme_len / steps));
			color_steps = [...color_steps, color_scheme[color_index]];
		}
	}

	/**
	 * Update function for value_steps in data_mode == 'sequential'.
	 * Linear sequence based on #steps.
	 */
	function update_value_steps_seq() {
		value_steps = [];

		value_steps = [...value_steps, 0.0];
		for (let i = 1; i < steps; i++) {
			value_steps = [...value_steps, 0.0 + i * ((cmax_real - 0.0) / steps)];
		}

		value_steps = [...value_steps, cmax_real];
	}

	/**
	 * Update function for color_steps in data_mode == 'divergent'.
	 * Picks #steps colors from the chosen color-scheme.
	 * 	- always contains scheme_colors[first], -[middle] and -[last] color.
	 * 	- minimum #steps is 3
	 */
	function update_color_steps_div() {
		color_steps = [];
		var scheme_len = color_scheme.length;
		var middle = Math.ceil(scheme_len / 2);
		var step_half = Math.floor(steps / 2);

		color_steps = [...color_steps, color_scheme[0]];
		for (let i = 1; i < step_half; i += 1) {
			var cur_index = Math.round((scheme_len / (steps - 1)) * i);
			color_steps = [...color_steps, color_scheme[cur_index]];
		}
		color_steps = [...color_steps, color_scheme[middle]];
		for (let i = 1; i < step_half; i += 1) {
			var cur_index = Math.round((scheme_len / (steps - 1)) * i) + middle;
			color_steps = [...color_steps, color_scheme[cur_index]];
		}
		color_steps = [...color_steps, color_scheme[color_scheme.length - 1]];
	}

	/**
	 * Update function for value_steps in data_mode == 'divergent'.
	 * Evenly distributed between the abs_max in -/+ direction.
	 */
	function update_value_steps_div() {
		if (cmin > cmax) return;

		var lower_l = 0.0;
		var upper_l = 0.0;

		if (custom_min <= -0.01) {
			lower_l = custom_min;
		} else {
			lower_l = cmin;
		}

		if (custom_max >= 0.01) {
			upper_l = custom_max;
		} else {
			upper_l = cmax;
		}

		value_steps = [];

		var step_half = Math.floor(steps / 2);
		value_steps = [...value_steps, lower_l];
		for (let i = 1; i < step_half; i++) {
			value_steps = [...value_steps, lower_l + i * (Math.abs(lower_l) / step_half)];
		}
		value_steps = [...value_steps, 0.0];
		for (let j = 1; j < step_half + 1; j++) {
			value_steps = [...value_steps, j * (Math.abs(upper_l) / (step_half + 1))];
		}
		value_steps = [...value_steps, upper_l];
	}

	export function apply_gray_rescale(update: boolean = true, value: boolean) {
		if (value) {
			data_mode = 'sequential';
			color_scheme = gray_seq;
			color_scheme_key = 'gray_seq';
			if (update) update_color_and_value_steps();
			forcedGrayScaleMode = value;
		} else {
			data_mode = 'divergent';
			color_scheme = prec_div;
			color_scheme_key = 'prec_div';
			if (update) update_color_and_value_steps();
			forcedGrayScaleMode = value;
		}
	}

	/**
	 * Update function for value_steps in data_mode == 'divergent'.
	 * Evenly distributed between the abs_max in -/+ direction.
	 */
	//  function update_value_steps_div() {
	// 	var abs_max = Math.max(Math.abs(cmin), Math.abs(cmax));
	// 	value_steps = [];

	// 	value_steps = [...value_steps, -abs_max];
	// 	for (let i = 1; i < steps; i++) {
	// 		value_steps = [...value_steps, -abs_max + i * ((abs_max * 2) / steps)];
	// 	}
	// 	value_steps = [...value_steps, abs_max];
	// }

	function update_color_steps_indiv() {
		update_color_steps_div();
	}

	export function get_forcedGrayScaleMode() {
		return forcedGrayScaleMode;
	}

	/**
	 * Generates a custom root based exponential sequence between start and end.
	 * @param start
	 * @param end
	 */
	function generate_root_expo_values_stops(start = cmin, end = 500) {
		var step_half = Math.floor(steps / 2);

		var final_values = [];

		for (var i = 0; i < step_half; i++) {
			final_values.push(Math.pow((i + 1) / step_half, 5.0 / 3.0) * end);
		}

		return final_values;
	}

	/**
	 * Generates a strict linear sequence between start and end.
	 * @param start
	 * @param end
	 */
	function generate_linear_value_stops(start = cmin, end = 0) {
		var step_half = Math.floor(steps / 2);

		var final_values = [];

		for (var i = 0; i < step_half; i++) {
			final_values.push(cmin + i * (Math.abs(cmin) / step_half));
		}

		return final_values;
	}

	/**
	 * Generates a custom exponential sequence between start and end.
	 * @param start
	 * @param end
	 */
	function generate_exponential_value_stops(start = 10, end = 500) {
		var helper = [];
		var step_half = Math.floor(steps / 2);

		for (var c = 0; c < step_half; c++) {
			helper.push(10 + c * 10);
		}

		var final_values = [];

		for (var i = 0; i < helper.length; i++) {
			var v = helper[i];
			var exponent_value = (Math.pow(1.1, Math.pow(v / step_half, 1.3)) - 1.0) * 100.0;
			final_values.push(exponent_value);
		}

		return final_values;
	}

	/**
	 * Update function for value_steps in data_mode == 'divergent_individual'.
	 * Hardcoded linear left side, and exponential for right side.
	 */
	function update_value_steps_indiv() {
		if (cmin >= 0) {
			throw new Error('cmin cant be >= 0!');
		}

		var helper = [];
		helper = helper.concat(generate_linear_value_stops(), [0], generate_exponential_value_stops());
		// helper = helper.concat(generate_linear_value_stops(), [0], generate_root_expo_values_stops());

		value_steps = helper;
		return;

		// NOTE - use this later with different config
		// straight forward approach for individual divergent
		// var step_half = Math.floor(steps / 2);

		// value_steps = [];

		// for (var i = 0; i < step_half; i++) {
		// 	value_steps = [...value_steps, cmin + i * (Math.abs(cmin) / step_half)];
		// }

		// for (var i = 0; i < step_half; i++) {
		// 	value_steps = [...value_steps, 0.0 + i * (Math.abs(cmax) / step_half)];
		// }

		// value_steps = [...value_steps, cmax];
	}
</script>

<div id={frame_id} class="px-4 mt-2 {horizontal ? 'w-full' : 'w-[260px]'}">
	<!--Buttons/Inputs-->
	<div class="grid grid-cols-1 place-items-center variant-outline-tertiary  p-1 {horizontal ? 'grid-cols-1 w-full' : 'w-full'}">
		{#each object_order as obj_element}
			{#if obj_element == 'tools'}
				<div class={horizontal ? 'flex w-full place-items-center ' : 'pt-3 flex'}  >

					<div
						class="{horizontal
							? 'flex flex-wrap w-full text-xs font-bold place-items-center gap-x-2 justify-evenly'
							: ''} {object_order_flip && colorbar_order_flip ? 'mt-[2px]' : ''}"
					>
					<!--Verticality-->
						<div class="max-w-[120px] flex-1 {horizontal ? '' : 'mb-1'}">
							{#if horizontal}
								<button
									class="variant-filled-tertiary hover:bg-tertiary-600 p-1 w-8 h-[28px]"
									on:click={() => {
										horizontal = !horizontal;
									}}
									title="Switch to horizontal legend layout"
									><span class="flex"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <line x1="8" y1="6" x2="21" y2="6"></line>
    <line x1="8" y1="12" x2="21" y2="12"></line>
    <line x1="8" y1="18" x2="21" y2="18"></line>
    <line x1="3" y1="6" x2="3" y2="6"></line>
    <line x1="3" y1="12" x2="3" y2="12"></line>
    <line x1="3" y1="18" x2="3" y2="18"></line>
</svg></span>
								</button>
							{:else}
								<button
									class="variant-filled-tertiary hover:bg-tertiary-600 p-1 w-8"
									on:click={() => {
										horizontal = !horizontal;
									}}
									title="Switch to vertical legend layout"
									><span class="flex"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <rect x="3" y="3" width="7" height="7"></rect>
    <rect x="14" y="3" width="7" height="7"></rect>
    <rect x="3" y="14" width="7" height="7"></rect>
    <rect x="14" y="14" width="7" height="7"></rect>
</svg></span>
								</button>
							{/if}
						</div>
						<!--Bounds-->
						<div class="max-w-[120px] flex-1">
							{#if show_in_bounds}
								<button
									class="variant-filled-tertiary hover:bg-tertiary-600 p-1 w-28 {horizontal
										? 'h-[28px]'
										: 'mb-1'}"
									on:click={() => {
										show_in_bounds = !show_in_bounds;
									}}
									title="Show all color stops"
									>Show all
								</button>
							{:else}
								<button
									class="variant-filled-tertiary hover:bg-tertiary-600 p-1 w-28 {horizontal
										? 'h-[28px]'
										: 'mb-1'}"
									on:click={() => {
										show_in_bounds = !show_in_bounds;
									}}
									title="Show only color stops within bounds"
									>Show bounds
								</button>
							{/if}
						</div>



						<!--Custom Min-->
						<div class="flex {horizontal ? '' : 'mb-1'}">
							<nobr>
								<label
									for="custom_bounds_input"
									class="flex  p-1"
									title="Set custom maximum bound">Custom Min:</label
								>
							</nobr>
							<input
								id="custom_bounds_input"
								class="flex-1 text-black ml-1 max-w-[96px] pl-1"
								on:change={set_custom_min}
							/>
						</div>

						<!--Custom Max-->
						<div class="flex {horizontal ? '' : 'mb-1'}">
							<nobr>
								<label
									for="custom_bounds_input"
									class="flex  p-1"
									title="Set custom maximum bound">Custom Max:</label
								>
							</nobr>
							<input
								id="custom_bounds_input"
								class="flex-1 text-black ml-1 max-w-[96px] pl-1"
								on:change={set_custom_max}
							/>
						</div>

						<!--Steps-->
						<div class="flex {horizontal ? '' : 'mb-1'}">
							<nobr>
								<div class="h-full flex-center  p-1">Steps:</div>
							</nobr>
							<input
								on:change={change_steps}
								bind:value={input_steps}
								type="number"
								id={frame_id + '_steps_input'}
								class="flex-1 text-black ml-1 max-w-[40px] pl-1 pr-0 text-xs font-bold"
								max="21"
								min="0"
								title="Number of color stops"
							/>
						</div>

						<!--Color Scheme-->
						<div class={horizontal ? 'flex' : ''}>
							<nobr>
								<div
									class="flex  p-1 h-full flex-center"
									title="Select color scheme"
								>
									Color Scheme:
								</div>
							</nobr>
							<select
								on:change={set_color_scheme}
								bind:value={color_scheme_key}
								id={frame_id + 'color_scheme_select'}
								class="flex-1 text-black py-0 pr-7 text-xs font-bold {horizontal
									? 'px-2 ml-1'
									: 'w-[176px] h-[32px] mt-1'}"
							>
								{#if data_mode == 'divergent' || data_mode == 'divergent_individual'}
									{#each Object.entries(color_schemes).filter(([key, value]) => value['orientation'] === 'div') as [key, value]}
										<option value={key}>{value['name']}</option>
									{/each}
									<!-- <option value="prec_div">Precipitation</option>
									<option value="chem_div">Chemical</option>
									<option value="cryo_div">Cryosphere</option>
									<option value="misc_div">Other variables</option>
									<option value="misc_div_custom">Other variables (cust.)</option>
									<option value="slev_div">Sea level</option>
									<option value="temp_div">Temperature</option>
									<option value="wind_div">Wind</option> -->
								{:else if data_mode == 'sequential'}
									{#each Object.entries(color_schemes).filter(([key, value]) => value['orientation'] === 'seq') as [key, value]}
										<option value={key}>{value['name']}</option>
									{/each}
									<!-- <option value="misc_seq">Other variables</option> -->
								{/if}
							</select>
						</div>

						<div class="flex {horizontal ? '' : 'mb-1'}">
							<button
								class="{forcedGrayScaleMode
									? 'bg-success-700'
									: 'variant-filled-tertiary'} hover:bg-tertiary-600 p-1 w-20 {horizontal
									? 'h-[28px]'
									: 'mb-1'} {!forcedGrayScaleMode && showScaleWarning ? '!bg-red-400' : ''}"
								on:click={() => apply_gray_rescale(true, !forcedGrayScaleMode)}
								title="Rescale colors to one-dimensional gray-scale. (Use when the value range of data points is very small or just one sided (e.g. only positives)."
								>Rescale
							</button>
						</div>
					</div>
				</div>

				<!--Color Gradient-->
			{:else if obj_element == 'colors'}
				<div
					class="grid grid-cols-1 	{horizontal ? 'grid-cols-1 pt-2' : 'grid-cols-[40px_40px] p-1'}
						{object_order_flip ? '' : 'mt-1'}
						place-items-center"
				>
					{#each colorbar_order as bar_element}
						<!--Color Rectangles-->
						{#if bar_element == 'colors'}
							<div>
								{#if toggle_gradient}
									<div
										class="{horizontal ? 'flex items-center' : ''} {colorbar_order_flip ? '' : ''}"
									>
										{#key color_steps}
											<svg width="{crect_w * color_steps.length}px" height="20px">
												<linearGradient id="{frame_id}_grad1" x1="0%" x2="100%" y1="0%" y2="0%">
													{#each color_steps as color, i}
														<stop
															offset="{((i + 1) * 100.0) / color_steps.length}%"
															stop-color={r2h(color)}
														/>

														{cmin}:{value_steps[i]}:{cmin > value_steps[i]}:{typeof value_steps[
															i
														]}:{typeof cmin}
														<svg width="{crect_w}px" height="20">
															{#if show_in_bounds && (cmin_real >= value_steps[i] || cmax_real <= value_steps[i])}
																<rect
																	width="{crect_w}px"
																	height="20"
																	fill={'#444444'}
																	x="0"
																	y="0"
																/>
															{:else}
																<rect
																	width="{crect_w}px"
																	height="20"
																	fill={r2h(color)}
																	x="0"
																	y="0"
																/>
															{/if}
														</svg>
													{/each}
												</linearGradient>
												<rect
													width="{crect_w * color_steps.length}px"
													height="20px"
													fill="url(#{frame_id}_grad1)"
												/>
											</svg>
										{/key}
									</div>
								{:else}
									<div
										class="{horizontal ? 'flex items-center' : ''} {colorbar_order_flip ? '' : ''}"
									>
										{#key color_steps}
											{#each color_steps as color, i}
												<svg width="{crect_w}px" height="20">
													{#if i == color_steps.length - 1}
														{#if show_in_bounds && cmax_real < value_steps[i]}
															<rect width="{crect_w}px" height="20" fill={'#444444'} x="0" y="0" />
														{:else}
															<rect width="{crect_w}px" height="20" fill={r2h(color)} x="0" y="0" />
														{/if}
													{:else if show_in_bounds && (cmin_real > value_steps[i + 1] || cmax_real < value_steps[i])}
														<rect width="{crect_w}px" height="20" fill={'#444444'} x="0" y="0" />
													{:else}
														<rect width="{crect_w}px" height="20" fill={r2h(color)} x="0" y="0" />
													{/if}
												</svg>
											{/each}
										{/key}
									</div>
								{/if}
							</div>

							<!--Values-->
						{:else if bar_element == 'numbers'}
							<div class="text-[13px] font-bold">
								<div class={horizontal ? 'flex items-center' : ''}>
									{#key color_steps}
										{#each value_steps as value, i}
											{#if horizontal}
												{#if mini_mode}
													{#if i == 0}
														<div style="width: {crect_w}px;">
															{value.toFixed(num_digits)}
														</div>
													{:else if Math.floor(value_steps.length / 2) - 2 == i || i == Math.floor(value_steps.length / 2)}
														{#if data_mode != 'sequential'}
															<div
																style="width: {crect_w}px; padding-left: {Math.floor(crect_w / 2.0) -
																	8}px;"
															>
																{value.toFixed(num_digits)}
															</div>
														{:else}
															<div style="width: {crect_w}px;" />
														{/if}
													{:else if i == Math.floor(value_steps.length / 2) - 1}
														{#if data_mode != 'sequential'}
															<div
																style="width: {crect_w}px; padding-left: {Math.floor(crect_w / 2.0) -
																	8}px;"
															>
																&nbsp;&nbsp;|
															</div>
														{:else}
															<div style="width: {crect_w}px;" />
														{/if}
													{:else if i == value_steps.length - 1}
														<div style="width: {crect_w}px;">
															{value.toFixed(num_digits)}
														</div>
													{:else}
														<div style="width: {crect_w}px;" />
													{/if}
												{:else}
													<div
														class="flex items-center justify-center h-[20px]"
														style="width: {crect_w}px;"
													>
														{value.toFixed(num_digits)}
													</div>
												{/if}
											{:else}
												<div class="flex items-center justify-center w-[{crect_w}px] h-[20px]">
													{value.toFixed(num_digits)}
												</div>
											{/if}
										{/each}
									{/key}
								</div>
							</div>
						{/if}
					{/each}
				</div>
			{/if}
		{/each}
	</div>
</div>
