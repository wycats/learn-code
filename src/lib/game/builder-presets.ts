import type { TileDefinition } from './schema';

export const LOCKED_DOOR_TILE_ID = 'locked-door';

export function createLockedDoorTileDefinition(): TileDefinition {
	return {
		id: LOCKED_DOOR_TILE_ID,
		name: 'Locked Door',
		type: 'wall',
		passableBy: 'key',
		visuals: {
			color: 'var(--amber-2)',
			pattern: 'locked-door'
		}
	};
}
