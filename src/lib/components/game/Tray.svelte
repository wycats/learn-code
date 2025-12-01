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
	import { Icon } from 'lucide-svelte';
	import { broom } from '@lucide/lab';
	import { soundManager } from '$lib/game/sound';
	import { SvelteSet } from 'svelte/reactivity';
	import { fly, fade } from 'svelte/transition';

	interface Props {
		game: GameModel;
		onTarget?: (target: string) => void;
	}

	let { game, onTarget }: Props = $props();

	// Palette items (derived from game level)
	const paletteItems = $derived.by(() => {
		const items: Block[] = [];
		const available = game.level.availableBlocks;

		for (const type of Object.keys(available)) {
			if (type === 'call') {
				items.push({ id: `palette-call-generic`, type: 'call' });
			} else {
				items.push({ id: `palette-${type}`, type: type as BlockType });
			}
		}
		return items;
	});

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

	const isDisabled = $derived(game.status !== 'planning');

	const hasFunctions = $derived(Object.keys(game.functions).length > 0);
	const functionNames = $derived(Object.keys(game.functions));

	type Highlight = { targets: string[]; type?: 'pulse' | 'arrow' | 'dim'; fading?: boolean };
	const highlight = $derived.by(() => {
		if (game.previewHighlight) return game.previewHighlight;
		if (game.displaySegment?.targets) {
			return { targets: game.displaySegment.targets, type: 'pulse' } as Highlight;
		}
		return undefined;
	});

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

	function updateCallFunction(name: string) {
		if (primarySelectedBlock && primarySelectedBlock.type === 'call') {
			game.updateBlock(primarySelectedBlock.id, { functionName: name });
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
		// eslint-disable-next-line @typescript-eslint/no-unused-vars
		const { id, ...sourceProps } = typeof source === 'string' ? { id: '' } : source;

		ghostTargetId = targetBlock.id;
		ghostSourceType = sourceType;

		const ghostBefore: Block = {
			id: crypto.randomUUID(),
			type: sourceType,
			isGhost: true,
			...sourceProps
		};
		const ghostAfter: Block = {
			id: crypto.randomUUID(),
			type: sourceType,
			isGhost: true,
			...sourceProps
		};
		const ghostInside: Block = {
			id: crypto.randomUUID(),
			type: sourceType,
			isGhost: true,
			...sourceProps
		};

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

	function handlePaletteClick(sourceBlock: Block) {
		const type = sourceBlock.type;
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
				showGhosts(target, sourceBlock);
				return;
			}
		}

		clearGhosts();

		// Create new block with properties
		// eslint-disable-next-line @typescript-eslint/no-unused-vars
		const { id, ...rest } = sourceBlock;
		const newBlock: Block = { id: crypto.randomUUID(), ...rest };

		// Check if the last block is a container (Loop)
		const lastBlock =
			game.activeProgram.length > 0 ? game.activeProgram[game.activeProgram.length - 1] : null;
		if (lastBlock && lastBlock.type === 'loop') {
			game.insertBlockIntoContainer(lastBlock.id, newBlock);
			// Select the container so we can edit its properties (and subsequent clicks use ghosts)
			selectedBlockIds.clear();
			selectedBlockIds.add(lastBlock.id);
		} else {
			// Otherwise, append to end of main program
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

	function handleClear() {
		if (game.activeProgram.length === 0) return;
		soundManager.play('sweep');
		game.clearProgram();
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
		// Auto-select function if there is only one
		if (
			primarySelectedBlock?.type === 'call' &&
			functionNames.length === 1 &&
			primarySelectedBlock.functionName !== functionNames[0]
		) {
			// Use untracked to avoid infinite loops if updateCallFunction touches signals read here (though it shouldn't)
			// Actually, just calling it is fine as long as it stabilizes.
			updateCallFunction(functionNames[0]);
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
				if (isDisabled) return;
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
						// Copy all properties from source block (except id) to preserve data like functionName
						// eslint-disable-next-line @typescript-eslint/no-unused-vars
						const { id, ...rest } = sourceBlock;
						newBlock = { id: crypto.randomUUID(), ...rest };
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
		<div class="block-list" class:disabled={isDisabled}>
			{#if isDisabled}
				<div class="disabled-overlay">
					{#if game.status === 'story'}
						<span>Listen to the Guide...</span>
					{:else if game.status === 'running'}
						<span>Program Running...</span>
					{/if}
				</div>
			{/if}
			{#each paletteItems as item (item.id)}
				{@const limit = getLimit(item.type)}
				{@const used = usedCounts[item.type] || 0}
				{@const typeFull = isTypeFull(item.type)}
				<div
					class:opacity-50={typeFull || isDisabled}
					class:highlighted={highlight?.targets?.includes(`block:${item.type}`)}
					class:fading={highlight?.targets?.includes(`block:${item.type}`) && highlight?.fading}
					use:draggableBlock={{
						block: item,
						isPaletteItem: true,
						disabled: typeFull || isDisabled
					}}
					style:position="relative"
				>
					<BlockComponent
						block={item}
						isPalette={true}
						onSelect={() => handlePaletteClick(item)}
						{onTarget}
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
			<div class="header-actions">
				<button
					class="clear-btn"
					onclick={handleClear}
					disabled={isDisabled || game.activeProgram.length === 0}
					title="Clear {game.editingContext ? game.editingContext : 'Main'} Program"
				>
					<Icon iconNode={broom} size={18} />
				</button>
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
					class:disabled={isDisabled}
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
								use:draggableBlock={{ block: item, disabled: isDisabled }}
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
									{onTarget}
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
							class:highlighted={highlight?.targets?.includes(`config:loop:${count}`)}
							onclick={() => updateLoopCount(count)}
							data-value={count}
						>
							{count}x
						</button>
					{/each}
					<div class="custom-input-wrapper">
						<input
							type="number"
							class="config-input"
							class:highlighted={highlight?.targets?.includes(`config:loop:custom`)}
							value={primarySelectedBlock.count ?? ''}
							placeholder="#"
							min="1"
							max="99"
							oninput={(e) => {
								const val = parseInt(e.currentTarget.value);
								updateLoopCount(isNaN(val) ? undefined : val);
							}}
							onclick={(e) => e.stopPropagation()}
						/>
					</div>
					{#if game.level.allowInfiniteLoop !== false}
						<button
							class="config-btn infinity"
							class:active={primarySelectedBlock.count === undefined}
							class:highlighted={highlight?.targets?.includes(`config:loop:infinity`)}
							onclick={() => updateLoopCount(undefined)}
							title="Repeat Forever"
							data-value="infinity"
						>
							<InfinityIcon size={20} />
						</button>
					{/if}
				</div>
			</div>
		{:else if primarySelectedBlock?.type === 'call'}
			<div class="config-panel" transition:fly={{ x: -20, duration: 200 }}>
				<div class="config-header">Call Function</div>
				<div class="config-list">
					{#if functionNames.length === 0}
						<div class="empty-msg">No functions created</div>
					{:else if functionNames.length === 1}
						{@const name = functionNames[0]}
						<div class="single-function-display">
							<span class="label">Calling:</span>
							<span class="value">{name}</span>
						</div>
					{:else}
						{#each functionNames as name (name)}
							<button
								class="config-btn text"
								class:active={primarySelectedBlock.functionName === name}
								onclick={() => updateCallFunction(name)}
							>
								{name}
							</button>
						{/each}
					{/if}
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

	.config-list {
		display: flex;
		flex-direction: column;
		gap: var(--size-1);
		max-height: 60vh;
		overflow-y: auto;
		/* Add padding to accommodate hover/active transforms without triggering scrollbars */
		padding: var(--size-1);
	}

	.single-function-display {
		background-color: var(--blue-2);
		color: var(--blue-7);
		border: 1px solid var(--blue-5);
		border-radius: var(--radius-2);
		padding: var(--size-3);
		text-align: center;
		font-weight: bold;
		display: flex;
		flex-direction: column;
		gap: var(--size-1);
	}

	.single-function-display .label {
		font-size: var(--font-size-0);
		text-transform: uppercase;
		opacity: 0.7;
	}

	.single-function-display .value {
		font-size: var(--font-size-2);
	}

	.empty-msg {
		font-size: var(--font-size-0);
		color: var(--text-3);
		font-style: italic;
		text-align: center;
		padding: var(--size-2);
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

	.config-btn.text {
		width: 100%;
		aspect-ratio: auto;
		padding: var(--size-2);
		justify-content: flex-start;
		text-align: left;
	}

	.config-btn.active {
		background-color: var(--blue-2);
		color: var(--blue-7);
		border-color: var(--blue-5);
		box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.1);
		transform: translateY(1px);
	}

	.config-btn.highlighted,
	.config-input.highlighted {
		outline: 3px solid var(--pink-5);
		box-shadow: 0 0 15px var(--pink-5);
		z-index: 10;
		animation: pulse-highlight 1.5s infinite;
	}

	.custom-input-wrapper {
		grid-column: span 1;
		display: flex;
	}

	.config-input {
		width: 100%;
		height: 100%;
		border: 1px solid rgba(0, 0, 0, 0.1);
		border-radius: var(--radius-2);
		text-align: center;
		font-weight: bold;
		font-size: var(--font-size-1);
		color: var(--text-1);
		background-color: rgba(255, 255, 255, 0.5);
		padding: 0;
		transition: all 0.2s;
	}

	.config-input:focus {
		background-color: white;
		outline: 2px solid var(--blue-5);
		border-color: transparent;
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

	.header-actions {
		display: flex;
		align-items: center;
		gap: var(--size-2);
	}

	.clear-btn {
		background: none;
		border: none;
		color: var(--text-3);
		cursor: pointer;
		width: var(--touch-target-min);
		height: var(--touch-target-min);
		padding: 0;
		border-radius: var(--radius-1);
		display: flex;
		align-items: center;
		justify-content: center;
		transition: all 0.2s;
	}

	.clear-btn:hover {
		background-color: var(--surface-3);
		color: var(--red-6);
	}

	.clear-btn:disabled {
		opacity: 0.3;
		cursor: not-allowed;
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
		position: relative; /* For overlay */
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

	.disabled-overlay {
		position: absolute;
		inset: 0;
		background-color: rgba(255, 255, 255, 0.6);
		backdrop-filter: blur(2px);
		z-index: 20;
		display: flex;
		align-items: center;
		justify-content: center;
		border-radius: var(--radius-2);
		font-weight: bold;
		color: var(--text-2);
		font-size: var(--font-size-1);
		text-align: center;
		padding: var(--size-2);
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
		display: grid;
		grid-template-columns: 100%;
		grid-template-rows: 100%;
		overflow: hidden;
		min-height: 0; /* Crucial for flex child scrolling */
	}

	.program-list {
		grid-area: 1 / 1;
		display: grid;
		grid-template-columns: 1fr 1fr;
		align-content: start;
		gap: var(--size-2);
		padding: var(--size-2);
		background-color: var(--surface-1);
		border-radius: var(--radius-2);
		overflow-y: auto; /* Scroll vertically if needed */
	}

	.program-list.disabled {
		opacity: 0.7;
		pointer-events: none;
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
		padding: 0 var(--size-2);
		min-height: var(--touch-target-min);
		font-weight: bold;
		color: var(--text-2);
		cursor: pointer;
		border-radius: var(--radius-2);
		white-space: nowrap;
		display: flex;
		align-items: center;
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
