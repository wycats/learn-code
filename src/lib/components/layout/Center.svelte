<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		children: Snippet;
		maxWidth?: string;
		centerText?: boolean;
		gutters?: string;
	}

	let { children, maxWidth = '60ch', centerText = false, gutters = '0' }: Props = $props();
</script>

<div
	class="center"
	style:--max-width={maxWidth}
	style:--gutters={gutters}
	class:center-text={centerText}
>
	{@render children()}
</div>

<style>
	.center {
		box-sizing: content-box;
		margin-inline: auto;
		max-width: var(--max-width);
		padding-inline: var(--gutters);
	}

	.center-text {
		text-align: center;
	}
</style>
