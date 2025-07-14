<script>
    import { Handle, Position } from '@xyflow/svelte';

    export let id;

    export let data = {
        person: 'Franziska',
        orcid: '0000-0001-6892-7046',
        orga: 'Uni Jena',
        rorid: 'XXX-XXX-XXX-XXX'
    };

    import { showDetails, handleKeyDown } from '$lib/store';

</script>

<div 
    class="bg-[#FFF9E5] border-4 border-[#E8CC71] rounded-lg shadow-lg relative inline-block p-4" 
    style="z-index: 1;"
    role="button"
    tabindex="0"
    aria-label="Show details"
    on:click={() => showDetails(data)}
    on:keydown={(event) => handleKeyDown(event, data)}
>

    <!-- Left Handle -->
    <Handle
        type="target"
        position={Position.Left}
        id={`${id}-left`}
        style="background-color: black; width: 10px; height: 10px; border-radius: 50%; position: absolute; left: -10px; top: 50%; transform: translateY(-50%);"
    />

    <!-- Right Handle -->
    <Handle
        type="source"
        position={Position.Right}
        id={`${id}-right`}
        style="background-color: black; width: 10px; height: 10px; border-radius: 50%; position: absolute; right: -10px; top: 50%; transform: translateY(-50%);"
    />

    <!-- Left Side: Person and Organisation -->
    <div class="text-[#424242] text-center text-lg font-bold text-black px-2 py-1">{id}</div>
    

    
</div>
