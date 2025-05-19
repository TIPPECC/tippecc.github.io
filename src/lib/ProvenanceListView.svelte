<script>
	import ProvenanceListViewItem from './ProvenanceListViewItem.svelte';

	export let data = null;
	export let only_links = false;
	export let in_main_page = true;
	export let min_prefix_length = 10;

	/**
	 * An entry from the input data
	 * @typedef {object}  DataItem
	 * @property  {object}        [collection_id]
	 * @property  {string}        collection_id.value
	 * @property  {object}        entity
	 * @property  {string}        entity.value
	 * @property  {string}        entity.value_display
	 * @property  {string}        entity.value_remainder
	 *
	 */
	/**
	 * An entry within the trie to display
	 * @typedef {object} TrieNode
	 * @property {boolean}          details     expand the tree below this node?
	 * @property {string}           prefix      prefix belonging to this node
	 * @property {Array<TrieNode>}  children    child nodes in the trie
	 * @property {Array<DataItem>}  items       items assigned to this node
	 * @property {number}           itemCount   total item count in the sub-trie rooted in this node
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
	 * get the common prefix of two strings
	 * @param {string} a
	 * @param {string} b
	 */
	function getCommonPrefix(a, b) {
		// find common prefix
		for (let i = 0; i < Math.min(a.length, b.length); i++) {
			if (a[i] != b[i]) {
				return a.slice(0, i);
			}
		}
		// if we got here, the smaller string is included within the larger one
		return a.length < b.length ? a : b;
	}

	/**
	 * build a trie out of the items being passed on
	 *
	 * @param   {Array<DataItem>} items
	 * @returns {Array<TrieNode>}
	 */
	function buildTrie(items) {
		// list has only one item, no trie to build
		if (items.length < 2) {
			return [
				{
					details: false,
					prefix: '',
					children: [],
					items: items,
					itemCount: items.length
				}
			];
		}

		// collect items with shared prefixes
		const /** @type {Array<TrieNode>} */ result = [];
		let collectedItems = [items[0]];
		let collectedPrefix = items[0].entity.value_remainder;
		for (let i = 1; i < items.length; i++) {
			// get the prefix between this and the previous node
			const prefix = getCommonPrefix(
				items[i - 1].entity.value_remainder,
				items[i].entity.value_remainder
			);

			if (prefix && prefix.length >= min_prefix_length) {
				// still sharing a prefix, keep on collecting
				collectedItems.push(items[i]);
				collectedPrefix = prefix.length < collectedPrefix.length ? prefix : collectedPrefix;
			} else {
				// no shared prefix? -> we finished a group

				// remove the prefix from the remaining labels
				for (const item of collectedItems) {
					item.entity.value_remainder = item.entity.value_remainder.replace(collectedPrefix, '');
				}

				// keep the result so far
				result.push({
					details: false,
					prefix: collectedPrefix,
					children: [],
					items: collectedItems,
					itemCount: collectedItems.length
				});

				// start next group
				collectedItems = [items[i]];
				collectedPrefix = items[i].entity.value_remainder;
			}
		}

		// append last group
		result.push({
			details: false,
			prefix: collectedPrefix,
			children: [],
			items: collectedItems,
			itemCount: collectedItems.length
		});
		for (const item of collectedItems) {
			item.entity.value_remainder = item.entity.value_remainder.replace(collectedPrefix, '');
		}

		// apply recursion
		for (const node of result) {
			// if there's more than one item
			if (node.items.length > 1) {
				// try to split
				node.children = buildTrie(node.items);

				// remove any sub-node with only one item and assign the items to this node
				// @TODO easier way for this?
				node.items = node.children
					.filter((c) => c.items.length < 2 && c.children.length < 1)
					.flatMap((c) => {
						for (const item of c.items) {
							// re-assign the removed prefix
							item.entity.value_remainder = c.prefix + item.entity.value_remainder;
						}
						return c.items;
					});
				node.children = node.children.filter((c) => c.items.length > 1 || c.children.length > 0);
			}
		}

		// done
		return result;
	}

	let /** @type {Array<TrieNode>} */ trie, /** @type {string} */ globalPrefix;
	if (sortedData.length > 0) {
		// get the global prefix
		// as the list is sorted, this equals the common prefix between first and last item
		globalPrefix = getCommonPrefix(
			sortedData[0].entity.value,
			sortedData[sortedData.length - 1].entity.value
		);

		// remove global prefix from all entries
		for (const item of sortedData) {
			item.entity.value_remainder = item.entity.value.replace(globalPrefix, '');
		}

		// build a trie out of the list of entities
		trie = buildTrie(sortedData);
	}

	// get url path
	const url = window.location.href;
	const urlParts = url.split(/\/|\?|&/);
	const urlPath = urlParts[1];
</script>

<div class="ml-2">
	{#if globalPrefix}
		<p class="text-sm mb-2">
			<span class="font-bold"
				>{globalPrefix.split('/').slice(-1)[0]}{globalPrefix.split('/').slice(-1)[0]
					? '[...]'
					: ''}</span
			>
		</p>
	{/if}

	{#if trie && trie.length > 0}
		<ProvenanceListViewItem nodes={trie} {urlPath} />
	{/if}
</div>
