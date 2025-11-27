<script lang="ts">
	import type { BlockType } from '$lib/game/types';

	interface Props {
		type: BlockType;
		isDragging?: boolean;
	}

	let { type, isDragging = false }: Props = $props();
</script>

<div class="block" data-type={type} class:dragging={isDragging}>
	<div class="icon">
		{#if type === 'move-forward'}
			⬆️
		{:else if type === 'turn-left'}
			↺
		{:else if type === 'turn-right'}
			↻
		{/if}
	</div>
	<span class="label">
		{#if type === 'move-forward'}
			Step
		{:else if type === 'turn-left'}
			Left
		{:else if type === 'turn-right'}
			Right
		{/if}
	</span>
</div>

<style>
	.block {
		display: flex;
		align-items: center;
		gap: var(--size-2);
		padding: var(--size-2) var(--size-3);
		border-radius: var(--radius-2);
		background-color: var(--surface-1);
		border: 2px solid transparent;
		cursor: grab;
		user-select: none;
		touch-action: none; /* Important for DnD */
		font-weight: var(--font-weight-6);
		box-shadow: var(--shadow-1);
		transition:
			transform 0.1s var(--ease-2),
			box-shadow 0.1s var(--ease-2);
	}

	.block:active {
		cursor: grabbing;
		transform: scale(0.98);
	}

	.block.dragging {
		opacity: 0.5;
		box-shadow: var(--shadow-3);
	}

	/* Type-specific styling */
	.block[data-type='move-forward'] {
		background-color: var(--blue-2);
		color: var(--blue-9);
		border-color: var(--blue-3);
	}

	.block[data-type='turn-left'],
	.block[data-type='turn-right'] {
		background-color: var(--purple-2);
		color: var(--purple-9);
		border-color: var(--purple-3);
	}

	.icon {
		font-size: var(--font-size-3);
	}
</style>
