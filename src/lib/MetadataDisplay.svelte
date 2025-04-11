<script>
    import { onMount } from 'svelte';
	import RecursiveDisplay from '$lib/RecursiveDisplay.svelte';
    export let data;

    const excludedKeys = ['file'];

    // Die neuen Objekte
    let filteredData = {};
    let excludedData = {};

    onMount(() => {
        if (typeof data === 'object' && !Array.isArray(data) && data !== null){
            for (const [key, value] of Object.entries(data)) {
                if (excludedKeys.includes(key)) {
                    excludedData[key] = value;
                } else {
                    filteredData[key] = value;
                }
            }
        }
        else if(data !== null){
            filteredData = data;
        }
        console.log(filteredData)
    });

</script>


{#if typeof excludedData === 'object' && !Array.isArray(data) && data !== null}
	{#each Object.entries(excludedData) as [key, value]}
		{#if key == 'file'}
			<div
                class="ml-4 collapsible flex"
				role="button"
				tabindex="0"
            >
                <b>format: &nbsp;</b>{value['file_format']} &nbsp;
                <b>file size: &nbsp;</b>{value['file_size']} Byte &nbsp;
                <b>created: &nbsp;</b>{value['birth_time']} &nbsp;
                <b>modified: &nbsp;</b>{value['last_modification_time']} 
			</div>
		{/if}
	{/each}
{/if}
<RecursiveDisplay data={filteredData} />

