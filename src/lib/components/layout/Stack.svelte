<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		children: Snippet;
		gap?: string;
		recursive?: boolean;
		align?: 'start' | 'center' | 'end' | 'stretch';
	}

	let { children, gap = 'var(--size-3)', recursive = false, align = 'stretch' }: Props = $props();
</script>

<div class="stack" class:recursive style:--gap={gap} style:--align={align}>
	{@render children()}
</div>

<style>
	.stack {
		display: flex;
		flex-direction: column;
		justify-content: flex-start;
		align-items: var(--align);
	}

	.stack > :global(*) {
		margin-block: 0;
	}

	.stack > :global(* + *) {
		margin-block-start: var(--gap);
	}

	.stack.recursive :global(* + *) {
		margin-block-start: var(--gap);
	}
</style>
