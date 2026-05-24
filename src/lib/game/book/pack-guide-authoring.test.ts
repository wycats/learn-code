import { describe, expect, it } from 'vitest';
import {
	MANAGED_PACK_GUIDE_CHAPTER_ID,
	compilePackGuideNotes,
	createManagedPackGuidePages,
	extractPackGuideNotes
} from './pack-guide-authoring';
import type { Book } from './schema';

const UNRELATED_CHAPTER = {
	id: 'advanced-secrets',
	title: 'Advanced Secrets',
	pages: [
		{
			id: 'secret-paths',
			title: 'Secret Paths',
			content: [{ type: 'text' as const, voice: 'guide' as const, content: 'Look closely.' }]
		}
	]
};

describe('pack guide authoring helpers', () => {
	it('extracts constrained Jonas notes from the managed chapter', () => {
		const guide: Book = {
			chapters: [
				{
					id: MANAGED_PACK_GUIDE_CHAPTER_ID,
					title: 'How This Pack Works',
					pages: [
						{
							id: 'special-rules',
							title: 'Special Rules',
							content: [{ type: 'voice', speaker: 'Jonas', content: 'Lava is a timer.' }]
						},
						{
							id: 'designer-tip',
							title: 'Designer Tip',
							content: [{ type: 'voice', speaker: 'Jonas', content: 'Count first.' }]
						}
					]
				}
			]
		};

		expect(extractPackGuideNotes(guide)).toEqual({
			specialRules: 'Lava is a timer.',
			trickyPart: '',
			designerTip: 'Count first.',
			whatToNotice: ''
		});
	});

	it('compiles non-empty notes into Jonas voice pages in the managed chapter', () => {
		const guide = compilePackGuideNotes({
			specialRules: '  Ice keeps sliding.  ',
			trickyPart: '',
			designerTip: 'Use one repeat.',
			whatToNotice: ''
		});

		expect(guide?.chapters).toHaveLength(1);
		expect(guide?.chapters[0]).toMatchObject({
			id: MANAGED_PACK_GUIDE_CHAPTER_ID,
			title: 'How This Pack Works'
		});
		expect(guide?.chapters[0].pages.map((page) => page.id)).toEqual([
			'special-rules',
			'designer-tip'
		]);
		expect(guide?.chapters[0].pages[0].content).toEqual([
			{ type: 'voice', speaker: 'Jonas', content: '  Ice keeps sliding.  ' }
		]);
	});

	it('preserves in-progress whitespace while deciding whether a note is empty', () => {
		const guide = compilePackGuideNotes({
			specialRules: 'Use  two  spaces. ',
			trickyPart: '   ',
			designerTip: '',
			whatToNotice: ''
		});

		expect(guide?.chapters[0].pages).toEqual([
			{
				id: 'special-rules',
				title: 'Special Rules',
				content: [{ type: 'voice', speaker: 'Jonas', content: 'Use  two  spaces. ' }]
			}
		]);
	});

	it('removes the managed chapter when all notes are empty', () => {
		const guide = compilePackGuideNotes(
			{
				specialRules: '',
				trickyPart: ' ',
				designerTip: '',
				whatToNotice: ''
			},
			{
				chapters: [
					UNRELATED_CHAPTER,
					{
						id: MANAGED_PACK_GUIDE_CHAPTER_ID,
						title: 'How This Pack Works',
						pages: [
							{
								id: 'tricky-part',
								title: 'Tricky Part',
								content: [{ type: 'voice', speaker: 'Jonas', content: 'Old note.' }]
							}
						]
					}
				]
			}
		);

		expect(guide).toEqual({ chapters: [UNRELATED_CHAPTER] });
	});

	it('returns undefined when all notes are empty and no unrelated guide chapters remain', () => {
		const guide = compilePackGuideNotes({
			specialRules: '',
			trickyPart: '',
			designerTip: '',
			whatToNotice: ''
		});

		expect(guide).toBeUndefined();
	});

	it('preserves unrelated guide chapters while replacing the managed chapter', () => {
		const guide = compilePackGuideNotes(
			{
				specialRules: '',
				trickyPart: 'The middle level is the trap.',
				designerTip: '',
				whatToNotice: 'The walls draw arrows.'
			},
			{
				chapters: [
					UNRELATED_CHAPTER,
					{
						id: MANAGED_PACK_GUIDE_CHAPTER_ID,
						title: 'Old Managed Chapter',
						pages: [
							{
								id: 'designer-tip',
								title: 'Designer Tip',
								content: [{ type: 'voice', speaker: 'Jonas', content: 'Old note.' }]
							}
						]
					}
				]
			}
		);

		expect(guide?.chapters[0]).toEqual(UNRELATED_CHAPTER);
		expect(guide?.chapters[1].id).toBe(MANAGED_PACK_GUIDE_CHAPTER_ID);
		expect(guide?.chapters[1].pages.map((page) => page.id)).toEqual([
			'tricky-part',
			'what-to-notice'
		]);
	});

	it('creates preview pages without unrelated guide content', () => {
		const pages = createManagedPackGuidePages({
			specialRules: '',
			trickyPart: 'Use the boat last.',
			designerTip: '',
			whatToNotice: ''
		});

		expect(pages).toEqual([
			{
				id: 'tricky-part',
				title: 'Tricky Part',
				content: [{ type: 'voice', speaker: 'Jonas', content: 'Use the boat last.' }]
			}
		]);
	});
});
