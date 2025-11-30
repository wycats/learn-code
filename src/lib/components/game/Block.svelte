<script lang="ts">
	import type { Block } from '$lib/game/types';
	import type { GameModel } from '$lib/game/model.svelte';
	import { draggableBlock, dropTarget } from '$lib/actions/dnd';
	import { getDragContext } from '$lib/game/drag-context.svelte';
	import BlockComponent from './Block.svelte';
	import DropIndicator from './DropIndicator.svelte';
	import { ArrowUp, RotateCcw, RotateCw, Repeat, Check, XCircle, Wand2 } from 'lucide-svelte';

	interface Props {
		block: Block;
		game?: GameModel;
		activeBlockId?: string | null;
		selectedBlockIds?: Set<string>;
		onSelect?: (id: string) => void;
		onContainerClick?: (id: string) => void;
		isPalette?: boolean;
		// Optional overrides if game is not provided
		isBlocked?: boolean;
		isSuccess?: boolean;
		loopProgress?: number;
	}

	let {
		block,
		game,
		activeBlockId = null,
		selectedBlockIds = new Set(),
		onSelect,
		onContainerClick,
		isPalette = false,
		isBlocked = false,
		isSuccess = false,
		loopProgress = 0
	}: Props = $props();

	const dragCtx = getDragContext();

	// Derived state from game model if available
	const derivedIsSuccess = $derived(
		game ? game.executionState.get(block.id) === 'success' : isSuccess
	);
	const derivedIsBlocked = $derived(
		game
			? game.executionState.get(block.id) === 'failure' ||
					(game.lastEvent?.type === 'blocked' && game.activeBlockId === block.id)
			: isBlocked
	);
	const derivedLoopProgress = $derived(game ? game.loopProgress.get(block.id) : loopProgress);
	const derivedActiveBlockId = $derived(game ? game.activeBlockId : activeBlockId);

	// Highlight logic
	const targets = $derived(game?.currentStorySegment?.targets);
	const isHighlighted = $derived.by(() => {
		if (!targets) return false;
		if (isPalette) {
			return targets.includes(`block:${block.type}`);
		} else {
			return targets.includes(`block:${block.id}`);
		}
	});

	function handleClick(e: MouseEvent) {
		e.stopPropagation();
		if (onSelect) {
			onSelect(block.id);
		}
	}

	function handleContainerClick(e: MouseEvent) {
		e.stopPropagation();
		if (onContainerClick) {
			onContainerClick(block.id);
		}
	}
</script>

<!-- svelte-ignore a11y_click_events_have_key_events -->
<!-- svelte-ignore a11y_no_static_element_interactions -->
<div
	class="block"
	data-type={block.type}
	class:active={derivedActiveBlockId === block.id}
	class:selected={selectedBlockIds.has(block.id)}
	class:ghost={block.isGhost}
	class:blocked={derivedIsBlocked}
	class:success={derivedIsSuccess}
	class:highlighted={isHighlighted}
	onclick={handleClick}
>
	<div class="header">
		<div class="icon">
			{#if block.type === 'move-forward'}
				<ArrowUp size={24} />
			{:else if block.type === 'turn-left'}
				<RotateCcw size={24} />
			{:else if block.type === 'turn-right'}
				<RotateCw size={24} />
			{:else if block.type === 'loop'}
				<Repeat size={24} />
			{:else if block.type === 'call'}
				<Wand2 size={24} />
			{/if}
		</div>
		<span class="label">
			{#if block.type === 'move-forward'}
				Step
			{:else if block.type === 'turn-left'}
				Left
			{:else if block.type === 'turn-right'}
				Right
			{:else if block.type === 'loop'}
				Repeat
				<span class="loop-badge">{block.count ? `${block.count}x` : '∞'}</span>
			{:else if block.type === 'call'}
				Call <span class="function-badge">{block.functionName || '???'}</span>
			{/if}
		</span>
		{#if block.type === 'loop' && derivedLoopProgress !== undefined && game?.status === 'running'}
			<div class="iteration-badge">
				{derivedLoopProgress + 1}
			</div>
		{/if}
		{#if derivedIsBlocked}
			<div class="status-icon"><XCircle size={20} color="var(--red-7)" /></div>
		{:else if derivedIsSuccess}
			<div class="status-icon"><Check size={20} color="var(--green-7)" /></div>
		{/if}
	</div>

	{#if block.type === 'loop' && !isPalette}
		<div
			class="children"
			use:dropTarget={{
				blockId: `${block.id}-children`,
				type: 'drop-target'
			}}
			onclick={handleContainerClick}
		>
			{#each block.children || [] as child, index (child.id)}
				<div class="block-wrapper" style:position="relative">
					{#if dragCtx?.targetId === child.id && dragCtx?.closestEdge === 'top'}
						<DropIndicator edge="top" />
					{/if}

					<div
						use:draggableBlock={{ block: child }}
						use:dropTarget={{
							blockId: child.id,
							index: index,
							type: 'drop-target'
						}}
					>
						<BlockComponent
							block={child}
							{game}
							activeBlockId={derivedActiveBlockId}
							{selectedBlockIds}
							{onSelect}
							{onContainerClick}
						/>
					</div>

					{#if dragCtx?.targetId === child.id && dragCtx?.closestEdge === 'bottom'}
						<DropIndicator edge="bottom" />
					{/if}
				</div>
			{/each}
			{#if !block.children?.length}
				<div class="empty-slot">Drop here</div>
			{/if}
		</div>
	{/if}
</div>

<style>
	.block {
		display: flex;
		flex-direction: column; /* Changed to column to support children */
		gap: var(--size-2);
		padding: var(--size-2) var(--size-3);
		border-radius: var(--radius-2);
		background-color: var(--surface-1);
		border: 2px solid transparent;
		cursor: grab;
		user-select: none;
		touch-action: none;
		font-weight: var(--font-weight-6);
		box-shadow: var(--shadow-1);
		transition:
			transform 0.1s var(--ease-2),
			box-shadow 0.1s var(--ease-2);
	}

	.header {
		display: flex;
		align-items: center;
		gap: var(--size-2);
		width: 100%;
	}

	.label {
		flex: 1;
	}

	.status-icon {
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.block:active {
		cursor: grabbing;
		transform: scale(0.98);
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

	.block[data-type='loop'] {
		background-color: var(--orange-2);
		color: var(--orange-9);
		border-color: var(--orange-3);
	}

	.block[data-type='call'] {
		background-color: var(--pink-2);
		color: var(--pink-9);
		border-color: var(--pink-3);
	}

	.block[data-type='loop']:not(:has(.children)) {
		padding-bottom: var(--size-2); /* Reset padding if no children */
	}

	/* Status styling - Placed AFTER type styling to override */
	.block.active {
		outline: 3px solid var(--yellow-5);
		box-shadow: 0 0 10px var(--yellow-5);
		z-index: 10;
	}

	.block.blocked {
		outline: 3px solid var(--red-5);
		box-shadow: 0 0 10px var(--red-5);
		background-color: var(--red-1) !important;
		border-color: var(--red-3) !important;
		animation: shake 0.3s cubic-bezier(0.36, 0.07, 0.19, 0.97) both;
	}

	.block.success {
		outline: 3px solid var(--green-5);
		box-shadow: 0 0 10px var(--green-5);
		background-color: var(--green-1) !important;
		border-color: var(--green-3) !important;
		color: var(--green-9) !important;
	}

	.block.selected {
		outline: 3px solid var(--blue-5);
		box-shadow: 0 0 10px var(--blue-5);
		z-index: 20;
	}

	.block.highlighted {
		outline: 3px solid var(--pink-5);
		box-shadow: 0 0 15px var(--pink-5);
		animation: pulse-highlight 1.5s infinite;
		z-index: 30;
	}

	@keyframes pulse-highlight {
		0% {
			box-shadow: 0 0 0 0 rgba(var(--pink-5-rgb), 0.7);
		}
		70% {
			box-shadow: 0 0 0 10px rgba(var(--pink-5-rgb), 0);
		}
		100% {
			box-shadow: 0 0 0 0 rgba(var(--pink-5-rgb), 0);
		}
	}

	@keyframes shake {
		10%,
		90% {
			transform: translate3d(-1px, 0, 0);
		}
		20%,
		80% {
			transform: translate3d(2px, 0, 0);
		}
		30%,
		50%,
		70% {
			transform: translate3d(-4px, 0, 0);
		}
		40%,
		60% {
			transform: translate3d(4px, 0, 0);
		}
	}

	.block.ghost {
		opacity: 0.6;
		border: 2px dashed var(--text-2);
		background-color: var(--surface-2);
		cursor: pointer;
		filter: grayscale(0.5);
	}

	.block.ghost:hover {
		opacity: 0.9;
		background-color: var(--surface-3);
		transform: scale(1.02);
	}

	.children {
		min-height: 60px;
		background-color: rgba(255, 255, 255, 0.3);
		border-radius: var(--radius-2);
		padding: var(--size-2);
		display: flex;
		flex-direction: column;
		gap: var(--size-2);
	}

	.children :global(.dragging) {
		opacity: 0.5;
	}

	.empty-slot {
		text-align: center;
		font-size: var(--font-size-0);
		color: var(--text-3);
		padding: var(--size-2);
		flex: 1;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.icon {
		font-size: var(--font-size-3);
	}

	.iteration-badge {
		font-size: var(--font-size-0);
		font-weight: bold;
		color: var(--text-2);
		background-color: var(--surface-2);
		padding: 2px 6px;
		border-radius: var(--radius-round);
		margin-right: var(--size-2);
		border: 1px solid var(--surface-3);
	}

	.loop-badge {
		background-color: rgba(0, 0, 0, 0.1);
		padding: 0 6px;
		border-radius: var(--radius-round);
		font-weight: 800;
	}

	.function-badge {
		background-color: rgba(0, 0, 0, 0.1);
		padding: 0 6px;
		border-radius: var(--radius-2);
		font-weight: 800;
		font-family: var(--font-mono);
	}
</style>
