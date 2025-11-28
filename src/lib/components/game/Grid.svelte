<script lang="ts">
	import type { GameModel } from '$lib/game/model.svelte';
	import Cell from './Cell.svelte';
	import Character from './Character.svelte';

	interface Props {
		game: GameModel;
	}

	let { game }: Props = $props();

	const width = $derived(game.level.gridSize.width);
	const height = $derived(game.level.gridSize.height);

	// Generate grid cells
	const cells = $derived.by(() => {
		const c = [];
		for (let y = 0; y < height; y++) {
			for (let x = 0; x < width; x++) {
				const key = `${x},${y}`;
				const type = game.level.layout[key] || 'grass';

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

	const highlight = $derived(game.currentStorySegment?.highlight);
</script>

<div class="grid-stage" style:--grid-width={width} style:--grid-height={height}>
	{#each cells as cell (`${cell.x},${cell.y}`)}
		<div class="grid-cell-wrapper">
			<Cell type={cell.type} x={cell.x} y={cell.y} {highlight} />
		</div>
	{/each}

	<div
		class="character-container"
		style:--x={game.characterPosition.x}
		style:--y={game.characterPosition.y}
	>
		<Character direction={game.characterOrientation} {game} />
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
		max-width: 100%;
		max-height: 100%;
		position: relative;
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
</style>
