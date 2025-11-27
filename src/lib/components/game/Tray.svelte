<script lang="ts">
	import { dndzone, type DndEvent } from 'svelte-dnd-action';
	import { flip } from 'svelte/animate';
	import BlockComponent from './Block.svelte';
	import type { Block, BlockType } from '$lib/game/types';
	import type { GameModel } from '$lib/game/model.svelte';

	interface Props {
		game: GameModel;
	}

	let { game }: Props = $props();

	// Palette items (static source)
	// We use a derived or state for this, but it needs to be stable for dndzone
	const availableTypes: BlockType[] = ['move-forward', 'turn-left', 'turn-right'];

	// We need a stable ID for palette items so dndzone can track them
	let paletteItems = $state(
		availableTypes.map((type) => ({ id: `palette-${type}`, type }) as Block)
	);

	function handlePaletteConsider(e: CustomEvent<DndEvent<Block>>) {
		paletteItems = e.detail.items;
	}

	function handlePaletteFinalize() {
		// Reset palette to ensure items are "copied" not moved
		paletteItems = availableTypes.map((type) => ({ id: `palette-${type}`, type }) as Block);
	}

	function handleProgramConsider(e: CustomEvent<DndEvent<Block>>) {
		game.program = e.detail.items;
	}

	function handleProgramFinalize(e: CustomEvent<DndEvent<Block>>) {
		const items = e.detail.items.map((item) => {
			// If it's a fresh drop from palette, give it a real ID
			if (item.id.startsWith('palette-')) {
				return { ...item, id: crypto.randomUUID() };
			}
			return item;
		});

		// We update the model. Ideally we'd use a method to track history,
		// but for DnD integration, direct assignment is often smoother.
		// We can manually trigger history push here if needed.
		game.program = items;
	}
</script>

<div class="tray">
	<div class="palette">
		<h3>Blocks</h3>
		<div
			class="block-list"
			use:dndzone={{ items: paletteItems, flipDurationMs: 300, dropFromOthersDisabled: true }}
			onconsider={handlePaletteConsider}
			onfinalize={handlePaletteFinalize}
		>
			{#each paletteItems as item (item.id)}
				<div animate:flip={{ duration: 300 }}>
					<BlockComponent type={item.type} />
				</div>
			{/each}
		</div>
	</div>

	<div class="sequence">
		<h3>Program</h3>
		<div
			class="program-list"
			use:dndzone={{ items: game.program, flipDurationMs: 300 }}
			onconsider={handleProgramConsider}
			onfinalize={handleProgramFinalize}
		>
			{#each game.program as item, index (item.id)}
				<div animate:flip={{ duration: 300 }} class:active={game.activeBlockIndex === index}>
					<BlockComponent type={item.type} />
				</div>
			{/each}

			{#if game.program.length === 0}
				<div class="empty-placeholder">Drag blocks here...</div>
			{/if}
		</div>
	</div>
</div>

<style>
	.tray {
		display: grid;
		grid-template-columns: 200px 1fr;
		gap: var(--size-4);
		height: 100%;
		padding: var(--size-3);
		background-color: var(--surface-2);
		border-top: 1px solid var(--surface-3);
	}

	h3 {
		font-size: var(--font-size-1);
		text-transform: uppercase;
		letter-spacing: var(--font-letterspacing-1);
		color: var(--text-2);
		margin-bottom: var(--size-2);
	}

	.block-list,
	.program-list {
		min-height: 100px;
		display: flex;
		flex-direction: column;
		gap: var(--size-2);
		padding: var(--size-2);
		background-color: var(--surface-1);
		border-radius: var(--radius-2);
	}

	.program-list {
		flex-direction: row; /* Horizontal sequence */
		flex-wrap: wrap;
		align-content: flex-start;
	}

	.empty-placeholder {
		width: 100%;
		height: 100%;
		display: grid;
		place-items: center;
		color: var(--text-3);
		font-style: italic;
		pointer-events: none;
	}

	.active :global(.block) {
		outline: 3px solid var(--yellow-5);
		box-shadow: 0 0 10px var(--yellow-5);
	}
</style>
