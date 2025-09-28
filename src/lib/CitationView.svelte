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
	if (!in_main_page) {
		showCitations = false;
	}
</script>

{#if in_main_page}
	<div class="bg-box">
		<h2 class="text-lg font-semibold mb-3 flex items-center gap-2">ℹ️ Cite as:</h2>
		<div>
			<span class="font-bold text-blue-400">Reference:</span>
			<span>please contact the TIPPECC team</span>
		</div>
		<div>
			<span class="font-bold text-blue-400">DOI:</span>
			<span>coming soon</span>
		</div>
		<div>
			<span class="font-bold text-blue-400">License:</span>
			<span>CC-BY-4.0</span>
		</div>
	</div>
{/if}

<div class="grid grid-cols-1 md:grid-cols-2 gap-y-2 gap-x-4">
	{#if file['citation_historical_source']}
		<div class="bg-box">
			<h2 class="text-lg font-semibold mb-3 flex items-center gap-2">
				ℹ️ Citation Source: Historical Data
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
			<h2 class="text-lg font-semibold mb-3 flex items-center gap-2">
				ℹ️ Citation Source: Scenario Data
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
			<h2 class="text-lg font-semibold mb-3 flex items-center gap-2">
				ℹ️ Citation: Historical & Scenario Source
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
</div>
