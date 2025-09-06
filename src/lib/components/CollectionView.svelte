<script lang="ts">
	import { SvelteFlow, Controls, Background, BackgroundVariant, MarkerType } from '@xyflow/svelte';
	import { SvelteComponent, onMount } from 'svelte';
	//import * as d3 from 'd3'; // Import D3.js
	import '@xyflow/svelte/dist/style.css';

	import EntityNode from '$lib/components/entityNode1.svelte';
	import CollectionNode from '$lib/components/CollectionNode.svelte';
	import Sidebar from '$lib/components/Sidebar.svelte'; // Import the Sidebar
	//import TopBar from '$lib/components/TopBar.svelte';
	import {
		isSwitchOn,
		updateLabels,
		wasDerivedFrom_lb,
		hadMember_lb,
		nodes_col,
		edges_col
	} from '$lib/store'; // Import the store

	import data from '$lib/data/TIPPECC_ACCESS-ESM1-5_day_r1i1p1f1__evspsblpot__mm_1950_2100__yearsum_mean_2080_2099.json';
	//TIPPECC_AWI-ESM-1-REcoM_day_r1i1p1f1__ai__mm_1850_2100__yearsum_mean_1981_2000-2080_2099.json

	import { AddEntities, createCollection } from './dataProcessing';
	import { adjustPositionPersons } from '$lib/components/adjustPositions';

	const defaultEdgeOptions = {
		style: 'stroke-width: 3; stroke: black; z-index: 1;',
		type: 'floating',
		markerEnd: {
			type: MarkerType.ArrowClosed,
			color: 'black'
		}
	};

	let minZoom = 0.01;

	const nodeTypes: Record<string, typeof SvelteComponent> = {
		entityNode: EntityNode as unknown as typeof SvelteComponent,
		collectionNode: CollectionNode as unknown as typeof SvelteComponent
	};

	$: {
		updateLabels($isSwitchOn);
	}

	// Update edges with new labels whenever the label changes
	$: {
		edges_col.update((edges) => {
			return edges.map((edge) => {
				// Update the label based on the edge's existing label (edge.label)
				let label;
				switch (edge.label) {
					case 'derived from':
						label = $wasDerivedFrom_lb;
						break;
					case 'wasDerivedFrom':
						label = $wasDerivedFrom_lb;
						break;
					case 'part of collection':
						label = $hadMember_lb;
						break;
					case 'hadMember':
						label = $hadMember_lb;
						break;
				}

				// Return the updated edge with the new label
				return { ...edge, label };
			});
		});
	}

	onMount(() => {
		// Adjust labels based on switch state

		// Clear the nodes and edges stores before repopulating them
		nodes_col.set([]);
		edges_col.set([]);

		//const hadMember = data.hadMember;
		AddEntities(data, nodes_col, edges_col, $wasDerivedFrom_lb, 'entityNode');
		createCollection({
			dataset: data,
			nodes: nodes_col,
			edges: edges_col,
			EdgeLabel: $hadMember_lb,
			swapArrow: false,
			edgeStyle: 'stroke: #FFA500'
		});

		adjustPositionPersons({
			edges: edges_col,
			nodes: nodes_col,
			EdgeLabel: $hadMember_lb,
			NodeType: 'collectionNode'
		});
	});
</script>

<div style="height: 1000px;">
	<SvelteFlow
		{minZoom}
		nodes={nodes_col}
		edges={edges_col}
		{defaultEdgeOptions}
		{nodeTypes}
		fitView
	>
		<Controls />
		<Background variant={BackgroundVariant.Dots} />
	</SvelteFlow>
	<Sidebar />
</div>
