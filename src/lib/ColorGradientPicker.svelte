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
	// export let CENTER_VALUE = 0;
	export let show_in_bounds = true;
	export let horizontal = true;
	let value_steps: any[] = [];
	export let color_steps: any[] = [];

	const DATA_MODES = ['divergent', 'sequential', 'categorical'];
	export let data_mode: string = DATA_MODES[0];

	// const VALUE_MODES = ['categorized', 'direct']
	// export let value_mode: string = VALUE_MODES[0];

	// called once on init, to display default colors and values
	update_color_and_value_steps();

	/**
	 * Returns a hex-string from an rgba input parameter c.
	 * @param c color value of the format: [r, g, b, a]
	 */
	function rgbToHex(c: number[]) {
		return '#' + ((1 << 24) | (c[0] << 16) | (c[1] << 8) | c[2]).toString(16).slice(1);
	}

	/**
	 * Sets cmin, cmax and updates color- and value-stops. Used from
	 * outside of the component.
	 * @param min
	 * @param max
	 */
	export function set_bounds(min: number = cmin, max: number = cmax) {
		cmin = min;
		cmax = max;
		update_color_and_value_steps();
	}

	/**
	 * Tries to set cmin, cmax and update color- and value-stops. Used from
	 * inside of the component (input field).
	 * @param e
	 */
	function set_custom_bounds(e: Event) {
		if (!e.target) {
			return;
		}

		try {
			const target = e.target as HTMLInputElement;
			var custom_abs_max = Math.abs(parseFloat(target.value));

			if (isNaN(custom_abs_max)) {
				throw new Error('NaN value entered as custom abs max.');
			}

			// TODO:
			//	- change so that you can reset to the original cmin/cmax
			//	which was (most likely) read from the file metadata
			//	- right now when a custom max is set, this information is lost
			//	and it can not be reverted without reloading the file
			cmin = -custom_abs_max;
			cmax = custom_abs_max;

			// console.log('SETTING BOUNDS: ', cmin, ' ', cmax);

			update_color_and_value_steps();
		} catch (error) {
			console.log(error);
		}
	}

	/**
	 * Sets the currently selected color_scheme.
	 * @param e
	 */
	function set_color_scheme(e: Event) {
		if (!e.target) {
			return;
		}
		const target = e.target as HTMLSelectElement;

		var chosen_scheme = target.value;

		if (chosen_scheme == 'prec_div') {
			color_scheme = prec_div;
		} else if (chosen_scheme == 'chem_div') {
			color_scheme = chem_div;
		} else if (chosen_scheme == 'cryo_div') {
			color_scheme = cryo_div;
		} else if (chosen_scheme == 'misc_div') {
			color_scheme = misc_div;
		} else if (chosen_scheme == 'slev_div') {
			color_scheme = slev_div;
		} else if (chosen_scheme == 'temp_div') {
			color_scheme = temp_div;
		} else if (chosen_scheme == 'wind_div') {
			color_scheme = wind_div;
		} else {
			color_scheme = [];
			throw Error('Color scheme not imported or misspelled!');
		}

		// console.log('Set color scheme to: ', chosen_scheme, color_scheme);
		update_color_and_value_steps();
	}

	/**
	 * Returns a list of color-stops (value-stops with according colors).
	 * The format depends on the chosen data_mode.
	 */
	export function get_color_stops() {
		if (data_mode == 'divergent') {
			return get_color_stops_divergent();
		} else {
			return get_color_stops_normal();
		}
	}

	/**
	 * Returns color stops with foregoing fix values, in the format:
	 * [[value1], [color1], [value2], [color2], ..., [value_n], [color_n]]
	 */
	function get_color_stops_normal() {
		const stops = new Array(steps * 2);

		for (let i = 0; i < steps; i++) {
			stops[i * 2] = value_steps[i];
			stops[i * 2 + 1] = color_steps[i];
		}

		// console.log("STOPS: ", stops);

		return stops;
	}

	/**
	 * Returns color stops with foregoing value ranges, in the format:
	 * [[value1, value2], [color1], [value2, value3], [color2], ..., [value_n-1, value_n], [color_n]]
	 */
	function get_color_stops_divergent() {
		const stops = new Array(steps * 2);

		for (let i = 0; i < steps; i++) {
			stops[i * 2] = [value_steps[i], value_steps[i + 1]];
			stops[i * 2 + 1] = color_steps[i];
		}

		return stops;
	}

	/**
	 * Sets the number of steps used for color- and value-stops.
	 * Clamps all values between 2 and 21.
	 * In divergent mode, it rounds to the next odd number.
	 * @param e
	 */
	function change_steps(e: Event) {
		if (!e.target) {
			return;
		}
		const target = e.target as HTMLInputElement;

		var n = parseInt(target.value);

		if (data_mode == 'divergent') {
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
		} else if (steps > 21) {
			steps = 21;
		}

		input_steps = steps;

		update_color_and_value_steps();
	}

	/**
	 * Updates color_steps and value_steps according to the current data_mode.
	 * Also in the end, dispatches the 'color_stops_changed' event.
	 *
	 * Called everytime color_steps or value_steps needs to be recalculated.
	 */
	function update_color_and_value_steps() {
		if (data_mode == 'divergent') {
			set_color_steps_divergent();
			set_value_steps_divergent();
		} else {
			// not functional rn
			set_color_steps_zero_to_end();
			set_value_steps_zero_to_end();
		}

		dispatch('color_stops_changed', {});
	}

	function set_color_steps_zero_to_end() {
		throw Error('Not implemented yet');

		color_steps = [];
		// console.log("setting color stops to n=", n)

		var scheme_len = color_scheme.length;
		var stepwidth = Math.floor(scheme_len / (steps - 1));
		// console.log("scheme_len: ", scheme_len)
		// console.log("stepwidth: ", stepwidth)

		color_steps = [...color_steps, color_scheme[0]];
		for (let i = 1; i < steps - 1; i += 1) {
			// color_steps.push(color_scheme[i]);
			var cur_index = Math.round((scheme_len / (steps - 1)) * i);
			// console.log("i: ", i, " index: ", cur_index)
			color_steps = [...color_steps, color_scheme[cur_index]];
		}

		color_steps = [...color_steps, color_scheme[color_scheme.length - 1]];

		// console.log("stops len: ", color_steps.length)
		// console.log(color_steps);
		// color_steps = color_steps;
	}

	/**
	 * Updates color_steps based on the number of steps chosen.
	 * Picks #steps colors from the chosen color-scheme. This is
	 * a two-part process where #Math.floor(steps/2) colors are
	 * picked between color_scheme[0] - color_scheme[middle] and
	 * color_scheme[end] - color_scheme[middle]. Thus the first-,
	 * last- and center-element of the color_scheme is always present.
	 */
	function set_color_steps_divergent() {
		color_steps = [];
		var scheme_len = color_scheme.length;
		var middle = Math.ceil(scheme_len / 2);
		var step_half = Math.floor(steps / 2);
		// console.log("scheme_len:", scheme_len)
		// console.log("middle:", middle)
		// console.log("step_half:", step_half)

		color_steps = [...color_steps, color_scheme[0]];
		for (let i = 1; i < step_half; i += 1) {
			var cur_index = Math.round((scheme_len / (steps - 1)) * i);
			// console.log("i: ", i, " index: ", cur_index)
			color_steps = [...color_steps, color_scheme[cur_index]];
		}
		color_steps = [...color_steps, color_scheme[middle]];
		for (let i = 1; i < step_half; i += 1) {
			var cur_index = Math.round((scheme_len / (steps - 1)) * i) + middle;
			// console.log("i: ", i, " index: ", cur_index)
			color_steps = [...color_steps, color_scheme[cur_index]];
		}
		color_steps = [...color_steps, color_scheme[color_scheme.length - 1]];

		// console.log(color_steps)
	}

	function set_value_steps_zero_to_end() {
		throw Error('Not implemented yet');
	}

	/**
	 * Updates value_steps based on the number of steps chosen.
	 * Sets a list of evenly values between cmin and cmax, resulting
	 * in #(steps+1) values.
	 */
	function set_value_steps_divergent() {
		var abs_max = Math.max(Math.abs(cmin), Math.abs(cmax));
		value_steps = [];

		value_steps = [...value_steps, -abs_max];
		for (let i = 1; i < steps; i++) {
			value_steps = [...value_steps, -abs_max + i * ((abs_max * 2) / steps)];
		}
		value_steps = [...value_steps, abs_max];
	}
</script>

<div class="p-4 mt-2 {horizontal ? 'w-[480px]' : 'w-[260px]'}">
	<!--Buttons/Inputs-->
	<div class="grid grid-cols-1 place-items-center {horizontal ? 'grid-cols-1 w-full' : 'w-full'}">
		<div class={horizontal ? '' : 'pt-2 flex place-items-center p-1'}>
			<div class={horizontal ? 'md:flex' : ''}>
				<!--Bounds-->
				<div class="flex {horizontal ? 'md:mr-1 max-md:mb-1' : 'mb-1'}">
					{#if show_in_bounds}
						<button
							class="variant-filled-tertiary hover:bg-tertiary-600 p-1 w-28"
							on:click={() => {
								show_in_bounds = !show_in_bounds;
							}}
							title="Show all color stops"
							>Show all
						</button>
					{:else}
						<button
							class="variant-filled-tertiary hover:bg-tertiary-600 p-1 w-28"
							on:click={() => {
								show_in_bounds = !show_in_bounds;
							}}
							title="Show only color stops within bounds"
							>Show bounds
						</button>
					{/if}
				</div>

				<!--Verticality-->
				<div class="flex-1 {horizontal ? 'md:mr-2 max-md:mb-1' : 'mb-1'}">
					{#if horizontal}
						<button
							class="variant-filled-tertiary hover:bg-tertiary-600 p-1 w-28"
							on:click={() => {
								horizontal = !horizontal;
							}}
							title="Switch to horizontal legend layout"
							>Horizontal
						</button>
					{:else}
						<button
							class="variant-filled-tertiary hover:bg-tertiary-600 p-1 w-28"
							on:click={() => {
								horizontal = !horizontal;
							}}
							title="Switch to vertical legend layout"
							>Vertical
						</button>
					{/if}
				</div>

				<!--Custom Max-->
				<div class="flex {horizontal ? 'md:mr-2 max-md:mb-1' : 'mb-1'}">
					<nobr>
						<label
							for="custom_bounds_input"
							class="flex variant-outline-tertiary p-1"
							title="Set custom maximum bound">Custom Max:</label
						>
					</nobr>
					<input
						id="custom_bounds_input"
						class="flex-1 text-black ml-1 max-w-[96px] pl-1"
						on:change={set_custom_bounds}
					/>
				</div>

				<!--Steps-->
				<div class="flex {horizontal ? 'md:mr-2 max-md:mb-1' : 'mb-1'}">
					<nobr>
						<label for="steps_input" class="flex variant-outline-tertiary p-1">Steps:</label>
					</nobr>
					<input
						on:change={change_steps}
						bind:value={input_steps}
						type="number"
						id="steps_input"
						class="flex-1 text-black ml-1 max-w-[40px] pl-1"
						max="21"
						min="0"
						title="Number of color stops"
					/>
				</div>

				<!--Color Scheme-->
				<div class="flex">
					<nobr>
						<label
							for="color_scheme_select"
							class="flex variant-outline-tertiary p-1"
							title="Select color scheme">Color Scheme:</label
						>
					</nobr>
					<select
						on:change={set_color_scheme}
						id="color_scheme_select"
						class="flex-1 text-black ml-1"
					>
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
		</div>

		<!--Color Gradient-->
		<div
			class="grid grid-cols-1 {horizontal
				? 'grid-cols-1'
				: 'grid-cols-[40px_40px] p-1'} place-items-center"
		>
			<!--Color Rectangles-->
			<div>
				<div class={horizontal ? 'flex items-center mt-2' : ''}>
					{#key color_steps}
						{#each color_steps as color, i}
							<!-- {cmin}:{value_steps[i]}:{(cmin > value_steps[i])}:{typeof(value_steps[i])}:{typeof(cmin)} -->
							<svg width="20" height="20">
								{#if show_in_bounds && (cmin > value_steps[i] || cmax < value_steps[i])}
									<rect width="20" height="20" fill={'#444444'} x="0" y="0" />
								{:else}
									<rect width="20" height="20" fill={rgbToHex(color)} x="0" y="0" />
								{/if}
							</svg>
						{/each}
					{/key}
				</div>
			</div>

			<!--Values-->
			<div>
				<div class={horizontal ? 'flex items-center' : ''}>
					{#key color_steps}
						{#each value_steps as value, i}
							{#if horizontal}
								<div class="flex items-center justify-center w-[20px] h-[20px]">
									{#if i == 0}
										<div style={value_steps.length <= 7 ? 'padding-right: 32px' : ''}>
											{value.toFixed(2)}
										</div>
									{:else if i == Math.floor(value_steps.length / 2)}
										<div
											style={value_steps.length <= 7 ? 'padding-top: 16px' : ''}
											class="pr-[20px]"
										>
											0.0
										</div>
									{:else if i == value_steps.length - 1}
										<div style={value_steps.length <= 7 ? 'padding-left: 32px' : ''}>
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
