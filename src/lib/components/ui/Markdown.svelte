<script lang="ts">
	import { parseMarkdown } from './markdown';

	let { content }: { content: string } = $props();
</script>

<!-- eslint-disable-next-line svelte/no-at-html-tags -->
<span class="markdown">{@html parseMarkdown(content)}</span>

<style>
	.markdown :global(strong) {
		font-weight: bold;
		color: var(--text-1);
	}

	.markdown :global(em) {
		font-style: italic;
	}

	.markdown :global(code) {
		background: var(--surface-2);
		padding: 0.2em 0.4em;
		border-radius: var(--radius-1);
		font-family: var(--font-mono);
		font-size: 0.9em;
	}

	.markdown :global(a) {
		color: var(--brand);
		text-decoration: underline;
	}
</style>
