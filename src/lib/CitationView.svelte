<script lang="ts">
	interface File {
		citation_historical_source?: {
			short_data_reference?: string;
			doi?: string;
			license?: string;
		};
		citation_scenario_source?: {
			short_data_reference?: string;
			doi?: string;
			license?: string;
		};
		citation_historical_scenario_source?: {
			short_data_reference?: string;
			doi?: string;
			license?: string;
		};
	}
	
	export let file: File = {};
	export let in_main_page: boolean = true;

	let showCitations = true;
	if (!in_main_page){
		showCitations = false;
	}

</script>

<div class="bg-box">
	<h2 class="text-lg font-semibold mb-3 flex items-center gap-2 text-white">ℹ️ Cite as:</h2>
	<div>
		<span class="font-bold text-blue-400">Reference:</span>
		<span>coming soon</span>
	</div>
</div>
{#if ! in_main_page}
	<button
		class="bg-cyan-700 w-full h-[36px] flex items-center hover:bg-gray-700 transition"
		on:click={() => showCitations = !showCitations}
	>
		{showCitations ? '🔽 More Citations' : '▶️ More Citations'}
	</button>
{/if}
	{#if showCitations}
	{#if file['citation_historical_source']}
		<div class="bg-box">
			<h2 class="text-lg font-semibold mb-3 flex items-center gap-2 text-white">
				ℹ️ Citation: Historical Source
			</h2>
			<div>
				<span class="font-bold text-blue-400">Short reference:</span>
				<span>{file['citation_historical_source']['short_data_reference']}</span>
			</div>
			<div>
				<span class="font-bold text-blue-400">DOI:</span>
				<span
					><a href={file['citation_historical_source']['doi']} target="_blank">
						{file['citation_historical_source']['doi']}</a
					></span
				>
			</div>
			<div>
				<span class="font-bold text-blue-400">License:</span>
				<span>{file['citation_historical_source']['license']}</span>
			</div>
		</div>
	{/if}
	{#if file['citation_scenario_source']}
		<div class="bg-box">
			<h2 class="text-lg font-semibold mb-3 flex items-center gap-2 text-white">
				ℹ️ Citation: Scenario Source
			</h2>
			<div>
				<span class="font-bold text-blue-400">Short reference:</span>
				<span>{file['citation_scenario_source']['short_data_reference']}</span>
			</div>
			<div>
				<span class="font-bold text-blue-400">DOI:</span>
				<span
					><a href={file['citation_scenario_source']['doi']} target="_blank">
						{file['citation_scenario_source']['doi']}</a
					></span
				>
			</div>
			<div>
				<span class="font-bold text-blue-400">License:</span>
				<span>{file['citation_scenario_source']['license']}</span>
			</div>
		</div>
	{/if}
	{#if file['citation_historical_scenario_source']}
		<div class="bg-box">
			<h2 class="text-lg font-semibold mb-3 flex items-center gap-2 text-white">
				ℹ️ Citation: Scenario Source
			</h2>
			<div>
				<span class="font-bold text-blue-400">Short reference:</span>
				<span>{file['citation_historical_scenario_source']['short_data_reference']}</span>
			</div>
			<div>
				<span class="font-bold text-blue-400">DOI:</span>
				<span
					><a href={file['citation_historical_scenario_source']['doi']} target="_blank">
						{file['citation_historical_scenario_source']['doi']}</a
					></span
				>
			</div>
			<div>
				<span class="font-bold text-blue-400">License:</span>
				<span>{file['citation_historical_scenario_source']['license']}</span>
			</div>
		</div>
	{/if}
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
