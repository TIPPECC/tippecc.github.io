export let keyList = {
	'@context': {
		prov: 'http://www.w3.org/ns/prov#',
		foaf: 'http://xmlns.com/foaf/0.1/',
		wd: 'http://www.wikidata.org/entity/',
		sdo: 'https://schema.org'
	},
	SOFTWARE__XCLIM_0_49: {
		'@id': 'SOFTWARE__XCLIM_0_49',
		'@type': 'sdo:SoftwareApplication',
		'sdo:softwareVersion': '0.49.0',
		'sdo:targetProduct': {
			'@id': 'SOFTWARE__XCLIM'
		}
	},
	SOFTWARE__XCLIM: {
		'@id': 'SOFTWARE__XCLIM',
		'@type': 'sdo:SoftwareApplication',
		'sdo:name': 'xclim',
		'sdo:description':
			'xclim is a library for the analysis of climate data. It is designed to work with xarray datasets and follows the CF conventions. It is part of the PyData ecosystem and is built on top of xarray and dask.',
		'sdo:license': 'MIT',
		'sdo:url': 'https://xclim.readthedocs.io/en/stable/'
	},
	SOFTWARE__XARRAY_2024_10_0: {
		'@id': 'SOFTWARE__XARRAY_2024_10_0',
		'@type': 'sdo:SoftwareApplication',
		'sdo:version': '2024.10.0',
		'sdo:targetProduct': {
			'@id': 'SOFTWARE__XARRAY'
		}
	},
	SOFTWARE__XARRAY: {
		'@id': 'SOFTWARE__XARRAY',
		'@type': 'sdo:SoftwareApplication',
		'sdo:name': 'xarray',
		'sdo:description':
			'xarray is an open source project and Python package that makes working with labelled multi-dimensional arrays simple, efficient, and fun!',
		'sdo:license': 'Apache-2.0',
		'sdo:url': 'http://xarray.pydata.org/en/stable/'
	},
	SOFTWARE__CDO_1_9_3: {
		'@id': 'SOFTWARE__CDO_1_9_3',
		'@type': 'sdo:SoftwareApplication',
		'sdo:softwareVersion': '1.9.3',
		'sdo:targetProduct': {
			'@id': 'SOFTWARE__CDO'
		}
	},
	SOFTWARE__CDO_1_9_8: {
		'@id': 'SOFTWARE__CDO_1_9_8',
		'@type': 'sdo:SoftwareApplication',
		'sdo:softwareVersion': '1.9.8',
		'sdo:targetProduct': {
			'@id': 'SOFTWARE__CDO'
		}
	},
	SOFTWARE__CDO: {
		'@id': 'SOFTWARE__CDO',
		'@type': 'sdo:SoftwareApplication',
		'sdo:name': 'Climate Data Operators',
		'sdo:description':
			'The Climate Data Operators (CDO) software is a collection of many operators for standard processing of climate and forecast model data.',
		'sdo:license': 'GPL-2.0',
		'sdo:url': 'https://code.mpimet.mpg.de/projects/cdo'
	},
	SOFTWARE__FORTRAN: {
		'@id': 'SOFTWARE__FORTRAN',
		'@type': 'sdo:SoftwareApplication',
		'sdo:name': 'Fortran',
		'sdo:description':
			'Fortran is a general-purpose, compiled imperative programming language that is especially suited to numeric computation and scientific computing.',
		'sdo:license': 'GPL-3.0',
		'sdo:url': 'https://fortran-lang.org/'
	},
	SOFTWARE__FORTAN_4_8_5: {
		'@id': 'SOFTWARE__FORTAN_4_8_5',
		'@type': 'sdo:SoftwareApplication',
		'sdo:softwareVersion': '4.8.5',
		'sdo:targetProduct': {
			'@id': 'SOFTWARE__FORTRAN'
		}
	},
	FUNCTION__BIAS_ADJUSTMENT: {
		'@id': 'FUNCTION__BIAS_ADJUSTMENT',
		'@type': 'sdo:SoftwareSourceCode',
		'sdo:name': 'Bias adjustment',
		'sdo:description': 'This module performs bias adjustment of the input field.',
		'sdo:targetProduct': {
			'@id': 'SOFTWARE__FORTRAN'
		}
	},
	FUNCTION__CDO_SUB: {
		'@id': 'FUNCTION__CDO_SUB',
		'@type': 'sdo:SoftwareSourceCode',
		'sdo:name': 'sub - subtract two fields',
		'sdo:description':
			'This module performs simple arithmetic of two datasets. The number of fields in ifile1 should be the same as in ifile2. One of the input files can contain only one timestep or one variable. The fields in ofile inherit the meta data from ifile1 or ifile2.',
		'sdo:targetProduct': {
			'@id': 'SOFTWARE__CDO'
		}
	},
	FUNCTION__CDO_MULC: {
		'@id': 'FUNCTION__CDO_MULC',
		'@type': 'sdo:SoftwareSourceCode',
		'sdo:name': 'mulc - multiply a field with a constant',
		'sdo:description': 'This module multiplies a field with a constant.',
		'sdo:targetProduct': {
			'@id': 'SOFTWARE__CDO'
		}
	},
	FUNCTION__CDO_SELYEAR: {
		'@id': 'FUNCTION__CDO_SELYEAR',
		'@type': 'sdo:SoftwareSourceCode',
		'sdo:name': 'selyear - select a year range',
		'sdo:description': 'This module selects a year range in the input field.',
		'sdo:targetProduct': {
			'@id': 'SOFTWARE__CDO'
		}
	},
	FUNCTION__CDO_SELDATE: {
		'@id': 'FUNCTION__CDO_SELDATE',
		'@type': 'sdo:SoftwareSourceCode',
		'sdo:name': 'seldate - select a date range',
		'sdo:description': 'This module selects a date range in the input field.',
		'sdo:targetProduct': {
			'@id': 'SOFTWARE__CDO'
		}
	},
	FUNCTION__CDO_TIMMEAN: {
		'@id': 'FUNCTION__CDO_TIMMEAN',
		'@type': 'sdo:SoftwareSourceCode',
		'sdo:name': 'timmean - time mean',
		'sdo:description': 'This module computes the temporal mean of the input field.',
		'sdo:targetProduct': {
			'@id': 'SOFTWARE__CDO'
		}
	},
	FUNCTION__CDO_SEASUM: {
		'@id': 'FUNCTION__CDO_SEASUM',
		'@type': 'sdo:SoftwareSourceCode',
		'sdo:name': 'seasum - seasonal sum',
		'sdo:description': 'This module computes the seasonal sum of the input field.',
		'sdo:targetProduct': {
			'@id': 'SOFTWARE__CDO'
		}
	},
	FUNCTION__CDO_MONSUM: {
		'@id': 'FUNCTION__CDO_MONSUM',
		'@type': 'sdo:SoftwareSourceCode',
		'sdo:name': 'monsum - monthly sum',
		'sdo:description': 'This module computes the monthly sum of the input field.',
		'sdo:targetProduct': {
			'@id': 'SOFTWARE__CDO'
		}
	},
	FUNCTION__CDO_SELLONLATBOX: {
		'@id': 'FUNCTION__CDO_SELLONLATBOX',
		'@type': 'sdo:SoftwareSourceCode',
		'sdo:name': 'sellonlatbox - select a region',
		'sdo:description': 'This module selects a region in the input field.',
		'sdo:targetProduct': {
			'@id': 'SOFTWARE__CDO'
		}
	},
	FUNCTION__EXTRACT_JAMS_FILES: {
		'@id': 'FUNCTION__EXTRACT_JAMS_FILES',
		'@type': 'sdo:SoftwareSourceCode',
		'sdo:name': 'Extract JAMS files',
		'sdo:description':
			'This module extracts JAMS files from a given netCDF file. They are stored as .dat files.',
		'sdo:softwareVersion': '0.0.2',
		'sdo:license': 'MIT',
		'sdo:creadtedBy': {
			'@id': 'PERSON__KRALISCH_SVEN'
		}
	},
	FUNCTION__XARRAY_ARIDITY_INDEX: {
		'@id': 'FUNCTION__XARRAY_ARIDITY_INDEX',
		'@type': 'sdo:SoftwareSourceCode',
		'sdo:name': 'Aridity index',
		'sdo:description': 'This module computes the aridity index.',
		'sdo:targetProduct': {
			'@id': 'SOFTWARE__XARRAY'
		}
	},
	FUNCTION__XARRAY_SLICE: {
		'@id': 'FUNCTION__XARRAY_SLICE',
		'@type': 'sdo:SoftwareSourceCode',
		'sdo:name': 'SLICE',
		'sdo:description': 'Reduces a dataset by area and time.',
		'sdo:targetProduct': {
			'@id': 'SOFTWARE__XARRAY'
		}
	},

	FUNCTION__XCLIM_EVAPOTRANSPIRATION: {
		'@id': 'FUNCTION__XCLIM_EVAPOTRANSPIRATION',
		'@type': 'sdo:SoftwareSourceCode',
		'sdo:name': 'Evapotranspiration',
		'sdo:description':
			'The potential for water evaporation from soil and transpiration by plants if the water supply is sufficient, calculated with a given method.',
		'sdo:url':
			'https://xclim.readthedocs.io/en/stable/api_indicators.html#xclim.indicators.atmos.potential_evapotranspiration',
		'sdo:targetProduct': {
			'@id': 'SOFTWARE__XCLIM'
		}
	},
	FUNCTION__XCLIM_WATER_BUDGET: {
		'@id': 'FUNCTION__XCLIM_WATER_BUDGET',
		'@type': 'sdo:SoftwareSourceCode',
		'sdo:name': 'Water budget',
		'sdo:description':
			'Precipitation minus potential evapotranspiration as a measure of an approximated surface water budget.',
		'sdo:url':
			'https://xclim.readthedocs.io/en/stable/api_indicators.html#xclim.indicators.atmos.water_budget',
		'sdo:targetProduct': {
			'@id': 'SOFTWARE__XCLIM'
		}
	},
	FUNCTION__XCLIM_CONVERT_UNITS: {
		'@id': 'FUNCTION__XCLIM_CONVERT_UNITS',
		'@type': 'sdo:SoftwareSourceCode',
		'sdo:name': 'Convert units',
		'sdo:description':
			'Convert a mathematical expression into a value with the same units as a DataArray.',
		'sdo:url':
			'https://xclim.readthedocs.io/en/stable/apidoc/xclim.core.html#xclim.core.units.convert_units_to',
		'sdo:targetProduct': {
			'@id': 'SOFTWARE__XCLIM'
		}
	},
	FUNCTION__XCLIM_RATE2AMOUNT: {
		'@id': 'FUNCTION__XCLIM_RATE2AMOUNT',
		'@type': 'sdo:SoftwareSourceCode',
		'sdo:name': 'Rate to amount',
		'sdo:description':
			'Convert a rate variable to an amount by multiplying by the sampling period length.',
		'sdo:url':
			'https://xclim.readthedocs.io/en/stable/apidoc/xclim.core.html#xclim.core.units.rate2amount',
		'sdo:targetProduct': {
			'@id': 'SOFTWARE__XCLIM'
		}
	},
	FUNCTION__XCLIM_FIRE_INDICES: {
		'@id': 'FUNCTION__XCLIM_FIRE_INDICES',
		'@type': 'sdo:SoftwareSourceCode',
		'sdo:name': 'Fire indices',
		'sdo:description': 'This module computes fire indices.',
		'sdo:targetProduct': {
			'@id': 'SOFTWARE__XCLIM'
		}
	},
	FUNCTION__XCLIM_SPI: {
		'@id': 'FUNCTION_XCLIM_SPI',
		'@type': 'sdo:SoftwareSourceCode',
		'sdo:name': 'SPI',
		'sdo:description': 'This module computes the Standardized Precipitation Index.',
		'sdo:targetProduct': {
			'@id': 'SOFTWARE__XCLIM'
		}
	},
	FUNCTION__CDO_MERGE: {
		'@id': 'FUNCTION__CDO_MERGE',
		'@type': 'sdo:SoftwareSourceCode',
		'sdo:name': 'Merge two fields',
		'sdo:description': 'This module merges two fields.',
		'sdo:targetProduct': {
			'@id': 'SOFTWARE__CDO'
		}
	},
	FUNCTION__CDO_YEARSUM: {
		'@id': 'FUNCTION__CDO_YEARSUM',
		'@type': 'sdo:SoftwareSourceCode',
		'sdo:name': 'Year sum',
		'sdo:description': 'This module computes the sum of the input field over a year.',
		'sdo:targetProduct': {
			'@id': 'SOFTWARE__CDO'
		}
	},
	FUNCTION__CDO_YEARMEAN: {
		'@id': 'FUNCTION__CDO_YEARMEAN',
		'@type': 'sdo:SoftwareSourceCode',
		'sdo:name': 'Year mean',
		'sdo:description': 'This module computes the mean of the input field over a year.',
		'sdo:targetProduct': {
			'@id': 'SOFTWARE__CDO'
		}
	},
	FUNCTION__CDO_SELTIME: {
		'@id': 'FUNCTION__CDO_SELTIME',
		'@type': 'sdo:SoftwareSourceCode',
		'sdo:name': 'Select a time range',
		'sdo:description': 'This module selects a time range in the input field.',
		'sdo:targetProduct': {
			'@id': 'SOFTWARE__CDO'
		}
	},
	FUNCTION__CDO_YEARSUM_SHIFTTIME: {
		'@id': 'FUNCTION__CDO_YEARSUM_SHIFTTIME',
		'@type': 'sdo:SoftwareSourceCode',
		'sdo:name': 'Year sum and shift time',
		'sdo:description':
			'This module computes the sum of the input field over a year and shifts the time.',
		'sdo:targetProduct': {
			'@id': 'SOFTWARE__CDO'
		}
	},
	FUNCTION__CDO_SELTIMESTEP: {
		'@id': 'FUNCTION__CDO_SELTIMESTEP',
		'@type': 'sdo:SoftwareSourceCode',
		'sdo:name': 'Select a time step',
		'sdo:description': 'This module selects a time step in the input field.',
		'sdo:targetProduct': {
			'@id': 'SOFTWARE__CDO'
		}
	},
	FUNCTION__CDO_REMAPBIL: {
		'@id': 'FUNCTION__CDO_REMAPBIL',
		'@type': 'sdo:SoftwareSourceCode',
		'sdo:name': 'Remap bilinear',
		'sdo:description': 'This module remaps the input field using bilinear interpolation.',
		'sdo:targetProduct': {
			'@id': 'SOFTWARE__CDO'
		}
	},
	FUNCTION__XCLIM_FIRE_INDICES_KBDI: {
		'@id': 'FUNCTION__XCLIM_FIRE_INDICES_KBDI',
		'@type': 'sdo:SoftwareSourceCode',
		'sdo:name': 'KBDI',
		'sdo:description': 'This module computes the Keetch-Byram Drought Index.',
		'sdo:targetProduct': {
			'@id': 'SOFTWARE__XCLIM'
		}
	},
	PERSON__ZANDER_FRANZISKA: {
		'@id': 'PERSON__ZANDER_FRANZISKA',
		'prov:type': 'prov:Person',
		'prov:label': 'Franziska Zander',
		'foaf:givenName': 'Franziska',
		'foaf:familyName': 'Zander',
		'wd:P496': '0000-0001-6892-7046',
		'sdo:affiliation': {
			'@id': 'ORG__FSU'
		}
	},
	PERSON__KRALISCH_SVEN: {
		'@id': 'PERSON__KRALISCH_SVEN',
		'prov:type': 'prov:Person',
		'prov:label': 'Sven Kralisch',
		'foaf:givenName': 'Sven',
		'foaf:familyName': 'Kralisch',
		'wd:P496': '0000-0003-2895-540X',
		'sdo:affiliation': {
			'@id': 'ORG__FSU'
		}
	},
	PERSON__FABIAN_SCHREITER: {
		'@id': 'PERSON__FABIAN_SCHREITER',
		'prov:type': 'prov:Person',
		'prov:label': 'Fabian Schreiter',
		'foaf:givenName': 'Fabian',
		'foaf:familyName': 'Schreiter',

		'sdo:affiliation': {
			'@id': 'ORG__FSU'
		}
	},
	PERSON__JONATHAN_PADAVATAN: {
		'@id': 'PERSON_JONATHAN_PADAVATAN',
		'prov:type': 'prov:Person',
		'prov:label': 'Jonathan Padavatan',
		'foaf:givenName': 'Jonathan',
		'foaf:familyName': 'Padavatan',

		'sdo:affiliation': {
			'@id': 'ORG__WITS'
		}
	},
	PERSON__FRANCOIS_ENGELBRECHT: {
		'@id': 'PERSON__FRANCOIS_ENGELBRECHT',
		'prov:type': 'prov:Person',
		'prov:label': 'Francois Engelbrecht',
		'foaf:givenName': 'Francois',
		'foaf:familyName': 'Engelbrecht',
		'wd:P496': '0000-0002-9189-6556',
		'sdo:affiliation': {
			'@id': 'ORG__WITS'
		}
	},
	PERSON__JESSICA_STEINKOPF: {
		'@id': 'PERSON__JESSICA_STEINKOPF',
		'prov:type': 'prov:Person',
		'prov:label': 'Jessica Steinkopf',
		'foaf:givenName': 'Jessica',
		'foaf:familyName': 'Steinkopf',
		'wd:P496': '0000-0002-9189-6556',
		'sdo:affiliation': {
			'@id': 'ORG__WITS'
		}
	},
	ORG__FSU: {
		'@id': 'ORG__FSU',
		'prov:type': 'prov:Organization',
		'prov:label': 'Friedrich Schiller University of Jena',
		'sdo:name': 'Friedrich Schiller University of Jena',
		'wd:P6782': 'https://ror.org/05qpz1x62'
	},
	ORG__WITS: {
		'@id': 'ORG__WITS',
		'prov:type': 'prov:Organization',
		'prov:label': 'University of the Witwatersrand',
		'sdo:name': 'University of the Witwatersrand',
		'wd:P6782': 'https://ror.org/03rp50x72'
	},
	COLLECTION__TIPPECC: {
		'prov:type': 'prov:Collection',
		'sdo:name': 'TIPPECC',
		'sdo:description': 'TIPPECC is a .....'
	},
	COLLECTION__CORDEX_CORE_BIAS: {
		'prov:type': 'prov:Collection',
		'sdo:name': 'CMIP5 (bias adjusted)',
		'sdo:description':
			'CMIP5 is a climate model intercomparison project. This collection contains bias adjusted data.'
	},
	COLLECTION__CORDEX_CORE: {
		'prov:type': 'prov:Collection',
		'sdo:name': 'CORDEX CORE',
		'sdo:description': 'CORDEX is a ....'
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
	},
	COLLECTION__ERA5: {
		'prov:type': 'prov:Collection',
		'sdo:name': 'ERA5',
		'sdo:description': 'ERA5 is a reanalysis dataset.'
	},
	COLLECTION__WARISCO: {
		'prov:type': 'prov:Collection',
		'sdo:name': 'WARISCO',
		'sdo:description': 'WARISCO is a ....'
	},
	COLLECTION__VAAL: {
		'prov:type': 'prov:Collection',
		'sdo:name': 'Vaal',
		'sdo:description': 'Vaal catchment data.'
	},
	COLLECTION__CHIRPS: {
		'prov:type': 'prov:Collection',
		'sdo:name': 'CHIRPS',
		'sdo:description': 'CHIRPS is a ....'
	}
};
