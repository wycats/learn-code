<script lang="ts">
	import { bookStore } from '$lib/game/book/store.svelte';
	import BookPage from './BookPage.svelte';
	import { X, ChevronLeft, ChevronRight, BookOpen } from 'lucide-svelte';
	import { THE_FIELD_GUIDE } from '$lib/game/book/content';

	let dialog: HTMLDialogElement;

	$effect(() => {
		if (bookStore.isOpen && dialog && !dialog.open) {
			dialog.showModal();
		} else if (!bookStore.isOpen && dialog && dialog.open) {
			dialog.close();
		}
	});

	function close() {
		bookStore.close();
	}

	function handleDialogClose() {
		if (bookStore.isOpen) {
			bookStore.close();
		}
	}

	function handleBackdropClick(e: MouseEvent) {
		if (e.target === dialog) {
			close();
		}
	}
</script>

<dialog
	bind:this={dialog}
	onclose={handleDialogClose}
	onclick={handleBackdropClick}
	class="book-modal"
>
	<div class="book-layout">
		<!-- Sidebar / TOC -->
		<div class="sidebar">
			<div class="sidebar-header">
				<BookOpen size={24} />
				<span>Field Guide</span>
			</div>

			<nav class="toc">
				{#each THE_FIELD_GUIDE.chapters as chapter (chapter.id)}
					<button
						class="toc-item"
						class:active={bookStore.currentChapterId === chapter.id}
						onclick={() => bookStore.goToChapter(chapter.id)}
					>
						{chapter.title}
					</button>
				{/each}
			</nav>
		</div>

		<!-- Main Content -->
		<div class="main-area">
			<button class="close-btn" onclick={close}>
				<X size={24} />
			</button>

			<div class="page-container">
				<BookPage page={bookStore.currentPage} />
			</div>

			<!-- Navigation Footer -->
			<div class="footer">
				<button
					class="nav-btn"
					onclick={() => bookStore.prevPage()}
					disabled={!bookStore.hasPrevPage &&
						bookStore.currentChapterId === THE_FIELD_GUIDE.chapters[0].id}
				>
					<ChevronLeft size={16} />
					Previous
				</button>

				<span class="page-indicator">
					Page {bookStore.currentPageIndex + 1} of {bookStore.currentChapter.pages.length}
				</span>

				<button
					class="nav-btn"
					onclick={() => bookStore.nextPage()}
					disabled={!bookStore.hasNextPage &&
						bookStore.currentChapterId ===
							THE_FIELD_GUIDE.chapters[THE_FIELD_GUIDE.chapters.length - 1].id}
				>
					Next
					<ChevronRight size={16} />
				</button>
			</div>
		</div>
	</div>
</dialog>

<style>
	dialog {
		padding: 0;
		border: none;
		/* Dialog is now the card itself */
		position: relative;
		width: 90vw;
		height: 90vh;
		max-width: 1024px;
		background-color: var(--surface-2);
		border-radius: var(--radius-3);
		box-shadow: var(--shadow-6);
		overflow: hidden;
		border: 1px solid var(--surface-3);
		margin: auto;
		color: var(--text-1);
	}

	.book-layout {
		display: flex;
		flex-direction: column;
		width: 100%;
		height: 100%;
	}

	dialog::backdrop {
		background-color: rgba(0, 0, 0, 0.8); /* Darker backdrop */
		backdrop-filter: blur(4px);
	}

	@media (min-width: 768px) {
		.book-layout {
			flex-direction: row;
		}
	}

	.sidebar {
		width: 100%;
		background-color: var(--surface-1);
		border-right: 1px solid var(--surface-3);
		padding: var(--size-4);
		overflow-y: auto;
	}

	@media (min-width: 768px) {
		.sidebar {
			width: 250px;
			flex-shrink: 0;
		}
	}

	.sidebar-header {
		display: flex;
		align-items: center;
		gap: var(--size-2);
		font-size: var(--font-size-3);
		font-weight: bold;
		color: var(--text-1);
		font-family: var(--font-heading);
		margin-bottom: var(--size-4);
	}

	.toc {
		display: flex;
		flex-direction: column;
		gap: var(--size-2);
	}

	.toc-item {
		width: 100%;
		text-align: left;
		padding: var(--size-2) var(--size-3);
		border-radius: var(--radius-2);
		font-size: var(--font-size-1);
		font-weight: 500;
		color: var(--text-2);
		background: none;
		border: none;
		cursor: pointer;
		transition:
			background-color 0.2s,
			color 0.2s;
	}

	.toc-item:hover {
		background-color: var(--surface-3);
		color: var(--text-1);
	}

	.toc-item.active {
		background-color: var(--brand-dim);
		color: var(--brand);
	}

	.main-area {
		position: relative;
		flex: 1;
		display: flex;
		flex-direction: column;
		background-color: var(--surface-2);
		overflow: hidden;
	}

	.close-btn {
		position: absolute;
		right: var(--size-4);
		top: var(--size-4);
		padding: var(--size-2);
		background: none;
		border: none;
		color: var(--text-3);
		cursor: pointer;
		border-radius: var(--radius-round);
		z-index: 10;
	}

	.close-btn:hover {
		background-color: var(--surface-3);
		color: var(--text-1);
	}

	.page-container {
		flex: 1;
		overflow-y: auto;
		padding: var(--size-6) var(--size-8);
	}

	@media (max-width: 768px) {
		.page-container {
			padding: var(--size-4);
		}
	}

	.footer {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: var(--size-4);
		background-color: var(--surface-1);
		border-top: 1px solid var(--surface-3);
	}

	.nav-btn {
		display: flex;
		align-items: center;
		gap: var(--size-2);
		padding: var(--size-2) var(--size-4);
		border-radius: var(--radius-2);
		font-size: var(--font-size-1);
		font-weight: 500;
		color: var(--text-1);
		background: none;
		border: none;
		cursor: pointer;
	}

	.nav-btn:hover:not(:disabled) {
		background-color: var(--surface-3);
	}

	.nav-btn:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}

	.page-indicator {
		font-size: var(--font-size-0);
		color: var(--text-3);
	}
</style>
