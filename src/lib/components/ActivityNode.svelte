<script lang="ts">
    import { Handle, Position } from '@xyflow/svelte';
    import { showDetails, handleKeyDown } from '$lib/store';

    export let id;

    export let data = {
        id: "",
        startTime: "",
        params: "",
        label: "",
        description: "",
        function: ""
    }
    
    function extractBaseString(input: string): string {
        const match = input.match(/^(.*?)(?:_\d+)?$/);
        return match ? match[1] : input;
    }

    const id_new = extractBaseString(id);

</script>

<div 
    class="bg-[#90CAF9] rounded-lg shadow-lg relative inline-block" 
    style="z-index: 1;"
    role="button"
    tabindex="0"
    aria-label="Show details"
    on:click={() => showDetails(data)}
    on:keydown={(event) => handleKeyDown(event, data)}
>
    <!-- Top Handle -->
    <Handle
        type="target"
        position={Position.Top}
        id={`${id}-top`}
        style="background-color: black; width: 10px; height: 10px; border-radius: 50%; position: absolute; top: -10px; left: 50%; transform: translateX(-50%);"
    />

    <!-- Bottom Handle -->
    <Handle
        type="source"
        position={Position.Bottom}
        id={`${id}-bottom`}
        style="background-color: black; width: 10px; height: 10px; border-radius: 50%; position: absolute; bottom: -10px; left: 50%; transform: translateX(-50%);"
    />

        <!-- Top Handle -->
        <Handle
        type="source"
        position={Position.Top}
        id={`${id}-top`}
        style="background-color: black; width: 10px; height: 10px; border-radius: 50%; position: absolute; top: -10px; left: 50%; transform: translateX(-50%);"
    />

    <!-- Bottom Handle -->
    <Handle
        type="target"
        position={Position.Bottom}
        id={`${id}-bottom`}
        style="background-color: black; width: 10px; height: 10px; border-radius: 50%; position: absolute; bottom: -10px; left: 50%; transform: translateX(-50%);"
    />

    <!-- Left Handle -->
    <Handle
        type="source"
        position={Position.Left}
        id={`${id}-left`}
        style="background-color: black; width: 10px; height: 10px; border-radius: 50%; position: absolute; left: -10px; top: 50%; transform: translateY(-50%);"
    />

    <!-- Right Handle -->
    <Handle
        type="target"
        position={Position.Right}
        id={`${id}-right`}
        style="background-color: black; width: 10px; height: 10px; border-radius: 50%; position: absolute; right: -10px; top: 50%; transform: translateY(-50%);"
    />

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

    <!-- Display Main Information with exact background size -->
    <div class="bg-[#E9F5FB] text-[#424242] border-4 border-[#88BCE4] font-bold px-4 py-2 rounded-md text-lg inline-block">
        {id_new}
    </div>
</div>
