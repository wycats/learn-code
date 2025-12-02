import { describe, it, expect } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';
import { LevelDefinitionSchema } from './schema';
import { LEVELS } from './levels';
import { migrateLevel } from './migrations';

const FIXTURES_DIR = path.resolve(__dirname, '../../fixtures/levels/v1');

describe('Schema Compatibility', () => {
	// 1. Validation Test: Ensure current schema can read old data
	it('should validate all v1 fixtures against the current schema', () => {
		if (!fs.existsSync(FIXTURES_DIR)) {
			console.warn('No fixtures found. Skipping compatibility test.');
			return;
		}

		const files = fs.readdirSync(FIXTURES_DIR).filter((f) => f.endsWith('.json'));

		if (files.length === 0) {
			console.warn('No JSON fixtures found in v1 directory.');
			return;
		}

		files.forEach((file) => {
			const filePath = path.join(FIXTURES_DIR, file);
			const content = fs.readFileSync(filePath, 'utf-8');
			const json = JSON.parse(content);

			let result = LevelDefinitionSchema.safeParse(json);

			if (!result.success) {
				// Attempt migration
				console.log(`Migration needed for ${file}...`);
				const migrated = migrateLevel(json);
				result = LevelDefinitionSchema.safeParse(migrated);
			}

			if (!result.success) {
				console.error(`Failed to parse ${file} even after migration:`, result.error.format());
			}

			expect(result.success, `Failed to parse fixture: ${file}`).toBe(true);
		});
	});

	// 2. Generation Tool: Run this manually to update/create fixtures
	// Use `it.skip` to prevent accidental overwrites during normal test runs
	// To run: modify to `it.only` or use a specific test filter
	it.skip('should generate v1 fixtures from current levels', () => {
		if (!fs.existsSync(FIXTURES_DIR)) {
			fs.mkdirSync(FIXTURES_DIR, { recursive: true });
		}

		LEVELS.forEach((level) => {
			const filePath = path.join(FIXTURES_DIR, `${level.id}.json`);
			fs.writeFileSync(filePath, JSON.stringify(level, null, 2));
			console.log(`Generated fixture: ${filePath}`);
		});

		expect(true).toBe(true); // Ensure test passes
	});
});
