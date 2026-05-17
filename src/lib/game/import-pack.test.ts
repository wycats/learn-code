import { describe, expect, it } from 'vitest';
import { getRawPackUrl, parseImportedPack } from './import-pack';

describe('getRawPackUrl', () => {
	it('converts a GitHub repository URL to its raw pack.json URL', () => {
		expect(getRawPackUrl('https://github.com/wycats/kibi-pack')).toBe(
			'https://raw.githubusercontent.com/wycats/kibi-pack/main/pack.json'
		);
	});

	it('converts a GitHub blob URL to its raw URL', () => {
		expect(getRawPackUrl('https://github.com/wycats/kibi-pack/blob/december/pack.json')).toBe(
			'https://raw.githubusercontent.com/wycats/kibi-pack/december/pack.json'
		);
	});

	it('leaves raw URLs untouched', () => {
		const raw = 'https://example.com/pack.json';
		expect(getRawPackUrl(raw)).toBe(raw);
	});
});

describe('parseImportedPack', () => {
	it('validates a migrated pack', () => {
		const pack = parseImportedPack({
			id: 'pack-1',
			name: 'Imported Pack',
			levels: []
		});

		expect(pack.name).toBe('Imported Pack');
		expect(pack.difficulty).toBe('beginner');
	});
});
