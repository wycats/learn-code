<script lang="ts">
	import { draggableVariable } from '$lib/actions/dnd';
	import { interactionTarget, interactionManager } from '$lib/interactions';
	import { focusManager } from '$lib/interactions/focus.svelte';
	import { editorState } from '$lib/interactions/editor.svelte';
	import { dropTarget } from '$lib/interactions/dnd';
	import { monitorForElements } from '@atlaskit/pragmatic-drag-and-drop/element/adapter';
	import { extractClosestEdge } from '@atlaskit/pragmatic-drag-and-drop-hitbox/closest-edge';
	import BlockComponent from './Block.svelte';
	import HeldItemToken from './HeldItemToken.svelte';
	import DropIndicator from './DropIndicator.svelte';
	import DialInput from '$lib/components/builder/DialInput.svelte';
	import type { Block, BlockType } from '$lib/game/types';
	import {
		cloneBlockWithFreshIds,
		findBlockInList,
		insertBlockInList,
		removeBlockFromList,
		updateBlockInList,
		type BlockListInsertTarget
	} from '$lib/game/block-list';
	import type { GameModel } from '$lib/game/model.svelte';
	import { resolveItemDefinition } from '$lib/game/utils';
	import { Trash2, Move, ListChecks, Copy, Infinity as InfinityIcon } from 'lucide-svelte';
	import { Icon } from 'lucide-svelte';
	import { broom } from '@lucide/lab';
	import { soundManager } from '$lib/game/sound';
	import { fly, fade } from 'svelte/transition';

	interface Props {
		game: GameModel;
		onTarget?: (target: string) => void;
		isStepMode?: boolean;
		draftingTable?: Block[];
	}

	let { game, onTarget, isStepMode = false, draftingTable }: Props = $props();

	type BlockSurface = 'palette' | 'program' | 'draft';
	type EditableBlockSurface = Exclude<BlockSurface, 'palette'>;
	type SelectedBlock = { block: Block; surface: EditableBlockSurface };

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

	const hasVariables = $derived.by(() => {
		if ('pick-up' in game.level.availableBlocks) return true;
		if (!game.level.items) return false;

		return Object.values(game.level.items).some((item) => {
			const def = resolveItemDefinition(game.level, item.type, undefined);
			if (def && def.behavior === 'vehicle') return false;
			return true;
		});
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
	const disabledOverlayText = $derived.by(() => {
		if (game.status === 'story') return 'Listen to the Guide...';
		if (game.status === 'goal') return 'Start planning to edit blocks.';
		if (game.status === 'running' && isStepMode) return 'Step Mode: paused to inspect the program.';
		if (game.status === 'running') return 'Program Running...';
		if (game.status === 'lost') return 'Run stopped. Try Again, or Reset to edit.';
		if (game.status === 'won') return 'Level Complete! Replay or continue.';
		return null;
	});
	const disabledModeLabel = $derived.by(() => {
		if (game.status === 'story') return 'Story Mode';
		if (game.status === 'goal') return 'Goal Mode';
		if (game.status === 'running' && isStepMode) return 'Step Mode';
		if (game.status === 'running') return 'Running';
		if (game.status === 'lost') return 'Lost';
		if (game.status === 'won') return 'Won';
		return null;
	});

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
	let isDragging = $state(false);

	// Selection State
	let isVariableSelected = $state(false);

	// Insertion Mode State
	let insertionMode = $state<{ type: BlockType } | null>(null);

	// Editor State Delegation
	const isMoveMode = $derived(editorState.mode === 'move');
	const isPasteMode = $derived(editorState.mode === 'paste');

	// Trash State
	let isTrashActive = $state(false);

	function findBlockWithSurface(id: string): SelectedBlock | null {
		const programBlock = findBlockInList(game.activeProgram, id);
		if (programBlock) return { block: programBlock, surface: 'program' };

		if (draftingTable) {
			const draftBlock = findBlockInList(draftingTable, id);
			if (draftBlock) return { block: draftBlock, surface: 'draft' };
		}

		return null;
	}

	function updateEditableBlock(id: string, updates: Partial<Block>) {
		const selected = findBlockWithSurface(id);
		if (!selected) return;

		if (selected.surface === 'program') {
			game.updateBlock(id, updates);
			return;
		}

		if (draftingTable) {
			updateBlockInList(draftingTable, id, updates);
		}
	}

	const selectedBlockEntries = $derived(
		Array.from(interactionManager.selection)
			.map((id) => findBlockWithSurface(id))
			.filter((entry) => entry !== null) as SelectedBlock[]
	);
	const selectedBlocks = $derived(selectedBlockEntries.map((entry) => entry.block));
	const primarySelectedEntry = $derived(
		selectedBlockEntries.length === 1 ? selectedBlockEntries[0] : null
	);
	const primarySelectedBlock = $derived(primarySelectedEntry?.block ?? null);
	const primarySelectedSurface = $derived(primarySelectedEntry?.surface ?? null);
	const selectedBlockId = $derived(primarySelectedBlock?.id ?? null); // Backwards compatibility for logic that expects single ID

	function handleVariableClick() {
		if (isDisabled) return;
		isVariableSelected = !isVariableSelected;
		if (isVariableSelected) {
			interactionManager.clearSelection();
			if (onTarget) onTarget('variable:heldItem');
		}
	}

	function handleTargetClick(target: string) {
		if (isVariableSelected) {
			// Parse target string 'block:{id}:count'
			const match = target.match(/^block:(.+):count$/);
			if (match) {
				const blockId = match[1];
				updateEditableBlock(blockId, {
					count: { type: 'variable', variableId: 'heldItem' }
				});
				soundManager.play('click');
				isVariableSelected = false;
				interactionManager.clearSelection();
			}
		} else if (onTarget) {
			onTarget(target);
		}
	}

	function updateLoopCount(count: number | undefined | 'variable') {
		if (primarySelectedBlock && primarySelectedBlock.type === 'loop') {
			if (count === 'variable') {
				updateEditableBlock(primarySelectedBlock.id, {
					count: { type: 'variable', variableId: 'heldItem' }
				});
			} else {
				updateEditableBlock(primarySelectedBlock.id, { count });
			}
		}
	}

	function updateCallFunction(name: string) {
		if (primarySelectedBlock && primarySelectedBlock.type === 'call') {
			updateEditableBlock(primarySelectedBlock.id, { functionName: name });
		}
	}

	function handleSelect(id: string) {
		const selected = findBlockWithSurface(id);
		if (selected?.surface === 'draft') {
			editorState.setMode('idle');
			editorState.clearGhosts();
			interactionManager.select(id);
		} else {
			editorState.handleBlockClick(game, id);
		}

		// If we select a different block (and not in multi-select), we might need to sync local state?
		// No, local state is gone.

		if (insertionMode) {
			insertionMode = null;
		}

		// Variable selection logic
		if (id !== selectedBlockId) {
			isVariableSelected = false;
		}
	}

	function handlePaletteClick(sourceBlock: Block) {
		const type = sourceBlock.type;
		if (isTypeFull(type)) return;
		soundManager.play('click');

		// If we have a selected block, show ghosts around it
		if (selectedBlockId) {
			// If we click the SAME palette item again, confirm the default ghost
			if (
				selectedBlockId === editorState.ghostTargetId &&
				editorState.ghostSourceType === type &&
				editorState.defaultGhostId
			) {
				const defaultGhost = findBlockInList(game.activeProgram, editorState.defaultGhostId);
				if (defaultGhost) {
					editorState.confirmGhost(game, defaultGhost);
					return;
				}
			}

			editorState.clearGhosts();
			const target = findBlockInList(game.activeProgram, selectedBlockId);
			if (target) {
				editorState.showGhosts(game, target, sourceBlock);
				return;
			}
		}

		editorState.clearGhosts();

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
			interactionManager.select(lastBlock.id);
		} else {
			// Otherwise, append to end of main program
			game.addBlock(newBlock);
			// Do NOT select the new block, so we can keep appending
			// selectedBlockIds = new Set([newBlock.id]);
		}
	}

	function handleDeleteSelected() {
		if (interactionManager.selection.size === 0) return;
		const programIds: string[] = [];
		const draftIds: string[] = [];

		for (const entry of selectedBlockEntries) {
			if (entry.surface === 'program') {
				programIds.push(entry.block.id);
			} else {
				draftIds.push(entry.block.id);
			}
		}

		if (programIds.length === 0 && draftIds.length === 0) return;

		soundManager.play('delete');
		if (programIds.length > 0) {
			game.deleteBlocks(programIds);
		}
		if (draftingTable && draftIds.length > 0) {
			for (const id of draftIds) {
				removeBlockFromList(draftingTable, id);
			}
		}
		interactionManager.clearSelection();
	}

	function handleDuplicate() {
		if (interactionManager.selection.size === 0) return;
		soundManager.play('click');

		// Deep clone selected blocks
		const blocks = selectedBlocks;

		editorState.copy(blocks);
		editorState.isMultiSelectMode = false;

		// Show ghosts around the primary selection immediately
		if (
			primarySelectedBlock &&
			primarySelectedSurface === 'program' &&
			editorState.clipboard.length > 0
		) {
			editorState.showGhosts(game, primarySelectedBlock, editorState.clipboard[0]);
		}
	}

	function handleContainerClick(containerId: string) {
		if (!selectedBlockId || primarySelectedSurface !== 'program') return;
		if (selectedBlockId === containerId) return; // Can't move into self

		const blockToMove = findBlockInList(game.activeProgram, selectedBlockId);
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
		removeBlockFromList(game.activeProgram, selectedBlockId);

		// Add to new position
		const container = findBlockInList(game.activeProgram, containerId);
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

	function handleWindowKeydown(e: KeyboardEvent) {
		if (isDisabled) return;

		// If we are editing a text input, ignore
		if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

		if (e.key === 'ArrowDown' || e.key === 'ArrowRight') {
			const current = document.activeElement?.getAttribute('data-interaction-id');
			if (current) {
				e.preventDefault();
				focusManager.navigate(current, 'next');
			} else if (game.activeProgram.length > 0) {
				// If nothing focused, focus the first block in program
				e.preventDefault();
				focusManager.focus(game.activeProgram[0].id);
			}
		} else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') {
			const current = document.activeElement?.getAttribute('data-interaction-id');
			if (current) {
				e.preventDefault();
				focusManager.navigate(current, 'prev');
			}
		}
	}

	$effect(() => {
		if (game.status === 'running') {
			interactionManager.clearSelection();
			editorState.setMode('idle');
			editorState.isMultiSelectMode = false;
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

	function getSurfaceBlocks(surface: EditableBlockSurface): Block[] | null {
		if (surface === 'program') return game.activeProgram;
		return draftingTable ?? null;
	}

	function syncSurface(surface: EditableBlockSurface) {
		if (surface === 'program') {
			game.activeProgram = [...game.activeProgram];
		}
	}

	function getDragSurface(sourceData: Record<string, unknown>): BlockSurface {
		if (sourceData.surface === 'draft') return 'draft';
		if (sourceData.surface === 'program') return 'program';
		return 'palette';
	}

	function getVerticalEdge(data: Record<string, unknown>): 'top' | 'bottom' | null {
		const edge = extractClosestEdge(data);
		return edge === 'top' || edge === 'bottom' ? edge : null;
	}

	function isDropInsideSource(sourceBlock: Block, target: BlockListInsertTarget): boolean {
		if (target.kind === 'root') return false;
		const targetId = target.kind === 'children' ? target.parentId : target.targetId;
		return (
			targetId === sourceBlock.id || Boolean(findBlockInList(sourceBlock.children ?? [], targetId))
		);
	}

	function getDropTarget(data: Record<string, unknown>): {
		surface: EditableBlockSurface;
		target: BlockListInsertTarget;
	} | null {
		const surface = data.surface === 'draft' ? 'draft' : 'program';
		const targetKind = data.targetKind;
		const blockId = data.blockId;

		if (targetKind === 'children' && typeof data.parentId === 'string') {
			return { surface, target: { kind: 'children', parentId: data.parentId } };
		}

		if (targetKind === 'root' || blockId === 'program-list' || blockId === 'drafting-table-list') {
			return { surface, target: { kind: 'root' } };
		}

		if (typeof blockId === 'string') {
			return {
				surface,
				target: {
					kind: 'sibling',
					targetId: blockId,
					edge: getVerticalEdge(data)
				}
			};
		}

		return null;
	}

	function handleTrashDrop(sourceBlock: Block, sourceSurface: BlockSurface) {
		if (sourceSurface === 'palette') return;

		if (sourceSurface === 'program') {
			game.deleteBlock(sourceBlock.id);
		} else if (draftingTable) {
			removeBlockFromList(draftingTable, sourceBlock.id);
		}

		interactionManager.clearSelection();
	}

	function transferBlock(
		sourceBlock: Block,
		sourceSurface: BlockSurface,
		targetData: Record<string, unknown>
	) {
		const dropTarget = getDropTarget(targetData);
		if (!dropTarget) return;

		const targetBlocks = getSurfaceBlocks(dropTarget.surface);
		if (!targetBlocks) return;

		let blockToInsert: Block;
		const sourceEditableSurface: EditableBlockSurface | null =
			sourceSurface === 'palette' ? null : sourceSurface;
		const isSameEditableSurface = sourceEditableSurface === dropTarget.surface;

		if (isSameEditableSurface) {
			if (isDropInsideSource(sourceBlock, dropTarget.target)) return;
			const sourceBlocks = getSurfaceBlocks(sourceEditableSurface);
			if (!sourceBlocks) return;
			blockToInsert = removeBlockFromList(sourceBlocks, sourceBlock.id) ?? sourceBlock;
		} else {
			blockToInsert = cloneBlockWithFreshIds(sourceBlock);
		}

		if (insertBlockInList(targetBlocks, dropTarget.target, blockToInsert)) {
			syncSurface(dropTarget.surface);
			if (sourceEditableSurface && isSameEditableSurface) {
				syncSurface(sourceEditableSurface);
			}
		}
	}

	$effect(() => {
		return monitorForElements({
			onDragStart: () => {
				soundManager.play('pickup');
				isDragging = true;
				isTrashActive = false;
			},
			onDrag: ({ location }) => {
				const target = location.current.dropTargets[0];
				if (target) {
					const data = target.data;
					isTrashActive = data.type === 'trash';
				} else {
					isTrashActive = false;
				}
			},
			onDrop: ({ source, location }) => {
				if (isDisabled) return;
				isDragging = false;
				isTrashActive = false;

				const target = location.current.dropTargets[0];
				if (!target) return;

				soundManager.play('drop');

				const sourceBlock = source.data.block as Block;
				const sourceSurface = getDragSurface(source.data);
				const targetData = target.data;

				// Handle Trash
				if (targetData.type === 'trash') {
					handleTrashDrop(sourceBlock, sourceSurface);
					return;
				}

				// Handle Drop on List or Block
				if (targetData.type === 'drop-target') {
					transferBlock(sourceBlock, sourceSurface, targetData);
				}
			}
		});
	});
</script>

<svelte:window onkeydown={handleWindowKeydown} />

<div class="tray">
	<div class="palette">
		<h3>Blocks</h3>
		<div class="block-list" class:disabled={isDisabled}>
			{#if isDisabled && disabledOverlayText}
				<div class="disabled-overlay">
					{#if disabledModeLabel}
						<strong>{disabledModeLabel}</strong>
					{/if}
					<span>{disabledOverlayText}</span>
				</div>
			{/if}

			{#if hasVariables}
				<!-- svelte-ignore a11y_click_events_have_key_events -->
				<!-- svelte-ignore a11y_no_static_element_interactions -->
				<div
					class="variable-token"
					use:draggableVariable={{ type: 'number' }}
					title="Drag to use held item"
					class:disabled={isDisabled}
					class:selected={isVariableSelected}
					onclick={handleVariableClick}
					data-target="variable:heldItem"
				>
					<div class="token-icon">
						<HeldItemToken item={null} variant="variable" />
					</div>
					<span class="token-label">Held Item</span>
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
					style:position="relative"
				>
					<BlockComponent
						block={item}
						isPalette={true}
						onSelect={() => handlePaletteClick(item)}
						{onTarget}
						disabled={typeFull || isDisabled}
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

		{#if draftingTable}
			<section class="drafting-section" aria-label="Drafting Table">
				<div class="program-header drafting-header">
					<h3>Drafting Table</h3>
					<span class="drafting-note">Scratchpad</span>
				</div>

				<div
					class="program-list drafting-list"
					class:disabled={isDisabled}
					data-block-id="drafting-table-list"
					use:interactionTarget={{
						node: {
							id: 'drafting-table-list',
							role: 'root',
							dataType: 'statement',
							accepts: ['statement']
						},
						api: {
							highlight: () => {},
							clearHighlight: () => {},
							scrollIntoView: () => {},
							getBoundingRect: () => new DOMRect(),
							focus: () =>
								(
									document.querySelector('[data-block-id="drafting-table-list"]') as HTMLElement
								)?.focus()
						}
					}}
					use:dropTarget={{
						id: 'drafting-table-list',
						data: {
							type: 'drop-target',
							surface: 'draft',
							targetKind: 'root',
							blockId: 'drafting-table-list'
						}
					}}
					onclick={() => interactionManager.clearSelection()}
					role="button"
					tabindex="0"
					onkeydown={(e) => {
						if (e.key === 'Enter' || e.key === ' ') interactionManager.clearSelection();
					}}
				>
					{#each draftingTable as item, index (item.id)}
						{@const itemState = interactionManager.getComponentState(item.id)}
						<div class="block-wrapper draft-block-wrapper" style:position="relative">
							{#if itemState.status === 'candidate' && itemState.isHovered && itemState.edge === 'top'}
								<DropIndicator edge="top" />
							{/if}

							<div
								use:interactionTarget={{
									node: {
										id: `draft-gap-${item.id}`,
										role: 'slot',
										dataType: 'statement',
										accepts: ['statement']
									},
									api: {
										highlight: () => {},
										clearHighlight: () => {},
										scrollIntoView: () => {},
										getBoundingRect: () => new DOMRect(),
										focus: () => {}
									}
								}}
								use:dropTarget={{
									id: `draft-gap-${item.id}`,
									data: {
										type: 'drop-target',
										surface: 'draft',
										targetKind: 'sibling',
										blockId: item.id,
										index: index
									}
								}}
							>
								<BlockComponent
									block={item}
									{game}
									activeBlockId={null}
									onSelect={handleSelect}
									onContainerClick={handleContainerClick}
									onTarget={handleTargetClick}
									isTargetMode={isVariableSelected}
									dragSurface="draft"
								/>
							</div>

							{#if itemState.status === 'candidate' && itemState.isHovered && itemState.edge === 'bottom'}
								<DropIndicator edge="bottom" />
							{/if}
						</div>
					{/each}

					{#if draftingTable.length === 0}
						<div class="empty-placeholder draft-empty">Stage blocks here.</div>
					{/if}
				</div>
			</section>
		{/if}

		<div class="program-container">
			{#key game.editingContext}
				<div
					class="program-list"
					class:disabled={isDisabled}
					in:fly={{ x: 20, duration: 300, delay: 100 }}
					out:fade={{ duration: 100 }}
					data-block-id="program-list"
					use:interactionTarget={{
						node: {
							id: 'program-list',
							role: 'root',
							dataType: 'statement',
							accepts: ['statement']
						},
						api: {
							highlight: () => {},
							clearHighlight: () => {},
							scrollIntoView: () => {},
							getBoundingRect: () => new DOMRect(),
							focus: () =>
								(document.querySelector('[data-block-id="program-list"]') as HTMLElement)?.focus()
						}
					}}
					use:dropTarget={{
						id: 'program-list',
						data: {
							type: 'drop-target',
							surface: 'program',
							targetKind: 'root',
							blockId: 'program-list'
						}
					}}
					onclick={() => interactionManager.clearSelection()}
					role="button"
					tabindex="0"
					onkeydown={(e) => {
						if (e.key === 'Enter' || e.key === ' ') interactionManager.clearSelection();
					}}
				>
					{#each game.activeProgram as item, index (item.id)}
						{@const itemState = interactionManager.getComponentState(item.id)}
						<div class="block-wrapper" style:position="relative">
							{#if itemState.status === 'candidate' && itemState.isHovered && itemState.edge === 'top'}
								<DropIndicator edge="top" />
							{/if}

							<div
								use:interactionTarget={{
									node: {
										id: `gap-${item.id}`,
										role: 'slot',
										dataType: 'statement',
										accepts: ['statement']
									},
									api: {
										highlight: () => {},
										clearHighlight: () => {},
										scrollIntoView: () => {},
										getBoundingRect: () => new DOMRect(),
										focus: () => {}
									}
								}}
								use:dropTarget={{
									id: `gap-${item.id}`,
									data: {
										type: 'drop-target',
										surface: 'program',
										targetKind: 'sibling',
										blockId: item.id,
										index: index
									}
								}}
							>
								<BlockComponent
									block={item}
									{game}
									activeBlockId={game.activeBlockId}
									onSelect={handleSelect}
									onContainerClick={handleContainerClick}
									onTarget={handleTargetClick}
									isTargetMode={isVariableSelected}
									dragSurface="program"
								/>
							</div>

							{#if itemState.status === 'candidate' && itemState.isHovered && itemState.edge === 'bottom'}
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
	<div class="floating-toolbar" class:visible={isDragging || interactionManager.selection.size > 0}>
		<!-- Configuration Panel (Left of Toolbar) -->
		{#if primarySelectedBlock?.type === 'loop'}
			<div class="config-panel" transition:fly={{ x: -20, duration: 200 }}>
				<div class="config-header">Repeat</div>

				<div class="config-content">
					<div class="dial-wrapper">
						<DialInput
							value={typeof primarySelectedBlock.count === 'number'
								? primarySelectedBlock.count
								: 2}
							min={1}
							max={99}
							label="Times"
							onChange={(val) => updateLoopCount(val)}
						/>
					</div>

					<div class="special-options">
						{#if hasVariables}
							<button
								class="config-btn variable"
								class:active={typeof primarySelectedBlock.count === 'object'}
								class:highlighted={highlight?.targets?.includes(`config:loop:variable`)}
								onclick={() => updateLoopCount('variable')}
								title="Use Held Item"
								data-value="variable"
							>
								<HeldItemToken item={null} variant="mini" />
							</button>
						{/if}
						{#if game.level.allowInfiniteLoop !== false}
							<button
								class="config-btn infinity"
								class:active={primarySelectedBlock.count === undefined}
								onclick={() => updateLoopCount(undefined)}
								title="Repeat Forever"
								data-value="infinity"
							>
								<InfinityIcon size={20} />
							</button>
						{/if}
					</div>
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
				use:interactionTarget={{
					node: { id: 'trash-zone', role: 'root', dataType: 'any', accepts: ['any'] },
					api: {
						highlight: () => {},
						clearHighlight: () => {},
						scrollIntoView: () => {},
						getBoundingRect: () => new DOMRect(),
						focus: () => {} // TODO: Implement focus
					}
				}}
				use:dropTarget={{
					id: 'trash-zone',
					data: { type: 'trash' }
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
				{#if interactionManager.selection.size > 1}
					<span class="badge">{interactionManager.selection.size}</span>
				{/if}
			</div>

			{#if interactionManager.selection.size > 0}
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
					class:active={editorState.isMultiSelectMode}
					onclick={() => (editorState.isMultiSelectMode = !editorState.isMultiSelectMode)}
					title="Toggle Multi-Select Mode"
					role="button"
					tabindex="0"
					onkeydown={(e) => {
						if (e.key === 'Enter' || e.key === ' ')
							editorState.isMultiSelectMode = !editorState.isMultiSelectMode;
					}}
				>
					<ListChecks size={24} />
					<span class="label">Select</span>
				</div>
			{/if}

			{#if interactionManager.selection.size === 1 && primarySelectedSurface === 'program'}
				<div
					class="toolbar-btn"
					class:active={isMoveMode}
					onclick={() => editorState.setMode(isMoveMode ? 'idle' : 'move')}
					title="Move selected block"
					role="button"
					tabindex="0"
					onkeydown={(e) => {
						if (e.key === 'Enter' || e.key === ' ')
							editorState.setMode(isMoveMode ? 'idle' : 'move');
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
			grid-template-columns: 110px 1fr; /* Palette | Program */
			gap: var(--size-2);
			padding: var(--size-2);
		}

		.floating-toolbar {
			left: 50%;
			top: var(--size-2);
			bottom: auto;
			transform: translateX(-50%) translateY(-20px);
			flex-direction: row;
		}

		.floating-toolbar.visible {
			transform: translateX(-50%) translateY(0);
		}

		.toolbar-container {
			flex-direction: row;
		}

		.config-panel {
			right: auto;
			bottom: 100%;
			top: auto;
			transform: translateX(-50%);
			left: 50%;
			margin-bottom: var(--size-2);
			margin-right: 0;
		}

		.drafting-list {
			grid-template-columns: 1fr;
			max-height: 24vh;
		}

		.drafting-note {
			display: none;
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
		background: light-dark(rgba(255, 255, 255, 0.65), rgba(0, 0, 0, 0.65));
		backdrop-filter: blur(12px);
		-webkit-backdrop-filter: blur(12px);
		border: 1px solid light-dark(rgba(255, 255, 255, 0.5), rgba(255, 255, 255, 0.1));
		box-shadow:
			0 10px 25px -5px rgba(0, 0, 0, 0.1),
			0 8px 10px -6px rgba(0, 0, 0, 0.1),
			inset 0 0 20px light-dark(rgba(255, 255, 255, 0.5), rgba(255, 255, 255, 0.05));

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
		background-color: light-dark(rgba(255, 255, 255, 0.5), rgba(255, 255, 255, 0.1));
		border: 1px solid light-dark(rgba(0, 0, 0, 0.05), rgba(255, 255, 255, 0.1));
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
		background-color: light-dark(white, var(--surface-3));
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

	.config-btn.highlighted {
		outline: 3px solid var(--pink-5);
		box-shadow: 0 0 15px var(--pink-5);
		z-index: 10;
		animation: pulse-highlight 1.5s infinite;
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
		background-color: light-dark(rgba(255, 255, 255, 0.6), rgba(0, 0, 0, 0.6));
		backdrop-filter: blur(2px);
		z-index: 20;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: 2px;
		border-radius: var(--radius-2);
		color: var(--text-2);
		font-size: var(--font-size-1);
		text-align: center;
		padding: var(--size-2);
	}

	.disabled-overlay strong {
		font-family: var(--font-heading);
		font-size: var(--font-size-2);
		color: var(--text-1);
	}

	.disabled-overlay span {
		font-weight: 700;
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
		gap: var(--size-2);
		overflow: hidden; /* Contain the scrollable list */
		min-height: 0; /* Crucial for flex child scrolling */
	}

	.drafting-section {
		display: flex;
		flex-direction: column;
		min-height: 0;
		flex: 0 0 auto;
	}

	.drafting-header {
		margin-bottom: var(--size-1);
	}

	.drafting-note {
		color: var(--text-3);
		background-color: var(--surface-3);
		border-radius: var(--radius-round);
		font-size: var(--font-size-00);
		font-weight: 800;
		padding: 2px var(--size-2);
		text-transform: uppercase;
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

	.drafting-list {
		grid-template-columns: 1fr 1fr;
		max-height: min(26vh, 220px);
		border: 1px dashed var(--surface-4);
		background-color: light-dark(var(--surface-0), var(--surface-1));
	}

	.draft-empty {
		min-height: 72px;
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

	.drafting-list .empty-placeholder {
		grid-column: 1 / -1;
		min-height: 72px;
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

	.variable-token {
		grid-column: 1 / -1; /* Span full width */
		display: flex;
		align-items: center;
		gap: var(--size-2);
		padding: var(--size-2) var(--size-3);
		background-color: var(--surface-2);
		border: 2px solid var(--surface-3);
		border-radius: var(--radius-round);
		cursor: grab;
		width: fit-content;
		margin: 0 auto var(--size-2) auto;
		transition: all 0.2s;
	}

	.variable-token:hover {
		border-color: var(--brand);
		background-color: var(--surface-3);
		transform: translateY(-2px);
	}

	.variable-token.selected {
		border-color: var(--brand);
		background-color: var(--brand-dim);
		box-shadow: 0 0 0 2px var(--brand);
	}

	.variable-token.disabled {
		opacity: 0.5;
		pointer-events: none;
	}

	.variable-token :global(.dragging) {
		opacity: 0.5;
	}

	.token-icon {
		color: var(--brand);
		display: grid;
		place-items: center;
	}

	.token-label {
		font-weight: bold;
		font-size: var(--font-size-0);
		color: var(--text-1);
	}

	.config-content {
		display: flex;
		flex-direction: column;
		gap: var(--size-3);
		align-items: center;
	}

	.dial-wrapper {
		width: 100%;
		display: flex;
		justify-content: center;
	}

	.special-options {
		display: flex;
		gap: var(--size-2);
		width: 100%;
		justify-content: center;
	}
</style>
