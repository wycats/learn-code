<script lang="ts">
	import type { GameModel } from '$lib/game/model.svelte';
	import type { CellType, HeldItem } from '$lib/game/types';
	import type { TileDefinition } from '$lib/game/schema';
	import {
		ArrowDown,
		ArrowLeft,
		ArrowRight,
		ArrowUp,
		BrickWall,
		Circle,
		DoorClosedLocked,
		Flame,
		Hash,
		Key,
		Leaf,
		Mountain,
		Package,
		Ship,
		Snowflake,
		Star,
		Triangle,
		Trees,
		Waves
	} from 'lucide-svelte';

	type IconComponent = typeof ArrowRight;

	interface BoardCell {
		x: number;
		y: number;
		type: CellType;
		customTile?: TileDefinition;
		item?: HeldItem;
		isGoal: boolean;
		isPlayer: boolean;
	}

	interface Props {
		game: GameModel;
	}

	let { game }: Props = $props();

	const width = $derived(game.level.gridSize.width);
	const height = $derived(game.level.gridSize.height);
	const cells = $derived.by(() => {
		const result: BoardCell[] = [];

		for (let y = 0; y < height; y++) {
			for (let x = 0; x < width; x++) {
				const key = `${x},${y}`;
				const type = game.level.layout[key] || game.level.defaultTerrain || 'grass';
				const isPlayer = game.characterPosition.x === x && game.characterPosition.y === y;
				const isGoal = game.level.goal.x === x && game.level.goal.y === y;

				result.push({
					x,
					y,
					type,
					customTile: game.level.customTiles?.[type],
					item: !game.collectedItems.has(key) ? game.level.items?.[key] : undefined,
					isGoal,
					isPlayer
				});
			}
		}

		return result;
	});

	function terrainIcon(cell: BoardCell): IconComponent | null {
		if (cell.customTile?.visuals.pattern === 'locked-door') return DoorClosedLocked;
		if (cell.customTile?.type === 'wall') return BrickWall;

		switch (cell.type) {
			case 'wall':
				return BrickWall;
			case 'water':
				return Waves;
			case 'forest':
				return Trees;
			case 'snow':
				return Snowflake;
			case 'dirt':
				return Mountain;
			case 'spikes':
				return Triangle;
			case 'fire':
				return Flame;
			case 'grass':
				return Leaf;
			default:
				return null;
		}
	}

	function itemIcon(item: HeldItem): IconComponent {
		switch (item.type) {
			case 'key':
				return Key;
			case 'number':
				return Hash;
			case 'boat':
				return Ship;
			default:
				return Package;
		}
	}

	function playerIcon(): IconComponent {
		switch (game.characterOrientation) {
			case 'N':
				return ArrowUp;
			case 'S':
				return ArrowDown;
			case 'W':
				return ArrowLeft;
			case 'E':
			default:
				return ArrowRight;
		}
	}
</script>

<aside class="board-preview" aria-label="Board preview">
	<header class="board-preview-header">
		<h3>Board</h3>
		<span>{width}x{height}</span>
	</header>

	<div
		class="mini-board"
		style:--grid-width={width}
		style:--grid-height={height}
		aria-hidden="true"
	>
		{#each cells as cell (`${cell.x},${cell.y}`)}
			{@const TerrainIcon = terrainIcon(cell)}
			<div
				class="mini-cell"
				class:player={cell.isPlayer}
				class:goal={cell.isGoal}
				class:custom={Boolean(cell.customTile)}
				data-type={cell.type}
				style:--tile-color={cell.customTile?.visuals.color}
			>
				{#if TerrainIcon}
					<TerrainIcon size={14} strokeWidth={2.4} />
				{:else}
					<Circle size={8} strokeWidth={3} />
				{/if}

				{#if cell.isGoal}
					<span class="goal-icon">
						<Star size={15} fill="currentColor" strokeWidth={2.4} />
					</span>
				{/if}

				{#if cell.item}
					{@const ItemIcon = itemIcon(cell.item)}
					<span class="item-icon">
						<ItemIcon size={13} strokeWidth={2.6} />
					</span>
				{/if}

				{#if cell.isPlayer}
					{@const PlayerIcon = playerIcon()}
					<span class="player-marker">
						<PlayerIcon size={15} strokeWidth={3} />
					</span>
				{/if}
			</div>
		{/each}
	</div>
</aside>

<style>
	.board-preview {
		display: grid;
		grid-template-rows: auto minmax(0, 1fr);
		gap: var(--size-3);
		min-width: 0;
		padding: var(--size-4);
		border: 1px solid color-mix(in srgb, var(--brand), var(--surface-3) 74%);
		border-radius: var(--radius-4);
		background: color-mix(in srgb, var(--surface-1), transparent 7%);
		box-shadow:
			inset 0 1px 0 rgba(255, 255, 255, 0.06),
			0 18px 48px rgba(0, 0, 0, 0.1);
	}

	.board-preview-header {
		display: flex;
		align-items: baseline;
		justify-content: space-between;
		gap: var(--size-3);
	}

	h3 {
		margin: 0;
		font-family: var(--font-heading);
		font-size: var(--font-size-2);
		line-height: 1;
		color: var(--text-1);
	}

	.board-preview-header span {
		font-size: var(--font-size-00);
		font-weight: 850;
		color: var(--text-2);
	}

	.mini-board {
		align-self: start;
		display: grid;
		grid-template-columns: repeat(var(--grid-width), minmax(0, 1fr));
		grid-template-rows: repeat(var(--grid-height), minmax(0, 1fr));
		gap: 3px;
		width: min(100%, 15rem);
		aspect-ratio: var(--grid-width) / var(--grid-height);
	}

	.mini-cell {
		position: relative;
		display: grid;
		place-items: center;
		min-width: 0;
		min-height: 0;
		padding: 0;
		border: 1px solid color-mix(in srgb, black, transparent 84%);
		border-radius: var(--radius-2);
		background: var(--green-2);
		color: color-mix(in srgb, black, transparent 42%);
		overflow: hidden;
	}

	.mini-cell.custom {
		background: var(--tile-color);
	}

	.mini-cell[data-type='wall'] {
		background: var(--stone-3);
	}

	.mini-cell[data-type='water'] {
		background: var(--blue-3);
		color: var(--blue-8);
	}

	.mini-cell[data-type='forest'] {
		background: var(--green-8);
		color: var(--green-1);
	}

	.mini-cell[data-type='snow'] {
		background: var(--gray-1);
		color: var(--blue-5);
	}

	.mini-cell[data-type='dirt'] {
		background: var(--orange-3);
		color: var(--orange-9);
	}

	.mini-cell[data-type='spikes'],
	.mini-cell[data-type='fire'] {
		background: var(--red-3);
		color: var(--red-8);
	}

	.mini-cell.goal {
		box-shadow: inset 0 0 0 2px color-mix(in srgb, var(--yellow-6), transparent 20%);
	}

	.goal-icon {
		position: absolute;
		color: var(--yellow-7);
	}

	.item-icon {
		position: absolute;
		right: 2px;
		bottom: 2px;
		color: var(--text-1);
		filter: drop-shadow(0 1px 1px rgba(255, 255, 255, 0.35));
	}

	.player-marker {
		position: absolute;
		display: grid;
		place-items: center;
		width: 72%;
		height: 72%;
		border-radius: var(--radius-round);
		background: color-mix(in srgb, var(--accent), white 22%);
		color: white;
		box-shadow:
			0 0 0 2px color-mix(in srgb, white, transparent 12%),
			0 4px 12px rgba(0, 0, 0, 0.2);
	}
</style>
