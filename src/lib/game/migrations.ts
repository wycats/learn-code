import type { LevelPack, LevelDefinition } from './schema';

/**
 * Migrates a LevelPack JSON object to the current schema version.
 * This function should be updated whenever breaking changes are made to the schema.
 */
export function migrateLevelPack(data: unknown): LevelPack {
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const pack = data as any;

	// Example migration pattern:
	// if (pack.version === '1.0.0') {
	//   pack.newField = 'default';
	//   pack.version = '1.1.0';
	// }

	// For now, we assume the data is valid or Zod will catch it.
	// The Schema Stability test will ensure that if Zod fails, we must add a migration here.

	return pack as LevelPack;
}

/**
 * Migrates a raw LevelDefinition JSON object to the current schema.
 */
export function migrateLevel(data: unknown): LevelDefinition {
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const level = data as any;

	// Migration logic goes here

	return level as LevelDefinition;
}
