export function buildPrimaryNavigation(primaryItems) {
	const itemsById = new Map();
	const itemsByColumn = new Map();

	primaryItems.forEach((item) => {
		itemsById.set(item.id, item);
		const items = itemsByColumn.get(item.columnIndex) ?? [];
		items.push(item);
		itemsByColumn.set(item.columnIndex, items);
	});

	itemsByColumn.forEach((items, columnIndex) => {
		itemsByColumn.set(
			columnIndex,
			[...items].sort((a, b) => a.rowIndex - b.rowIndex)
		);
	});

	const columnIndexes = [...itemsByColumn.keys()].sort((a, b) => a - b);
	return { itemsById, itemsByColumn, columnIndexes };
}

function getClosestItemInColumn(itemsByColumn, columnIndex, targetRowIndex) {
	const columnItems = itemsByColumn.get(columnIndex) ?? [];
	if (columnItems.length === 0) return null;

	let nearest = columnItems[0];
	let nearestDistance = Math.abs(columnItems[0].rowIndex - targetRowIndex);

	for (let i = 1; i < columnItems.length; i += 1) {
		const candidate = columnItems[i];
		const distance = Math.abs(candidate.rowIndex - targetRowIndex);
		if (distance < nearestDistance) {
			nearest = candidate;
			nearestDistance = distance;
		}
	}

	return nearest;
}

export function getNextPrimaryFocusId({ key, resolvedFocusedId, primaryItems, navigation }) {
	if (primaryItems.length === 0) return null;

	const current = navigation.itemsById.get(resolvedFocusedId) ?? primaryItems[0] ?? null;
	if (!current) return null;

	const currentColumnItems = navigation.itemsByColumn.get(current.columnIndex) ?? [];
	const currentIndexInColumn = currentColumnItems.findIndex((item) => item.id === current.id);

	let nextItem = null;

	if (key === 'ArrowUp') {
		nextItem = currentColumnItems[Math.min(currentColumnItems.length - 1, currentIndexInColumn + 1)] ?? current;
	} else if (key === 'ArrowDown') {
		nextItem = currentColumnItems[Math.max(0, currentIndexInColumn - 1)] ?? current;
	} else if (key === 'ArrowLeft' || key === 'ArrowRight') {
		const direction = key === 'ArrowRight' ? 1 : -1;
		const currentColumnOrder = navigation.columnIndexes.findIndex((column) => column === current.columnIndex);
		const targetColumn = navigation.columnIndexes[currentColumnOrder + direction] ?? null;
		if (targetColumn != null) {
			nextItem = getClosestItemInColumn(navigation.itemsByColumn, targetColumn, current.rowIndex);
		}
	}

	return nextItem?.id ?? current.id;
}
