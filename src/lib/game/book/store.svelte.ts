import { THE_FIELD_GUIDE } from './content';
import type { Book, BookChapter } from './schema';

export class BookStore {
	book = $state<Book>(THE_FIELD_GUIDE);
	isOpen = $state(false);
	currentChapterId = $state<string | null>(THE_FIELD_GUIDE.chapters[0]?.id ?? null);
	currentPageIndex = $state(0);

	constructor(book: Book = THE_FIELD_GUIDE) {
		this.setBook(book);
	}

	get currentChapter() {
		return (
			this.book.chapters.find((c) => c.id === this.currentChapterId) ??
			this.book.chapters[0] ??
			null
		);
	}

	get currentPage() {
		return this.currentChapter?.pages[this.currentPageIndex] ?? null;
	}

	get hasNextPage() {
		const chapter = this.currentChapter;
		if (!chapter) return false;

		return (
			this.currentPageIndex < chapter.pages.length - 1 ||
			this.currentChapterIndex < this.book.chapters.length - 1
		);
	}

	get hasPrevPage() {
		return this.currentPageIndex > 0 || this.currentChapterIndex > 0;
	}

	get currentChapterIndex() {
		return Math.max(
			this.book.chapters.findIndex((c) => c.id === this.currentChapter?.id),
			0
		);
	}

	get isAtFirstPage() {
		return !this.hasPrevPage;
	}

	get isAtLastPage() {
		return !this.hasNextPage;
	}

	setBook(book: Book) {
		this.book = book;
		this.ensureValidPosition();
	}

	openTo(chapterId: string, pageId?: string) {
		const position = this.resolvePosition(chapterId, pageId, { preservePageIndex: false });

		this.currentChapterId = position.chapter?.id ?? null;
		this.currentPageIndex = position.pageIndex;
		this.open();
	}

	open() {
		this.ensureValidPosition();
		this.isOpen = true;
	}

	close() {
		this.isOpen = false;
	}

	nextPage() {
		const chapter = this.currentChapter;
		if (!chapter) return;

		if (this.currentPageIndex < chapter.pages.length - 1) {
			this.currentPageIndex++;
		} else {
			// Go to next chapter
			const currentChapterIndex = this.currentChapterIndex;
			if (currentChapterIndex < this.book.chapters.length - 1) {
				this.currentChapterId = this.book.chapters[currentChapterIndex + 1].id;
				this.currentPageIndex = 0;
			}
		}
	}

	prevPage() {
		if (this.currentPageIndex > 0) {
			this.currentPageIndex--;
		} else {
			// Go to prev chapter
			const currentChapterIndex = this.currentChapterIndex;
			if (currentChapterIndex > 0) {
				const previousChapter = this.book.chapters[currentChapterIndex - 1];
				this.currentChapterId = previousChapter.id;
				this.currentPageIndex = Math.max(previousChapter.pages.length - 1, 0);
			}
		}
	}

	goToChapter(chapterId: string) {
		const chapter = this.book.chapters.find((c) => c.id === chapterId);
		if (chapter) {
			this.currentChapterId = chapterId;
			this.currentPageIndex = 0;
		}
	}

	private ensureValidPosition() {
		const position = this.resolvePosition(this.currentChapterId);
		this.currentChapterId = position.chapter?.id ?? null;
		this.currentPageIndex = position.pageIndex;
	}

	private resolvePosition(
		chapterId?: string | null,
		pageId?: string,
		options: ResolvePositionOptions = { preservePageIndex: true }
	): BookPosition {
		const requestedChapter = this.book.chapters.find((c) => c.id === chapterId);
		const chapter = requestedChapter ?? this.book.chapters[0] ?? null;
		if (!chapter) {
			return { chapter: null, pageIndex: 0 };
		}

		return {
			chapter,
			pageIndex: this.resolvePageIndex(chapter, pageId, {
				preservePageIndex: options.preservePageIndex && Boolean(requestedChapter)
			})
		};
	}

	private resolvePageIndex(
		chapter: BookChapter,
		pageId?: string,
		options: ResolvePositionOptions = { preservePageIndex: true }
	) {
		if (pageId) {
			const pageIndex = chapter.pages.findIndex((page) => page.id === pageId);
			if (pageIndex !== -1) return pageIndex;
		}

		if (!options.preservePageIndex) return 0;

		return chapter.pages.length > 0 ? Math.min(this.currentPageIndex, chapter.pages.length - 1) : 0;
	}
}

type BookPosition = {
	chapter: BookChapter | null;
	pageIndex: number;
};

type ResolvePositionOptions = {
	preservePageIndex: boolean;
};

export const bookStore = new BookStore();
