<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		children: Snippet;
		gap?: string;
		justify?: 'start' | 'center' | 'end' | 'space-between' | 'space-around';
		align?: 'start' | 'center' | 'end' | 'stretch';
	}

	let { children, gap = 'var(--size-3)', justify = 'start', align = 'center' }: Props = $props();
</script>

<div class="cluster" style:--gap={gap} style:--justify={justify} style:--align={align}>
	{@render children()}
</div>

<style>
	.cluster {
		display: flex;
		flex-wrap: wrap;
		gap: var(--gap);
		justify-content: var(--justify);
		align-items: var(--align);
	}
</style>
