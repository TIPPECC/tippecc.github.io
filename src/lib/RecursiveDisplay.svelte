<script>
	/** @type {keyof typeof keyList | any} */
	export let data;
	import RecursiveDisplay from './RecursiveDisplay.svelte';
	/** @type {Record<string, boolean>} */
	let collapsed = {};

	import { popup } from '@skeletonlabs/skeleton';

	// Toggle collapse state for a given key
	/**
	 * @param {string} key
	 */
	function toggleCollapse(key) {
		collapsed[key] = !collapsed[key];
	}

	let keyList = {
		'@context': {
			prov: 'http://www.w3.org/ns/prov#',
			foaf: 'http://xmlns.com/foaf/0.1/',
			wd: 'http://www.wikidata.org/entity/',
			sdo: 'https://schema.org'
		},
		SOFTWARE__XCLIM_0_49: {
			'@id': 'SOFTWARE__XCLIM_0_49',
			'@type': 'SoftwareApplication',
			'sdo:name': 'xclim',
			'sdo:description':
				'xclim is a library for the analysis of climate data. It is designed to work with xarray datasets and follows the CF conventions. It is part of the PyData ecosystem and is built on top of xarray and dask.',
			'sdo:softwareVersion': '0.49.0',
			'sdo:license': 'MIT',
			'sdo:url': 'https://xclim.readthedocs.io/en/stable/'
		},
		SOFTWARE__XARRAY_2024_10_0: {
			'@id': 'SOFTWARE__XARRAY_2024_10_0',
			'@type': 'SoftwareApplication',
			'sdo:name': 'xarray',
			'sdo:description':
				'xarray is an open source project and Python package that makes working with labelled multi-dimensional arrays simple, efficient, and fun!',
			'sdo:softwareVersion': '2024.10.0',
			'sdo:license': 'Apache-2.0',
			'sdo:url': 'http://xarray.pydata.org/en/stable/'
		},
		SOFTWARE__CDO_1_9_3: {
			'@id': 'SOFTWARE__CDO_1_9_3',
			'@type': 'SoftwareApplication',
			'sdo:name': 'Climate Data Operators',
			'sdo:description':
				'The Climate Data Operators (CDO) software is a collection of many operators for standard processing of climate and forecast model data.',
			'sdo:softwareVersion': '1.9.3',
			'sdo:license': 'GPL-2.0',
			'sdo:url': 'https://code.mpimet.mpg.de/projects/cdo'
		},
		FUNCTION__CDO_SUB: {
			name: 'Subtract two fields',
			abbr: 'sub',
			description:
				'This module performs simple arithmetic of two datasets. The number of fields in ifile1 should be the same as in ifile2. One of the input files can contain only one timestep or one variable. The fields in ofile inherit the meta data from ifile1 or ifile2.'
		},
		FUNCTION__CDO_SELYEAR: {
			name: 'Time mean',
			abbr: 'sub',
			description:
				'Time mean.This module computes statistical values over all timesteps in ifile. Depending on the chosen operator the minimum, maximum, sum, average, variance or standard deviation of all timesteps read from ifile is written to ofile. The date information of a timestep in ofile is the date of the last contributing timestep in ifile.'
		},
		FUNCTION__CDO_TIMMEAN: {
			name: 'Time mean',
			abbr: 'timmean',
			description: 'This module computes the temporal mean of the input field.'
		},
		FUNCTION__CDO_SELLONLATBOX: {
			name: 'Select a region',
			abbr: 'sellonlatbox',
			description: 'This module selects a region in the input field.'
		},
		FUNCTION__EXTRACT_JAMS_FILES: {
			'@id': 'FUNCTION__EXTRACT_JAMS_FILES',
			'@type': 'SoftwareSourceCode',
			'sdo:name': 'Extract JAMS files',
			'sdo:description':
				'This module extracts JAMS files from a given netCDF file. They are stored as .dat files.',
			'sdo:softwareVersion': '0.0.2',
			'sdo:license': 'MIT',
			'sdo:creadtedBy': {
				'@key': 'PERSON__KRALISCH_SVEN'
			}
		},
		FUNCTION__XARRAY_ARIDITY_INDEX: {
			name: 'Aridity index',
			abbr: 'aridity_index',
			description: 'This module computes the aridity index of the input field.'
		},
		FUNCTION__XCLIM_EVAPOTRANSPIRATION: {
			name: 'Evapotranspiration',
			abbr: 'evapotranspiration',
			description: 'This module computes the evapotranspiration of the input field.'
		},
		FUNCTION__XCLIM_WATER_BUDGET: {
			name: 'Water budget',
			abbr: 'water_budget',
			description: 'This module computes the water budget of the input field.'
		},
		FUNCTION__XCLIM_CONVERT_UNITS: {
			name: 'Convert units',
			abbr: 'convert_units',
			description: 'This module converts the units of the input field.'
		},
		FUNCTION__XCLIM_RATE2AMOUNT: {
			name: 'Rate to amount',
			abbr: 'rate2amount',
			description: 'This module converts the rate to amount.'
		},
		FUNCTION__CDO_MERGE: {
			name: 'Merge two fields',
			abbr: 'merge',
			description: 'This module merges two fields.'
		},
		FUNCTION__CDO_YEARSUM: {
			name: 'Year sum',
			abbr: 'yearsum',
			description: 'This module computes the sum of the input field over a year.'
		},
		FUNCTION__CDO_SELTIME: {
			name: 'Select a time range',
			abbr: 'seltime',
			description: 'This module selects a time range in the input field.'
		},
		FUNCTION__CDO_YEARSUM_SHIFTTIME: {
			name: 'Year sum and shift time',
			abbr: 'yearsum_shifttime',
			description:
				'This module computes the sum of the input field over a year and shifts the time.'
		},
		FUNCTION__CDO_SELTIMESTEP: {
			name: 'Select a time step',
			abbr: 'seltimestep',
			description: 'This module selects a time step in the input field.'
		},
		PERSON__ZANDER_FRANZISKA: {
			'prov:type': 'prov:Person',
			'prov:label': 'Franziska Zander',
			'foaf:givenName': 'Franziska',
			'foaf:familyName': 'Zander',
			'wd:P6782': '0000-0002-0000-0000',

			'sdo:affiliation': {
				'@key': 'ORG__FSU'
			}
		},
		PERSON__KRALISCH_SVEN: {
			'prov:type': 'prov:Person',
			'prov:label': 'Sven Kralisch',
			'foaf:givenName': 'Sven',
			'foaf:familyName': 'Kralisch',
			'wd:P6782': '0000-0002-0000-0000',
			'sdo:affiliation': {
				'@key': 'ORG__FSU'
			}
		},
		ORG__FSU: {
			name: 'Friedrich Schiller University of Jena',
			ror: 'https://ror.org/05qpz1x62'
		},
		ORG__WITS: {
			name: 'University of the Witwatersrand',
			ror: 'https://ror.org/03rp50x72'
		},
		COLLECTION__TIPPECC: {
			'prov:type': 'prov:Collection',
			'sdo:name': 'TIPPECC',
			'sdo:description': 'TIPPECC is a .....'
		},
		COLLECTION__CMIP5_BIAS: {
			'prov:type': 'prov:Collection',
			'sdo:name': 'CMIP5 (bias adjusted)',
			'sdo:description':
				'CMIP5 is a climate model intercomparison project. This collection contains bias adjusted data.'
		},
		COLLECTION__CMIP5: {
			'prov:type': 'prov:Collection',
			'sdo:name': 'CMIP5',
			'sdo:description': 'CMIP5 is a climate model intercomparison project.'
		},
		COLLECTION__CMIP6: {
			'prov:type': 'prov:Collection',
			'sdo:name': 'CMIP6',
			'sdo:description': 'CMIP6 is a climate model intercomparison project.'
		},
		COLLECTION__CMIP6_BIAS: {
			'prov:type': 'prov:Collection',
			'sdo:name': 'CMIP6 (bias adjusted)',
			'sdo:description':
				'CMIP6 is a climate model intercomparison project. This collection contains bias adjusted data.'
		}
	};
	// Function to stringify JSON
	/**
	 * @param {any} json
	 */
	function stringifyJSON(json) {
		return JSON.stringify(json, null, 2); // Pretty print with 2 spaces
	}
	const popupHover = {
		event: 'hover',
		target: 'popupHover',
		placement: 'top'
	};
</script>

{#if typeof data === 'object' && !Array.isArray(data) && data !== null}
	{#each Object.entries(data) as [key, value]}
		{#if key != 'NETCDF_DIM_time_VALUES'}
			<div class="ml-4 collapsible flex">
				<span
					class="font-bold text-blue-400"
					role="button"
					tabindex="0"
					on:click={() => toggleCollapse(key)}
					on:keydown={(e) => e.key === 'Enter' && toggleCollapse(key)}>{key}:</span
				>
				<div class="ml-4 {collapsed[key] ? 'collapsed' : ''}">
					<div class="content">
						<RecursiveDisplay data={value} />
					</div>
				</div>
			</div>
		{/if}
	{/each}
{:else if Array.isArray(data)}
	<ul class="ml-4">
		{#each data as item, index}
			<li>
				<div class="collapsible">
					<div class="ml-4">
						<div class="content">
							<RecursiveDisplay data={item} />
						</div>
					</div>
				</div>
			</li>
		{/each}
	</ul>
{:else if data in keyList}
	<!--add tooltip-->
	<button
		class="underline decoration-dotted [&>*]:pointer-events-none"
		use:popup={{ event: 'hover', target: 'loopExample-' + data, placement: 'top' }}
	>
		<span>{data}</span>
	</button>
	<div class="card p-4 variant-filled-secondary" data-popup="loopExample-{data}">
		<pre>{stringifyJSON(keyList[data])}</pre>
		<div class="arrow variant-filled-secondary" />
	</div>
{:else}
	<div class="ml-4">
		{data}
	</div>
{/if}

<style>
	.collapsible {
		cursor: pointer;
		user-select: none;
	}
	.collapsed > .content {
		display: none;
	}
</style>
