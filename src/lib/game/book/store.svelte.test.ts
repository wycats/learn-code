import { describe, it, expect, beforeEach } from 'vitest';
import { BookStore } from './store.svelte';
import { THE_FIELD_GUIDE } from './content';

describe('BookStore', () => {
	let store: BookStore;

	beforeEach(() => {
		store = new BookStore();
	});

	it('should start closed', () => {
		expect(store.isOpen).toBe(false);
	});

	it('should open to the first page of the first chapter by default', () => {
		store.open();
		expect(store.isOpen).toBe(true);
		expect(store.currentChapterId).toBe(THE_FIELD_GUIDE.chapters[0].id);
		expect(store.currentPage.id).toBe(THE_FIELD_GUIDE.chapters[0].pages[0].id);
	});

	it('should navigate to the next page', () => {
		store.open();
		const firstChapter = THE_FIELD_GUIDE.chapters[0];

		// Assuming chapter 1 has at least 2 pages
		if (firstChapter.pages.length > 1) {
			store.nextPage();
			expect(store.currentPage.id).toBe(firstChapter.pages[1].id);
		}
	});

	it('should navigate to the previous page', () => {
		store.open();
		const firstChapter = THE_FIELD_GUIDE.chapters[0];

		if (firstChapter.pages.length > 1) {
			store.nextPage();
			store.prevPage();
			expect(store.currentPage.id).toBe(firstChapter.pages[0].id);
		}
	});

	it('should jump to a specific chapter', () => {
		store.open();
		const secondChapter = THE_FIELD_GUIDE.chapters[1];
		if (secondChapter) {
			store.goToChapter(secondChapter.id);
			expect(store.currentChapterId).toBe(secondChapter.id);
			expect(store.currentPage.id).toBe(secondChapter.pages[0].id);
		}
	});

	it('should close', () => {
		store.open();
		store.close();
		expect(store.isOpen).toBe(false);
	});
});
