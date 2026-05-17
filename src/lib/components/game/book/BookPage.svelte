<script lang="ts">
	import type { BookPage } from '$lib/game/book/schema';
	import MiniPlayground from './MiniPlayground.svelte';
	import Markdown from '$lib/components/ui/Markdown.svelte';

	let { page }: { page: BookPage } = $props();
</script>

<div class="book-page">
	<h2 class="page-title">{page.title}</h2>

	<div class="content">
		{#each page.content as block, i (i)}
			{#if block.type === 'text'}
				<p class="text-block"><Markdown content={block.content} /></p>
			{:else if block.type === 'voice'}
				<div class="voice-block {block.speaker.toLowerCase()}">
					<div class="speaker-label">{block.speaker}:</div>
					<p class="voice-text"><Markdown content={block.content} /></p>
				</div>
			{:else if block.type === 'code'}
				<pre class="code-block"><code>{block.content}</code></pre>
			{:else if block.type === 'playground'}
				<div class="playground-wrapper">
					<MiniPlayground snippet={block.snippet} />
				</div>
			{/if}
		{/each}
	</div>
</div>

<style>
	.book-page {
		max-width: 65ch;
		margin: 0 auto;
	}

	.page-title {
		font-size: var(--font-size-5);
		font-weight: bold;
		color: var(--text-1);
		margin-bottom: var(--size-6);
		font-family: var(--font-heading);
	}

	.content {
		display: flex;
		flex-direction: column;
		gap: var(--size-4);
	}

	.text-block {
		font-size: var(--font-size-2);
		color: var(--text-2);
		line-height: var(--font-lineheight-3);
	}

	.voice-block {
		padding: var(--size-4);
		border-radius: var(--radius-2);
		background-color: var(--surface-3);
		border-left: 4px solid var(--text-2);
	}

	.voice-block.zoey {
		background-color: var(--surface-2);
		border-left-color: var(--brand);
		font-family: 'Comic Sans MS', 'Chalkboard SE', sans-serif; /* Fallback for handwriting */
	}

	.voice-block.system {
		background-color: var(--surface-1);
		border-left-color: var(--text-1);
		font-family: var(--font-mono);
	}

	.speaker-label {
		font-size: var(--font-size-0);
		font-weight: bold;
		text-transform: uppercase;
		margin-bottom: var(--size-1);
		color: var(--text-2);
	}

	.voice-block.zoey .speaker-label {
		color: var(--brand);
	}

	.voice-text {
		font-size: var(--font-size-2);
		color: var(--text-1);
		line-height: var(--font-lineheight-3);
	}

	.code-block {
		padding: var(--size-4);
		background-color: var(--surface-1);
		border-radius: var(--radius-2);
		overflow-x: auto;
		font-family: var(--font-mono);
		font-size: var(--font-size-1);
		color: var(--text-1);
		border: 1px solid var(--surface-3);
	}

	.playground-wrapper {
		margin-top: var(--size-4);
		margin-bottom: var(--size-4);
	}
</style>
