<script lang="ts">
	let { content }: { content: string } = $props();

	function parse(text: string) {
		// Escape HTML first to prevent XSS (basic)
		let html = text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

		// Bold
		html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');

		// Italic
		html = html.replace(/\*(.*?)\*/g, '<em>$1</em>');

		// Code
		html = html.replace(/`(.*?)`/g, '<code>$1</code>');

		// Links
		html = html.replace(
			/\[(.*?)\]\((.*?)\)/g,
			'<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>'
		);

		return html;
	}
</script>

<!-- eslint-disable-next-line svelte/no-at-html-tags -->
<span>{@html parse(content)}</span>

<style>
	strong {
		font-weight: bold;
		color: var(--text-1);
	}

	em {
		font-style: italic;
	}

	code {
		background: var(--surface-2);
		padding: 0.2em 0.4em;
		border-radius: var(--radius-1);
		font-family: var(--font-mono);
		font-size: 0.9em;
	}

	a {
		color: var(--brand);
		text-decoration: underline;
	}
</style>
