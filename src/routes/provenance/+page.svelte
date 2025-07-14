<script>
    import { writable } from 'svelte/store';
    import TopBar from '$lib/components/TopBar.svelte';
    import DetailView from '$lib/components/DetailView.svelte';
    import MinimalView from '$lib/components/MinimalView.svelte';
    import CollectionView from '$lib/components/CollectionView.svelte';

    let activeView = writable("View 1"); // Track the active view
</script>

<TopBar {activeView} />

{#if $activeView === "View 1"}
    <MinimalView />
{:else if $activeView === "View 2"}
    <DetailView />
{:else if $activeView === "View 3"}
    <CollectionView />
{/if}
