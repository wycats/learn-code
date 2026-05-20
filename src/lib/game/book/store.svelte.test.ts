import { describe, it, expect, beforeEach } from 'vitest';
import { BookStore } from './store.svelte';
import { THE_FIELD_GUIDE } from './content';
import type { Book } from './schema';

const CUSTOM_BOOK: Book = {
	chapters: [
		{
			id: 'custom-basics',
			title: 'Custom Basics',
			pages: [
				{
					id: 'custom-start',
					title: 'Custom Start',
					content: [{ type: 'text', content: 'Start here.', voice: 'guide' }]
				},
				{
					id: 'custom-next',
					title: 'Custom Next',
					content: [{ type: 'text', content: 'Keep going.', voice: 'guide' }]
				}
			]
		},
		{
			id: 'custom-advanced',
			title: 'Custom Advanced',
			pages: [
				{
					id: 'custom-trick',
					title: 'Custom Trick',
					content: [{ type: 'text', content: 'Try a trick.', voice: 'jonas' }]
				}
			]
		}
	]
};

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
		expect(store.currentPage?.id).toBe(THE_FIELD_GUIDE.chapters[0].pages[0].id);
	});

	it('should navigate to the next page', () => {
		store.open();
		const firstChapter = THE_FIELD_GUIDE.chapters[0];

		// Assuming chapter 1 has at least 2 pages
		if (firstChapter.pages.length > 1) {
			store.nextPage();
			expect(store.currentPage?.id).toBe(firstChapter.pages[1].id);
		}
	});

	it('should navigate to the previous page', () => {
		store.open();
		const firstChapter = THE_FIELD_GUIDE.chapters[0];

		if (firstChapter.pages.length > 1) {
			store.nextPage();
			store.prevPage();
			expect(store.currentPage?.id).toBe(firstChapter.pages[0].id);
		}
	});

	it('should jump to a specific chapter', () => {
		store.open();
		const secondChapter = THE_FIELD_GUIDE.chapters[1];
		if (secondChapter) {
			store.goToChapter(secondChapter.id);
			expect(store.currentChapterId).toBe(secondChapter.id);
			expect(store.currentPage?.id).toBe(secondChapter.pages[0].id);
		}
	});

	it('should close', () => {
		store.open();
		store.close();
		expect(store.isOpen).toBe(false);
	});

	it('should navigate a supplied book instead of the built-in field guide', () => {
		store = new BookStore(CUSTOM_BOOK);
		store.open();

		expect(store.book).toEqual(CUSTOM_BOOK);
		expect(store.currentChapterId).toBe('custom-basics');
		expect(store.currentPage?.id).toBe('custom-start');

		store.nextPage();
		expect(store.currentPage?.id).toBe('custom-next');

		store.nextPage();
		expect(store.currentChapterId).toBe('custom-advanced');
		expect(store.currentPage?.id).toBe('custom-trick');
	});

	it('should update to a new book while preserving a valid location when possible', () => {
		store.open();
		store.setBook(CUSTOM_BOOK);

		expect(store.currentChapterId).toBe('custom-basics');
		expect(store.currentPage?.id).toBe('custom-start');
	});

	it('should open to a requested chapter and page', () => {
		store = new BookStore(CUSTOM_BOOK);
		store.openTo('custom-basics', 'custom-next');

		expect(store.isOpen).toBe(true);
		expect(store.currentChapterId).toBe('custom-basics');
		expect(store.currentPage?.id).toBe('custom-next');
	});

	it('should fall back to the first chapter when openTo receives an unknown chapter', () => {
		store = new BookStore(CUSTOM_BOOK);
		store.openTo('missing-chapter', 'missing-page');

		expect(store.isOpen).toBe(true);
		expect(store.currentChapterId).toBe('custom-basics');
		expect(store.currentPage?.id).toBe('custom-start');
	});

	it('should fall back to the first page when openTo receives an unknown page', () => {
		store = new BookStore(CUSTOM_BOOK);
		store.openTo('custom-basics', 'missing-page');

		expect(store.currentChapterId).toBe('custom-basics');
		expect(store.currentPage?.id).toBe('custom-start');
	});
});
