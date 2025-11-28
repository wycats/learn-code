<script lang="ts">
	import { draggableBlock, dropTarget } from '$lib/actions/dnd';
	import { monitorForElements } from '@atlaskit/pragmatic-drag-and-drop/element/adapter';
	import {
		extractClosestEdge,
		type Edge
	} from '@atlaskit/pragmatic-drag-and-drop-hitbox/closest-edge';
	import BlockComponent from './Block.svelte';
	import DropIndicator from './DropIndicator.svelte';
	import type { Block, BlockType } from '$lib/game/types';
	import type { GameModel } from '$lib/game/model.svelte';
	import { setDragContext } from '$lib/game/drag-context.svelte';
	import { Trash2, Move, ListChecks, Copy } from 'lucide-svelte';
	import { soundManager } from '$lib/game/sound';
	import { SvelteSet } from 'svelte/reactivity';

	interface Props {
		game: GameModel;
	}

	let { game }: Props = $props();

	// Palette items (derived from game level)
	const paletteItems = $derived(
		game.level.availableBlocks.map((type) => ({ id: `palette-${type}`, type }) as Block)
	);

	const isFull = $derived(
		game.level.maxBlocks !== undefined && game.blockCount >= game.level.maxBlocks
	);

	const highlight = $derived(game.currentStorySegment?.highlight);

	// Drag State
	const dragCtx = setDragContext();

	// Selection State
	const selectedBlockIds = new SvelteSet<string>();
	let isMultiSelectMode = $state(false);

	// Insertion Mode State
	let insertionMode = $state<{ type: BlockType } | null>(null);

	// Move Mode State
	let isMoveMode = $state(false);

	// Paste Mode State
	let isPasteMode = $state(false);
	let clipboard = $state<Block[]>([]);

	// Ghost State
	let ghostTargetId = $state<string | null>(null);
	let ghostSourceType = $state<BlockType | null>(null);
	let defaultGhostId = $state<string | null>(null);

	// Trash State
	let isTrashActive = $state(false);

	function findBlock(blocks: Block[], id: string): Block | null {
		for (const block of blocks) {
			if (block.id === id) return block;
			if (block.children) {
				const found = findBlock(block.children, id);
				if (found) return found;
			}
		}
		return null;
	}

	const selectedBlocks = $derived(
		Array.from(selectedBlockIds)
			.map((id) => findBlock(game.program, id))
			.filter((b) => b !== null) as Block[]
	);
	const primarySelectedBlock = $derived(selectedBlocks.length === 1 ? selectedBlocks[0] : null);
	const selectedBlockId = $derived(primarySelectedBlock?.id ?? null); // Backwards compatibility for logic that expects single ID

	function deepCloneWithNewIds(block: Block): Block {
		const newBlock = { ...block, id: crypto.randomUUID() };
		if (newBlock.children) {
			newBlock.children = newBlock.children.map((child) => deepCloneWithNewIds(child));
		}
		// Remove ghost flag if present (shouldn't be, but safety)
		delete newBlock.isGhost;
		return newBlock;
	}

	function clearGhosts() {
		ghostTargetId = null;
		ghostSourceType = null;
		defaultGhostId = null;
		function removeGhosts(blocks: Block[]) {
			for (let i = blocks.length - 1; i >= 0; i--) {
				if (blocks[i].isGhost) {
					blocks.splice(i, 1);
				} else {
					const children = blocks[i].children;
					if (children) {
						removeGhosts(children);
					}
				}
			}
		}
		removeGhosts(game.program);
		game.program = [...game.program];
	}

	function confirmGhost(ghostBlock: Block) {
		game.commit();

		// If we are in move mode, we need to delete the original block first
		if (isMoveMode && selectedBlockId) {
			// We need to find the original block ID.
			// Wait, selectedBlockId IS the original block ID in move mode.
			// But if we clicked a ghost, selectedBlockId is now the ghost ID?
			// No, handleSelect sets selectedBlockId to ghost ID *after* confirmGhost.
			// So selectedBlockId is still the original block here.

			// However, we need to be careful not to delete the ghost we just clicked.
			// The ghost is in the tree. The original is also in the tree.

			// Let's remove the original block
			removeBlock(game.program, selectedBlockId);
			isMoveMode = false;
		}

		if (isPasteMode && clipboard.length > 0) {
			const newBlocks = clipboard.map((b) => deepCloneWithNewIds(b));

			function finalizePaste(blocks: Block[]) {
				for (let i = blocks.length - 1; i >= 0; i--) {
					const b = blocks[i];
					if (b.id === ghostBlock.id) {
						// Replace ghost with new blocks
						blocks.splice(i, 1, ...newBlocks);
					} else if (b.isGhost) {
						blocks.splice(i, 1);
					}
					if (b.children) finalizePaste(b.children);
				}
			}
			finalizePaste(game.program);
			game.program = [...game.program];

			selectedBlockIds.clear();
			for (const b of newBlocks) selectedBlockIds.add(b.id);
			isPasteMode = false;
			return;
		}

		function finalize(blocks: Block[]) {
			for (let i = blocks.length - 1; i >= 0; i--) {
				const b = blocks[i];
				if (b.id === ghostBlock.id) {
					delete b.isGhost;
				} else if (b.isGhost) {
					blocks.splice(i, 1);
				}

				if (b.children) {
					finalize(b.children);
				}
			}
		}
		finalize(game.program);
		game.program = [...game.program];

		// Restore selection to the target block (if it exists) so we can keep editing relative to it
		if (ghostTargetId) {
			selectedBlockIds.clear();
			selectedBlockIds.add(ghostTargetId);
		} else {
			// Fallback to selecting the new block if we lost context
			selectedBlockIds.clear();
			selectedBlockIds.add(ghostBlock.id);
		}
	}

	function showGhosts(targetBlock: Block, source: Block | BlockType) {
		const sourceType = typeof source === 'string' ? source : source.type;

		ghostTargetId = targetBlock.id;
		ghostSourceType = sourceType;

		const ghostBefore: Block = { id: crypto.randomUUID(), type: sourceType, isGhost: true };
		const ghostAfter: Block = { id: crypto.randomUUID(), type: sourceType, isGhost: true };
		const ghostInside: Block = { id: crypto.randomUUID(), type: sourceType, isGhost: true };

		function insertGhostsRecursive(blocks: Block[]): boolean {
			const index = blocks.findIndex((b) => b.id === targetBlock.id);
			if (index !== -1) {
				// If target is loop, offer Before, Inside and After
				if (targetBlock.type === 'loop') {
					// Insert ghost after loop
					blocks.splice(index + 1, 0, ghostAfter);
					// Insert ghost before loop
					blocks.splice(index, 0, ghostBefore);

					// Insert ghost inside loop
					if (!targetBlock.children) targetBlock.children = [];
					targetBlock.children.push(ghostInside);

					defaultGhostId = ghostInside.id;
				} else {
					// If target is regular block, offer Before and After
					blocks.splice(index + 1, 0, ghostAfter);
					blocks.splice(index, 0, ghostBefore);

					defaultGhostId = ghostAfter.id;
				}
				return true;
			}

			for (const block of blocks) {
				if (block.children && insertGhostsRecursive(block.children)) return true;
			}
			return false;
		}

		insertGhostsRecursive(game.program);
		game.program = [...game.program];
	}

	function handleSelect(id: string) {
		const block = findBlock(game.program, id);

		// If we clicked a ghost, confirm it
		if (block?.isGhost) {
			confirmGhost(block);
			return;
		}

		// Paste Mode Logic
		if (isPasteMode && clipboard.length > 0 && block) {
			// If we click the SAME target again, confirm default ghost
			if (id === ghostTargetId && defaultGhostId) {
				const defaultGhost = findBlock(game.program, defaultGhostId);
				if (defaultGhost) {
					confirmGhost(defaultGhost);
					return;
				}
			}

			clearGhosts();
			showGhosts(block, clipboard[0]);
			return;
		}

		// If we are in Move Mode (and didn't click a ghost), show ghosts around the clicked block
		if (isMoveMode && selectedBlockId && block) {
			// Don't move into self
			if (block.id === selectedBlockId) return;

			// If we click the SAME target again, confirm the default ghost
			if (id === ghostTargetId && defaultGhostId) {
				const defaultGhost = findBlock(game.program, defaultGhostId);
				if (defaultGhost) {
					confirmGhost(defaultGhost);
					return;
				}
			}

			// Don't move into children (cycle)
			function isChild(parent: Block, targetId: string): boolean {
				if (!parent.children) return false;
				for (const child of parent.children) {
					if (child.id === targetId) return true;
					if (isChild(child, targetId)) return true;
				}
				return false;
			}
			const sourceBlock = findBlock(game.program, selectedBlockId);
			if (sourceBlock && isChild(sourceBlock, block.id)) return;

			clearGhosts();
			if (sourceBlock) {
				showGhosts(block, sourceBlock);
			}
			return;
		}

		if (insertionMode) {
			insertionMode = null;
		}

		// Clear ghosts if we select something else
		clearGhosts();

		// Multi-Select Logic
		if (isMultiSelectMode) {
			if (selectedBlockIds.has(id)) {
				selectedBlockIds.delete(id);
			} else {
				selectedBlockIds.add(id);
			}
			return;
		}

		// If we select a different block, exit move mode
		if (selectedBlockId !== id) {
			isMoveMode = false;
			isPasteMode = false; // Exit paste mode if we select normally
			selectedBlockIds.clear();
			selectedBlockIds.add(id);
		} else {
			// Deselect
			selectedBlockIds.clear();
			isMoveMode = false;
			isPasteMode = false;
		}
	}

	function handlePaletteClick(type: BlockType) {
		if (isFull) return;
		soundManager.play('click');

		// If we have a selected block, show ghosts around it
		if (selectedBlockId) {
			// If we click the SAME palette item again, confirm the default ghost
			if (selectedBlockId === ghostTargetId && ghostSourceType === type && defaultGhostId) {
				const defaultGhost = findBlock(game.program, defaultGhostId);
				if (defaultGhost) {
					confirmGhost(defaultGhost);
					return;
				}
			}

			clearGhosts();
			const target = findBlock(game.program, selectedBlockId);
			if (target) {
				showGhosts(target, type);
				return;
			}
		}

		clearGhosts();

		// Check if the last block is a container (Loop)
		const lastBlock = game.program.length > 0 ? game.program[game.program.length - 1] : null;
		if (lastBlock && lastBlock.type === 'loop') {
			const newBlock: Block = { id: crypto.randomUUID(), type };
			game.insertBlockIntoContainer(lastBlock.id, newBlock);
			// Select the container so we can edit its properties (and subsequent clicks use ghosts)
			selectedBlockIds.clear();
			selectedBlockIds.add(lastBlock.id);
		} else {
			// Otherwise, append to end of main program
			const newBlock: Block = { id: crypto.randomUUID(), type };
			game.addBlock(newBlock);
			// Do NOT select the new block, so we can keep appending
			// selectedBlockIds = new Set([newBlock.id]);
		}
	}

	function handleDeleteSelected() {
		if (selectedBlockIds.size === 0) return;
		soundManager.play('delete');
		game.deleteBlocks(Array.from(selectedBlockIds));
		selectedBlockIds.clear();
	}

	function handleDuplicate() {
		if (selectedBlockIds.size === 0) return;
		soundManager.play('click');

		// Deep clone selected blocks
		const blocks = Array.from(selectedBlockIds)
			.map((id) => findBlock(game.program, id))
			.filter((b) => b !== null) as Block[];

		// Store in clipboard
		clipboard = JSON.parse(JSON.stringify(blocks));

		isPasteMode = true;
		isMoveMode = false;
		isMultiSelectMode = false;

		// Show ghosts around the primary selection immediately
		if (primarySelectedBlock) {
			showGhosts(primarySelectedBlock, clipboard[0]);
		}
	}

	// Helper to remove block from anywhere in the tree
	function removeBlock(blocks: Block[], id: string): boolean {
		const index = blocks.findIndex((b) => b.id === id);
		if (index !== -1) {
			blocks.splice(index, 1);
			return true;
		}
		for (const block of blocks) {
			if (block.children && removeBlock(block.children, id)) {
				return true;
			}
		}
		return false;
	}

	function handleContainerClick(containerId: string) {
		if (!selectedBlockId) return;
		if (selectedBlockId === containerId) return; // Can't move into self

		const blockToMove = findBlock(game.program, selectedBlockId);
		if (!blockToMove) return;

		// Check if target is a child of the block we are moving (prevent cycles)
		function isChild(parent: Block, targetId: string): boolean {
			if (!parent.children) return false;
			for (const child of parent.children) {
				if (child.id === targetId) return true;
				if (isChild(child, targetId)) return true;
			}
			return false;
		}
		if (isChild(blockToMove, containerId)) return;

		// Remove from old position
		removeBlock(game.program, selectedBlockId);

		// Add to new position
		const container = findBlock(game.program, containerId);
		if (container) {
			if (!container.children) container.children = [];
			container.children.push(blockToMove);
		}

		game.program = [...game.program];
		// Keep selected so user sees where it went
	}

	$effect(() => {
		return monitorForElements({
			onDragStart: () => {
				soundManager.play('pickup');
				dragCtx.isDragging = true;
				isTrashActive = false;
			},
			onDrag: ({ location }) => {
				const target = location.current.dropTargets[0];
				if (target) {
					const data = target.data;
					isTrashActive = data.type === 'trash';
					dragCtx.targetId = (data.blockId as string) || 'program-list';
					dragCtx.closestEdge = extractClosestEdge(data);
				} else {
					isTrashActive = false;
					dragCtx.targetId = null;
					dragCtx.closestEdge = null;
				}
			},
			onDrop: ({ source, location }) => {
				dragCtx.isDragging = false;
				dragCtx.targetId = null;
				dragCtx.closestEdge = null;
				isTrashActive = false;

				const target = location.current.dropTargets[0];
				if (!target) return;

				soundManager.play('drop');

				const sourceBlock = source.data.block as Block;
				const isPaletteItem = source.data.isPaletteItem as boolean;
				const targetData = target.data;

				// Helper to insert block
				function insertBlock(
					blocks: Block[],
					targetId: string,
					newBlock: Block,
					edge: Edge | null
				) {
					// If target is the main list
					if (targetId === 'program-list') {
						// If edge is null, append to end
						if (!edge) {
							blocks.push(newBlock);
							return;
						}
						// This shouldn't happen if we have proper targets, but fallback
						blocks.push(newBlock);
						return;
					}

					// Find the target block
					// We need to find the *parent* list of the target block to insert next to it
					// OR if the target is a container (like 'loop-children'), insert inside it.

					// Wait, my drop targets are on the blocks themselves.
					// So I need to find the list containing the target block.

					function findAndInsert(list: Block[]): boolean {
						const index = list.findIndex((b) => b.id === targetId);
						if (index !== -1) {
							let insertIndex = index;
							if (edge === 'bottom') insertIndex += 1;
							list.splice(insertIndex, 0, newBlock);
							return true;
						}

						for (const block of list) {
							// Check if the target IS the container itself (e.g. dropping into a loop)
							if (targetId === `${block.id}-children`) {
								if (!block.children) block.children = [];
								block.children.push(newBlock);
								return true;
							}

							if (block.children) {
								if (findAndInsert(block.children)) return true;
							}
						}
						return false;
					}

					findAndInsert(blocks);
				}

				// Handle Trash
				if (targetData.type === 'trash') {
					if (!isPaletteItem) {
						removeBlock(game.program, sourceBlock.id);
						game.program = [...game.program]; // Trigger reactivity
					}
					return;
				}

				// Handle Drop on List or Block
				if (targetData.type === 'drop-target') {
					let newBlock: Block;
					if (isPaletteItem) {
						newBlock = { id: crypto.randomUUID(), type: sourceBlock.type };
					} else {
						newBlock = sourceBlock;
						// Remove from old position first
						removeBlock(game.program, sourceBlock.id);
					}

					// Insert at new position
					const edge = extractClosestEdge(targetData);
					const targetId = targetData.blockId as string;

					// Special case: Dropping into empty program list
					if (targetId === 'program-list' && game.program.length === 0) {
						game.program = [newBlock];
					} else {
						insertBlock(game.program, targetId, newBlock, edge);
						game.program = [...game.program]; // Trigger reactivity
					}
				}
			}
		});
	});
</script>

<div class="tray">
	<div class="palette">
		<h3>Blocks</h3>
		<div class="block-list" class:disabled={isFull}>
			{#each paletteItems as item (item.id)}
				<div
					class:opacity-50={isFull}
					class:highlighted={highlight?.target === `block:${item.type}`}
					use:draggableBlock={{ block: item, isPaletteItem: true }}
				>
					<BlockComponent
						block={item}
						isPalette={true}
						onSelect={() => handlePaletteClick(item.type)}
					/>
				</div>
			{/each}
		</div>
	</div>

	<div class="sequence">
		<div class="program-header">
			<h3>Program</h3>
			{#if game.level.maxBlocks !== undefined}
				<span class="count" class:full={isFull}>
					{game.blockCount} / {game.level.maxBlocks}
				</span>
			{:else}
				<span class="count">
					{game.blockCount}
				</span>
			{/if}
		</div>

		<div class="program-container">
			<div
				class="program-list"
				data-block-id="program-list"
				use:dropTarget={{
					blockId: 'program-list',
					type: 'drop-target'
				}}
				onclick={() => selectedBlockIds.clear()}
				role="button"
				tabindex="0"
				onkeydown={(e) => {
					if (e.key === 'Enter' || e.key === ' ') selectedBlockIds.clear();
				}}
			>
				{#each game.program as item, index (item.id)}
					<div class="block-wrapper" style:position="relative">
						{#if dragCtx.targetId === item.id && dragCtx.closestEdge === 'top'}
							<DropIndicator edge="top" />
						{/if}

						<div
							use:draggableBlock={{ block: item }}
							use:dropTarget={{
								blockId: item.id,
								index: index,
								type: 'drop-target'
							}}
						>
							<BlockComponent
								block={item}
								{game}
								activeBlockId={game.activeBlockId}
								{selectedBlockIds}
								onSelect={handleSelect}
								onContainerClick={handleContainerClick}
							/>
						</div>

						{#if dragCtx.targetId === item.id && dragCtx.closestEdge === 'bottom'}
							<DropIndicator edge="bottom" />
						{/if}
					</div>
				{/each}

				{#if game.program.length === 0}
					<div class="empty-placeholder">Drag blocks here...</div>
				{/if}
			</div>
		</div>
	</div>

	<!-- Floating Toolbar (Trash / Inspector) -->
	<div class="floating-toolbar" class:visible={dragCtx.isDragging || selectedBlockIds.size > 0}>
		{#if primarySelectedBlock && primarySelectedBlock.type === 'loop' && selectedBlockIds.size === 1}
			<div class="toolbar-item loop-control">
				<label for="loop-count">Repeat</label>
				<input
					id="loop-count"
					type="number"
					min="1"
					max="99"
					disabled={game.status === 'running'}
					value={primarySelectedBlock.count || 1}
					oninput={(e) => {
						const val = parseInt(e.currentTarget.value);
						if (!isNaN(val) && val >= 1) {
							game.updateBlock(primarySelectedBlock!.id, { count: val });
						}
					}}
				/>
			</div>
		{/if}

		<div
			class="trash-zone"
			class:active={isTrashActive}
			use:dropTarget={{
				type: 'trash'
			}}
			onclick={handleDeleteSelected}
			title="Drag here to delete, or click to delete selected"
			role="button"
			tabindex="0"
			onkeydown={(e) => {
				if (e.key === 'Enter' || e.key === ' ') handleDeleteSelected();
			}}
		>
			<Trash2 size={24} />
			{#if selectedBlockIds.size > 1}
				<span class="badge">{selectedBlockIds.size}</span>
			{/if}
		</div>

		{#if selectedBlockIds.size > 0}
			<div
				class="trash-zone"
				class:active={isPasteMode}
				onclick={handleDuplicate}
				title="Duplicate selected blocks"
				role="button"
				tabindex="0"
				onkeydown={(e) => {
					if (e.key === 'Enter' || e.key === ' ') handleDuplicate();
				}}
			>
				<Copy size={24} />
			</div>

			<div
				class="trash-zone"
				class:active={isMultiSelectMode}
				onclick={() => (isMultiSelectMode = !isMultiSelectMode)}
				title="Toggle Multi-Select Mode"
				role="button"
				tabindex="0"
				onkeydown={(e) => {
					if (e.key === 'Enter' || e.key === ' ') isMultiSelectMode = !isMultiSelectMode;
				}}
			>
				<ListChecks size={24} />
			</div>
		{/if}

		{#if selectedBlockIds.size === 1}
			<div
				class="trash-zone"
				class:active={isMoveMode}
				onclick={() => (isMoveMode = !isMoveMode)}
				title="Move selected block"
				role="button"
				tabindex="0"
				onkeydown={(e) => {
					if (e.key === 'Enter' || e.key === ' ') isMoveMode = !isMoveMode;
				}}
			>
				<Move size={24} />
			</div>
		{/if}
	</div>
</div>

<style>
	.tray {
		display: grid;
		grid-template-rows: auto 1fr; /* Palette | Program */
		gap: var(--size-4);
		padding: var(--size-3);
		height: 100%;
		background-color: var(--surface-2);
		position: relative; /* Context for floating toolbar */
	}

	.floating-toolbar {
		position: absolute;
		top: 50%;
		left: -80px; /* Push out to the left */
		transform: translateY(-50%) translateX(20px);
		opacity: 0;
		pointer-events: none;
		transition:
			opacity 0.2s,
			transform 0.2s;
		z-index: 100;
		display: flex;
		flex-direction: column;
		gap: var(--size-3);
		align-items: center;
	}

	.floating-toolbar.visible {
		opacity: 1;
		pointer-events: auto;
		transform: translateY(-50%) translateX(0);
	}

	.toolbar-item {
		background-color: var(--surface-1);
		padding: var(--size-2);
		border-radius: var(--radius-2);
		box-shadow: var(--shadow-3);
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: var(--size-1);
	}

	.loop-control label {
		font-size: var(--font-size-0);
		font-weight: bold;
		color: var(--text-2);
		text-transform: uppercase;
	}

	.loop-control input {
		width: 50px;
		text-align: center;
		padding: var(--size-1);
		border: 1px solid var(--surface-3);
		border-radius: var(--radius-1);
		font-weight: bold;
		font-size: var(--font-size-2);
	}

	h3 {
		font-size: var(--font-size-0);
		text-transform: uppercase;
		letter-spacing: 0.1em;
		color: var(--text-3);
		margin-bottom: var(--size-3);
		font-weight: 700;
	}

	.program-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: var(--size-2);
	}

	.program-header h3 {
		margin-bottom: 0;
	}

	.count {
		font-size: var(--font-size-1);
		font-weight: bold;
		color: var(--text-2);
		background-color: var(--surface-3);
		padding: 2px var(--size-2);
		border-radius: var(--radius-round);
	}

	.count.full {
		color: var(--red-7);
		background-color: var(--red-2);
	}

	.block-list.disabled {
		opacity: 0.7;
		cursor: not-allowed;
	}

	.opacity-50 {
		opacity: 0.5;
	}

	/* .palette {
		Fixed height for palette or auto? Let's keep it auto but maybe grid
	} */

	.block-list {
		display: grid;
		grid-template-columns: repeat(2, 1fr); /* 2 columns for blocks */
		gap: var(--size-2);
		padding: var(--size-2);
		background-color: var(--surface-1);
		border-radius: var(--radius-2);
		align-items: start; /* Prevent stretching */
	}

	.highlighted {
		outline: 3px solid var(--pink-5);
		box-shadow: 0 0 15px var(--pink-5);
		border-radius: var(--radius-2);
		z-index: 10;
		animation: pulse-highlight 1.5s infinite;
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

	.sequence {
		display: flex;
		flex-direction: column;
		overflow: hidden; /* Contain the scrollable list */
		min-height: 0; /* Crucial for flex child scrolling */
	}

	.program-container {
		position: relative;
		flex: 1;
		display: flex;
		flex-direction: row;
		gap: var(--size-2);
		overflow: hidden;
		min-height: 0; /* Crucial for flex child scrolling */
	}

	.trash-zone {
		width: 60px;
		height: 60px;
		background-color: var(--surface-1);
		border: 2px solid var(--red-3);
		border-radius: var(--radius-round);
		display: flex;
		align-items: center;
		justify-content: center;
		color: var(--red-7);
		box-shadow: var(--shadow-3);
		cursor: pointer;
		transition:
			transform 0.1s,
			background-color 0.2s;
		position: relative;
	}

	.trash-zone:hover {
		transform: scale(1.1);
	}

	.trash-zone.active {
		background-color: var(--red-2);
		border-color: var(--red-5);
		transform: scale(1.2);
	}

	.badge {
		position: absolute;
		top: -5px;
		right: -5px;
		background-color: var(--red-7);
		color: white;
		font-size: var(--font-size-0);
		font-weight: bold;
		width: 20px;
		height: 20px;
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
		box-shadow: var(--shadow-2);
	}

	.program-list {
		flex: 1;
		display: flex;
		flex-direction: column; /* Vertical list */
		gap: var(--size-2);
		padding: var(--size-2);
		background-color: var(--surface-1);
		border-radius: var(--radius-2);
		overflow-y: auto; /* Scroll vertically if needed */
	}

	.program-list :global(.dragging) {
		opacity: 0.5;
	}

	.empty-placeholder {
		width: 100%;
		height: 100%;
		display: grid;
		place-items: center;
		color: var(--text-3);
		font-style: italic;
		pointer-events: none;
		min-height: 100px;
	}
</style>
