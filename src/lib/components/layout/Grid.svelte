<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		children: Snippet;
		gap?: string;
		minItemWidth?: string;
	}

	let { children, gap = 'var(--size-3)', minItemWidth = '20rem' }: Props = $props();
</script>

<div class="grid" style:--gap={gap} style:--min-item-width={minItemWidth}>
	{@render children()}
</div>

<style>
	.grid {
		display: grid;
		grid-gap: var(--gap);
		grid-template-columns: repeat(auto-fit, minmax(min(100%, var(--min-item-width)), 1fr));
	}
</style>
