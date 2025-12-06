import type { LevelDefinition, ItemDefinition, LevelPack } from './types';

export function resolveItemDefinition(
	level: LevelDefinition,
	typeId: string,
	pack?: LevelPack
): ItemDefinition | undefined {
	// Check level custom items
	if (level.customItems && level.customItems[typeId]) {
		return level.customItems[typeId];
	}
	// Check pack custom items
	if (pack && pack.customItems && pack.customItems[typeId]) {
		return pack.customItems[typeId];
	}
	// Check built-ins
	if (typeId === 'boat')
		return {
			id: 'boat',
			name: 'Boat',
			behavior: 'vehicle',
			visuals: { icon: 'Ship', color: 'cyan' }
		};
	if (typeId === 'key')
		return {
			id: 'key',
			name: 'Key',
			behavior: 'collectible',
			visuals: { icon: 'Key', color: 'gold' }
		};
	if (typeId === 'number')
		return {
			id: 'number',
			name: 'Number',
			behavior: 'value',
			visuals: { icon: 'Hash', color: 'white' }
		};
	if (typeId === 'color')
		return {
			id: 'color',
			name: 'Color',
			behavior: 'value',
			visuals: { icon: 'Palette', color: 'white' }
		};

	return undefined;
}
