import type { GridPosition, HeldItem, LevelDefinition, VariableRef } from './types';
import { resolveItemDefinition } from './utils';

export type RuntimeInventory = Readonly<{
	heldItem: HeldItem | null;
	vehicle: HeldItem | null;
}>;

export type ResolvedRuntimeTile = Readonly<{
	type: 'floor' | 'wall' | 'water' | 'hazard' | 'ice';
	passableBy?: string;
	onEnter?: 'kill' | 'slide' | 'damage' | 'none';
}>;

export function resolveHeldValue(
	level: LevelDefinition,
	heldItem: HeldItem | null,
	value: number | VariableRef | undefined
): number | undefined {
	if (value === undefined) return undefined;
	if (typeof value === 'number') return value;
	if (value.type === 'variable' && value.variableId === 'heldItem') {
		if (heldItem) {
			const definition = resolveItemDefinition(level, heldItem.type);
			if (definition?.behavior === 'value') {
				const resolvedValue = Number(heldItem.value);
				return Number.isFinite(resolvedValue) ? resolvedValue : 0;
			}
		}
		return 0;
	}
	return 0;
}

export function resolveTerrainTile(
	level: LevelDefinition,
	x: number,
	y: number
): ResolvedRuntimeTile {
	const key = `${x},${y}`;
	const typeId = level.layout[key] || level.defaultTerrain || 'grass';
	const customTile = level.customTiles?.[typeId];

	if (customTile) {
		return {
			type: customTile.type,
			passableBy: customTile.passableBy,
			onEnter: customTile.onEnter
		};
	}

	if (typeId === 'water') return { type: 'water', passableBy: 'boat' };
	if (typeId === 'void') return { type: 'hazard', onEnter: 'kill' };
	if (typeId === 'spikes') return { type: 'hazard', onEnter: 'damage' };
	if (typeId === 'fire') return { type: 'hazard', onEnter: 'damage' };
	if (typeId === 'hazard') return { type: 'hazard', onEnter: 'kill' };
	if (typeId === 'ice') return { type: 'ice', onEnter: 'slide' };
	if (typeId === 'wall') return { type: 'wall' };

	return { type: 'floor' };
}

export function canPassTile(
	level: LevelDefinition,
	position: GridPosition,
	inventory: RuntimeInventory
): boolean {
	if (isOutOfBounds(level, position)) {
		return false;
	}

	return canPassResolvedTile(resolveTerrainTile(level, position.x, position.y), inventory);
}

export function canPassResolvedTile(
	tile: ResolvedRuntimeTile,
	{ heldItem, vehicle }: RuntimeInventory
): boolean {
	if (tile.type === 'wall') {
		return Boolean(tile.passableBy && heldItem?.type === tile.passableBy);
	}

	if (tile.type === 'water') {
		const requiredItem = tile.passableBy || 'boat';
		return vehicle?.type === requiredItem || heldItem?.type === requiredItem;
	}

	return true;
}

function isOutOfBounds(level: LevelDefinition, position: GridPosition): boolean {
	return (
		position.x < 0 ||
		position.x >= level.gridSize.width ||
		position.y < 0 ||
		position.y >= level.gridSize.height
	);
}
