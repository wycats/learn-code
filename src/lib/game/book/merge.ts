import { THE_FIELD_GUIDE } from './content';
import type { Book, BookChapter } from './schema';

const PACK_GUIDE_PREFIX = 'pack';

export function mergeFieldGuide(packGuide?: Book): Book {
	if (!packGuide || packGuide.chapters.length === 0) {
		return THE_FIELD_GUIDE;
	}

	// Pack-authored guide IDs are namespaced at the play-mode boundary so duplicate
	// creator IDs cannot collide with built-in chapters or Svelte keyed each blocks.
	return {
		chapters: [...THE_FIELD_GUIDE.chapters, ...namespacePackChapters(packGuide.chapters)]
	};
}

function namespacePackChapters(chapters: BookChapter[]): BookChapter[] {
	const usedChapterIds = new Set(THE_FIELD_GUIDE.chapters.map((chapter) => chapter.id));

	return chapters.map((chapter) => {
		const chapterId = getUniquePackGuideId(chapter.id, usedChapterIds);
		const usedPageIds = new Set<string>();

		return {
			...chapter,
			id: chapterId,
			pages: chapter.pages.map((page) => ({
				...page,
				id: getUniquePackGuideId(page.id, usedPageIds)
			}))
		};
	});
}

export function toPackGuideId(id: string) {
	if (id.startsWith(`${PACK_GUIDE_PREFIX}:`)) return id;

	return `${PACK_GUIDE_PREFIX}:${id}`;
}

function getUniquePackGuideId(id: string, usedIds: Set<string>) {
	const baseId = toPackGuideId(id);
	let candidate = baseId;
	let suffix = 2;

	while (usedIds.has(candidate)) {
		candidate = `${baseId}-${suffix}`;
		suffix += 1;
	}

	usedIds.add(candidate);
	return candidate;
}
