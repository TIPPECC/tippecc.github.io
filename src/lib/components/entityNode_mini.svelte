<script>
	import { Handle, Position } from '@xyflow/svelte';

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
	export let width;
	export let height;

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
		variant: 'r1i1p1f1'
	};

	import { showDetails, handleKeyDown } from '$lib/store'; // Import the store
</script>

<div
	class="p-4 bg-[#EAF6EA] border-4 border-[#9CCEA0] rounded-lg shadow-lg mx-auto relative space-y-3 inline-block max-w"
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

	<!-- Label -->
	<div class="text-center text-lg font-bold text-[#424242] px-2 py-1">{id}</div>
</div>
