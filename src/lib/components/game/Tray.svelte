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
	import { Trash2, Move, ListChecks, Copy, Infinity as InfinityIcon } from 'lucide-svelte';
	import { soundManager } from '$lib/game/sound';
	import { SvelteSet } from 'svelte/reactivity';
	import { fly, fade } from 'svelte/transition';

	interface Props {
		game: GameModel;
	}

	let { game }: Props = $props();

	// Palette items (derived from game level)
	const paletteItems = $derived(
		Object.keys(game.level.availableBlocks).map(
			(type) => ({ id: `palette-${type}`, type: type as BlockType }) as Block
		)
	);

	// Helper to count blocks by type across the entire solution (program + functions)
	function countBlocksByType(
		program: Block[],
		functions: Record<string, Block[]>
	): Record<string, number> {
		const counts: Record<string, number> = {};

		function recurse(list: Block[]) {
			for (const block of list) {
				counts[block.type] = (counts[block.type] || 0) + 1;
				if (block.children) recurse(block.children);
			}
		}

		recurse(program);
		for (const funcName in functions) {
			recurse(functions[funcName]);
		}
		return counts;
	}

	const usedCounts = $derived(countBlocksByType(game.program, game.functions));

	function getLimit(type: BlockType): number | 'unlimited' {
		return game.level.availableBlocks[type] ?? 0;
	}

	function isTypeFull(type: BlockType): boolean {
		if (isFull) return true; // Global limit
		const limit = getLimit(type);
		if (limit === 'unlimited') return false;
		const used = usedCounts[type] || 0;
		return used >= limit;
	}

	const isFull = $derived(
		game.level.maxBlocks !== undefined && game.blockCount >= game.level.maxBlocks
	);

	const hasFunctions = $derived(Object.keys(game.functions).length > 0);
	const functionNames = $derived(Object.keys(game.functions));

	type Highlight = { target: string; type?: 'pulse' | 'arrow' | 'dim'; fading?: boolean };
	const highlight = $derived(
		(game.previewHighlight || game.displaySegment?.highlight) as Highlight | undefined
	);

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
			.map((id) => findBlock(game.activeProgram, id))
			.filter((b) => b !== null) as Block[]
	);
	const primarySelectedBlock = $derived(selectedBlocks.length === 1 ? selectedBlocks[0] : null);
	const selectedBlockId = $derived(primarySelectedBlock?.id ?? null); // Backwards compatibility for logic that expects single ID

	function updateLoopCount(count: number | undefined) {
		if (primarySelectedBlock && primarySelectedBlock.type === 'loop') {
			game.updateBlock(primarySelectedBlock.id, { count });
		}
	}

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
		removeGhosts(game.activeProgram);
		game.activeProgram = [...game.activeProgram];
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
			removeBlock(game.activeProgram, selectedBlockId);
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
			finalizePaste(game.activeProgram);
			game.activeProgram = [...game.activeProgram];

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
		finalize(game.activeProgram);
		game.activeProgram = [...game.activeProgram];

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

		insertGhostsRecursive(game.activeProgram);
		game.activeProgram = [...game.activeProgram];
	}

	function handleSelect(id: string) {
		const block = findBlock(game.activeProgram, id);

		// If we clicked a ghost, confirm it
		if (block?.isGhost) {
			confirmGhost(block);
			return;
		}

		// Paste Mode Logic
		if (isPasteMode && clipboard.length > 0 && block) {
			// If we click the SAME target again, confirm default ghost
			if (id === ghostTargetId && defaultGhostId) {
				const defaultGhost = findBlock(game.activeProgram, defaultGhostId);
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
				const defaultGhost = findBlock(game.activeProgram, defaultGhostId);
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
			const sourceBlock = findBlock(game.activeProgram, selectedBlockId);
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
		if (isTypeFull(type)) return;
		soundManager.play('click');

		// If we have a selected block, show ghosts around it
		if (selectedBlockId) {
			// If we click the SAME palette item again, confirm the default ghost
			if (selectedBlockId === ghostTargetId && ghostSourceType === type && defaultGhostId) {
				const defaultGhost = findBlock(game.activeProgram, defaultGhostId);
				if (defaultGhost) {
					confirmGhost(defaultGhost);
					return;
				}
			}

			clearGhosts();
			const target = findBlock(game.activeProgram, selectedBlockId);
			if (target) {
				showGhosts(target, type);
				return;
			}
		}

		clearGhosts();

		// Check if the last block is a container (Loop)
		const lastBlock =
			game.activeProgram.length > 0 ? game.activeProgram[game.activeProgram.length - 1] : null;
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
			.map((id) => findBlock(game.activeProgram, id))
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

		const blockToMove = findBlock(game.activeProgram, selectedBlockId);
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
		removeBlock(game.activeProgram, selectedBlockId);

		// Add to new position
		const container = findBlock(game.activeProgram, containerId);
		if (container) {
			if (!container.children) container.children = [];
			container.children.push(blockToMove);
		}

		game.activeProgram = [...game.activeProgram];
		// Keep selected so user sees where it went
	}

	$effect(() => {
		if (game.status === 'running') {
			selectedBlockIds.clear();
			isMoveMode = false;
			isPasteMode = false;
			isMultiSelectMode = false;
			insertionMode = null;
		}
	});

	$effect(() => {
		if (game.activeBlockId) {
			// We need to wait for the DOM to update if we just switched context
			// But $effect runs after render, so it should be fine.
			// However, the element might be inside a key block that just remounted.
			// Let's try a small timeout or just run it.
			const el = document.querySelector(`[data-block-id="${game.activeBlockId}"]`);
			if (el) {
				el.scrollIntoView({ behavior: 'smooth', block: 'center' });
			}
		}
	});

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
						removeBlock(game.activeProgram, sourceBlock.id);
						game.activeProgram = [...game.activeProgram]; // Trigger reactivity
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
						removeBlock(game.activeProgram, sourceBlock.id);
					}

					// Insert at new position
					const edge = extractClosestEdge(targetData);
					const targetId = targetData.blockId as string;

					// Special case: Dropping into empty program list
					if (targetId === 'program-list' && game.activeProgram.length === 0) {
						game.activeProgram = [newBlock];
					} else {
						insertBlock(game.activeProgram, targetId, newBlock, edge);
						game.activeProgram = [...game.activeProgram]; // Trigger reactivity
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
				{@const limit = getLimit(item.type)}
				{@const used = usedCounts[item.type] || 0}
				{@const typeFull = isTypeFull(item.type)}
				<div
					class:opacity-50={typeFull}
					class:highlighted={highlight?.target === `block:${item.type}`}
					class:fading={highlight?.target === `block:${item.type}` && highlight?.fading}
					use:draggableBlock={{ block: item, isPaletteItem: true, disabled: typeFull }}
					style:position="relative"
				>
					<BlockComponent
						block={item}
						isPalette={true}
						onSelect={() => handlePaletteClick(item.type)}
					/>
					{#if limit !== 'unlimited'}
						<div class="limit-badge" class:full={typeFull}>
							{limit - used}
						</div>
					{/if}
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

		{#if hasFunctions}
			<div class="context-tabs">
				<button
					class:active={game.editingContext === null}
					onclick={() => (game.editingContext = null)}
				>
					Main
				</button>
				{#each functionNames as name (name)}
					<button
						class:active={game.editingContext === name}
						onclick={() => (game.editingContext = name)}
					>
						{name}
					</button>
				{/each}
			</div>
		{/if}

		<div class="program-container">
			{#key game.editingContext}
				<div
					class="program-list"
					in:fly={{ x: 20, duration: 300, delay: 100 }}
					out:fade={{ duration: 100 }}
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
					{#each game.activeProgram as item, index (item.id)}
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

					{#if game.activeProgram.length === 0}
						<div class="empty-placeholder">Drag blocks here...</div>
					{/if}
				</div>
			{/key}
		</div>
	</div>

	<!-- Floating Toolbar (Trash / Inspector) -->
	<div class="floating-toolbar" class:visible={dragCtx.isDragging || selectedBlockIds.size > 0}>
		<!-- Configuration Panel (Left of Toolbar) -->
		{#if primarySelectedBlock?.type === 'loop'}
			<div class="config-panel" transition:fly={{ x: -20, duration: 200 }}>
				<div class="config-header">Repeat</div>
				<div class="config-grid">
					{#each [2, 3, 4, 5, 10] as count (count)}
						<button
							class="config-btn"
							class:active={primarySelectedBlock.count === count}
							onclick={() => updateLoopCount(count)}
						>
							{count}x
						</button>
					{/each}
					<button
						class="config-btn infinity"
						class:active={primarySelectedBlock.count === undefined}
						onclick={() => updateLoopCount(undefined)}
						title="Repeat Forever"
					>
						<InfinityIcon size={20} />
					</button>
				</div>
			</div>
		{/if}

		<div class="toolbar-container">
			<div
				class="toolbar-btn trash-zone"
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
				<span class="label">Delete</span>
				{#if selectedBlockIds.size > 1}
					<span class="badge">{selectedBlockIds.size}</span>
				{/if}
			</div>

			{#if selectedBlockIds.size > 0}
				<div
					class="toolbar-btn"
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
					<span class="label">Copy</span>
				</div>

				<div
					class="toolbar-btn"
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
					<span class="label">Select</span>
				</div>
			{/if}

			{#if selectedBlockIds.size === 1}
				<div
					class="toolbar-btn"
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
					<span class="label">Move</span>
				</div>
			{/if}
		</div>
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

	@media (max-width: 768px) {
		.tray {
			grid-template-rows: 1fr;
			grid-template-columns: 140px 1fr; /* Palette | Program */
		}
	}

	.floating-toolbar {
		position: absolute;
		top: 50%;
		left: -100px; /* Push out to the left */
		transform: translateY(-50%) translateX(20px);
		opacity: 0;
		pointer-events: none;
		transition:
			opacity 0.2s,
			transform 0.2s;
		z-index: 100;
		display: flex;
		flex-direction: column;
		align-items: center;
		/* Allow config panel to overflow */
		overflow: visible;
	}

	.floating-toolbar.visible {
		opacity: 1;
		pointer-events: auto;
		transform: translateY(-50%) translateX(0);
	}

	.config-panel {
		position: absolute;
		right: 100%;
		top: 50%;
		transform: translateY(-50%);
		margin-right: var(--size-3);

		/* Glassomorphism */
		background: rgba(255, 255, 255, 0.65);
		backdrop-filter: blur(12px);
		-webkit-backdrop-filter: blur(12px);
		border: 1px solid rgba(255, 255, 255, 0.5);
		box-shadow:
			0 10px 25px -5px rgba(0, 0, 0, 0.1),
			0 8px 10px -6px rgba(0, 0, 0, 0.1),
			inset 0 0 20px rgba(255, 255, 255, 0.5);

		border-radius: var(--radius-3);
		padding: var(--size-3);
		width: 200px;
		display: flex;
		flex-direction: column;
		gap: var(--size-2);
	}

	.config-header {
		font-size: var(--font-size-0);
		font-weight: 800;
		color: var(--text-2);
		text-transform: uppercase;
		letter-spacing: 0.05em;
		text-align: center;
		padding-bottom: var(--size-1);
		border-bottom: 1px solid rgba(0, 0, 0, 0.05);
	}

	.config-grid {
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		gap: var(--size-2);
	}

	.config-btn {
		aspect-ratio: 1;
		background-color: rgba(255, 255, 255, 0.5);
		border: 1px solid rgba(0, 0, 0, 0.05);
		border-radius: var(--radius-2);
		font-size: var(--font-size-1);
		font-weight: bold;
		color: var(--text-2);
		cursor: pointer;
		display: flex;
		align-items: center;
		justify-content: center;
		transition: all 0.2s var(--ease-2);
		box-shadow: 0 2px 5px rgba(0, 0, 0, 0.05);
	}

	.config-btn:hover {
		background-color: white;
		transform: translateY(-2px);
		box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
		color: var(--text-1);
	}

	.config-btn.active {
		background-color: var(--blue-2);
		color: var(--blue-7);
		border-color: var(--blue-5);
		box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.1);
		transform: translateY(1px);
	}

	.toolbar-container {
		background-color: var(--surface-1);
		padding: var(--size-2);
		border-radius: var(--radius-3);
		box-shadow: var(--shadow-4);
		display: flex;
		flex-direction: column;
		gap: var(--size-2);
		border: 1px solid var(--surface-3);
	}

	.toolbar-btn {
		width: 70px;
		height: 70px;
		background-color: var(--surface-2);
		border: 2px solid transparent;
		border-radius: var(--radius-2);
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: var(--size-1);
		color: var(--text-2);
		cursor: pointer;
		transition:
			transform 0.1s,
			background-color 0.2s,
			color 0.2s;
		position: relative;
	}

	.toolbar-btn:hover {
		background-color: var(--surface-3);
		color: var(--text-1);
		transform: scale(1.05);
	}

	.toolbar-btn.active {
		background-color: var(--blue-2);
		color: var(--blue-7);
		border-color: var(--blue-5);
	}

	.toolbar-btn .label {
		font-size: var(--font-size-00);
		font-weight: bold;
		text-transform: uppercase;
	}

	.trash-zone {
		color: var(--red-7);
		border-color: var(--red-3);
	}

	.trash-zone:hover {
		background-color: var(--red-1);
	}

	.trash-zone.active {
		background-color: var(--red-2);
		border-color: var(--red-5);
		transform: scale(1.1);
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

	.block-list {
		display: grid;
		grid-template-columns: repeat(2, 1fr); /* 2 columns for blocks */
		gap: var(--size-2);
		padding: var(--size-2);
		background-color: var(--surface-1);
		border-radius: var(--radius-2);
		align-items: start; /* Prevent stretching */
	}

	@media (max-width: 768px) {
		.block-list {
			grid-template-columns: 1fr;
		}
	}

	.block-list.disabled {
		opacity: 0.7;
		cursor: not-allowed;
	}

	.opacity-50 {
		opacity: 0.5;
	}

	.highlighted {
		outline: 3px solid var(--pink-5);
		box-shadow: 0 0 15px var(--pink-5);
		border-radius: var(--radius-2);
		z-index: 10;
		animation: pulse-highlight 1.5s infinite;
	}

	.highlighted.fading {
		animation: none;
		outline-color: transparent;
		box-shadow: none;
		transition:
			outline-color 2s ease-out,
			box-shadow 2s ease-out;
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

	.context-tabs {
		display: flex;
		gap: var(--size-2);
		margin-bottom: var(--size-2);
		padding-bottom: var(--size-2);
		border-bottom: 1px solid var(--surface-3);
		overflow-x: auto;
	}

	.context-tabs button {
		background: none;
		border: none;
		padding: var(--size-1) var(--size-2);
		font-weight: bold;
		color: var(--text-2);
		cursor: pointer;
		border-radius: var(--radius-2);
		white-space: nowrap;
	}

	.context-tabs button.active {
		background-color: var(--surface-3);
		color: var(--text-1);
	}

	.context-tabs button:hover {
		background-color: var(--surface-2);
	}

	.limit-badge {
		position: absolute;
		top: -5px;
		right: -5px;
		background-color: var(--blue-5);
		color: white;
		font-size: var(--font-size-00);
		font-weight: bold;
		width: 20px;
		height: 20px;
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
		box-shadow: var(--shadow-2);
		z-index: 5;
	}

	.limit-badge.full {
		background-color: var(--surface-4);
		color: var(--text-3);
	}
</style>
