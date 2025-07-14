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
    //let showBubble = false;


</script>

<!-- Updated with role and keyboard event handling -->
<div
    class="bg-[#FFE082] rounded-lg shadow-lg relative inline-block p-4 cursor-pointer"
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
        position={Position.Left}
        id={`${id}-left`}
        style="background-color: black; width: 10px; height: 10px; border-radius: 50%; position: absolute; right: -10px; top: 50%; transform: translateY(-50%);"
    />

    <!-- Person and ORCID Information -->
    <div class="flex flex-col space-y-3 w-full">
        <!-- Person and Organisation -->
        <div class="flex space-x-2 w-full">
            <!-- Person Chip -->
            <div class="bg-[#FFF9E5] text-[#424242] border border-[#E8CC71] font-bold px-4 py-2 rounded-md text-lg flex-grow text-center hover:bg-white transition-colors duration-200">
                {data.person}
            </div>
            <!-- Organisation Chip -->
            <div class="bg-[#FFF9E5] text-[#424242] border border-[#E8CC71] font-bold px-4 py-2 rounded-md text-lg flex-grow text-center hover:bg-white transition-colors duration-200">
                {data.orga}
            </div>
        </div>
    </div>
</div>
