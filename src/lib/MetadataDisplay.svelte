<script>
	import { onMount } from 'svelte';
	import RecursiveDisplay from '$lib/RecursiveDisplay.svelte';
	import { sizeofFmt, round } from '$lib/toolbox';
	export let data;
	export let in_main_page = true;

	const excludedKeys = ['file'];

	// Die neuen Objekte
	let filteredData = {};
	let excludedData = {};

	onMount(() => {
		if (typeof data === 'object' && !Array.isArray(data) && data !== null) {
			for (const [key, value] of Object.entries(data)) {
				if (excludedKeys.includes(key)) {
					excludedData[key] = value;
				} else {
					filteredData[key] = value;
				}
			}
		} else if (data !== null) {
			filteredData = data;
		}
		console.log(filteredData);
	});

	/**
	 * @param {any} value
	 */
	function format_c_bound(value) {
		if (typeof value == 'object') {
			const start = value[0].split('-')[0];
			const end = value[1].split('-')[0];
			return start + ' - ' + end;
		} else {
			const parts = value.split('-');
			const start = parts[0];
			return start;
		}
	}
</script>

{#if typeof excludedData === 'object' && !Array.isArray(data) && data !== null}
	{#each Object.entries(excludedData) as [key, value]}
		{#if key == 'file'}
			{#if in_main_page}
				<!-- File Information -->
				<div class="bg-box mt-4">
					<h2 class="text-lg font-semibold mb-3 flex items-center gap-2 text-white">
						📁 File Information
					</h2>
					<div class="grid grid-cols-1 md:grid-cols-2 gap-y-2 gap-x-4 text-zinc-200">
						<div>
							<span class="font-bold text-label">Format:</span>
							<span class="font-medium text-zinc-300">{value['file_format']}</span>
						</div>
						<div>
							<span class="font-bold text-label">Size:</span>
							<span class="font-medium text-zinc-300">{sizeofFmt(value['file_size'])}</span>
						</div>
						<div>
							<span class="font-bold text-label">Created:</span>
							<span class="font-medium text-zinc-300">{value['birth_time']}</span>
						</div>
						<div>
							<span class="font-bold text-label">Last Modified:</span>
							<span class="font-medium text-zinc-300">{value['last_modification_time']}</span>
						</div>
					</div>
				</div>

				<!-- Temporal Coverage -->
				<div class="bg-box">
					<h2 class="text-lg font-semibold mb-3 flex items-center gap-2 text-white">
						🕒 Temporal Coverage
					</h2>
					<div class="grid grid-cols-1 md:grid-cols-2 gap-y-2 gap-x-4 text-zinc-200">
						<div>
							<span class="font-bold text-label">Start:</span>
							<span class="font-medium text-zinc-300">{value['time_coverage_start']}</span>
						</div>
						<div>
							<span class="font-bold text-label">End:</span>
							<span class="font-medium text-zinc-300">{value['time_coverage_end']}</span>
						</div>
						{#if value['climatology_bounds']}
							<div>
								<span class="font-bold text-label">Climatology Bounds Start:</span>
								<span class="font-medium text-zinc-300"
									>{format_c_bound(value['climatology_bounds'][0][0])}</span
								>
							</div>
							<div>
								<span class="font-bold text-label">Climatology Bounds End:</span>
								<span class="font-medium text-zinc-300"
									>{format_c_bound(value['climatology_bounds'][0][1])}</span
								>
							</div>
						{/if}
						{#if value['climatology_bounds_details']}
							<div>
								<span class="font-bold text-label">Climatology Bounds 1st Period:</span>
								<span class="font-medium text-zinc-300"
									>{format_c_bound(value['climatology_bounds_details'][0])}</span
								>
							</div>
							<div>
								<span class="font-bold text-label">Climatology Bounds 2nd Period:</span>
								<span class="font-medium text-zinc-300"
									>{format_c_bound(value['climatology_bounds_details'][1])}</span
								>
							</div>
						{/if}
						<div>
							<span class="font-bold text-label">Time Units:</span>
							<span class="font-medium text-zinc-300">{value['time_units']}</span>
						</div>
						<div>
							<span class="font-bold text-label">Calendar:</span>
							<span class="font-medium text-zinc-300">{value['time_calendar']}</span>
						</div>
						<div>
							<span class="font-bold text-label">Time Steps:</span>
							<span class="font-medium text-zinc-300">{value['num_time_steps']}</span>
						</div>
						<div>
							<span class="font-bold text-label">Frequency:</span>
							<span class="font-medium text-zinc-300">{value['frequency']}</span>
						</div>
					</div>
				</div>
			{/if}
			{#if in_main_page}
				<!-- Geospatial Information -->
				<div class="bg-box">
					<h2 class="text-lg font-semibold mb-3 flex items-center gap-2 text-white">
						🌍 Geospatial Information
					</h2>
					<div class="grid grid-cols-1 md:grid-cols-2 gap-y-2 gap-x-4 text-zinc-200">
						<div class="grid grid-cols-3 grid-rows-3 text-zinc-200 text-center text-sm">
							<!-- Top (Lat Max) -->
							<div />
							<div>
								<span class="font-bold text-label">{round(value['geospatial_lat_max'], 4)}°</span
								><br /><span class="font-medium text-zinc-300">↑</span>
							</div>
							<div />

							<!-- Middle Row: Lon Min / Spacer / Lon Max -->
							<div>
								<span class="font-bold text-label">{round(value['geospatial_lon_min'], 4)}°</span
								><br /><span class="font-medium text-zinc-300">←</span>
							</div>
							<div />
							<div>
								<span class="font-bold text-label">{round(value['geospatial_lon_max'], 4)}°</span
								><br /><span class="font-medium text-zinc-300">→</span>
							</div>

							<!-- Bottom (Lat Min) -->
							<div />
							<div>
								<span class="font-medium text-zinc-300">↓</span><br /><span
									class="font-bold text-label">{round(value['geospatial_lat_min'], 4)}°</span
								>
							</div>
							<div />
						</div>
						<div>
							<span class="font-bold text-label">Resolution:</span>
							<span class="font-medium text-zinc-300">{value['nominal_resolution']}</span>
						</div>
					</div>
				</div>

				<!-- Variable Details -->
				<div class="bg-box">
					<h2 class="text-lg font-semibold mb-3 flex items-center gap-2 text-white">
						🔬 Variable And Simulation Details
					</h2>
					<div class="grid grid-cols-1 md:grid-cols-2 gap-y-2 gap-x-4 text-zinc-200">
						<div>
							<span class="font-bold text-label">Short Name:</span>
							<span class="font-medium text-zinc-300">{value['short_variable_name']}</span>
						</div>
						<div>
							<span class="font-bold text-label">Long Name:</span>
							<span class="font-medium text-zinc-300">{value['long_name']}</span>
						</div>
						<div>
							<span class="font-bold text-label">Unit:</span>
							<span class="font-medium text-zinc-300">{value['unit']}</span>
						</div>
						<div>
							<span class="font-bold text-label">Cell Method:</span>
							<span class="font-medium text-zinc-300">{value['cell_methods']}</span>
						</div>
						<div>
							<span class="font-bold text-label">Global Min / Max:</span>
							<span class="font-medium text-zinc-300"
								>{round(value['global_min'], 2)} / {round(value['global_max'], 2)}</span
							>
						</div>
						<div>
							<span class="font-bold text-label">Experiment ID:</span>
							<span class="font-medium text-zinc-300">{value['experiment_id']}</span>
						</div>
						<div>
							<span class="font-bold text-label">Bias Correction:</span>
							<span class="font-medium text-zinc-300">{value['bias_correction']}</span>
						</div>
						<div>
							<span class="font-bold text-label">Indicator:</span>
							<span class="font-medium text-zinc-300">{value['indicator']}</span>
						</div>
					</div>
				</div>
			{/if}
		{/if}
	{/each}
{/if}
<div class="bg-box">
	<h2 class="text-lg font-semibold mb-3 flex items-center gap-2 text-white">
		ℹ️ Other Information
	</h2>
	<div class="italic">
		(Metadata as stored inside the netCDF file. This metadata has not been updated yet!)
	</div>
	<br />
	<RecursiveDisplay data={filteredData} />
</div>

<style>
	.text-label {
		color: #60a5fa; /* Die gewünschte Farbe, hier entspricht es Tailwinds "text-label" */
	}
	.bg-box {
		background-color: #1f2937; /* Dunkelgrau (zinc-800) als Standardhintergrund */
		border: 1px solid #374151; /* Etwas dunklerer Rand (zinc-700) */
		border-radius: 1rem; /* abgerundete Ecken */
		padding: 1rem; /* Innenabstand */
		box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); /* Schatten für den 3D-Effekt */
		margin-bottom: 1rem; /* Abstand nach unten */
		margin-top: 1rem; /* Abstand nach oben */
	}
</style>
