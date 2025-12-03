<script lang="ts">
	import type { HeldItem } from '$lib/game/types';
	import { Key, Brain } from 'lucide-svelte';
	import { scale } from 'svelte/transition';
	import type { CrossfadeParams, TransitionConfig } from 'svelte/transition';

	interface Props {
		item: HeldItem | null;
		receive?: (node: Element, params: CrossfadeParams & { key: unknown }) => () => TransitionConfig;
	}

	let { item, receive = () => () => ({ duration: 0 }) }: Props = $props();
</script>

<div class="thought-bubble" class:empty={!item} transition:scale={{ duration: 200, start: 0.5 }}>
	<div class="bubble-content">
		{#if item}
			<div
				class="item-wrapper"
				in:receive={{ key: `item-${item.type}-${item.value}` }}
				out:scale={{ duration: 200, start: 0.5 }}
			>
				{#if item.type === 'key'}
					<Key size={16} color="var(--amber-7)" />
				{:else if item.type === 'number'}
					<Brain size={16} color="var(--blue-7)" style="margin-right: 4px;" />
					<span class="number">{item.value}</span>
				{:else if item.type === 'color'}
					<div class="color-swatch" style:background-color={item.value}></div>
				{/if}
			</div>
		{:else}
			<Brain size={16} color="var(--stone-4)" style="opacity: 0.5;" />
		{/if}
	</div>
	<div class="bubble-tail"></div>
</div>

<style>
	.thought-bubble {
		position: absolute;
		top: -30px;
		left: 50%;
		transform: translateX(-50%);
		background: white;
		border: 2px solid var(--surface-4);
		border-radius: var(--radius-round);
		padding: 4px;
		min-width: 32px;
		height: 32px;
		display: grid;
		place-items: center;
		box-shadow: var(--shadow-2);
		z-index: 20;
		transition: all 0.2s var(--ease-3);
	}

	.thought-bubble.empty {
		border-style: dashed;
		border-color: var(--stone-4);
		background: var(--surface-1);
		box-shadow: none;
	}

	.bubble-content {
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.item-wrapper {
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.bubble-tail {
		position: absolute;
		bottom: -4px;
		left: 50%;
		transform: translateX(-50%) rotate(45deg);
		width: 8px;
		height: 8px;
		background: white;
		border-right: 2px solid var(--surface-4);
		border-bottom: 2px solid var(--surface-4);
	}

	.thought-bubble.empty .bubble-tail {
		background: var(--surface-1);
		border-color: var(--stone-4);
		border-style: dashed;
	}

	.number {
		font-family: var(--font-mono);
		font-weight: bold;
		font-size: var(--font-size-1);
		color: var(--text-1);
	}

	.color-swatch {
		width: 16px;
		height: 16px;
		border-radius: 50%;
		border: 1px solid var(--surface-4);
	}
</style>
