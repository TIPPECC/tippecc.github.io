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
	changedBounds
} from '$lib/store';

import { get } from 'svelte/store';

type WasDerivedFrom = {
	[key: string]: {
		'prov:generatedEntity': string;
		'prov:usedEntity': string;
	};
};

type Activity = {
	[key: string]: {
		'prov:startTime': string;
		'prov:params': string;
		'prov:label': string;
		'prov:description': string;
		'prov:function': string;
	};
};

type WasInformedBy = {
	[key: string]: {
		'prov:informed': string;
		'prov:informant': string;
	};
};
type WasAttributedTo = {
	[key: string]: {
		'prov:agent': string;
		'prov:entity': string;
	};
};

type ActedOnBehalfOf = {
	[key: string]: {
		'prov:delegate': string;
		'prov:responsible': string;
	};
};

type WasAssociatedWith = {
	[key: string]: {
		[key: string]: string; // Allow indexing with any string key
	};
};

type UsedGenerated = {
	[key: string]: {
		[key: string]: string; // Allow indexing with any string key
	};
};

type Entity = {
	[key: string]: {
		'tippecc_data:file.long_name'?: string;
		'tippecc_data:evspsblpot.units'?: string;
		'tippecc_data:file.geospatial_lat_min': string;
		'tippecc_data:file.geospatial_lat_max': string;
		'tippecc_data:file.geospatial_lon_min': string;
		'tippecc_data:file.geospatial_lon_max': string;
		'tippecc_data:file.nominal_resolution'?: string;
		'tippecc_data:file.global_model'?: string;
		'tippecc_data:file.file_format'?: string;
		'tippecc_data:file.frequency'?: string;
		'tippecc_data:file.file_size'?: { $: number };
		'tippecc_data:file.birth_time'?: string;
		'tippecc_data:project_id'?: string;
		'tippecc_data:file.experiment_id'?: string;
		'tippecc_data:Conventions'?: string;
		'tippecc_data:institution'?: string;
		'tippecc_data:realm'?: string;
		'tippecc_data:contact'?: string;
		'tippecc_data:tracking_id'?: string;
		'tippecc_data:file.variant'?: string;
		'tippecc_data:license'?: string;
		'tippecc_data:file.time_coverage_start': string;
		'tippecc_data:file.time_coverage_end': string;
		'tippecc_data:file.climatology_bounds': string;
		[key: string]: any;
	};
};

type Node = {
	id: string;
	type: string;
	data: {
		parameter: string;
		zeitspranne: any;
		regionalmodell: string;
		globalmodell: string;
		einheit: string;
		szenario: string;
		format: string;
		resolutionZeitlich: string;
		resolutionRaeumlich: string;
		spatialExtent: any;
		spatialExtent_orig: any;
		dateigroesse: string;
		timestamp: string;
		project: string;
		experiment: string;
		standard: string;
		bias: string;
		source: string;
		institution: string;
		domain: string;
		contact: string;
		tracking_id: string;
		doi: string;
		doi_hist: string;
		collection: string;
		variant: string;
		id: string;
	};
	position: { x: number; y: number };
};

type NodeActivity = {
	id: string;
	type: string; // Specify the custom node type
	data: {
		id: string;
		startTime: string;
		params: unknown;
		label: string;
		description: string;
		function: string;
	};
	position: { x: number; y: number };
};

type Edge = {
	id: string; // Unique edge id using generated and used entities
	source: string; // Source is the generated entity
	target: string; // Target is the used entity
	animated: boolean; // Set animated to false
	label: string; // Add a label if necessary
	type: string; // Specify the edge type
	labelStyle: string; // Styling for the label
};

type Dataset = {
	wasDerivedFrom: WasDerivedFrom;
	wasInformedBy: WasInformedBy;
	wasAttributedTo: WasAttributedTo;
	hadMember: HadMember;
	entity: Entity;
	activity: Activity;
};

type HadMember = {
	[key: string]: {
		'prov:entity': string;
		'prov:collection': string;
	};
};

// Funktion, die die eindeutigen Entitäten extrahiert
export function AddEntities(
	dataset: Dataset,
	nodes: any,
	edges: any,
	label: any,
	NodeType: string
): void {
	// Funktion, um die erste Entität zu finden
	function findFirstEntity(dataset: any): string | null {
		const wasDerivedFrom = Object.values(dataset.wasDerivedFrom) as {
			'prov:generatedEntity': string;
			'prov:usedEntity': string;
		}[];

		const generatedEntities = new Set<string>();
		const usedEntities = new Set<string>();

		wasDerivedFrom.forEach(({ 'prov:generatedEntity': gen, 'prov:usedEntity': used }) => {
			generatedEntities.add(gen);
			usedEntities.add(used);
		});

		for (const entity of generatedEntities) {
			if (!usedEntities.has(entity)) {
				return entity; // Die Entität, die nicht als usedEntity vorkommt
			}
		}

		return null; // Falls keine Start-Entität gefunden wird
	}

	function buildEntityList(dataset: any): string[][] {
		const wasDerivedFrom = Object.values(dataset.wasDerivedFrom) as {
			'prov:generatedEntity': string;
			'prov:usedEntity': string;
		}[];

		const firstEntity: any = findFirstEntity(dataset);
		//console.log(firstEntity);

		// Finde alle usedEntities, die von der firstEntity als generatedEntity abgeleitet sind
		const usedEntities = new Set<string>();

		wasDerivedFrom.forEach(({ 'prov:generatedEntity': gen, 'prov:usedEntity': used }) => {
			if (gen === firstEntity) {
				usedEntities.add(used); // Add usedEntity if the generatedEntity is the firstEntity
			}
		});

		// Schritt 2: Erstelle die Anfangsliste mit der firstEntity und ihren usedEntities
		const entityList: string[][] = [[firstEntity], [...usedEntities]]; // Die Liste mit der firstEntity und ihren usedEntities

		// Schritt 3: Iteriere solange über die usedEntities und finde deren generatedEntities, bis keine neuen gefunden werden
		let currentUsedEntities = [...usedEntities]; // Die erste Liste von usedEntities
		let foundNewEntities = true;

		while (foundNewEntities) {
			foundNewEntities = false; // Setze anfangs auf false, bis wir neue Entities finden

			const nextUsedEntities = new Set<string>(); // Set für die nächsten gefundenen usedEntities

			currentUsedEntities.forEach((element) => {
				wasDerivedFrom.forEach(({ 'prov:generatedEntity': gen, 'prov:usedEntity': used }) => {
					if (gen === element) {
						nextUsedEntities.add(used); // Add the usedEntity if the generatedEntity matches the current element
					}
				});
			});

			if (nextUsedEntities.size > 0) {
				entityList.push([...nextUsedEntities]); // Füge die neuen usedEntities der entityList hinzu
				currentUsedEntities = [...nextUsedEntities]; // Setze die Liste der aktuellen usedEntities auf die neuen
				foundNewEntities = true; // Es wurden neue Entities gefunden, also wiederhole den Vorgang
			}
		}

		return entityList;
	}

	const EntityList = buildEntityList(dataset);

	function findCollectionForEntity(currentEntity: string, hadMember: HadMember): string {
		// Iterate through the hadMember object to find the matching collection
		const entry = Object.values(hadMember).find(
			(member) => member['prov:entity'] === currentEntity
		);
		return entry ? entry['prov:collection'] : 'No Collection defined';
	}

	function formatFileSize(bytes: number): string {
		if (bytes === 0) return '0 B';
		const sizes = ['B', 'KB', 'MB', 'GB'];
		const i = Math.floor(Math.log(bytes) / Math.log(1024));
		const formatted = (bytes / Math.pow(1024, i)).toFixed(2);
		return `${formatted} ${sizes[i]}`;
	}

	/*

    function calculateSpatialResolution(
        gridSize: [number, number], 
        upperLeft: [number, number], 
        upperRight: [number, number], 
        lowerLeft: [number, number]
    ): string {
        
        const [width, height] = gridSize;

        const longitudeRange = upperRight[0] - upperLeft[0]; // 52.0 - 10.0
        const latitudeRange = upperLeft[1] - lowerLeft[1];   // -5.0 - (-36.0)

        const lonResolution = longitudeRange / width;  // 42.0 / 84 = 0.5°
        const latResolution = latitudeRange / height;  // 31.0 / 62 = 0.5°

        return `${lonResolution.toFixed(1)}° x ${latResolution.toFixed(1)}°`;
    }*/

	let name: string;
	let unit: string;
	let extent: any;
	let collection: string;
	let regionalmodel: string;
	let globalmodel: string;
	let scenario: string;
	let format: string;
	let temporalResolution: string;
	let spatialResolution: string;
	let size: string;
	let parsedTimespans: { start: number; end: number }[] = [];
	let timestamp: string;
	let project: string;
	let experiment: string;
	let standard: string;
	let bias: string;
	let source: string;
	let institution: string;
	let domain: string;
	let contact: string;
	let tracking_id: string;
	let references: string;
	let references_hist: string;
	let variant: string;
	let yPos: number = 0;

	EntityList.forEach((level) => {
		let xPos: number = 0;
		level.forEach((currentEntity) => {
			if (dataset.entity[currentEntity]) {
				// EXTRACT PARAMTER NAME
				name = dataset.entity[currentEntity]['tippecc_data:file.long_name'] ?? 'N/A';
				//EXTRACT UNIT
				unit = dataset.entity[currentEntity]['tippecc_data:evspsblpot.units'] ?? 'N/A';
				//EXTRACT BOUNDS
				const lat_min = Number(
					dataset.entity[currentEntity]['tippecc_data:file.geospatial_lat_min']
				);
				const lat_max = Number(
					dataset.entity[currentEntity]['tippecc_data:file.geospatial_lat_max']
				);
				const lon_min = Number(
					dataset.entity[currentEntity]['tippecc_data:file.geospatial_lon_min']
				);
				const lon_max = Number(
					dataset.entity[currentEntity]['tippecc_data:file.geospatial_lon_max']
				);
				extent = [lat_min, lat_max, lon_min, lon_max];

				// EXTRACT COLLECTION
				collection = findCollectionForEntity(currentEntity, dataset.hadMember);
				// EXTRACT REGIONAL MODEL TODO
				regionalmodel = dataset.entity[currentEntity]['tippecc_data:file.regional_model'] ?? 'N/A';
				// EXTRACT Global MODEL
				globalmodel = dataset.entity[currentEntity]['tippecc_data:file.global_model'] ?? 'N/A';
				// EXTRACT scenario TODO
				scenario = dataset.entity[currentEntity]['tippecc_data:file.experiment_id'] ?? 'N/A';
				//EXTRACT File Format
				format = dataset.entity[currentEntity]['tippecc_data:file.file_format'] ?? 'N/A';

				//EXTRACT temp res
				temporalResolution = dataset.entity[currentEntity]['tippecc_data:file.frequency'] ?? 'N/A';
				//EXTRACT spat res
				spatialResolution =
					dataset.entity[currentEntity]['tippecc_data:file.nominal_resolution'] ?? 'N/A';
				//EXTRACT File Size
				size = formatFileSize(dataset.entity[currentEntity]['tippecc_data:file.file_size']?.$ ?? 0);

				// Extract TIMESPAN
				const climatologyBounds =
					dataset.entity[currentEntity]['tippecc_data:file.climatology_bounds'];
				const timeCoverageStart =
					dataset.entity[currentEntity]['tippecc_data:file.time_coverage_start'];
				const timeCoverageEnd =
					dataset.entity[currentEntity]['tippecc_data:file.time_coverage_end'];

				// Function to parse a time range string into { start, end } objects
				const parseTimeRanges = (timeString: string): { start: number; end: number }[] => {
					return [...timeString.matchAll(/\d{4}/g)]
						.map((match) => parseInt(match[0], 10))
						.reduce((acc, year, index, arr) => {
							if (index % 2 === 0 && arr[index + 1] !== undefined) {
								acc.push({ start: year, end: arr[index + 1] });
							}
							return acc;
						}, [] as { start: number; end: number }[]);
				};

				// Determine the parsedTimespans based on available data

				if (climatologyBounds) {
					parsedTimespans = parseTimeRanges(climatologyBounds);
				} else if (timeCoverageStart && timeCoverageEnd) {
					parsedTimespans = [
						{
							start: parseInt(timeCoverageStart.substring(0, 4), 10),
							end: parseInt(timeCoverageEnd.substring(0, 4), 10)
						}
					];
				}

				//parsedTimespans = [ { start: 1910, end: 1960 }, { start: 1980, end: 2050 } ];

				//EXTRACT Timestamp
				timestamp = dataset.entity[currentEntity]['tippecc_data:file.birth_time'] ?? 'N/A';
				// EXTRACT Project
				project = dataset.entity[currentEntity]['tippecc_data:activity_id'] ?? 'N/A';
				// EXTRACT experiment TODO
				experiment = dataset.entity[currentEntity]['tippecc_data:file.experiment_id'] ?? 'N/A';
				// EXTRACT Standard
				standard = dataset.entity[currentEntity]['tippecc_data:Conventions'] ?? 'N/A';
				//EXTRACT Bias TODO
				bias = 'Yes';
				//EXTRACT institution
				institution = dataset.entity[currentEntity]['tippecc_data:institution'] ?? 'N/A';
				//EXTRACT domain
				domain = dataset.entity[currentEntity]['tippecc_data:realm'] ?? 'N/A';
				//EXTRACT contact
				contact = dataset.entity[currentEntity]['tippecc_data:file.contact'] ?? 'N/A';
				//EXTRACT tracking_id TODO
				tracking_id = dataset.entity[currentEntity]['tippecc_data:tracking_id'] ?? 'N/A';
				//EXTRACT doi
				references =
					dataset.entity[currentEntity]['tippecc_data:file.citation_scenario_source.doi'] ?? 'N/A';
				references_hist =
					dataset.entity[currentEntity]['tippecc_data:file.citation_historical_source.doi'] ??
					'N/A';
				//EXTRACT variant
				variant = dataset.entity[currentEntity]['tippecc_data:file.variant'] ?? 'N/A';
				//EXTRACT source
				source = dataset.entity[currentEntity]['tippecc_data:license'] ?? 'N/A';
			} else {
				name = 'N/A';
				unit = 'N/A';
				const lat_min = 0;
				const lat_max = 0;
				const lon_min = 0;
				const lon_max = 0;

				extent = [lat_min, lat_max, lon_min, lon_max];
				try {
					collection = findCollectionForEntity(currentEntity, dataset.hadMember);
				} catch {
					collection = 'unknown';
				}
				regionalmodel = 'not defined';
				globalmodel = 'N/A';
				scenario = 'N/A';
				format = 'N/A';
				temporalResolution = 'N/A';
				spatialResolution = 'N/A';
				size = '0 B';
				parsedTimespans = [];
				timestamp = 'N/A';
				project = 'N/A';
				experiment = 'N/A';
				standard = 'N/A';
				bias = 'N/A';
				source = 'N/A';
				institution = 'N/A';
				domain = 'N/A';
				contact = 'N/A';
				tracking_id = 'N/A';
				references = 'N/A';
				variant = 'N/A';
			}
			function findUsedEntities(dataset: any, currentEntity: any) {
				let usedEntities = [];

				for (const key in dataset.wasDerivedFrom) {
					const entry = dataset.wasDerivedFrom[key];
					if (entry['prov:generatedEntity'] === currentEntity) {
						usedEntities.push(entry['prov:usedEntity']);
					}
				}

				return usedEntities;
			}
			const usedEntitiesList = findUsedEntities(dataset, currentEntity);

			let name_used: string;
			let unit_used: string;
			let regionalmodel_used: string;
			let globalmodel_used: string;
			let scenario_used: string;
			let format_used: string;
			let temporalResolution_used: string;
			let spatialResolution_used: string;
			let size_used: string;
			let extent_used: any;

			let extentList: [number, number, number, number][] = [];

			// Loop over usedEntitiesList
			usedEntitiesList.forEach((usedEntity) => {
				if (dataset.entity[usedEntity]) {
					name_used = dataset.entity[usedEntity]['tippecc_data:file.long_name'] ?? 'N/A';
					unit_used = dataset.entity[usedEntity]['tippecc_data:evspsblpot.units'] ?? 'N/A';
					temporalResolution_used =
						dataset.entity[usedEntity]['tippecc_data:file.frequency'] ?? 'N/A';
					const lat_min_used = Number(
						dataset.entity[usedEntity]['tippecc_data:file.geospatial_lat_min']
					);
					const lat_max_used = Number(
						dataset.entity[usedEntity]['tippecc_data:file.geospatial_lat_max']
					);
					const lon_min_used = Number(
						dataset.entity[usedEntity]['tippecc_data:file.geospatial_lon_min']
					);
					const lon_max_used = Number(
						dataset.entity[usedEntity]['tippecc_data:file.geospatial_lon_max']
					);

					spatialResolution_used =
						dataset.entity[usedEntity]['tippecc_data:file.nominal_resolution'] ?? 'N/A';
					scenario_used = dataset.entity[usedEntity]['tippecc_data:file.experiment_id'] ?? 'N/A';
					format_used = dataset.entity[usedEntity]['tippecc_data:file.file_format'] ?? 'N/A';
					size_used = formatFileSize(
						dataset.entity[usedEntity]['tippecc_data:file.file_size']?.$ ?? 0
					);
					globalmodel_used =
						dataset.entity[usedEntity]['tippecc_data:file.regional_model'] ?? 'N/A';
					regionalmodel_used =
						dataset.entity[usedEntity]['tippecc_data:file.global_model'] ?? 'N/A';

					extent_used = [lat_min_used, lat_max_used, lon_min_used, lon_max_used];
					extentList.push(extent_used);
				} else {
					name_used = 'N/A';
					unit_used = 'N/A';
					temporalResolution_used = 'N/A';

					const lat_min_used = 0;
					const lat_max_used = 0;
					const lon_min_used = 0;
					const lon_max_used = 0;

					extent_used = [lat_min_used, lat_max_used, lon_min_used, lon_max_used];

					spatialResolution_used = 'N/A';

					extentList.push(extent_used);

					scenario_used = 'N/A';
					format_used = 'N/A';
					size_used = '0 B';
					globalmodel_used = 'N/A';
					regionalmodel_used = 'not defined'; //dataset.entity[usedEntity]["tippecc_data:source"];
				}

				if (name !== name_used) {
					changedPar.update((set) => {
						set.add(usedEntity);
						return new Set(set);
					});
				}
				if (unit !== unit_used) {
					changedUnit.update((set) => {
						set.add(usedEntity); // Add entity ID to the set
						return new Set(set); // Return a new Set to trigger reactivity
					});
				}
				if (temporalResolution !== temporalResolution_used) {
					changedTempRes.update((set) => {
						set.add(usedEntity); // Add entity ID to the set
						return new Set(set); // Return a new Set to trigger reactivity
					});
				}
				if (spatialResolution !== spatialResolution_used) {
					changedSpatRes.update((set) => {
						set.add(usedEntity); // Add entity ID to the set
						return new Set(set); // Return a new Set to trigger reactivity
					});
				}
				if (scenario !== scenario_used) {
					changedScenario.update((set) => {
						set.add(usedEntity); // Add entity ID to the set
						return new Set(set); // Return a new Set to trigger reactivity
					});
				}
				if (format !== format_used) {
					changedFormat.update((set) => {
						set.add(usedEntity); // Add entity ID to the set
						return new Set(set); // Return a new Set to trigger reactivity
					});
				}
				if (size !== size_used) {
					changedSize.update((set) => {
						set.add(usedEntity); // Add entity ID to the set
						return new Set(set); // Return a new Set to trigger reactivity
					});
				}
				if (globalmodel !== globalmodel_used) {
					changedGlobMod.update((set) => {
						set.add(usedEntity); // Add entity ID to the set
						return new Set(set); // Return a new Set to trigger reactivity
					});
				}
				if (regionalmodel !== regionalmodel_used) {
					changedRegMod.update((set) => {
						set.add(usedEntity); // Add entity ID to the set
						return new Set(set); // Return a new Set to trigger reactivity
					});
				}

				function arraysEqual(a: any, b: any) {
					if (!Array.isArray(a) || !Array.isArray(b)) return false;
					if (a.length !== b.length) return false;

					return a.every((val, index) => {
						const otherVal = b[index];

						// Handle NaN values explicitly
						const bothNaN =
							typeof val === 'number' &&
							typeof otherVal === 'number' &&
							isNaN(val) &&
							isNaN(otherVal);
						if (bothNaN) return true;

						// Tolerance-based number comparison
						if (typeof val === 'number' && typeof otherVal === 'number') {
							return Math.abs(val - otherVal) < 1e-6;
						}

						// Fallback: strict equality
						return val === otherVal;
					});
				}

				if (!arraysEqual(extent, extent_used)) {
					changedBounds.update((set) => {
						set.add(usedEntity);
						return new Set(set);
					});
				}
			});

			// Ensure extentList is not empty before calculating the average
			const extentAverage: [number, number, number, number] =
				extentList.length > 0
					? (extentList[0].map(
							(_, i) => extentList.reduce((sum, ext) => sum + ext[i], 0) / extentList.length
					  ) as [number, number, number, number])
					: [0, 0, 0, 0]; // Default fallback if no data

			//xPos = Math.random() * 400;  // Zufälliger Wert zwischen 0 und 800
			//yPos = Math.random() * 800;  // Zufälliger Wert zwischen 0 und 600

			// Add node for currentEntity
			nodes.update((n: Node[]) => {
				if (!n.some((node) => node.id === currentEntity)) {
					//console.log(uniqueEntityId);

					n.push({
						id: currentEntity,
						type: NodeType, // Specify the custom node type
						data: {
							parameter: name || 'N/A',
							zeitspranne: parsedTimespans || [],
							regionalmodell: regionalmodel || 'not defined',
							globalmodell: globalmodel || 'N/A',
							einheit: unit || 'N/A',
							szenario: scenario || 'N/A',
							format: format || 'N/A',
							resolutionZeitlich: temporalResolution || 'N/A',
							resolutionRaeumlich: spatialResolution || 'N/A',
							spatialExtent: extent || [0, 0, 0, 0],
							spatialExtent_orig: extentAverage || [0, 0, 0, 0],
							dateigroesse: size || '0 B',
							timestamp: timestamp || 'N/A',
							project: project || 'N/A',
							experiment: experiment || 'N/A',
							standard: standard || 'N/A',
							bias: bias || 'N/A',
							source: source || 'N/A',
							institution: institution || 'N/A',
							domain: domain || 'N/A',
							contact: contact || 'N/A',
							tracking_id: tracking_id || 'N/A',
							doi: references || 'N/A',
							doi_hist: references_hist || 'N/A',
							collection: collection || 'N/A',
							variant: variant || 'N/A',
							id: currentEntity
						},
						position: { x: xPos, y: yPos }
					});
				}
				return n;
			});
			xPos += -1200;
		});
		yPos += -500;
	});

	edges.update((e: Edge[]) => {
		const newEdges = Object.keys(dataset.wasDerivedFrom).map((id) => {
			const generatedEntity = dataset.wasDerivedFrom[id]['prov:generatedEntity'];
			const usedEntity = dataset.wasDerivedFrom[id]['prov:usedEntity'];

			// Create a new edge object
			return {
				id: `${generatedEntity}-${usedEntity}`, // Unique edge id using generated and used entities
				source: generatedEntity, // Source is the generated entity
				target: usedEntity, // Target is the used entity
				animated: false, // Set animated to false
				label: label, // Add a label if necessary
				type: 'step', // Specify the edge type
				labelStyle: 'color: black; font-size: 16px; z-index: 2; pointer-events: none;' // Styling for the label
			};
		});

		// Use push to add the new edges to the existing list
		newEdges.forEach((newEdge) => {
			e.push(newEdge);
		});

		// Return the updated edges list
		return e;
	});
}

export function AddActions(dataset: Dataset, nodes: any, edges: any, label: any): void {
	function findActivities(dataset: any): string[] {
		if (!dataset.activity || typeof dataset.activity !== 'object') {
			return [];
		}

		// Die Keys des activity-Objekts sind die IDs der Aktivitäten
		return Object.keys(dataset.activity);
	}

	const currentNodes: any = get(nodes); // Get all nodes in the flow

	// Get all entityNodes
	const entityNodes = currentNodes.filter((node: any) => node.type === 'entityNode');

	if (entityNodes.length === 0) {
		console.warn('No entityNodes found, skipping adjustment.');
		return;
	}

	// Determine min and max y-positions
	const minY = Math.min(...entityNodes.map((node: any) => node.position.y));
	const maxY = Math.max(...entityNodes.map((node: any) => node.position.y));

	// Beispielaufruf mit deinem JSON-Dataset
	//const executionOrder = findExecutionOrder(dataset);
	const executionOrder = findActivities(dataset);

	let xPos: number = 1500;
	let yPos: number = 0;
	const length = executionOrder.length - 1;
	const spacing = (maxY - minY) / length;

	//console.log(executionOrder);
	executionOrder.forEach((currentEntity) => {
		const currentActivity = dataset.activity[currentEntity];
		// Add node for currentEntity
		nodes.update((n: NodeActivity[]) => {
			if (!n.some((node) => node.id === currentEntity)) {
				//console.log(uniqueEntityId);

				n.push({
					id: currentEntity,
					type: 'activityNode', // Specify the custom node type
					data: {
						id: currentEntity,
						startTime: currentActivity['prov:startTime'],
						params: currentActivity['prov:params'],
						label: currentActivity['prov:label'],
						description: currentActivity['prov:description'],
						function: currentActivity['prov:function']
					},
					position: { x: xPos, y: yPos }
				});
			}
			return n;
		});
		yPos += -spacing;
	});

	edges.update((e: Edge[]) => {
		const newEdges = Object.keys(dataset.wasInformedBy).map((id) => {
			const generatedEntity = dataset.wasInformedBy[id]['prov:informed'];
			const usedEntity = dataset.wasInformedBy[id]['prov:informant'];

			// Create a new edge object
			return {
				id: `${generatedEntity}-${usedEntity}`, // Unique edge id using generated and used entities
				source: usedEntity, // Source is the generated entity
				target: generatedEntity, // Target is the used entity
				animated: false, // Set animated to false
				label: label, // Add a label if necessary
				type: 'step', // Specify the edge type
				labelStyle: 'color: black; font-size: 16px; z-index: 2; pointer-events: none;', // Styling for the label
				style: 'stroke:rgb(2, 1, 2);'
			};
		});

		// Use push to add the new edges to the existing list
		newEdges.forEach((newEdge) => {
			e.push(newEdge);
		});

		// Return the updated edges list
		return e;
	});
}

export function createPeople({
	dataset,
	nodes,
	edges,
	EdgeLabel,
	swapArrow,
	edgeStyle
}: {
	dataset: any;
	nodes: any;
	edges: any;
	EdgeLabel: string;
	swapArrow: boolean;
	edgeStyle: string;
}) {
	const entityNodes = new Set();
	let yPosition = 0;

	for (const [id, member] of Object.entries(dataset.wasAttributedTo) as [
		string,
		WasAttributedTo[string]
	][]) {
		const personId = member['prov:agent']; // Use full person identifier (e.g., people:Franzi)
		const entity = member['prov:entity'];

		// Find organization (orgaId) from actedOnBehalfOf
		const actedOnBehalfOfEntry = Object.values(dataset.actedOnBehalfOf as ActedOnBehalfOf).find(
			(entry: any) => entry['prov:delegate'] === personId
		);

		const orgaId = actedOnBehalfOfEntry?.['prov:responsible'] || null;
		const rorid = orgaId ? dataset.agent[orgaId]?.['wd:P6782'] : null;

		// Only add the person node if it hasn't been added yet
		if (!entityNodes.has(personId)) {
			nodes.update((n: any) => {
				n.push({
					id: personId,
					type: 'personNode',
					data: {
						person: personId || 'N/A',
						orga: orgaId || 'N/A',
						orcid: dataset.agent?.[personId]?.['wd:P496'] || 'N/A',
						rorid: rorid || 'N/A'
					},
					position: { x: -600, y: yPosition }
				});
				return n;
			});
			entityNodes.add(personId);
			yPosition += 400;
		}

		// Add edge between the person and the corresponding entity
		const source = swapArrow ? entity : personId;
		const target = swapArrow ? personId : entity;
		const sourceHandle = swapArrow ? `${entity}-left` : `${personId}-right`;
		const targetHandle = swapArrow ? `${personId}-right` : `${entity}-left`;

		edges.update((e: any) => {
			e.push({
				id: `${personId}-${entity}`,
				source: source,
				target: target,
				sourceHandle: sourceHandle,
				targetHandle: targetHandle,
				animated: false,
				label: EdgeLabel,
				style: edgeStyle,
				labelStyle: 'color: black; font-size: 16px'
			});
			return e;
		});
	}
}
//-----------------------------------------------------------------------------------------
//---------------------------------------------------------------------------------------

//ADD Nodes and Edges for Software
export function addSoftware({
	dataset,
	nodes,
	edges,
	EdgeLabel,
	IdName,
	EntityName,
	swapArrow,
	edgestyle
}: {
	dataset: any;
	nodes: any;
	edges: any;
	EdgeLabel: string;
	IdName: string;
	EntityName: string;
	swapArrow: boolean;
	edgestyle: string;
}) {
	let yPosition = 0;

	for (const member of Object.values(dataset.wasAssociatedWith as WasAssociatedWith)) {
		const activityId = member[IdName];
		const agentId = member[EntityName];

		// Ensure agent node is added if not present
		nodes.update((n: any) => {
			if (!n.some((node: any) => node.id === agentId)) {
				n.push({
					id: agentId,
					type: 'softwareNode',
					data: {
						//TODO add Data
						software: agentId || 'N/A',
						software_name: dataset.agent[agentId]['sdo:name'] || 'N/A',
						version: dataset.agent[agentId]['sdo:softwareVersion'] || 'N/A',
						url: dataset.agent[agentId]['sdo:url'] || 'N/A',
						license: dataset.agent[agentId]['sdo:license'] || 'N/A',
						description: dataset.agent[agentId]['sdo:description'] || 'N/A'
					},
					position: { x: 1200, y: yPosition } // Adjust as needed
				});
			}
			return n;
		});
		yPosition += 400;

		// Define edge direction based on swapArrow
		const source = swapArrow ? agentId : activityId;
		const target = swapArrow ? activityId : agentId;
		const sourceHandle = swapArrow ? `${agentId}-left` : `${activityId}-right`; // Use the correct handle
		const targetHandle = swapArrow ? `${activityId}-right` : `${agentId}-left`; // Use the correct handle

		// Add edge between the activity and agent
		edges.update((e: any) => {
			e.push({
				id: `${activityId}-${agentId}`,
				source: source,
				target: target,
				sourceHandle: sourceHandle, // Assign the correct source handle
				targetHandle: targetHandle, // Assign the correct target handle
				animated: false,
				label: EdgeLabel,
				style: edgestyle,
				labelStyle: 'color: black; font-size: 16px'
			});
			return e;
		});
	}
}

// ADD EDGES ONLY
export function addEdgesOnly({
	dataset,
	edges,
	EdgeLabel,
	IdName,
	EntityName,
	swapArrow,
	style,
	labelStyle,
	handle1,
	handle2,
	IdAppendix
}: //edgeStyle = {} // Allow optional edge style customization
{
	dataset: any;
	edges: any;
	EdgeLabel: string;
	IdName: string;
	EntityName: string;
	swapArrow: boolean;
	style: string;
	labelStyle: string;
	handle1: string;
	handle2: string;
	IdAppendix: string;
}) {
	for (const member of Object.values(dataset as UsedGenerated)) {
		const activityId = member[IdName];
		const entityId = member[EntityName];

		// Define edge direction based on swapArrow
		const source = swapArrow ? entityId : activityId;
		const target = swapArrow ? activityId : entityId;
		//console.log("source and target:", source, target);

		// Specify the correct handles for source and target
		const sourceHandle = swapArrow ? `${entityId}-${handle1}` : `${activityId}-${handle2}`; // Use entityNode right or activityNode left
		const targetHandle = swapArrow ? `${activityId}-${handle2}` : `${entityId}-${handle1}`; // Use activityNode left or entityNode right
		//console.log(sourceHandle, targetHandle)

		// Add edge between activity and entity
		edges.update((e: any) => {
			e.push({
				id: `${source}-${target}-${IdAppendix}`,
				source: source,
				target: target,
				sourceHandle: sourceHandle, // Assign the correct source handle
				targetHandle: targetHandle, // Assign the correct target handle
				animated: false,
				label: EdgeLabel,
				style: style,
				labelStyle: labelStyle
			});
			return e;
		});
	}
}

export function createCollection({
	dataset,
	nodes,
	edges,
	EdgeLabel,
	swapArrow,
	edgeStyle
}: {
	dataset: any;
	nodes: any;
	edges: any;
	EdgeLabel: string;
	swapArrow: boolean;
	edgeStyle: string;
}) {
	const collectionNodes = new Set();
	let yPosition = 0;

	for (const [id, member] of Object.entries(dataset.hadMember) as [string, any][]) {
		const collectionId = member['prov:collection']; // Collection ID
		const entityId = member['prov:entity']; // Entity ID

		const collectionData = dataset.entity[collectionId];

		// Only add the collection node if it hasn't been added yet
		if (!collectionNodes.has(collectionId)) {
			nodes.update((n: any) => {
				n.push({
					id: collectionId,
					type: 'collectionNode',
					data: {
						id: collectionId,
						type: collectionData['prov:type'][1],
						description: collectionData['sdo:description'],
						collection_name: collectionData['sdo:name']
					},
					position: { x: 600, y: yPosition }
				});
				return n;
			});
			collectionNodes.add(collectionId);
			yPosition += 400;
		}

		// Add edge between the collection and the corresponding entity
		const source = swapArrow ? entityId : collectionId;
		const target = swapArrow ? collectionId : entityId;
		const sourceHandle = swapArrow ? `${entityId}-left` : `${collectionId}-right`;
		const targetHandle = swapArrow ? `${collectionId}-right` : `${entityId}-left`;

		edges.update((e: any) => {
			e.push({
				id: `${collectionId}-${entityId}`,
				source: source,
				target: target,
				sourceHandle: sourceHandle,
				targetHandle: targetHandle,
				animated: false,
				label: EdgeLabel,
				style: edgeStyle,
				labelStyle: 'color: black; font-size: 16px'
			});
			return e;
		});
	}
}
