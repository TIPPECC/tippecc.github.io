import { get } from 'svelte/store';
import type { Edge, Node } from '@xyflow/svelte';


export function adjustPositionSoftware({
    edges,
    nodes,
    EdgeLabel
}: {
    edges: import('svelte/store').Readable<Edge[]>;
    nodes: import('svelte/store').Readable<Node[]>;
    EdgeLabel: string;
}): void {
    const currentNodes = get(nodes);
    const currentEdges = get(edges);

    // Get all activity edges matching the given label
    const activityEdges = currentEdges.filter(edge => edge.label === EdgeLabel);

    if (activityEdges.length === 0) {
        console.warn("No matching activity edges found, skipping adjustment.");
        return;
    }

    // Group edges by source
    const groupedBySource = activityEdges.reduce((acc, edge) => {
        (acc[edge.source] = acc[edge.source] || []).push(edge);
        return acc;
    }, {} as Record<string, Edge[]>);

    // Calculate average y-position for each group and ensure minimum spacing of 200
    const adjustedYPositions = new Map<string, number>();

    Object.entries(groupedBySource).forEach(([sourceId, edges]) => {
        const targetNodes = edges.map(edge => currentNodes.find(node => node.id === edge.target)).filter(Boolean) as Node[];
        if (targetNodes.length === 0) return;

        let avgY = targetNodes.reduce((sum, node) => sum + node.position.y, 0) / targetNodes.length;

        // Ensure a minimum spacing of 200 between nodes
        while ([...adjustedYPositions.values()].some(y => Math.abs(y - avgY) < 200)) {
            avgY += 200;
        }
        adjustedYPositions.set(sourceId, avgY);

        // Update source node with the new y position
        const sourceNode = currentNodes.find(node => node.id === sourceId);
        if (sourceNode) {
            sourceNode.position = { x: sourceNode.position.x, y: avgY };
        }
    });
}




export function adjustPositionPersons({
    edges,
    nodes,
    EdgeLabel,
    NodeType
}: {
    edges: import('svelte/store').Readable<Edge[]>;
    nodes: import('svelte/store').Readable<Node[]>;
    EdgeLabel: string;
    NodeType: string
}): void {
    const currentNodes = get(nodes);
    const currentEdges = get(edges);

    // Get all activity edges matching the given label
    const activityEdges = currentEdges.filter(edge => edge.label === EdgeLabel);

    if (activityEdges.length === 0) {
        console.warn("No matching activity edges found, skipping adjustment.");
        return;
    }

    // Group edges by target
    const groupedBySource = activityEdges.reduce((acc, edge) => {
        (acc[edge.source] = acc[edge.source] || []).push(edge);
        return acc;
    }, {} as Record<string, Edge[]>);

    // Calculate average y and x position for each group and ensure minimum spacing of 200
    const adjustedPositions = new Map<string, { x: number; y: number }>();

    Object.entries(groupedBySource).forEach(([sourceId, edges]) => {
        const targetNodes = edges.map(edge => currentNodes.find(node => node.id === edge.target)).filter(Boolean) as Node[];
        if (targetNodes.length === 0) return;

        let avgY = targetNodes.reduce((sum, node) => sum + node.position.y, 0) / targetNodes.length;
        let avgX = targetNodes.reduce((sum, node) => sum + node.position.x, 0) / targetNodes.length;

        // Ensure a minimum spacing of 200 between Y values
        while ([...adjustedPositions.values()].some(pos => Math.abs(pos.y - avgY) < 200)) {
            avgY += 200;
        }
        while ([...adjustedPositions.values()].some(pos => Math.abs(pos.x - avgX) < 200)) {
            avgX += 200;
        }

        adjustedPositions.set(sourceId, { x: avgX, y: avgY });

        // Update source node with the new x and y position
        const sourceNode = currentNodes.find(node => node.id === sourceId);
        if (sourceNode) {
            sourceNode.position = { x: avgX, y: avgY };
        }
    });

}



export function adjustPositionActivities({
    edges,
    nodes,
    EdgeLabel,
    EdgeLabel2,
    minDistance = 50 // Minimum allowed distance between nodes
}: {
    edges: import('svelte/store').Readable<Edge[]>;
    nodes: import('svelte/store').Readable<Node[]>;
    EdgeLabel: string;
    EdgeLabel2: string;
    minDistance?: number; // Minimum allowed distance between nodes
}): void {
    const currentNodes = get(nodes);
    const currentEdges = get(edges);

    // Get all activity edges matching the given label
    const activityEdges = currentEdges.filter(
        edge => edge.label === EdgeLabel || edge.label === EdgeLabel2
    );

    if (activityEdges.length === 0) {
        console.warn("No matching activity edges found, skipping adjustment.");
        return;
    }

    // Group edges by source (activity nodes)
    const groupedBySource = activityEdges.reduce((acc, edge) => {
        (acc[edge.source] = acc[edge.source] || []).push(edge);
        return acc;
    }, {} as Record<string, Edge[]>);

    // Maps to store adjusted positions
    const adjustedYPositions = new Map<string, number>();
    const adjustedXPositions = new Map<string, number>();

    // Adjust position for each activity node
    Object.entries(groupedBySource).forEach(([sourceId, edges]) => {
        const targetNodes = edges.map(edge => currentNodes.find(node => node.id === edge.target)).filter(Boolean) as Node[];
        if (targetNodes.length === 0) return;


        // Calculate the average X and Y positions of the connected entity nodes
        let avgX = targetNodes.reduce((sum, node) => sum + node.position.x, 0) / targetNodes.length;
        let avgY = targetNodes.reduce((sum, node) => sum + node.position.y, 0) / targetNodes.length;

        // Ensure a minimum spacing between nodes (avoid overlap)
        while ([...adjustedXPositions.values()].some(x => Math.abs(x - avgX) < minDistance)) {
            avgX += minDistance; // Push right if needed
        }
        while ([...adjustedYPositions.values()].some(y => Math.abs(y - avgY) < minDistance)) {
            avgY += minDistance; // Push down if needed
        }

        // Store new positions
        adjustedXPositions.set(sourceId, avgX);
        adjustedYPositions.set(sourceId, avgY);

        // Update activity node with the computed average position
        const sourceNode = currentNodes.find(node => node.id === sourceId);
        if (sourceNode) {
            sourceNode.position = { x: avgX, y: avgY };
        }
    });

    // Update the nodes in the store
    nodes.update(n => 
        n.map(node => 
            adjustedXPositions.has(node.id) || adjustedYPositions.has(node.id)
            ? { ...node, position: { 
                x: adjustedXPositions.get(node.id) ?? node.position.x, 
                y: adjustedYPositions.get(node.id) ?? node.position.y 
            } }
            : node
        )
    );
}

