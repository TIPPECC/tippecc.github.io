<script>
	export let data = null;
	export let only_links = false;
	export let in_main_page = true;

	/**
	 * An entry from the input data
	 * @typedef {object}  DataItem
	 * @property  {object}        [collection_id]
	 * @property  {string}        collection_id.value
	 * @property  {object}        entity
	 * @property  {string}        entity.value
	 * @property  {string}        entity.value_display
	 *
	 */
	/**
	 * An entry within the hierarchy to display
	 * @typedef {object} DisplayEntry
	 * @property {boolean}          details     expand the tree below this entry?
	 * @property {DataItem}         item        the item corresponding to this node in the hierarchy
	 * @property {Array<DataItem>}  children    items below this one
	 */

	// split entity name and sort by name
	/** @type {Array<DataItem>} */
	const sortedData = data?.['results']?.['bindings']
		?.filter((item) => item.entity && (!only_links || item.collection_id)) // remove entries, we can not create a link for if requested
		?.sort((a, b) => {
			if (!b.entity || !b.entity.value) {
				return 1; // Move to the end if no value
			}
			if (!a.entity || !a.entity.value) {
				return 1; // Move to the end if no value
			}
			const nameA = a.entity.value.split('/').pop().toLowerCase();
			const nameB = b.entity.value.split('/').pop().toLowerCase();
			return nameA.localeCompare(nameB);
		});

	/**
	 * across a list of strings, find the largest common prefix
	 * @param {Array<string>} strings
	 */
	function findCommonPrefix(strings) {
		if (!strings || strings.length === 0) {
			return '';
		}

		let prefix = strings[0];

		for (let i = 1; i < strings.length; i++) {
			let j = 0;
			while (j < prefix.length && j < strings[i].length && prefix[j] === strings[i][j]) {
				j++;
			}
			prefix = prefix.substring(0, j);
			if (prefix === '') {
				break; // No common prefix found
			}
		}

		return prefix;
	}

	// if common prefix is not empty, remove it from the shown entity value
	const commonPrefix = findCommonPrefix(sortedData?.map((item) => item.entity?.value || ''));
	sortedData?.forEach((item) => {
		item.entity.value_display =
			item.entity && item.entity.value.startsWith(commonPrefix)
				? item.entity.value.replace(commonPrefix, '')
				: item.entity.value;
	});

	// structure output
	/** @type {Array<DisplayEntry>} */
	const hierarchy = [];
	/** @type {DisplayEntry} */
	let parent = {
		details: false,
		item: { entity: { value: '', value_display: '------------' } },
		children: []
	}; // current parent entry to consider
	for (const item of sortedData ?? []) {
		if (!item.entity.value_display?.startsWith(parent.item?.entity.value_display)) {
			// we have a new parent
			parent = {
				details: false,
				item,
				children: []
			};
			hierarchy.push(parent);
		} else {
			// we have a child of the current parent

			// add to collection
			parent.children.push(item);

			// adjust label if possible
			if (parent.item) {
				item.entity.value_display = item.entity.value_display.replace(
					parent.item.entity.value_display,
					''
				);
			}
		}
	}

	// get url path
	const url = window.location.href;
	const urlParts = url.split(/\/|\?|&/);
	const urlPath = urlParts[1];
</script>

<div class="ml-2">
	{#if commonPrefix}
		<p class="text-sm mb-2">
			<span class="font-bold">{commonPrefix.split('/').slice(-1)[0]}</span>
		</p>
	{/if}

	<ul>
		{#each hierarchy as parent}
			{#if parent.children.length < 1}
				{#if parent.item.collection_id}
					<li class="underline">
						<a
							href="{urlPath}?type={parent.item.collection_id.value}&filename={parent.item.entity
								.value}.nc"
							target="_self">{parent.item.entity.value_display}</a
						>
					</li>
				{:else}
					<li>{parent.item.entity.value_display}</li>
				{/if}
			{:else}
				<li>
					<button
						class="flex items-center cursor-pointer"
						on:click={() => {
							parent.details = !parent.details;
						}}
					>
						<span class="font-bold">
							{parent.item.entity.value_display}
						</span>
						<span class="ml-2 text-sm text-gray-500">
							({parent.children.length}
							{parent.children.length > 1 ? 'children' : 'child'})
						</span>
					</button>

					{#if parent.details}
						<ul>
							{#if parent.item}
								{#if parent.item.collection_id}
									<li class="underline ml-4">
										<a
											href="{urlPath}?type={parent.item.collection_id.value}&filename={parent.item
												.entity.value}.nc"
											target="_self">{parent.item.entity.value_display}</a
										>
									</li>
								{:else}
									<li>{parent.item.entity.value_display}</li>
								{/if}
							{/if}

							{#each parent.children as child}
								{#if child.collection_id}
									<li class="underline ml-8">
										<a
											href="{urlPath}?type={child.collection_id.value}&filename={child.entity
												.value}.nc"
											target="_self">{child.entity.value_display}</a
										>
									</li>
								{:else}
									<li>{child.entity.value_display}</li>
								{/if}
							{/each}
						</ul>
					{/if}
				</li>
			{/if}
		{/each}
	</ul>
</div>
