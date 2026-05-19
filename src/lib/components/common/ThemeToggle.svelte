<script lang="ts">
	import { theme } from '$lib/stores/theme.svelte';
	import { Sun, Moon, Monitor } from 'lucide-svelte';

	type ThemeToggleVariant = 'plain' | 'toolbar';

	let { variant = 'plain' }: { variant?: ThemeToggleVariant } = $props();
</script>

<button
	class="theme-toggle"
	class:toolbar={variant === 'toolbar'}
	onclick={() => theme.toggle()}
	title="Toggle Theme"
	aria-label="Toggle Theme"
>
	{#if theme.current === 'light'}
		<Sun size={20} />
	{:else if theme.current === 'dark'}
		<Moon size={20} />
	{:else}
		<Monitor size={20} />
	{/if}
</button>

<style>
	.theme-toggle {
		background: none;
		border: none;
		cursor: pointer;
		color: var(--text-2);
		padding: var(--size-2);
		border-radius: 50%;
		display: grid;
		place-items: center;
		transition:
			color 0.2s,
			background-color 0.2s,
			transform 0.2s;
		width: var(--touch-target-min);
		height: var(--touch-target-min);
	}

	.theme-toggle.toolbar {
		background-color: var(--surface-2);
		border: 1px solid var(--surface-3);
		padding: 0;
		border-radius: var(--radius-2);
		transition:
			color 0.2s,
			background-color 0.2s,
			border-color 0.2s,
			transform 0.2s;
	}

	.theme-toggle:hover {
		color: var(--text-1);
		background-color: var(--surface-2);
		transform: translateY(-1px);
	}

	.theme-toggle.toolbar:hover {
		background-color: var(--surface-3);
		border-color: var(--brand);
	}

	.theme-toggle:focus-visible {
		outline: 3px solid var(--brand-light);
		outline-offset: 2px;
	}
</style>
