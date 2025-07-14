<script lang="ts">
    import { detailInfo } from '$lib/store';
    import { onDestroy } from 'svelte';
    import SidebarDetails from './SidebarDetails.svelte';
    import SidebarLegend from './SidebarLegend.svelte';
    import SidebarExplanation from './SidebarExplanation.svelte';

    let detailedData;
    let activeTab = 'details'; // Default active tab
    const unsubscribe = detailInfo.subscribe((data) => {
        detailedData = data;

        // Automatically switch to the Details tab when detailInfo changes
        if (data) {
            activeTab = 'details';
        }
    });

    onDestroy(() => {
        unsubscribe();  // Clean up the subscription when the component is destroyed
    });


    function setActiveTab(tab) {
        console.log('Switching to tab:', tab); // Debug log
        activeTab = tab;
    }
</script>

<style>

    .tab-navigation {
        display: flex;
        justify-content: left;  /* Distributes buttons evenly */
        width: 95%;  /* Ensures it spans the full sidebar width */
        gap: 20px
    }

    .sidebar {
        width: 440px;
        background: #ffffff;
        border-left: 1px solid #ddd;
        padding: 16px;
        overflow-y: auto;
        box-shadow: -2px 0 4px rgba(0, 0, 0, 0.1);
        color: #000;
        font-size: 16px;
        position: fixed; /* Fix the sidebar on the right */
        right: 0; /* Attach to the right edge */
        top: 0; /* Align it to the top */
        bottom: 0; /* Extend it to the bottom */
        z-index: 1000; /* Ensure it stays above other elements */
    }

    .sidebar h2 {
        font-size: 1.24rem;
        margin-bottom: 1rem;
    }

    .sidebar ul {
        list-style: none;
        padding: 0;
    }

    .sidebar li {
        margin-bottom: 0.4rem;
    }

    .tab-button {
        padding: 10px 20px;
        font-size: 16px;
        background-color: rgb(194, 194, 194);
        border: 1px solid #ccc;
        border-radius: 5px;
        cursor: pointer !important;;
        transition: background-color 0.2s, color 0.2s;
        color: black;
        pointer-events: auto;
        z-index: 20;
    }

    .tab-button:hover {
        background-color: #203c74;
        color: white;
        cursor: pointer !important;
    }

    .tab-button.active {
        background-color: #203c74 !important; /* Keep the active button blue */
        color: white;
    }

</style>

<div class="sidebar">
    <div class="tab-navigation">
        <button
            class="tab-button"
            class:active={activeTab === 'details'}
            on:click={() => setActiveTab('details')}>
            Details
        </button>
        <button
            class="tab-button"
            class:active={activeTab === 'legend'}
            on:click={() => setActiveTab('legend')}>
            Legend
        </button>
        <button
            class="tab-button"
            class:active={activeTab === 'explanation'}
            on:click={() => setActiveTab('explanation')}>
            Explanation
        </button>
    </div>

    {#if activeTab === 'details'}
        <SidebarDetails {detailedData} />
    {:else if activeTab === 'legend'}
        <SidebarLegend />
    {:else if activeTab === 'explanation'}
        <SidebarExplanation />
    {/if}
</div>