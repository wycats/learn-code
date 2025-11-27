<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		children: Snippet;
		padding?: string;
		background?: string;
		border?: string;
		radius?: string;
		shadow?: string;
		color?: string;
	}

	let {
		children,
		padding = 'var(--size-3)',
		background = 'transparent',
		border = 'none',
		radius = '0',
		shadow = 'none',
		color = 'inherit'
	}: Props = $props();
</script>

<div
	class="box"
	style:--padding={padding}
	style:--background={background}
	style:--border={border}
	style:--radius={radius}
	style:--shadow={shadow}
	style:--color={color}
>
	{@render children()}
</div>

<style>
	.box {
		padding: var(--padding);
		background: var(--background);
		border: var(--border);
		border-radius: var(--radius);
		box-shadow: var(--shadow);
		color: var(--color);
	}
</style>
