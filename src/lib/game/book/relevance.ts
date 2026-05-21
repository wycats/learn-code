import { isPackGuideId } from './merge';
import { MANAGED_PACK_GUIDE_CHAPTER_ID } from './pack-guide-authoring';
import type { Book } from './schema';
import type { BlockType, LevelDefinition, LevelPack } from '$lib/game/types';

export type FieldGuideTarget = {
	chapterId: string;
	pageId: string;
};

type BuiltInGuideTarget = FieldGuideTarget & {
	signal: BlockType;
};

const BUILT_IN_BLOCK_TARGETS: BuiltInGuideTarget[] = [
	{ signal: 'loop', chapterId: 'automation', pageId: 'loops' },
	{ signal: 'move-forward', chapterId: 'basics', pageId: 'movement' },
	{ signal: 'turn-left', chapterId: 'basics', pageId: 'turning' },
	{ signal: 'turn-right', chapterId: 'basics', pageId: 'turning' }
];

export function findRelatedFieldGuideTarget({
	book,
	level,
	pack
}: {
	book: Book;
	level?: LevelDefinition | null;
	pack?: LevelPack | null;
}): FieldGuideTarget | null {
	const packTarget = findPreferredPackAuthoredGuideTarget(book);
	if (packTarget && pack?.guide && isCustomPack(pack)) return packTarget;

	if (hasCustomPackContext(level, pack)) {
		if (packTarget) return packTarget;
	}

	if (!level) return null;

	for (const target of BUILT_IN_BLOCK_TARGETS) {
		if (hasAvailableBlock(level, target.signal) && hasGuideTarget(book, target)) {
			return { chapterId: target.chapterId, pageId: target.pageId };
		}
	}

	if (hasTag(pack, 'loops')) {
		const target = { chapterId: 'automation', pageId: 'loops' };
		if (hasGuideTarget(book, target)) return target;
	}

	return null;
}

export function findFirstPackAuthoredGuideTarget(book: Book): FieldGuideTarget | null {
	for (const chapter of book.chapters) {
		if (!isPackGuideId(chapter.id)) continue;

		const page = chapter.pages.find((candidate) => isPackGuideId(candidate.id));
		if (page) {
			return { chapterId: chapter.id, pageId: page.id };
		}
	}

	return null;
}

function findPreferredPackAuthoredGuideTarget(book: Book): FieldGuideTarget | null {
	return findPackAuthoredGuideTarget(book, `pack:${MANAGED_PACK_GUIDE_CHAPTER_ID}`);
}

function findPackAuthoredGuideTarget(
	book: Book,
	preferredChapterId?: string
): FieldGuideTarget | null {
	if (preferredChapterId) {
		const preferredChapter = book.chapters.find((chapter) => chapter.id === preferredChapterId);
		const preferredPage = preferredChapter?.pages.find((page) => isPackGuideId(page.id));

		if (preferredChapter && preferredPage) {
			return { chapterId: preferredChapter.id, pageId: preferredPage.id };
		}
	}

	return findFirstPackAuthoredGuideTarget(book);
}

function hasGuideTarget(book: Book, target: FieldGuideTarget) {
	const chapter = book.chapters.find((candidate) => candidate.id === target.chapterId);
	return Boolean(chapter?.pages.some((page) => page.id === target.pageId));
}

function hasAvailableBlock(level: LevelDefinition, blockType: BlockType) {
	return Object.hasOwn(level.availableBlocks, blockType);
}

function hasTag(pack: LevelPack | null | undefined, tag: string) {
	return Boolean(pack?.tags.some((candidate) => candidate.toLowerCase() === tag));
}

function hasCustomPackContext(level?: LevelDefinition | null, pack?: LevelPack | null) {
	return (
		hasCustomDefinitions(level?.customTiles) ||
		hasCustomDefinitions(level?.customItems) ||
		hasCustomDefinitions(pack?.customTiles) ||
		hasCustomDefinitions(pack?.customItems)
	);
}

function hasCustomDefinitions(definitions?: Record<string, unknown>) {
	return Boolean(definitions && Object.keys(definitions).length > 0);
}

function isCustomPack(pack: LevelPack) {
	return pack.isCustom === true;
}
