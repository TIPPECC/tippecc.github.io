<script>
	import { Handle, Position } from '@xyflow/svelte';

	import { showDetails, handleKeyDown } from '$lib/store';

	export let id;

	export let data = {
		software: 'software:cdo',
		software_name: 'www.example.com',
		version: '1.7',
		type: 'https://github.com/rue-a/provo?tab=readme-ov-file'
	};
</script>

<div
	class="bg-[#CE93D8] p-6 rounded-lg shadow-lg relative inline-block"
	style="z-index: 1;"
	role="button"
	tabindex="0"
	aria-label="Show details"
	on:click={() => showDetails(data)}
	on:keydown={(event) => handleKeyDown(event, data)}
>
	<!-- Left Handle -->
	<Handle
		type="source"
		position={Position.Left}
		id={`${id}-left`}
		style="background-color: black; width: 10px; height: 10px; border-radius: 50%; position: absolute; left: -10px; top: 50%; transform: translateY(-50%);"
	/>

	<!-- Software Information with Flex Layout -->
	<div class="flex flex-col space-y-3">
		<!-- Row with Software, Version, and License Chips -->
		<div class="flex space-x-3 w-full">
			<!-- Software Chip -->
			<div
				class="bg-[#F8F2F9] border border-[#C28DB8] text-[#424242] font-bold px-4 py-2 rounded-md text-lg flex-shrink-0 text-center hover:bg-white transition-colors duration-200"
			>
				{data.software}
			</div>

			<!-- Version Chip -->
			<div
				class="bg-[#F8F2F9] text-[#424242] border border-[#C28DB8] font-bold px-4 py-2 rounded-md text-lg flex-grow text-center hover:bg-white transition-colors duration-200"
			>
				{data.version}
			</div>
		</div>
	</div>
</div>
