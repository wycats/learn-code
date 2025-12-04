<script lang="ts">
	import { GameModel } from '$lib/game/model.svelte';
	import Grid from '$lib/components/game/Grid.svelte';
	import { Play, RotateCcw, Plus } from 'lucide-svelte';
	import type { LevelDefinition, BlockType } from '$lib/game/types';
	import { StackInterpreter } from '$lib/game/mimic';

	let {
		snippet,
		levelId,
		caption
	}: {
		snippet?: {
			gridSize: { width: number; height: number };
			layout?: Record<string, string>;
			start?: { x: number; y: number };
			startOrientation?: 'N' | 'E' | 'S' | 'W';
			availableBlocks?: BlockType[];
		};
		levelId?: string;
		caption?: string;
	} = $props();

	// Construct level definition
	const levelDef: LevelDefinition = $derived.by(() => {
		if (snippet) {
			// Find goal in layout
			let goal = { x: 99, y: 99 };
			if (snippet.layout) {
				for (const [key, value] of Object.entries(snippet.layout)) {
					if (value === 'goal') {
						const [x, y] = key.split(',').map(Number);
						goal = { x, y };
						break;
					}
				}
			}

			return {
				id: 'mini-level',
				name: 'Mini Level',
				gridSize: snippet.gridSize,
				start: snippet.start || { x: 0, y: 0 },
				startOrientation: snippet.startOrientation || 'E',
				goal,
				layout: snippet.layout || {},
				availableBlocks: (snippet.availableBlocks || []).reduce(
					(acc, type) => {
						acc[type] = 'unlimited';
						return acc;
					},
					{} as Record<string, number | 'unlimited'>
				)
				// ... defaults
			} as LevelDefinition;
		}
		// TODO: Load level by ID
		return {
			id: 'empty',
			name: 'Empty',
			gridSize: { width: 3, height: 3 },
			start: { x: 0, y: 0 },
			startOrientation: 'E',
			goal: { x: 1, y: 1 },
			layout: {},
			availableBlocks: {}
		} as LevelDefinition;
	});

	let game = $state(new GameModel(levelDef));

	// Re-init game when levelDef changes
	$effect(() => {
		game = new GameModel(levelDef);
	});

	async function run() {
		if (game.status === 'running') return;
		game.status = 'running';
		game.resetExecutionState();

		const interpreter = new StackInterpreter(game);
		interpreter.start();

		while (game.status === 'running') {
			const result = interpreter.step();
			if (!result) {
				// Check win condition
				if (
					game.characterPosition.x === game.level.goal.x &&
					game.characterPosition.y === game.level.goal.y
				) {
					game.status = 'won';
				} else if (game.lastEvent?.type === 'fail' || game.lastEvent?.type === 'blocked') {
					game.status = 'lost';
				} else {
					// Program finished but not at goal
					game.status = 'lost'; // Or just stopped
				}
				break;
			}
			await new Promise((r) => setTimeout(r, 500)); // Delay for visualization
		}
	}

	function reset() {
		game.reset();
	}

	// Simple block adding (click to add)
	function addBlock(type: string) {
		game.addBlock({ id: crypto.randomUUID(), type: type as any });
	}
</script>

<div class="mini-playground">
	<!-- Grid -->
	<div class="grid-container">
		<Grid {game} />
	</div>

	<!-- Controls & Program -->
	<div class="controls-container">
		<div class="block-palette">
			{#each Object.keys(game.level.availableBlocks) as type}
				<button class="palette-btn" onclick={() => addBlock(type)}>
					<Plus size={12} />
					{type}
				</button>
			{/each}
		</div>

		<div class="program-area">
			{#each game.program as block}
				<div class="program-block">
					{block.type}
				</div>
			{/each}
			{#if game.program.length === 0}
				<div class="empty-msg">Click blocks to add...</div>
			{/if}
		</div>

		<div class="action-bar">
			<button class="run-btn" onclick={run}>
				<Play size={14} /> Run
			</button>
			<button class="reset-btn" onclick={reset}>
				<RotateCcw size={14} />
			</button>
		</div>
	</div>
</div>
{#if caption}
	<div class="caption">{caption}</div>
{/if}

<style>
	.mini-playground {
		display: flex;
		flex-direction: column;
		gap: var(--size-4);
		padding: var(--size-4);
		background-color: var(--surface-1);
		border: 1px solid var(--surface-3);
		border-radius: var(--radius-2);
		box-shadow: var(--shadow-1);
	}

	@media (min-width: 768px) {
		.mini-playground {
			flex-direction: row;
		}
	}

	.grid-container {
		width: 12rem; /* h-48 w-48 approx */
		height: 12rem;
		flex-shrink: 0;
	}

	.controls-container {
		flex: 1;
		display: flex;
		flex-direction: column;
		gap: var(--size-2);
		min-width: 0;
	}

	.block-palette {
		display: flex;
		flex-wrap: wrap;
		gap: var(--size-2);
	}

	.palette-btn {
		display: flex;
		align-items: center;
		gap: var(--size-1);
		padding: var(--size-1) var(--size-2);
		background-color: var(--surface-2);
		border: 1px solid var(--surface-3);
		border-radius: var(--radius-1);
		font-size: var(--font-size-0);
		font-weight: 500;
		color: var(--text-1);
		cursor: pointer;
		box-shadow: var(--shadow-1);
	}

	.palette-btn:hover {
		background-color: var(--surface-3);
	}

	.program-area {
		flex: 1;
		min-height: 100px;
		overflow-y: auto;
		background-color: var(--surface-2);
		border: 1px solid var(--surface-3);
		border-radius: var(--radius-1);
		padding: var(--size-2);
	}

	.program-block {
		margin-bottom: var(--size-1);
		padding: var(--size-1);
		background-color: var(--surface-1);
		border: 1px solid var(--surface-3);
		border-radius: var(--radius-1);
		font-size: var(--font-size-0);
		color: var(--text-1);
	}

	.empty-msg {
		font-size: var(--font-size-0);
		font-style: italic;
		color: var(--text-3);
	}

	.action-bar {
		display: flex;
		gap: var(--size-2);
	}

	.run-btn {
		flex: 1;
		display: flex;
		align-items: center;
		justify-content: center;
		gap: var(--size-1);
		padding: var(--size-1) 0;
		background-color: var(--brand); /* Assuming --color-action was meant to be brand */
		color: white;
		border: none;
		border-radius: var(--radius-1);
		font-size: var(--font-size-1);
		font-weight: bold;
		cursor: pointer;
	}

	.run-btn:hover {
		opacity: 0.9;
	}

	.reset-btn {
		padding: 0 var(--size-3);
		background-color: var(--surface-3);
		color: var(--text-2);
		border: none;
		border-radius: var(--radius-1);
		cursor: pointer;
		display: flex;
		align-items: center;
	}

	.reset-btn:hover {
		background-color: var(--surface-4);
	}

	.caption {
		margin-top: var(--size-2);
		text-align: center;
		font-size: var(--font-size-0);
		font-style: italic;
		color: var(--text-3);
	}
</style>
