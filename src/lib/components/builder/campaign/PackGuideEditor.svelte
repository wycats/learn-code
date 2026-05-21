<script lang="ts">
	import BookPage from '$lib/components/game/book/BookPage.svelte';
	import {
		PACK_GUIDE_NOTE_PROMPTS,
		compilePackGuideNotes,
		createManagedPackGuidePages,
		extractPackGuideNotes,
		hasPackGuideNotes,
		type PackGuideNoteKey,
		type PackGuideNotes
	} from '$lib/game/book/pack-guide-authoring';
	import type { Book } from '$lib/game/book/schema';
	import type { LevelPack } from '$lib/game/schema';
	import { BookOpen, Eye } from 'lucide-svelte';

	interface Props {
		pack: LevelPack;
		onChange: (guide: Book | undefined) => void;
	}

	let { pack, onChange }: Props = $props();

	let notes = $derived<PackGuideNotes>(extractPackGuideNotes(pack.guide));
	const previewPages = $derived(createManagedPackGuidePages(notes));
	const hasNotes = $derived(hasPackGuideNotes(notes));

	function updateGuide(key: PackGuideNoteKey, value: string) {
		notes = { ...notes, [key]: value };
		onChange(compilePackGuideNotes(notes, pack.guide));
	}
</script>

<section class="guide-editor" aria-labelledby="pack-guide-editor-title">
	<div class="header">
		<div class="header-icon"><BookOpen size={24} /></div>
		<div>
			<p class="eyebrow">Field Guide</p>
			<h2 id="pack-guide-editor-title">How this pack works</h2>
			<p class="intro">
				Write quick Jonas notes for players. Kibi turns each filled prompt into a Field Guide page.
			</p>
		</div>
	</div>

	<div class="prompt-list">
		{#each PACK_GUIDE_NOTE_PROMPTS as prompt (prompt.key)}
			<label class="prompt-card">
				<span class="prompt-header">
					<span class="prompt-label">{prompt.label}</span>
					<span class="voice-chip">Jonas voice</span>
				</span>
				<span class="prompt-description">{prompt.description}</span>
				<textarea
					value={notes[prompt.key]}
					oninput={(event) => updateGuide(prompt.key, event.currentTarget.value)}
					placeholder={prompt.placeholder}
					rows="3"
				></textarea>
			</label>
		{/each}
	</div>

	<div class="preview" aria-live="polite">
		<div class="preview-header">
			<Eye size={18} />
			<h3>Preview</h3>
		</div>

		{#if hasNotes}
			<div class="preview-pages">
				{#each previewPages as page (page.id)}
					<div class="preview-page-card">
						<BookPage {page} />
					</div>
				{/each}
			</div>
		{:else}
			<p class="empty-preview">
				Write one note to create “How This Pack Works” in the Field Guide.
			</p>
		{/if}
	</div>
</section>

<style>
	.guide-editor {
		display: flex;
		flex-direction: column;
		gap: var(--size-5);
		padding: var(--size-6);
		border: 1px solid var(--surface-3);
		border-radius: var(--radius-3);
		background: var(--surface-1);
		box-shadow: var(--shadow-2);
	}

	.header {
		display: flex;
		align-items: flex-start;
		gap: var(--size-3);
	}

	.header-icon {
		display: grid;
		place-items: center;
		width: 44px;
		height: 44px;
		border-radius: var(--radius-3);
		background: light-dark(var(--blue-1), var(--blue-10));
		color: var(--brand);
		flex: 0 0 auto;
	}

	.eyebrow {
		margin: 0 0 var(--size-1);
		font-size: var(--font-size-0);
		font-weight: 800;
		text-transform: uppercase;
		letter-spacing: 0.08em;
		color: var(--brand);
	}

	h2,
	h3 {
		margin: 0;
		font-family: var(--font-heading);
		color: var(--text-1);
	}

	h2 {
		font-size: var(--font-size-3);
	}

	h3 {
		font-size: var(--font-size-2);
	}

	.intro {
		margin: var(--size-2) 0 0;
		color: var(--text-2);
		line-height: 1.5;
	}

	.prompt-list {
		display: grid;
		gap: var(--size-4);
	}

	.prompt-card {
		display: flex;
		flex-direction: column;
		gap: var(--size-2);
	}

	.prompt-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: var(--size-3);
	}

	.prompt-label {
		font-weight: 800;
		color: var(--text-1);
	}

	.voice-chip {
		padding: 2px var(--size-2);
		border-radius: var(--radius-pill);
		background: light-dark(var(--blue-1), var(--blue-10));
		color: var(--brand);
		font-size: var(--font-size-0);
		font-weight: 800;
		white-space: nowrap;
	}

	.prompt-description {
		font-size: var(--font-size-0);
		font-weight: 600;
		color: var(--text-3);
	}

	textarea {
		width: 100%;
		min-height: 88px;
		resize: vertical;
		padding: var(--size-3);
		border: 1px solid var(--surface-3);
		border-radius: var(--radius-2);
		background: var(--surface-2);
		color: var(--text-1);
		font: inherit;
		line-height: 1.5;
	}

	textarea:focus {
		outline: 3px solid var(--brand-dim);
		border-color: var(--brand);
	}

	.preview {
		display: flex;
		flex-direction: column;
		gap: var(--size-3);
		padding-top: var(--size-4);
		border-top: 1px solid var(--surface-3);
	}

	.preview-header {
		display: flex;
		align-items: center;
		gap: var(--size-2);
		color: var(--text-2);
	}

	.preview-pages {
		display: grid;
		gap: var(--size-4);
	}

	.preview-page-card {
		padding: var(--size-4);
		border: 1px solid var(--surface-3);
		border-radius: var(--radius-3);
		background: var(--surface-2);
	}

	.preview-page-card :global(.book-page) {
		max-width: none;
	}

	.preview-page-card :global(.page-title) {
		font-size: var(--font-size-3);
		margin-bottom: var(--size-3);
	}

	.empty-preview {
		margin: 0;
		padding: var(--size-4);
		border: 1px dashed var(--surface-4);
		border-radius: var(--radius-3);
		color: var(--text-3);
		background: var(--surface-2);
		font-weight: 600;
	}
</style>
