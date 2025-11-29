<script lang="ts">
	import type { GameModel } from '$lib/game/model.svelte';
	import type { GridPosition } from '$lib/game/types';
	import Cell from './Cell.svelte';
	import Character from './Character.svelte';
	import { RotateCw } from 'lucide-svelte';
	import { fade } from 'svelte/transition';

	interface Props {
		game: GameModel;
		isBuilder?: boolean;
		selectedActor?: 'start' | 'goal' | null;
		onCellClick?: (pos: GridPosition) => void;
		onActorSelect?: (actor: 'start' | 'goal') => void;
		onActorDrop?: () => void;
		onRotateStart?: () => void;
	}

	let {
		game,
		isBuilder = false,
		selectedActor = null,
		onCellClick,
		onActorSelect,
		onActorDrop,
		onRotateStart
	}: Props = $props();

	let isDragging = $state(false);
	let dragStartPos = $state<GridPosition | null>(null);
	let isHoveringCharacter = $state(false);

	function handleMouseDown(x: number, y: number) {
		if (!isBuilder) return;

		// Check if clicking on goal
		if (game.level.goal.x === x && game.level.goal.y === y) {
			onActorSelect?.('goal');
			dragStartPos = { ...game.level.goal };
			isDragging = true;
			return;
		}

		if (selectedActor) {
			// If we are placing an existing selection, record start pos
			dragStartPos =
				selectedActor === 'start' ? { ...game.characterPosition } : { ...game.level.goal };
		}

		isDragging = true;
		onCellClick?.({ x, y });
	}

	function handleMouseEnter(x: number, y: number) {
		if (!isBuilder || !isDragging) return;
		onCellClick?.({ x, y });
	}

	function handleMouseUp() {
		if (selectedActor && dragStartPos) {
			const currentPos = selectedActor === 'start' ? game.characterPosition : game.level.goal;
			if (currentPos.x !== dragStartPos.x || currentPos.y !== dragStartPos.y) {
				onActorDrop?.();
			}
		}
		isDragging = false;
		dragStartPos = null;
	}

	function handleCharacterMouseDown(e: MouseEvent) {
		if (!isBuilder) return;
		e.stopPropagation(); // Prevent cell click

		dragStartPos = { ...game.characterPosition };
		isDragging = true;

		// Only select if not already selected.
		// If already selected, we wait for mouseup to determine if it's a click (rotate) or drag.
		if (selectedActor !== 'start') {
			onActorSelect?.('start');
		}
	}

	const width = $derived(game.level.gridSize.width);
	const height = $derived(game.level.gridSize.height);

	// Generate grid cells
	const cells = $derived.by(() => {
		const c = [];
		for (let y = 0; y < height; y++) {
			for (let x = 0; x < width; x++) {
				const key = `${x},${y}`;
				const type = game.level.layout[key] || game.level.defaultTerrain || 'grass';

				// Check if this is the goal position
				const isGoal = game.level.goal.x === x && game.level.goal.y === y;

				// If character is ON the goal, don't render the goal icon (so they don't overlap weirdly)
				// Or maybe render it but we handle it in Cell?
				// Let's just pass 'grass' if character is on goal, assuming goal is on grass.
				// But wait, the goal might be on a specific tile.
				// Let's keep it simple: if character is on goal, show 'grass' (or underlying type) instead of 'goal'.
				const isCharacterHere = game.characterPosition.x === x && game.characterPosition.y === y;

				c.push({
					x,
					y,
					type: isGoal && !isCharacterHere ? 'goal' : isGoal ? 'grass' : type
				});
			}
		}
		return c;
	});

	const highlight = $derived(game.previewHighlight || game.displaySegment?.highlight);
</script>

<div
	class="grid-stage"
	style:--grid-width={width}
	style:--grid-height={height}
	onmouseup={handleMouseUp}
	onmouseleave={handleMouseUp}
	role="grid"
	tabindex="0"
>
	{#each cells as cell (`${cell.x},${cell.y}`)}
		<!-- svelte-ignore a11y_no_static_element_interactions -->
		<div
			class="grid-cell-wrapper"
			class:interactive={isBuilder}
			class:selected={isBuilder && cell.type === 'goal' && selectedActor === 'goal'}
			style:grid-column={cell.x + 1}
			style:grid-row={cell.y + 1}
			onmousedown={() => handleMouseDown(cell.x, cell.y)}
			onmouseenter={() => handleMouseEnter(cell.x, cell.y)}
		>
			<Cell type={cell.type} x={cell.x} y={cell.y} {highlight} />
		</div>
	{/each}

	<div
		class="character-container"
		class:interactive={isBuilder}
		class:selected={isBuilder && selectedActor === 'start'}
		style:--x={game.characterPosition.x}
		style:--y={game.characterPosition.y}
		onmousedown={handleCharacterMouseDown}
		onmouseenter={() => (isHoveringCharacter = true)}
		onmouseleave={() => (isHoveringCharacter = false)}
		role="button"
		tabindex="0"
	>
		<Character direction={game.characterOrientation} {game} />

		{#if isBuilder && (selectedActor === 'start' || isHoveringCharacter)}
			<button
				class="rotate-handle"
				onmousedown={(e) => {
					e.stopPropagation();
					onRotateStart?.();
				}}
				transition:fade={{ duration: 150 }}
				title="Rotate Character"
			>
				<RotateCw size={16} />
			</button>
		{/if}
	</div>
</div>

<style>
	.grid-stage {
		display: grid;
		grid-template-columns: repeat(var(--grid-width), 1fr);
		grid-template-rows: repeat(var(--grid-height), 1fr);
		gap: var(--size-2);
		padding: var(--size-3);
		background-color: var(--surface-1);
		border-radius: var(--radius-3);
		box-shadow: var(--shadow-3);
		aspect-ratio: var(--grid-width) / var(--grid-height);
		width: 100%;
		max-width: 100%;
		max-height: 100%;
		position: relative;
		/* Ensure grid items don't overflow */
		min-width: 0;
		min-height: 0;
	}

	.grid-cell-wrapper {
		position: relative;
		width: 100%;
		height: 100%;
	}

	.character-container {
		grid-area: 1 / 1;
		width: 100%;
		height: 100%;
		display: grid;
		place-items: center;
		pointer-events: none;
		z-index: 10;

		/* Movement logic */
		--gap: var(--size-2);
		transform: translate(
			calc(var(--x) * (100% + var(--gap))),
			calc(var(--y) * (100% + var(--gap)))
		);
		transition: transform 0.3s cubic-bezier(0.2, 0, 0.2, 1);
	}

	.character-container.interactive {
		pointer-events: auto;
		cursor: grab;
	}

	.character-container.interactive:active {
		cursor: grabbing;
	}

	.grid-cell-wrapper.interactive {
		cursor: pointer;
	}

	.grid-cell-wrapper.interactive:hover {
		filter: brightness(1.1);
	}

	.grid-cell-wrapper.selected,
	.character-container.selected {
		outline: 3px solid var(--brand);
		outline-offset: 2px;
		border-radius: var(--radius-2);
		z-index: 20;
	}

	.rotate-handle {
		position: absolute;
		top: -10px;
		right: -10px;
		width: 24px;
		height: 24px;
		border-radius: 50%;
		background-color: var(--brand);
		color: white;
		border: 2px solid white;
		display: grid;
		place-items: center;
		cursor: pointer;
		box-shadow: var(--shadow-2);
		z-index: 30;
		padding: 0;
	}

	.rotate-handle:hover {
		transform: scale(1.1);
	}

	.rotate-handle:active {
		transform: scale(0.95);
	}
</style>
