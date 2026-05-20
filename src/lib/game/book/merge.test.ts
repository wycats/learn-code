import { describe, expect, it } from 'vitest';
import { THE_FIELD_GUIDE } from './content';
import { mergeFieldGuide, toPackGuideId } from './merge';
import type { Book } from './schema';

const PACK_GUIDE: Book = {
	chapters: [
		{
			id: 'basics',
			title: 'Pack Basics',
			pages: [
				{
					id: 'movement',
					title: 'Custom Movement',
					content: [
						{ type: 'text', content: 'This pack has custom movement advice.', voice: 'jonas' }
					]
				}
			]
		}
	]
};

describe('mergeFieldGuide', () => {
	it('returns the built-in guide when there is no pack guide', () => {
		expect(mergeFieldGuide()).toBe(THE_FIELD_GUIDE);
	});

	it('appends pack guide chapters after the built-in guide', () => {
		const merged = mergeFieldGuide(PACK_GUIDE);

		expect(merged.chapters).toHaveLength(THE_FIELD_GUIDE.chapters.length + 1);
		expect(merged.chapters[0].id).toBe(THE_FIELD_GUIDE.chapters[0].id);
		expect(merged.chapters.at(-1)?.title).toBe('Pack Basics');
	});

	it('namespaces pack-authored chapter and page IDs to avoid keyed each collisions', () => {
		const merged = mergeFieldGuide(PACK_GUIDE);
		const packChapter = merged.chapters.at(-1);

		expect(packChapter?.id).toBe('pack:basics');
		expect(packChapter?.pages[0].id).toBe('pack:movement');
		expect(new Set(merged.chapters.map((chapter) => chapter.id)).size).toBe(merged.chapters.length);
	});

	it('does not double-prefix pack guide IDs that are already namespaced', () => {
		expect(toPackGuideId('pack:creator-notes')).toBe('pack:creator-notes');
	});

	it('deduplicates repeated pack-authored chapter IDs after namespacing', () => {
		const merged = mergeFieldGuide({
			chapters: [
				{ ...PACK_GUIDE.chapters[0], id: 'basics' },
				{ ...PACK_GUIDE.chapters[0], id: 'basics' },
				{ ...PACK_GUIDE.chapters[0], id: 'pack:basics' }
			]
		});

		const packChapterIds = merged.chapters
			.slice(THE_FIELD_GUIDE.chapters.length)
			.map((chapter) => chapter.id);

		expect(packChapterIds).toEqual(['pack:basics', 'pack:basics-2', 'pack:basics-3']);
		expect(new Set(merged.chapters.map((chapter) => chapter.id)).size).toBe(merged.chapters.length);
	});

	it('deduplicates repeated pack-authored page IDs within a chapter', () => {
		const merged = mergeFieldGuide({
			chapters: [
				{
					...PACK_GUIDE.chapters[0],
					pages: [
						{ ...PACK_GUIDE.chapters[0].pages[0], id: 'movement' },
						{ ...PACK_GUIDE.chapters[0].pages[0], id: 'movement' },
						{ ...PACK_GUIDE.chapters[0].pages[0], id: 'pack:movement' }
					]
				}
			]
		});

		const packPageIds = merged.chapters.at(-1)?.pages.map((page) => page.id);

		expect(packPageIds).toEqual(['pack:movement', 'pack:movement-2', 'pack:movement-3']);
	});
});
