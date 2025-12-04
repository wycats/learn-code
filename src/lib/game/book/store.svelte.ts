import { THE_FIELD_GUIDE } from './content';

export class BookStore {
	isOpen = $state(false);
	currentChapterId = $state(THE_FIELD_GUIDE.chapters[0].id);
	currentPageIndex = $state(0);

	get currentChapter() {
		return (
			THE_FIELD_GUIDE.chapters.find((c) => c.id === this.currentChapterId) ||
			THE_FIELD_GUIDE.chapters[0]
		);
	}

	get currentPage() {
		return this.currentChapter.pages[this.currentPageIndex];
	}

	get hasNextPage() {
		return this.currentPageIndex < this.currentChapter.pages.length - 1;
	}

	get hasPrevPage() {
		return this.currentPageIndex > 0;
	}

	open() {
		this.isOpen = true;
	}

	close() {
		this.isOpen = false;
	}

	nextPage() {
		if (this.hasNextPage) {
			this.currentPageIndex++;
		} else {
			// Go to next chapter
			const currentChapterIndex = THE_FIELD_GUIDE.chapters.findIndex(
				(c) => c.id === this.currentChapterId
			);
			if (currentChapterIndex < THE_FIELD_GUIDE.chapters.length - 1) {
				this.currentChapterId = THE_FIELD_GUIDE.chapters[currentChapterIndex + 1].id;
				this.currentPageIndex = 0;
			}
		}
	}

	prevPage() {
		if (this.hasPrevPage) {
			this.currentPageIndex--;
		} else {
			// Go to prev chapter
			const currentChapterIndex = THE_FIELD_GUIDE.chapters.findIndex(
				(c) => c.id === this.currentChapterId
			);
			if (currentChapterIndex > 0) {
				this.currentChapterId = THE_FIELD_GUIDE.chapters[currentChapterIndex - 1].id;
				this.currentPageIndex = THE_FIELD_GUIDE.chapters[currentChapterIndex - 1].pages.length - 1;
			}
		}
	}

	goToChapter(chapterId: string) {
		const chapter = THE_FIELD_GUIDE.chapters.find((c) => c.id === chapterId);
		if (chapter) {
			this.currentChapterId = chapterId;
			this.currentPageIndex = 0;
		}
	}
}

export const bookStore = new BookStore();
