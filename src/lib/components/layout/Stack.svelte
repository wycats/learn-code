<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		children: Snippet;
		gap?: string;
		align?: 'start' | 'center' | 'end' | 'stretch';
	}

	let { children, gap = 'var(--size-3)', align = 'stretch' }: Props = $props();
</script>

<div class="stack" style:--gap={gap} style:--align={align}>
	{@render children()}
</div>

<style>
	.stack {
		display: flex;
		flex-direction: column;
		justify-content: flex-start;
		align-items: var(--align);
		gap: var(--gap);
	}
</style>
