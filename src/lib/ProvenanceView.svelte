<script lang="ts">
	import RecursiveDisplay from '$lib/RecursiveDisplay.svelte';
	import ProvenanceListView from '$lib/ProvenanceListView.svelte';
	import ProvenanceProcessingView from './ProvenanceProcessingView.svelte';

	export let metadata_prov = {};
	export let metadata_prov_stats: {
		count?: {
			results?: {
				bindings?: {
					[key: string]: {
						entityCount?: { value: string };
						activityCount?: { value: string };
						agentCount?: { value: string };
						softwareCount?: { value: string };
					};
				};
			};
		};
		source_entities?: {
			results?: {
				bindings: {
					collection_id: { value: string };
					entity: { value: string };
				}[];
			};
		};
		result_entities?: {
			results?: {
				bindings: { entity: { value: string } }[];
			};
		};
		base_for_entities?: {
			results?: {
				bindings: { entity: { value: string } }[];
			};
		};
	} = {};
	export let in_main_page = true;
	let random_id = Math.random().toString(36).substring(2, 15); // Generate a random ID
</script>

{#if metadata_prov}
	<!--tab select metadata or provenance object content-->
{/if}
{#if metadata_prov_stats}
	<!--tab select metadata or provenance object content-->
	{#if metadata_prov_stats}
		<!-- print object-->
		<div class="bg-box">
			<h2 class="text-lg font-semibold mb-3 flex items-center gap-2 text-white">
				ℹ️ Provenance: Overview
			</h2>
			<div class="ml-2">
				<div class="flex gap-2">
					<span class="font-bold text-blue-400">Number of involved files:</span>
					<span
						>{metadata_prov_stats?.count?.results?.bindings?.['0']?.entityCount?.value}

						({metadata_prov_stats?.['source_entities']?.['results']?.['bindings']?.length}
						<a href="#source_files_{random_id}" class="underline"> source files</a>
						&
						{metadata_prov_stats?.['result_entities']?.['results']?.['bindings']?.length}
						<a href="#result_files_{random_id}" class="underline"> result files</a>)
					</span>
				</div>
				<div class="flex gap-2">
					<span class="font-bold text-blue-400">Number of files based on this file:</span>
					<span
						><a href="#base_for_entities_{random_id}" class="underline"
							>{metadata_prov_stats?.['base_for_entities']?.['results']?.['bindings']?.length ??
								0}</a
						></span
					>
				</div>
				<div class="flex gap-2">
					<span class="font-bold text-blue-400">Number of processing steps:</span>
					<span
						>{metadata_prov_stats?.count?.results?.bindings?.['0']?.activityCount?.value ??
							'N/A'}</span
					>
				</div>
				<div class="flex gap-2">
					<span class="font-bold text-blue-400">Number of agents:</span>
					<span
						>{metadata_prov_stats?.count?.results?.bindings?.['0']?.agentCount?.value ??
							'N/A'}</span
					>
				</div>
				<div class="flex gap-2">
					<span class="font-bold text-blue-400">Number of used software:</span>
					<span
						>{metadata_prov_stats?.count?.results?.bindings?.['0']?.softwareCount?.value ??
							'N/A'}</span
					>
				</div>
				<div class="flex gap-2">
					<span class="font-bold text-blue-400">Number of used functions:</span>
					<span
						>{metadata_prov_stats?.count?.results?.bindings?.['0']?.functionCount?.value ??
							'N/A'}</span
					>
				</div>
			</div>
		</div>
	{/if}
{/if}
{#if metadata_prov}
	<!--tab select metadata or provenance object content-->
	{#if metadata_prov}
		<!-- print object-->
		<div class="bg-box">
			<h2 class="text-lg font-semibold mb-3 flex items-center gap-2 text-white">
				ℹ️ Provenance: Last Processing Step(s)
			</h2>
			<ProvenanceProcessingView data={metadata_prov} />
		</div>
	{/if}
{/if}

{#if metadata_prov_stats}
	<div class="bg-box" id="source_files_{random_id}">
		<h2 class="text-lg font-semibold mb-3 flex items-center gap-2 text-white">
			ℹ️ Provenance: Source Files
		</h2>
		<div class="italic">(e.g. downloaded from the ESGF portal + additional files)</div>
		<ProvenanceListView data={metadata_prov_stats?.['source_entities']} {in_main_page} />
	</div>
	<div class="bg-box" id="result_files_{random_id}">
		<h2 class="text-lg font-semibold mb-3 flex items-center gap-2 text-white">
			ℹ️ Provenance: Result Files
		</h2>
		<div class="italic">(files created during previous processing steps)</div>
		<ProvenanceListView data={metadata_prov_stats?.['result_entities']} {in_main_page} />
	</div>
	<div class="bg-box" id="base_for_entities_{random_id}">
		<h2 class="text-lg font-semibold mb-3 flex items-center gap-2 text-white">
			ℹ️ Provenance: Files based on this file
		</h2>
		<ProvenanceListView data={metadata_prov_stats?.['base_for_entities']} {in_main_page} />
	</div>
{/if}

<style>
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
