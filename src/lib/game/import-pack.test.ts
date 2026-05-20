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

	it('converts a GitHub branch URL to the branch pack.json URL', () => {
		expect(getRawPackUrl('https://github.com/wycats/kibi-pack/tree/december')).toBe(
			'https://raw.githubusercontent.com/wycats/kibi-pack/december/pack.json'
		);
	});

	it('converts a GitHub branch folder URL to a raw pack.json URL in that folder', () => {
		expect(getRawPackUrl('https://github.com/wycats/kibi-pack/tree/december/packs/jonas')).toBe(
			'https://raw.githubusercontent.com/wycats/kibi-pack/december/packs/jonas/pack.json'
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

	it('parses optional pack-authored guide content', () => {
		const pack = parseImportedPack({
			id: 'pack-with-guide',
			name: 'Imported Pack With Guide',
			levels: [],
			guide: {
				chapters: [
					{
						id: 'creator-notes',
						title: 'Creator Notes',
						pages: [
							{
								id: 'tricky-part',
								title: 'The Tricky Part',
								content: [
									{
										type: 'text',
										content: 'The bridge only works if you pick up the boat first.',
										voice: 'jonas'
									}
								]
							}
						]
					}
				]
			}
		});

		expect(pack.guide?.chapters[0].id).toBe('creator-notes');
		expect(pack.guide?.chapters[0].pages[0].id).toBe('tricky-part');
	});
});
