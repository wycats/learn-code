<script lang="ts">
	import { theme } from '$lib/stores/theme.svelte';
	import { Sun, Moon, Monitor } from 'lucide-svelte';
</script>

<button class="theme-toggle" onclick={() => theme.toggle()} title="Toggle Theme">
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
			background-color 0.2s;
		width: var(--touch-target-min);
		height: var(--touch-target-min);
	}
	.theme-toggle:hover {
		color: var(--text-1);
		background-color: var(--surface-2);
	}
</style>
