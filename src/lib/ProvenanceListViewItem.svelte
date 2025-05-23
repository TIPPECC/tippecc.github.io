<script>
	export let nodes;
	export let urlPath;
	export let globalPrefix;

	for (const node of nodes) {
		// set initial state for details (1 or 2 items are always expanded)
		if (node.itemCount <= 2 || node.items.length == 1) {
			node.details = true;
		} else {
			node.details = false;
		}
		// ensure that items are sorted by entity value
		// node.items.sort((a, b) => a.entity.value_remainder.localeCompare(b.entity.value_remainder));
	}
</script>

<ul class="ml-10 list-disc">
	{#each nodes as node}
		<li class="text-left">
			<!-- toggle for sub-trie-->
			{#if node.itemCount > 0}
				<button
					class="flex items-center cursor-pointer"
					on:click={() => {
						node.details = !node.details;
					}}
				>
					<span class="font-bold">
						{node.prefix.length > 2 && node.items.length != 1 ? node.prefix : '[...]'}
					</span>
					<span class="ml-2 text-sm text-gray-500">
						({node.itemCount}
						{node.itemCount > 1 ? 'children' : 'child'})
					</span>
				</button>
			{/if}

			{#if node.details}
				<!-- display items-->
				{#if node.items.length > 0}
					<ul class="ml-4 mb-4">
						{#each node.items as item}
							{#if item.collection_id}
								<li class="underline">
									<a
										href="{urlPath}?type={item.collection_id.value}&filename={item.entity.value
											.split('/')
											.slice(-1)[0]}.nc"
										title="View file in collection view ({item.entity.value
											.split('/')
											.slice(-1)[0]}.nc)"
										target="_self"
									>
										{#if node.prefix.length == 0 && item.entity.value_remainder.length == 0}
											{item.entity.value.split('/').pop()}
										{:else}
											{node.prefix}{item.entity.value_remainder}
										{/if}
									</a>
								</li>
							{:else}
								<li>
									<span title={item.entity.value.split('/').slice(-1)[0]}>
										{#if node.prefix.length == 0 && item.entity.value_remainder.length == 0}
											{item.entity.value.split('/').pop()}
										{:else}
											{node.prefix}{item.entity.value_remainder}
										{/if}
									</span
									>
								</li>
							{/if}
						{/each}
					</ul>
				{/if}

				<!-- further children, if existing -->
				{#if node.children.length > 0}
					<svelte:self nodes={node.children} {urlPath} />
				{/if}
			{/if}
		</li>
	{/each}
</ul>
