import { LevelDefinitionSchema } from './schema';
import level1Data from './levels/level-1.json';
import level2Data from './levels/level-2.json';
import level3Data from './levels/level-3.json';
import level4Data from './levels/level-4.json';
import level5Data from './levels/level-5.json';
import level6Data from './levels/level-6.json';
import level7Data from './levels/level-7.json';
import level8Data from './levels/level-8.json';
import level9Data from './levels/level-9.json';
import level10Data from './levels/level-10.json';
import level11Data from './levels/level-11.json';
import level12Data from './levels/level-12.json';
import level13Data from './levels/level-13.json';
import level14Data from './levels/level-14.json';
import levelKeys1Data from './levels/level-keys.json';
import levelBoat1Data from './levels/level-boat-1.json';
import levelBoatIntroData from './levels/level-boat-intro.json';
import levelBoatIslandData from './levels/level-boat-island.json';

export const LEVEL_1 = LevelDefinitionSchema.parse(level1Data);
export const LEVEL_2 = LevelDefinitionSchema.parse(level2Data);
export const LEVEL_3 = LevelDefinitionSchema.parse(level3Data);
export const LEVEL_4 = LevelDefinitionSchema.parse(level4Data);
export const LEVEL_5 = LevelDefinitionSchema.parse(level5Data);
export const LEVEL_6 = LevelDefinitionSchema.parse(level6Data);
export const LEVEL_7 = LevelDefinitionSchema.parse(level7Data);
export const LEVEL_8 = LevelDefinitionSchema.parse(level8Data);
export const LEVEL_9 = LevelDefinitionSchema.parse(level9Data);
export const LEVEL_10 = LevelDefinitionSchema.parse(level10Data);
export const LEVEL_11 = LevelDefinitionSchema.parse(level11Data);
export const LEVEL_12 = LevelDefinitionSchema.parse(level12Data);
export const LEVEL_13 = LevelDefinitionSchema.parse(level13Data);
export const LEVEL_14 = LevelDefinitionSchema.parse(level14Data);
export const LEVEL_KEYS_1 = LevelDefinitionSchema.parse(levelKeys1Data);
export const LEVEL_BOAT_1 = LevelDefinitionSchema.parse(levelBoat1Data);
export const LEVEL_BOAT_INTRO = LevelDefinitionSchema.parse(levelBoatIntroData);
export const LEVEL_BOAT_ISLAND = LevelDefinitionSchema.parse(levelBoatIslandData);

export const LEVELS = [
	LEVEL_1,
	LEVEL_2,
	LEVEL_3,
	LEVEL_4,
	LEVEL_5,
	LEVEL_6,
	LEVEL_7,
	LEVEL_8,
	LEVEL_9,
	LEVEL_10,
	LEVEL_11,
	LEVEL_12,
	LEVEL_13,
	LEVEL_14,
	LEVEL_KEYS_1,
	LEVEL_BOAT_1,
	LEVEL_BOAT_INTRO,
	LEVEL_BOAT_ISLAND
];
