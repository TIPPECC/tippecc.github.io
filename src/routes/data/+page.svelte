<script>
	import { readable } from 'svelte/store';
	import { createTable, Subscribe, Render, createRender } from 'svelte-headless-table';
	import {
		addTableFilter,
		addGroupBy,
		addExpandedRows,
		addColumnOrder
	} from 'svelte-headless-table/plugins';
	import Expand from './Expand.svelte';

	const getDistinct = (/** @type {Iterable<any> | null | undefined} */ items) => {
		return Array.from(new Set(items));
	};

	const data = readable([
		{ global_model: 'GERICS-REMO2015', age: 21 },
		{ global_model: 'GERICS-REMO2015', age: 52 },
		{ global_model: 'GERICS-REMO2015', age: 38 }
	]);

	const table = createTable(data, {
		tableFilter: addTableFilter(),
		group: addGroupBy(),
		expand: addExpandedRows(),
		colOrder: addColumnOrder()
	});

	const columns = table.createColumns([
		table.display({
			id: 'expanded',
			header: '',
			cell: ({ row }, { pluginStates }) => {
				const { isExpanded, canExpand, isAllSubRowsExpanded } =
					pluginStates.expand.getRowState(row);
				return createRender(Expand, {
					depth: row.depth,
					isExpanded,
					canExpand,
					isAllSubRowsExpanded
				});
			}
		}),
		table.column({
			header: 'Global Model',
			accessor: 'global_model',
			plugins: {
				group: {
					getAggregateValue: (values) => getDistinct(values).length,
					cell: ({ value }) => `${value} unique`
				}
			}
		}),
		table.column({
			header: 'Age',
			accessor: 'age',
			plugins: {
				group: {
					getAggregateValue: (values) => getDistinct(values).length,
					cell: ({ value }) => `${value} unique`
				}
			}
		})
	]);

	const { headerRows, rows, tableAttrs, tableBodyAttrs, pluginStates } =
		table.createViewModel(columns);
	const { filterValue } = pluginStates.tableFilter;
</script>

<input type="text" bind:value={$filterValue} placeholder="Search rows..." class="input w-60" />
<table {...$tableAttrs} class="table">
	<thead>
		{#each $headerRows as headerRow (headerRow.id)}
			<Subscribe rowAttrs={headerRow.attrs()} let:rowAttrs>
				<tr {...rowAttrs}>
					{#each headerRow.cells as cell (cell.id)}
						<Subscribe attrs={cell.attrs()} let:attrs props={cell.props()} let:props>
							<th {...attrs}>
								<Render of={cell.render()} />
								{#if !props.group.disabled}
									<button on:click={props.group.toggle} class="demo">
										{#if props.group.grouped}
											ungroup
										{:else}
											group
										{/if}
									</button>
								{/if}
							</th>
						</Subscribe>
					{/each}
				</tr>
			</Subscribe>
		{/each}
	</thead>
	<tbody {...$tableBodyAttrs}>
		{#each $rows as row (row.id)}
			<Subscribe rowAttrs={row.attrs()} let:rowAttrs>
				<tr {...rowAttrs} class="table-row">
					{#each row.cells as cell (cell.id)}
						<Subscribe attrs={cell.attrs()} let:attrs>
							<td {...attrs} class="table-cell">
								<Render of={cell.render()} />
							</td>
						</Subscribe>
					{/each}
				</tr>
			</Subscribe>
		{/each}
	</tbody>
</table>

<style>
	th,
	td {
		border-bottom: 1px solid black;
		border-right: 1px solid black;
		padding: 0.5rem;
	}
</style>
