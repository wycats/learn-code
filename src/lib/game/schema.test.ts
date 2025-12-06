import { describe, it, expect } from 'vitest';
import { LevelPackSchema } from './schema';
import { migrateLevelPack } from './migrations';
import fs from 'fs';
import path from 'path';

describe('Schema Stability', () => {
	it('should be able to parse the v1_basics.json fixture', () => {
		const fixturePath = path.resolve(__dirname, '../../fixtures/packs/v1_basics.json');
		const rawData = fs.readFileSync(fixturePath, 'utf-8');
		const json = JSON.parse(rawData);

		// 1. Migrate the data (if necessary)
		const migrated = migrateLevelPack(json);

		// 2. Validate against the current schema
		const result = LevelPackSchema.safeParse(migrated);

		if (!result.success) {
			console.error('Schema Validation Failed:', JSON.stringify(result.error.format(), null, 2));
		}

		expect(result.success).toBe(true);
	});
});
