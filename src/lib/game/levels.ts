import { LevelDefinitionSchema } from './schema';
import level1Data from './levels/level-1.json';
import level2Data from './levels/level-2.json';
import level3Data from './levels/level-3.json';
import level4Data from './levels/level-4.json';
import level5Data from './levels/level-5.json';
import level6Data from './levels/level-6.json';
import level7Data from './levels/level-7.json';
import level8Data from './levels/level-8.json';

export const LEVEL_1 = LevelDefinitionSchema.parse(level1Data);
export const LEVEL_2 = LevelDefinitionSchema.parse(level2Data);
export const LEVEL_3 = LevelDefinitionSchema.parse(level3Data);
export const LEVEL_4 = LevelDefinitionSchema.parse(level4Data);
export const LEVEL_5 = LevelDefinitionSchema.parse(level5Data);
export const LEVEL_6 = LevelDefinitionSchema.parse(level6Data);
export const LEVEL_7 = LevelDefinitionSchema.parse(level7Data);
export const LEVEL_8 = LevelDefinitionSchema.parse(level8Data);

export const LEVELS = [LEVEL_1, LEVEL_2, LEVEL_3, LEVEL_4, LEVEL_5, LEVEL_6, LEVEL_7, LEVEL_8];
