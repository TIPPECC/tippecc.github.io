<script>
    export let data;
    import {keyList} from '$lib/tempresults/provenanceKeys.js';
    import ProvenanceHover from './ProvenanceHover.svelte';

    /**
	 * @param {any} json
	 */
	function stringifyJSON(json) {
		return JSON.stringify(json, null, 2); // Pretty print with 2 spaces
	}


   
</script>
<ol class="list-decimal ml-6 space-y-4">
    {#each data.processing as step}
        <li class="[&::marker]">
        {#if step.label}
            <span class="font-bold text-label"><ProvenanceHover value = {step.label}/></span>
            {#if step.description}
                – <ProvenanceHover value = {step.description}/><br />
            {/if}
        {/if}
        {#if step.function}
            <span class="font-bold text-label">Function:</span> <ProvenanceHover value = {step.function}/><br />
        {/if}

        {#if step.software}
            <span class="font-bold text-label">Software:</span> <ProvenanceHover value = {step.software}/><br />
        {/if}

        {#if step.function_call}
            <span class="font-bold text-label">Function Call:</span> <code class="px-1 rounded"><ProvenanceHover value = {step.function_call} /></code><br />
        {/if}

        {#if step.execution_time}
            <span class="font-bold text-label">Executed On:</span> <ProvenanceHover value = {step.execution_time}/><br />
        {/if}

        {#if step.executed_by}
            <span class="font-bold text-label">Executed By:</span> 
                <ProvenanceHover value = {step.executed_by}/>
            {#if step.on_behalf_of}
                on behalf of
                    <ProvenanceHover value = {step.on_behalf_of}/>
            {/if}
            <br />
        {/if}
        {#if step.params}
        <details class="mt-2 ml-2">
            <summary class="cursor-pointer font-bold text-label">Parameters</summary>
            <ul class="list-disc ml-6 mt-1">
            {#each Object.entries(step.params) as [key, value]}
                <li><span class="font-medium">{key}:</span> {value}</li>
            {/each}
            </ul>
        </details>
        {/if}
        </li>
    <br/>
    {/each}
    <hr class="my-6 border-t border-gray-300" />
    <br/>
    <span class="font-bold text-label">Collections</span>
    <ul class="list-disc ml-6 mt-1">
        {#each data.collection as item}
            <li><ProvenanceHover value = {item}/></li>
        {/each}
    </ul>
    <br/>
    <span class="font-bold text-label">Input Files</span>
    <ul class="list-disc ml-6 mt-1">
    {#each data.input_files as file}
        <li><ProvenanceHover value = {file}/></li>
    {/each}
    </ul>
    <br/>
    <span class="font-bold text-label">Output File</span>
    <ul class="list-disc ml-6 mt-1">
        <li><ProvenanceHover value = {data.output_file}/></li>
    </ul>
    <br/>
    
    <span class="font-bold text-label">Comment:</span>
    {#if data._comment}
        <em>{data._comment}</em>
    {/if}
</ol>


<style>
	.text-label {
		color: #60a5fa; 
	}
    li::marker {
        font-weight: bold;
        font-size: 1.25rem; /* text-lg */
    }
</style>