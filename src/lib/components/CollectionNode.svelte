<script>
    import { Handle, Position } from '@xyflow/svelte';

    import { 
    showDetails, 
    handleKeyDown} from '$lib/store';
    
    export let id;
    export let data = {
        id: "",
        type: "",
        description: "",
        collection_name: ""
	}

</script>



<div 
class="p-4 bg-[#FFA500] border-4 border-[#CC8400] rounded-lg shadow-lg mx-auto relative inline-block max-w"
style="z-index: 1;"
role="button"
tabindex="0"
aria-label="Show details"
on:click={() => showDetails(data)}
on:keydown={(event) => handleKeyDown(event, data)}
>

    <!-- Right Handle -->
    <Handle
        type="source"
        position={Position.Right}
        id={`${id}-right`}
        style="background-color: black; width: 10px; height: 10px; border-radius: 50%; position: absolute; right: -10px; top: 50%; transform: translateY(-50%);"
    />

    <!-- Left Handle -->
    <Handle
        type="source"
        position={Position.Right}
        id={`${id}-left`}
        style="background-color: black; width: 10px; height: 10px; border-radius: 50%; position: absolute; right: -10px; top: 50%; transform: translateY(-50%);"
    />

    <!-- Label -->
    <div class="text-center text-lg font-bold text-[#424242] px-2 py-1">{id}</div>
</div>