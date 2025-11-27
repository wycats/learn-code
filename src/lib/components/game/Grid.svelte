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

				// Check if this is the goal position (override layout if needed, or just ensure it matches)
				// Actually, goal is separate in definition, but we might want to render it as a cell type
				const isGoal = game.level.goal.x === x && game.level.goal.y === y;

				c.push({
					x,
					y,
					type: isGoal ? 'goal' : type
				});
			}
		}
		return c;
	});
</script>

<div class="grid-stage" style:--grid-width={width} style:--grid-height={height}>
	{#each cells as cell (`${cell.x},${cell.y}`)}
		<div class="grid-cell-wrapper">
			<Cell type={cell.type} />

			{#if game.characterPosition.x === cell.x && game.characterPosition.y === cell.y}
				<div class="character-layer">
					<Character direction={game.characterOrientation} />
				</div>
			{/if}
		</div>
	{/each}
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
	}

	.grid-cell-wrapper {
		position: relative;
		width: 100%;
		height: 100%;
	}

	.character-layer {
		position: absolute;
		inset: 0;
		display: grid;
		place-items: center;
		pointer-events: none;
	}
</style>
