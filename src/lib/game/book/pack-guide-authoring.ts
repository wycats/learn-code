import type { Book, BookChapter, BookContentBlock, BookPage } from './schema';

export const MANAGED_PACK_GUIDE_CHAPTER_ID = 'how-this-pack-works';

export type PackGuideNotes = {
	specialRules: string;
	trickyPart: string;
	designerTip: string;
	whatToNotice: string;
};

export type PackGuideNoteKey = keyof PackGuideNotes;

export type PackGuideNotePrompt = {
	key: PackGuideNoteKey;
	pageId: string;
	label: string;
	pageTitle: string;
	description: string;
	placeholder: string;
};

export const PACK_GUIDE_NOTE_PROMPTS: PackGuideNotePrompt[] = [
	{
		key: 'specialRules',
		pageId: 'special-rules',
		label: 'Special rules',
		pageTitle: 'Special Rules',
		description: 'What works differently in this pack?',
		placeholder: 'Example: Lava is safe only when you ride the boat.'
	},
	{
		key: 'trickyPart',
		pageId: 'tricky-part',
		label: 'Tricky part',
		pageTitle: 'Tricky Part',
		description: 'Where might players get stuck?',
		placeholder: 'Example: The shortest path looks easy, but it uses too many blocks.'
	},
	{
		key: 'designerTip',
		pageId: 'designer-tip',
		label: 'Designer tip',
		pageTitle: 'Designer Tip',
		description: 'Give players one useful idea from the designer.',
		placeholder: 'Example: Try building the repeat first, then add the turns.'
	},
	{
		key: 'whatToNotice',
		pageId: 'what-to-notice',
		label: 'What I want players to notice',
		pageTitle: 'What to Notice',
		description: 'Point players toward the pattern or surprise you built.',
		placeholder: 'Example: Every level hides the same zig-zag pattern.'
	}
];

export function createEmptyPackGuideNotes(): PackGuideNotes {
	return {
		specialRules: '',
		trickyPart: '',
		designerTip: '',
		whatToNotice: ''
	};
}

export function extractPackGuideNotes(guide?: Book | null): PackGuideNotes {
	const notes = createEmptyPackGuideNotes();
	const managedChapter = guide?.chapters.find(
		(chapter) => chapter.id === MANAGED_PACK_GUIDE_CHAPTER_ID
	);

	if (!managedChapter) return notes;

	for (const prompt of PACK_GUIDE_NOTE_PROMPTS) {
		const page = managedChapter.pages.find((candidate) => candidate.id === prompt.pageId);
		notes[prompt.key] = extractPageNote(page);
	}

	return notes;
}

export function compilePackGuideNotes(
	notes: PackGuideNotes,
	existingGuide?: Book | null
): Book | undefined {
	const preservedChapters = (existingGuide?.chapters ?? []).filter(
		(chapter) => chapter.id !== MANAGED_PACK_GUIDE_CHAPTER_ID
	);
	const managedChapter = createManagedPackGuideChapter(notes);
	const chapters = managedChapter ? [...preservedChapters, managedChapter] : preservedChapters;

	return chapters.length > 0 ? { chapters } : undefined;
}

export function createManagedPackGuideChapter(notes: PackGuideNotes): BookChapter | null {
	const pages = createManagedPackGuidePages(notes);

	if (pages.length === 0) return null;

	return {
		id: MANAGED_PACK_GUIDE_CHAPTER_ID,
		title: 'How This Pack Works',
		pages
	};
}

export function createManagedPackGuidePages(notes: PackGuideNotes): BookPage[] {
	return PACK_GUIDE_NOTE_PROMPTS.map<BookPage | null>((prompt) => {
		const content = notes[prompt.key].trim();

		if (!content) return null;

		const blocks: BookContentBlock[] = [{ type: 'voice', speaker: 'Jonas', content }];

		return {
			id: prompt.pageId,
			title: prompt.pageTitle,
			content: blocks
		};
	}).filter(isBookPage);
}

export function hasPackGuideNotes(notes: PackGuideNotes): boolean {
	return PACK_GUIDE_NOTE_PROMPTS.some((prompt) => notes[prompt.key].trim().length > 0);
}

function extractPageNote(page?: BookPage): string {
	if (!page) return '';

	for (const block of page.content) {
		if (block.type === 'voice' && block.speaker.toLowerCase() === 'jonas') return block.content;
	}

	for (const block of page.content) {
		if (block.type === 'voice') return block.content;
		if (block.type === 'text') return block.content;
	}

	return '';
}

function isBookPage(page: BookPage | null): page is BookPage {
	return page !== null;
}
