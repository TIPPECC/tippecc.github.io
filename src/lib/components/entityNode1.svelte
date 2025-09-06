<script lang="ts">
	import Timeline from '$lib/components/timeline.svelte';
	import { Handle, Position } from '@xyflow/svelte';
	import netcdfIcon from '$lib/icons/netcdf_icon.png';
	import shpIcon from '$lib/icons/shp_icon.png';
	import txtIcon from '$lib/icons/txt_icon.png';

	export let id;
	export let selected;
	export let selectable;
	export let deletable;
	export let zIndex;
	export let dragging;
	export let draggable;
	export let dragHandle;
	export let parentId;
	export let type;
	export let isConnectable;
	export let positionAbsoluteX;
	export let positionAbsoluteY;
	export let sourcePosition;
	export let targetPosition;

	function getFormatIcon(format: string): string {
		switch (format.toLowerCase()) {
			case 'netcdf':
				return netcdfIcon;
			case '.nc':
				return netcdfIcon;
			case 'shp':
				return shpIcon;
			case '.shp':
				return shpIcon;
			case 'txt':
				return txtIcon;
			case '.txt':
				return txtIcon;
			default:
				return 'None';
		}
	}

	export let data = {
		parameter: '',
		zeitspranne: [{ start: 1950, end: 2010 }],
		regionalmodell: '',
		globalmodell: '',
		einheit: '',
		szenario: '',
		format: '',
		resolutionZeitlich: '',
		resolutionRaeumlich: 0,
		spatialExtent: [0, 0, 0, 0],
		spatialExtent_orig: [0, 0, 0, 0],
		dateigroesse: '',
		timestamp: '2019-12-09-T14:52:55Z',
		project: 'CORDEX',
		experiment: 'historic',
		standard: 'CF-1.4',
		bias: 'yes',
		source: 'Climate Limited-area Modelling Community (CLM-Community)',
		institution: 'IMK-TRO/KIT, Karlsruhe, Germany in collaboration with the CLM community',
		domain: 'AFR-22',
		contact: 'hendrik.feldmann@kit.edu',
		tracking_id: 'hdl:21.14103/0f700e74-9c64-4638-9fab-e7a2f3d26b26',
		doi: 'www.exampleDOI.com',
		variant: 'r1i1p1f1',
		id: 0
	};

	import {
		changedPar,
		changedUnit,
		changedTempRes,
		changedSpatRes,
		changedScenario,
		changedFormat,
		changedSize,
		changedGlobMod,
		changedRegMod,
		changedBounds,
		showDetails,
		handleKeyDown
	} from '$lib/store';

	import { onDestroy } from 'svelte';

	let isChanged = false;
	const unsubscribe = changedPar.subscribe((set) => {
		isChanged = set.has(id); // Check if this entity is in the changed set
	});

	let isChangedUnit = false;
	const unsubscribeUnit = changedUnit.subscribe((set) => {
		isChangedUnit = set.has(id); // Check if this entity is in the changed set
	});

	let isChangedTempRes = false;
	const unsubscribeTempRes = changedTempRes.subscribe((set) => {
		isChangedTempRes = set.has(id); // Check if this entity is in the changed set
	});

	let isChangedSpatRes = false;
	const unsubscribeSpatRes = changedSpatRes.subscribe((set) => {
		isChangedSpatRes = set.has(id); // Check if this entity is in the changed set
	});

	let isChangedScenario = false;
	const unsubscribeScenario = changedScenario.subscribe((set) => {
		isChangedScenario = set.has(id); // Check if this entity is in the changed set
	});

	let isChangedFormat = false;
	const unsubscribeFormat = changedFormat.subscribe((set) => {
		isChangedFormat = set.has(id); // Check if this entity is in the changed set
	});

	let isChangedSize = false;
	const unsubscribeSize = changedSize.subscribe((set) => {
		isChangedSize = set.has(id); // Check if this entity is in the changed set
	});

	let isChangedGlobMod = false;
	const unsubscribeGlobMod = changedGlobMod.subscribe((set) => {
		isChangedGlobMod = set.has(id); // Check if this entity is in the changed set
	});

	let isChangedRegMod = false;
	const unsubscribeRegMod = changedRegMod.subscribe((set) => {
		isChangedRegMod = set.has(id); // Check if this entity is in the changed set
	});

	let isChangedBounds = false;
	const unsubscribeBounds = changedBounds.subscribe((set) => {
		isChangedBounds = set.has(id); // Check if this entity is in the changed set;
	});

	onDestroy(() => {
		unsubscribe();
		unsubscribeUnit();
		unsubscribeTempRes();
		unsubscribeSpatRes();
		unsubscribeScenario();
		unsubscribeFormat();
		unsubscribeSize();
		unsubscribeGlobMod();
		unsubscribeRegMod();
		unsubscribeBounds();
	});
</script>

<div
	class="p-4 bg-[#A5D6A7] rounded-lg shadow-lg space-y-3 mx-auto relative"
	style="z-index: 1;"
	role="button"
	tabindex="0"
	aria-label="Show details"
	on:click={() => showDetails(data)}
	on:keydown={(event) => handleKeyDown(event, data)}
>
	<!-- Top Handle -->
	<Handle
		type="source"
		position={Position.Top}
		id={`${id}-top`}
		style="background-color: black; width: 10px; height: 10px; border-radius: 50%; position: absolute; margin-top: -5px"
	/>

	<!-- Bottom Handle -->
	<Handle
		type="target"
		position={Position.Bottom}
		id={`${id}-bottom`}
		style="background-color: black; width: 10px; height: 10px; border-radius: 50%; position: absolute; margin-bottom: -2px;"
	/>

	<!-- Left Handle -->
	<Handle
		type="target"
		position={Position.Left}
		id={`${id}-left`}
		style="background-color: black; width: 10px; height: 10px; border-radius: 50%; transform: translateX(0px); margin-top: -5px; margin-left: -8px;"
	/>

	<!-- Right Handle -->
	<Handle
		type="target"
		position={Position.Right}
		id={`${id}-right`}
		style="background-color: black; width: 10px; height: 10px; border-radius: 50%; transform: translateX(0px); margin-top: -5px; margin-right: -7px;"
	/>

	<div class="flex space-x-4 w-full justify-between">
		<!-- Parameter Chip -->
		<div
			class="bg-[#EAF6EA] text-[#424242] rounded-md h-8 leading-tight inline-flex items-center justify-center text-lg font-bold flex-grow hover:bg-white transition-colors duration-200"
			style="z-index: 1; border: {isChanged ? '2px solid #7f1d1d' : 'none'};"
		>
			{data.parameter}
		</div>

		<!-- Unit Chip -->
		<div
			class="bg-[#EAF6EA] text-[#424242] border border-[#9CCEA0] rounded-md h-8 leading-tight inline-flex items-center justify-center text-xs flex-grow font-bold hover:bg-white transition-colors duration-200"
			style="z-index: 1; border: {isChangedUnit ? '2px solid #7f1d1d' : 'none'};"
		>
			{data.einheit}
		</div>
	</div>

	<div class="flex space-x-4 w-full justify-between">
		<!-- Temporal Resolution Chip -->
		<div
			class="bg-[#EAF6EA] text-[#424242] font-bold px-4 py-2 rounded-md inline-flex items-center justify-center inline-block text-sm flex-grow hover:bg-white transition-colors duration-200"
			style="z-index: 1; border: {isChangedTempRes ? '2px solid #7f1d1d' : 'none'};"
		>
			{data.resolutionZeitlich}
		</div>

		<!-- Bounds Chip -->
		<div
			class="bg-[#EAF6EA] text-[#424242] font-bold px-4 py-2 rounded-md inline-flex items-center justify-center inline-block text-sm flex-grow hover:bg-white transition-colors duration-200"
			style="z-index: 1; border: {isChangedBounds ? '2px solid #7f1d1d' : 'none'};"
		>
			<!-- First line for xmin and xmax -->
			<div>
				{data.spatialExtent[0]}, {data.spatialExtent[1]}, {data.spatialExtent[2]}, {data
					.spatialExtent[3]}
			</div>
		</div>

		<!-- Spatial Resolution with Map -->
		<div
			class="bg-[#EAF6EA] text-[#424242] font-bold px-4 py-2 rounded-md inline-flex items-center justify-center inline-block text-sm flex-grow hover:bg-white transition-colors duration-200"
			style="z-index: 1; border: {isChangedSpatRes ? '2px solid #7f1d1d' : 'none'};"
		>
			{data.resolutionRaeumlich}
		</div>
	</div>

	<!-- Scenario and Format Chips -->
	<div class="flex space-x-4 w-full justify-between">
		<div
			class="bg-[#EAF6EA] text-[#424242] font-bold px-4 py-2 inline-flex items-center justify-center rounded-md text-xs flex-grow hover:bg-white transition-colors duration-200"
			style="z-index: 1; border: {isChangedScenario ? '2px solid #7f1d1d' : 'none'};"
		>
			{data.szenario}
		</div>
		<div
			class="bg-[#EAF6EA] text-[#424242] font-bold border border-[#9CCEA0] px-4 py-2 inline-flex items-center justify-center rounded-md text-xs flex-grow hover:bg-white transition-colors duration-200"
			style="z-index: 1; border: {isChangedFormat ? '2px solid #7f1d1d' : 'none'};"
		>
			<img src={getFormatIcon(data.format)} alt="Icon" class="w-16 h-10 ml-0" />
		</div>
		<!-- File Size -->
		<div
			class="bg-[#EAF6EA] text-[#424242] font-bold px-4 py-2 inline-flex items-center justify-center rounded-md inline-block text-xs flex-grow hover:bg-white transition-colors duration-200"
			style="z-index: 1; border: {isChangedSize ? '2px solid #7f1d1d' : 'none'};"
		>
			{data.dateigroesse}
		</div>
	</div>

	<div class="flex space-x-4 w-full justify-between">
		<!-- Regional Model Chip -->
		<div
			class="bg-[#EAF6EA] text-[#424242] font-bold px-4 py-2 inline-flex items-center justify-center rounded-md inline-block text-xs flex-grow hover:bg-white transition-colors duration-200"
			style="z-index: 1; border: {isChangedRegMod ? '2px solid #7f1d1d' : 'none'};"
		>
			{data.regionalmodell}
		</div>

		<!-- Global Model Chip -->
		<div
			class="bg-[#EAF6EA] text-[#424242] font-bold border border-[#9CCEA0] px-4 py-2 inline-flex items-center justify-center rounded-md inline-block text-xs flex-grow hover:bg-white transition-colors duration-200"
			style="z-index: 1; border: {isChangedGlobMod ? '2px solid #7f1d1d' : 'none'};"
		>
			{data.globalmodell}
		</div>
	</div>

	<!-- Time Span with Graphical Timeline -->
	<div class="space-y-1 w-full justify-evenly">
		<div class="flex items-center space-x-2">
			<Timeline step={25} activeRanges={data.zeitspranne} />
		</div>
	</div>
</div>
