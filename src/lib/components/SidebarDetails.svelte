<script lang="ts">

    import { detailInfo } from '$lib/store';
    import { onDestroy } from 'svelte';

    export let detailedData: any;
    const unsubscribe = detailInfo.subscribe((data) => {
        detailedData = data;
    });

    onDestroy(() => {
        unsubscribe();  // Clean up the subscription when the component is destroyed
    });

    function copyData() {
        // Format data to copy, you can adjust this string based on what you need
        let dataToCopy = `
Parameter;${detailedData.parameter}
Unit;${detailedData.einheit}
Timespan;${detailedData.zeitspranne.map((t:any) => `${t.start} - ${t.end}`).join(',')}
Regional Model;${detailedData.regionalmodell}
Global Model;${detailedData.globalmodell}
Format;${detailedData.format}
Scenario;${detailedData.szenario}
Temporal Res.;${detailedData.resolutionZeitlich}
Spatial Res.;${detailedData.resolutionRaeumlich}
Spatial Extent;${detailedData.spatialExtent.join(',')}
File Size;${detailedData.dateigroesse}
Timestamp;${detailedData.timestamp}
Project;${detailedData.project}
Experiment;${detailedData.experiment}
Standard;${detailedData.standard}
Bias;${detailedData.bias}
Source;${detailedData.source}
Institution;${detailedData.institution}
Contact;${detailedData.contact}
Domain;${detailedData.domain}
DOI;${detailedData.doi}
DOI_hist;${detailedData.doi_hist}
Collection;${detailedData.collection}
Variant;${detailedData.variant}
Id;${detailedData.id}
`.trim();

        // Use Clipboard API to copy the string
        navigator.clipboard.writeText(dataToCopy)
            .then(() => {
                console.log('Data copied to clipboard');
                alert('Data copied to clipboard!');
            })
            .catch(err => {
                console.error('Failed to copy: ', err);
                alert('Failed to copy data. Please try again.');
            });
    }

    function copyPersonData() {
        // Format data to copy, you can adjust this string based on what you need
        let dataToCopy = `
Person:;${detailedData.person}
ORCID;${detailedData.orcid}
Organisation;${detailedData.orga}
RORID;${detailedData.rorid}
`.trim();

        // Use Clipboard API to copy the string
        navigator.clipboard.writeText(dataToCopy)
            .then(() => {
                console.log('Data copied to clipboard');
                alert('Data copied to clipboard!');
            })
            .catch(err => {
                console.error('Failed to copy: ', err);
                alert('Failed to copy data. Please try again.');
            });
    }

    function copySoftwareData() {
        // Format data to copy, you can adjust this string based on what you need
        let dataToCopy = `
Software;${detailedData.software}
Software_name;${detailedData.software_name}
Version;${detailedData.version}
URL;${detailedData.url}
License;${detailedData.license}
Description;${detailedData.description}
`.trim();

        // Use Clipboard API to copy the string
        navigator.clipboard.writeText(dataToCopy)
            .then(() => {
                console.log('Data copied to clipboard');
                alert('Data copied to clipboard!');
            })
            .catch(err => {
                console.error('Failed to copy: ', err);
                alert('Failed to copy data. Please try again.');
            });
    }



    function copyActivityData() {
        // Format data to copy, you can adjust this string based on what you need
        let dataToCopy = `
Id;${detailedData.id}
StartTime;${detailedData.startTime}
Params;${detailedData.params}
Label;${detailedData.label}
Description;${detailedData.description}
Function;${detailedData.function}
`.trim();

        // Use Clipboard API to copy the string
        navigator.clipboard.writeText(dataToCopy)
            .then(() => {
                console.log('Data copied to clipboard');
                alert('Data copied to clipboard!');
            })
            .catch(err => {
                console.error('Failed to copy: ', err);
                alert('Failed to copy data. Please try again.');
            });
    }


function copyCollectionData() {
        // Format data to copy, you can adjust this string based on what you need
        let dataToCopy = `
Id;${detailedData.id}
Type;${detailedData.type}
Description;${detailedData.description}
Collection_name;${detailedData.collection_name}
`.trim();

        // Use Clipboard API to copy the string
        navigator.clipboard.writeText(dataToCopy)
            .then(() => {
                console.log('Data copied to clipboard');
                alert('Data copied to clipboard!');
            })
            .catch(err => {
                console.error('Failed to copy: ', err);
                alert('Failed to copy data. Please try again.');
            });
    }
</script>

<style>
    .sidebar h2 {
        font-size: 1.24rem;
        margin-bottom: 1rem;
        margin-top: 1rem;
    }

    .table-container {
        display: grid;
        grid-template-columns: auto 2fr;
        gap: 6rem; /* Adjust this gap for more space between columns */
    }

    .table-container td {
        padding: 0.3rem; /* Uniform padding */
    }

    .table-container strong {
        font-weight: bold;
    }

    .info-icon {
    cursor: pointer;
    position: relative;
    margin-left: 5px;  /* Adds a small space between the label and the icon */
    vertical-align: right;  /* Aligns the icon vertically with the label */
    }

    .info-icon i {
        font-size: 1rem;
        margin-left: 0.5rem;
        color: #203c74; /* Adjust the color as needed */
    }

</style>

<div class="sidebar">
    <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css" rel="stylesheet">
    {#if detailedData?.parameter}
        <div class="relative"> <!-- Ensure relative positioning -->
            <button
                on:click={copyData}
                class="bg-gray-200 p-2 rounded-md shadow-md hover:bg-gray-200 mt-4"
                title="Copy to Clipboard"
            >
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-gray-600 hover:text-gray-800" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M14 2H9a2 2 0 00-2 2v12a2 2 0 002 2h6a2 2 0 002-2V4a2 2 0 00-2-2zM9 4h6v12H9V4z" />
                    <path d="M4 6a1 1 0 011-1h3a1 1 0 011 1v3a1 1 0 11-2 0V7H6v2a1 1 0 01-2 0V6z" />
                </svg>
            </button>
            <h2>{""}</h2>
            <div class="triangle absolute left-1/2 -top-2 transform -translate-x-1/2"></div>
            
            <div class="table-container">
                <!-- Table layout with bigger column spacing -->
                <table class="w-full">
                    <tbody>
                        <tr>
                            <td><strong>Parameter</strong></td>
                            <td>
                                {detailedData.parameter}
                            </td>

                        </tr>
                        <tr>
                            <td ><strong>Unit</strong></td>
                            <td >
                                {detailedData.einheit}
                            </td>
                        </tr>
                        <tr>
                            <td ><strong>Timespan</strong></td> 
                            <td >
                                {#each detailedData.zeitspranne as timespan}
                                    <div>{timespan.start} - {timespan.end}</div>
                                {/each}
                            </td>
                        </tr>
                        <tr>
                            <td ><strong>Model (R)</strong></td>
                            <td >
                                {detailedData.regionalmodell}
                                <span class="info-icon" title="A regional climate model simulates climate at a finer resolution for a specific geographical area, providing detailed local climate predictions."> 
                                    <i class="fas fa-info-circle" aria-hidden="true"></i>
                                </span>
                            </td>
                        </tr>
                        <tr>
                            <td ><strong>Model (G)</strong></td>
                            <td >
                                {detailedData.globalmodell}
                                <span class="info-icon" title="A global climate model simulates climate patterns and changes across the entire Earth, typically at a coarser resolution."> 
                                    <i class="fas fa-info-circle" aria-hidden="true"></i>
                                </span>
                            </td>
                        </tr>
                        <tr>
                            <td ><strong>Format</strong></td>
                            <td >
                                {detailedData.format}
                                <span class="info-icon" title="A data format specifies the structure and type of data storage, ensuring compatibility for processing and analysis, such as NetCDF for climate data."> 
                                    <i class="fas fa-info-circle" aria-hidden="true"></i>
                                </span>
                            </td>
                        </tr>
                        <tr>
                            <td ><strong>Scenario</strong></td>
                            <td >
                                {detailedData.szenario}
                                <span class="info-icon" title="A climate scenario represents a set of projected socio-economic pathways used to model future climate conditions, such as SSP-5 for high emissions."> 
                                    <i class="fas fa-info-circle" aria-hidden="true"></i>
                                </span>
                            </td>
                        </tr>
                        <tr>
                            <td ><strong>Variant</strong></td>
                            <td >
                                {detailedData.variant}
                                <span class="info-icon" title="The 'r1i1p1f1' is the control simulation of a CMIP6 model, using standard settings, while other ensemble members are derived from small variations of the control, representing equally valid future climate outcomes influenced by slight changes in initial conditions."> 
                                    <i class="fas fa-info-circle" aria-hidden="true"></i>
                                </span>
                            </td>
                        </tr>
                        <tr>
                            <td ><strong>Temp Res</strong></td>
                            <td >
                                {detailedData.resolutionZeitlich}
                                <span class="info-icon" title="Temporal Resolution (T → Time separator, nS → Second, P - Period) (nM → Minutes, nH → Hours, nD → Days, nW → Weeks, nM → Months, nY → Years)"> 
                                    <i class="fas fa-info-circle" aria-hidden="true"></i>
                                </span>
                            </td>
                        </tr>
                        <tr>
                            <td ><strong>Spat. Res</strong></td>
                            <td >
                                {detailedData.resolutionRaeumlich}
                                <span class="info-icon" title="Spatial resolution for one pixel."> 
                                    <i class="fas fa-info-circle" aria-hidden="true"></i>
                                </span>
                            </td>
                        </tr>
                        <tr>
                            <td ><strong>Sp. Extent</strong></td>
                            <td >
                                {detailedData.spatialExtent.join(', ')}
                                <span class="info-icon" title="LonMin, LonMax, LatMin, LatMax WGS 84"> 
                                    <i class="fas fa-info-circle" aria-hidden="true"></i>
                                </span>
                            </td>
                        </tr>

                        <tr>
                            <td ><strong>File Size</strong></td>
                            <td >
                                {detailedData.dateigroesse}
                                <span class="info-icon" title="File size of dataset."> 
                                    <i class="fas fa-info-circle" aria-hidden="true"></i>
                                </span>
                            </td>
                        </tr>
                        <tr>
                            <td ><strong>Timestamp</strong></td>
                            <td >
                                {detailedData.timestamp}
                                <span class="info-icon" title="Time of dataset generation."> 
                                    <i class="fas fa-info-circle" aria-hidden="true"></i>
                                </span>
                            </td>
                        </tr>
                        <tr>
                            <td ><strong>Project</strong></td>
                            <td >
                                {detailedData.project}
                            </td>
                        </tr>
                        <tr>
                            <td ><strong>Experiment</strong></td>
                            <td >
                                {detailedData.experiment}
                            </td>
                        </tr>
                        <tr>
                            <td ><strong>Standard</strong></td>
                            <td >
                                {detailedData.standard}
                                <span class="info-icon" title="Climate data standards, such as CF (Climate and Forecast) conventions, are defined by the CF community to ensure interoperability and consistent metadata in climate model outputs; they are documented at cfconventions.org."> 
                                    <i class="fas fa-info-circle" aria-hidden="true"></i>
                                </span>
                            </td>
                        </tr>
                        <tr>
                            <td ><strong>Bias</strong></td>
                            <td >
                                {detailedData.bias}
                                <span class="info-icon" title="Bias correction refers to statistical techniques used to adjust model outputs to reduce systematic deviations from observed data, improving the reliability of projections."> 
                                    <i class="fas fa-info-circle" aria-hidden="true"></i>
                                </span>
                            </td>
                        </tr>
                        <tr>
                            <td ><strong>Source</strong></td>
                            <td >
                                {detailedData.source}
                            </td>
                        </tr>
                        <tr>
                            <td ><strong>Institution</strong></td>
                            <td >{detailedData.institution}</td>
                        </tr>

                        <tr>
                            <td ><strong>Contact</strong></td>
                            <td >{detailedData.contact}</td>
                        </tr>
                        <tr>
                            <td ><strong>Domain</strong></td>
                            <td >
                                {detailedData.domain}
                                <span class="info-icon" title="Represents a specific geographic region at defined resolution, used for downscaling global climate model data to finer scales."> 
                                    <i class="fas fa-info-circle" aria-hidden="true"></i>
                                </span>
                            </td>
                        </tr>
                        <tr>
                            <td><strong>DOI</strong></td>
                            <td>
                                {#if detailedData.doi !== "N/A"}
                                    <a
                                        href={detailedData.doi.startsWith('http') ? detailedData.doi : `https://doi.org/${detailedData.doi}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        class="text-blue-600 underline hover:text-blue-800"
                                    >
                                        {detailedData.doi}
                                    </a>
                                {:else}
                                    N/A
                                {/if}
                        
                                {#if detailedData.doi_hist !== "N/A"}
                                        <a
                                            href={detailedData.doi_hist.startsWith('http') ? detailedData.doi_hist : `https://doi.org/${detailedData.doi_hist}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            class="text-blue-600 underline hover:text-blue-800"
                                        >
                                            {detailedData.doi_hist}
                                        </a>
                                {:else}
                                    N/A
                                {/if}
                        
                                {#if detailedData.doi !== "N/A" || detailedData.doi_hist !== "N/A"}
                                    <span
                                        class="info-icon ml-2"
                                        title="A DOI (Digital Object Identifier) is a permanent and unique identifier assigned to digital documents, datasets, or publications to ensure persistent access and citation. It is defined by the International DOI Foundation (IDF) and can be resolved via doi.org."
                                    >
                                        <i class="fas fa-info-circle" aria-hidden="true"></i>
                                    </span>
                                {/if}
                            </td>
                        </tr>
                        
                        <tr>
                            <td ><strong>Collection</strong></td>
                            <td >
                                {detailedData.collection}
                            </td>
                        </tr>
                        <tr>
                            <td ><strong>Id</strong></td>
                            <td >
                                {detailedData.id}
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    {/if}

    {#if detailedData?.person}
        <div class="relative"> <!-- Ensure relative positioning -->
            
            <button
                on:click={copyPersonData}
                class="bg-gray-200 p-2 rounded-md shadow-md hover:bg-gray-200 mt-4"
                title="Copy to Clipboard"
            >
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-gray-600 hover:text-gray-800" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M14 2H9a2 2 0 00-2 2v12a2 2 0 002 2h6a2 2 0 002-2V4a2 2 0 00-2-2zM9 4h6v12H9V4z" />
                    <path d="M4 6a1 1 0 011-1h3a1 1 0 011 1v3a1 1 0 11-2 0V7H6v2a1 1 0 01-2 0V6z" />
                </svg>
            </button>
            <h2>{"Agent Details"}</h2>
            <div class="triangle absolute left-1/2 -top-2 transform -translate-x-1/2"></div>
            
            <div class="table-container">
                <!-- Table layout with adjusted column spacing -->
                <table class="w-full">
                    <tbody>
                        <tr>
                            <td ><strong>Person</strong></td> 
                            <td >{detailedData.person}</td>
                        </tr>
                        <tr>
                            <td ><strong>ORCID</strong></td>
                            <td>
                                {#if detailedData.orcid !== 'N/A'}
                                    <a
                                        href={`https://orcid.org/${detailedData.orcid}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        class="text-blue-600 underline hover:text-blue-800"
                                    >
                                        {detailedData.orcid}
                                    </a>
                                {:else}
                                    <span>{detailedData.orcid}</span>
                                {/if}
                                <span
                                    class="info-icon ml-2"
                                    title="ORCID (Open Researcher and Contributor ID) is a unique identifier assigned to researchers and scholars to distinguish them from others with similar names. It is widely used to track publications, grants, and other academic contributions. ORCID is defined and maintained by the ORCID organization, and researchers can register for a free ORCID iD at orcid.org."
                                >
                                    <i class="fas fa-info-circle" aria-hidden="true"></i>
                                </span>
                            </td>
                        </tr>
                        <tr>
                            <td ><strong>Organisat.</strong></td>
                            <td >
                                {detailedData.orga}
                                <span class="info-icon" title="Organisation"> 
                                    <i class="fas fa-info-circle" aria-hidden="true"></i>
                                </span>
                            </td>
                        </tr>
                        <tr>
                            <td ><strong>RORID</strong></td>
                            <td>
                                <a 
                                    href={detailedData.rorid} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    class="text-blue-600 underline hover:text-blue-800"
                                >
                                    {detailedData.rorid}
                                </a>
                                <span 
                                    class="info-icon" 
                                    title="ROR (Research Organization Registry) is a global registry of unique identifiers for research organizations, such as universities, research institutes, and other entities involved in scholarly activities."
                                >
                                    <i class="fas fa-info-circle" aria-hidden="true"></i>
                                </span>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    {/if}


    {#if detailedData?.software}
        <div class="relative"> <!-- Ensure relative positioning -->
            
            <button
                on:click={copySoftwareData}
                class="bg-gray-200 p-2 rounded-md shadow-md hover:bg-gray-200 mt-4"
                title="Copy to Clipboard"
            >
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-gray-600 hover:text-gray-800" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M14 2H9a2 2 0 00-2 2v12a2 2 0 002 2h6a2 2 0 002-2V4a2 2 0 00-2-2zM9 4h6v12H9V4z" />
                    <path d="M4 6a1 1 0 011-1h3a1 1 0 011 1v3a1 1 0 11-2 0V7H6v2a1 1 0 01-2 0V6z" />
                </svg>
            </button>
            <h2>{"Software Details"}</h2>
            <div class="triangle absolute left-1/2 -top-2 transform -translate-x-1/2"></div>

            <div class="table-container">
                <!-- Table layout with adjusted column spacing -->
                <table class="w-full">
                    <tbody>
                        <tr>
                            <td ><strong>Software</strong></td> 
                            <td >
                                {detailedData.software}
                            </td>
                        </tr>
                        <tr>
                            <td ><strong>Software Name</strong></td>
                            <td >
                                {detailedData.software_name}
                            </td>
                        </tr>
                        <tr>
                            <td ><strong>Version</strong></td>
                            <td >{detailedData.version}</td>
                        </tr>
                        <tr>
                            <td><strong>URL</strong></td>
                            <td>
                                {#if detailedData.url !== "N/A"}
                                    <a href="{detailedData.url}" class="text-blue-600 hover:underline" target="_blank" rel="noopener noreferrer">
                                        {detailedData.url}
                                    </a>
                                {:else}
                                    N/A
                                {/if}
                            </td>
                        </tr>
                        <tr>
                            <td ><strong>License</strong></td>
                            <td >{detailedData.license}</td>
                        </tr>
                        <tr>
                            <td ><strong>Description</strong></td>
                            <td >{detailedData.description}</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    {/if}


    {#if detailedData?.params}
        <div class="relative"> <!-- Ensure relative positioning -->
            
            <button
                on:click={copyActivityData}
                class="bg-gray-200 p-2 rounded-md shadow-md hover:bg-gray-200 mt-4"
                title="Copy to Clipboard"
            >
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-gray-600 hover:text-gray-800" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M14 2H9a2 2 0 00-2 2v12a2 2 0 002 2h6a2 2 0 002-2V4a2 2 0 00-2-2zM9 4h6v12H9V4z" />
                    <path d="M4 6a1 1 0 011-1h3a1 1 0 011 1v3a1 1 0 11-2 0V7H6v2a1 1 0 01-2 0V6z" />
                </svg>
            </button>
            <h2>{"Activity Details"}</h2>
            <div class="triangle absolute left-1/2 -top-2 transform -translate-x-1/2"></div>
            
            <div class="table-container">
                <!-- Table layout with adjusted column spacing -->
                <table class="w-full">
                    <tbody>
                        <tr>
                            <td ><strong>Id</strong></td> 
                            <td >
                                {detailedData.id}
                            </td>
                        </tr>
                        <tr>
                            <td ><strong>StartTime</strong></td>
                            <td >
                                {detailedData.startTime}
                            </td>
                        </tr>
                        <tr>
                            <td ><strong>Parameter</strong></td>
                            <td >{detailedData.params}</td>
                        </tr>
                        <tr>
                            <td ><strong>Label</strong></td>
                            <td >{detailedData.label}</td>
                        </tr>

                        <tr>
                            <td ><strong>Description</strong></td>
                            <td >{detailedData.description}</td>
                        </tr>

                        <tr>
                            <td ><strong>Function</strong></td>
                            <td >{detailedData.function}</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    {/if}



    {#if detailedData?.collection_name}
        <div class="relative"> <!-- Ensure relative positioning -->
            
            <button
                on:click={copyCollectionData}
                class="bg-gray-200 p-2 rounded-md shadow-md hover:bg-gray-200 mt-4"
                title="Copy to Clipboard"
            >
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-gray-600 hover:text-gray-800" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M14 2H9a2 2 0 00-2 2v12a2 2 0 002 2h6a2 2 0 002-2V4a2 2 0 00-2-2zM9 4h6v12H9V4z" />
                    <path d="M4 6a1 1 0 011-1h3a1 1 0 011 1v3a1 1 0 11-2 0V7H6v2a1 1 0 01-2 0V6z" />
                </svg>
            </button>
            <h2>{"Collection Details"}</h2>
            <div class="triangle absolute left-1/2 -top-2 transform -translate-x-1/2"></div>
            
            <div class="table-container">
                <!-- Table layout with adjusted column spacing -->
                <table class="w-full">
                    <tbody>
                        <tr>
                            <td ><strong>Id</strong></td> 
                            <td >
                                {detailedData.id}
                            </td>
                        </tr>
                        <tr>
                            <td ><strong>Collection Name</strong></td>
                            <td >
                                {detailedData.collection_name}
                            </td>
                        </tr>
                        <tr>
                            <td ><strong>Type</strong></td>
                            <td >{detailedData.type}</td>
                        </tr>
                        <tr>
                            <td ><strong>Description</strong></td>
                            <td >{detailedData.description}</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    {/if}


</div>