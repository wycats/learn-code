<script lang="ts">
	import type { HeldItem } from '$lib/game/types';
	import HeldItemToken from './HeldItemToken.svelte';
	import { scale } from 'svelte/transition';
	import type { CrossfadeParams, TransitionConfig } from 'svelte/transition';

	interface Props {
		item: HeldItem | null;
		receive?: (node: Element, params: CrossfadeParams & { key: unknown }) => () => TransitionConfig;
	}

	let { item, receive = () => () => ({ duration: 0 }) }: Props = $props();
</script>

<div
	class="thought-bubble"
	class:empty={!item}
	transition:scale={{ duration: 200, start: 0.5 }}
	data-testid="thought-bubble"
>
	<div class="bubble-content">
		{#if item}
			<div
				class="item-wrapper"
				in:receive={{ key: `item-${item.type}-${item.value}` }}
				out:scale={{ duration: 200, start: 0.5 }}
			>
				<HeldItemToken {item} variant="bubble" />
			</div>
		{:else}
			<HeldItemToken item={null} variant="bubble" />
		{/if}
	</div>
	<div class="bubble-tail"></div>
</div>

<style>
	.thought-bubble {
		position: absolute;
		top: -42px;
		left: 50%;
		transform: translateX(-50%);
		background: white;
		border: 2px solid var(--surface-4);
		border-radius: 50%;
		padding: 6px;
		min-width: 44px;
		height: 44px;
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
		width: 100%;
		height: 100%;
	}

	.item-wrapper {
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.bubble-tail {
		position: absolute;
		bottom: -14px;
		left: 50%;
		transform: translateX(-50%);
		width: 0;
		height: 0;
	}

	.bubble-tail::before,
	.bubble-tail::after {
		content: '';
		position: absolute;
		background: white;
		border: 2px solid var(--surface-4);
		border-radius: 50%;
		left: 50%;
		transform: translateX(-50%);
		box-shadow: var(--shadow-1);
	}

	/* Medium dot */
	.bubble-tail::before {
		bottom: 8px;
		width: 10px;
		height: 10px;
	}

	/* Small dot */
	.bubble-tail::after {
		bottom: 0px;
		width: 6px;
		height: 6px;
	}

	.thought-bubble.empty .bubble-tail::before,
	.thought-bubble.empty .bubble-tail::after {
		background: var(--surface-1);
		border-color: var(--stone-4);
		border-style: dashed;
		box-shadow: none;
	}
</style>
