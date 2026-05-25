<script lang="ts">
	import type { HeldItem } from '$lib/game/types';
	import { AVATAR_ICONS } from '$lib/game/icons';
	import { Brain, Key, Ship } from 'lucide-svelte';

	interface Props {
		item?: HeldItem | null;
		variant?: 'cell' | 'bubble' | 'variable' | 'mini' | 'tool';
		label?: string;
	}

	let { item = null, variant = 'cell', label }: Props = $props();

	const tokenType = $derived(item?.type ?? 'held-item');
	const accessibleLabel = $derived.by(() => {
		if (label) return label;
		if (!item) return variant === 'bubble' ? 'Thought Bubble' : 'Held Item';
		if (item.type === 'number') return `Number ${item.value}`;
		return item.type.charAt(0).toUpperCase() + item.type.slice(1);
	});
</script>

<span
	class="held-item-token"
	class:empty={!item}
	data-variant={variant}
	data-token-type={tokenType}
	data-testid="held-item-token"
	title={accessibleLabel}
	aria-label={accessibleLabel}
>
	{#if item?.type === 'key'}
		<Key size={20} strokeWidth={2.8} />
	{:else if item?.type === 'boat'}
		<Ship size={22} fill="var(--blue-3)" />
	{:else if item?.type === 'number'}
		<span class="number-value">{item.value}</span>
	{:else if item?.type === 'color'}
		<span class="color-swatch" style:background-color={item.value}></span>
	{:else if item?.icon && item.icon.toLowerCase() in AVATAR_ICONS}
		{@const Icon = AVATAR_ICONS[item.icon.toLowerCase() as keyof typeof AVATAR_ICONS]}
		<Icon size={22} />
	{:else}
		<Brain size={18} />
	{/if}
</span>

<style>
	.held-item-token {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		gap: 2px;
		line-height: 1;
		color: var(--text-1);
	}

	.held-item-token[data-token-type='key'] {
		color: var(--orange-8);
	}

	.held-item-token[data-token-type='boat'],
	.held-item-token[data-token-type='number'],
	.held-item-token[data-token-type='held-item'] {
		color: var(--blue-7);
	}

	.held-item-token[data-variant='cell'],
	.held-item-token[data-variant='tool'] {
		width: 100%;
		height: 100%;
	}

	.held-item-token[data-variant='bubble'] {
		min-width: 20px;
		height: 20px;
	}

	.held-item-token[data-variant='variable'],
	.held-item-token[data-variant='mini'] {
		width: 24px;
		height: 24px;
		background-color: var(--surface-1);
		border: 2px solid var(--blue-3);
		border-radius: var(--radius-round);
		box-shadow: var(--shadow-1);
	}

	.held-item-token[data-variant='mini'] {
		width: 22px;
		height: 22px;
	}

	.held-item-token.empty[data-variant='bubble'] {
		color: var(--stone-4);
		opacity: 0.5;
	}

	.held-item-token :global(svg) {
		width: 72%;
		height: 72%;
		flex: none;
	}

	.number-value {
		font-family: var(--font-mono);
		font-weight: 900;
		font-size: clamp(1rem, 58%, 1.35rem);
		line-height: 1;
		color: var(--blue-8);
	}

	.held-item-token[data-variant='bubble'] .number-value {
		font-size: var(--font-size-2);
		color: var(--text-1);
	}

	.color-swatch {
		width: 20px;
		height: 20px;
		border-radius: var(--radius-round);
		border: 2px solid white;
		box-shadow: var(--shadow-1);
	}
</style>
