<script lang="ts">
	import type { LevelDefinition } from '$lib/game/schema';
	import { Plus, Trash2, Play, Edit } from 'lucide-svelte';
	import ConfirmModal from '$lib/components/common/ConfirmModal.svelte';
	import {
		draggable,
		dropTargetForElements
	} from '@atlaskit/pragmatic-drag-and-drop/element/adapter';
	import {
		attachClosestEdge,
		extractClosestEdge,
		type Edge
	} from '@atlaskit/pragmatic-drag-and-drop-hitbox/closest-edge';
	import { onMount } from 'svelte';

	interface Props {
		levels: LevelDefinition[];
		onUpdate: (levels: LevelDefinition[]) => void;
		onEditLevel: (levelId: string) => void;
		onPlayLevel: (levelId: string) => void;
	}

	let { levels, onUpdate, onEditLevel, onPlayLevel }: Props = $props();

	let showDeleteConfirm = $state(false);
	let levelToDeleteIndex = $state<number | null>(null);

	// DnD State
	let draggingIndex = $state<number | null>(null);
	let dropTargetIndex = $state<number | null>(null);
	let closestEdge = $state<Edge | null>(null);

	function requestDeleteLevel(index: number, e: Event) {
		e.stopPropagation();
		levelToDeleteIndex = index;
		showDeleteConfirm = true;
	}

	function confirmDeleteLevel() {
		if (levelToDeleteIndex === null) return;
		const newLevels = levels.filter((_, i) => i !== levelToDeleteIndex);
		onUpdate(newLevels);
		showDeleteConfirm = false;
		levelToDeleteIndex = null;
	}

	function addLevel() {
		const newLevel: LevelDefinition = {
			id: crypto.randomUUID(),
			name: `Level ${levels.length + 1}`,
			gridSize: { width: 5, height: 5 },
			start: { x: 0, y: 0 },
			startOrientation: 'E',
			goal: { x: 4, y: 4 },
			layout: {},
			availableBlocks: {
				'move-forward': 'unlimited',
				'turn-left': 'unlimited',
				'turn-right': 'unlimited'
			},
			intro: [],
			outro: []
		};

		onUpdate([...levels, newLevel]);
	}

	function draggableItem(node: HTMLElement, index: number) {
		return draggable({
			element: node,
			getInitialData: () => ({ type: 'level', index }),
			onDragStart: () => {
				draggingIndex = index;
				node.classList.add('dragging');
			},
			onDrop: () => {
				draggingIndex = null;
				node.classList.remove('dragging');
			}
		});
	}

	function dropTargetItem(node: HTMLElement, index: number) {
		return dropTargetForElements({
			element: node,
			getData: ({ input, element }) => {
				return attachClosestEdge(
					{ type: 'level', index },
					{ input, element, allowedEdges: ['left', 'right'] }
				);
			},
			onDragEnter: ({ self }) => {
				dropTargetIndex = index;
				closestEdge = extractClosestEdge(self.data);
			},
			onDrag: ({ self }) => {
				closestEdge = extractClosestEdge(self.data);
			},
			onDragLeave: () => {
				dropTargetIndex = null;
				closestEdge = null;
			},
			onDrop: ({ source, self }) => {
				dropTargetIndex = null;
				closestEdge = null;

				if (source.data.type !== 'level') return;

				const sourceIndex = source.data.index as number;
				const targetIndex = index;
				const edge = extractClosestEdge(self.data);

				if (sourceIndex === targetIndex) return;

				const newLevels = [...levels];
				const [movedLevel] = newLevels.splice(sourceIndex, 1);

				// Calculate insertion index
				let insertIndex = targetIndex;
				if (sourceIndex < targetIndex && edge === 'left') {
					insertIndex -= 1;
				} else if (sourceIndex > targetIndex && edge === 'right') {
					insertIndex += 1;
				}

				// Adjust for removal
				if (sourceIndex < targetIndex) {
					// If moving forward, the target index shifted down by 1, but we want to be relative to the *original* target position
					// Actually, splice removed it, so indices > sourceIndex shifted down.
					// It's easier to think about "insert before" or "insert after"
				}

				// Simplified logic:
				// If dropping on left of target, insert at target index.
				// If dropping on right of target, insert at target index + 1.
				// But we removed the item first, so we need to account for the shift if source < target.

				let finalIndex = targetIndex;
				if (edge === 'right') finalIndex++;

				if (sourceIndex < finalIndex) {
					finalIndex--;
				}

				newLevels.splice(finalIndex, 0, movedLevel);
				onUpdate(newLevels);
			}
		});
	}
</script>

{#if showDeleteConfirm}
	<ConfirmModal
		title="Delete Level"
		message="Are you sure you want to delete this level? This cannot be undone."
		confirmText="Delete"
		onConfirm={confirmDeleteLevel}
		onCancel={() => (showDeleteConfirm = false)}
	/>
{/if}

<div class="level-organizer">
	<div class="header">
		<h3>Levels ({levels.length})</h3>
	</div>

	<div class="level-grid">
		{#each levels as level, i (level.id)}
			<div class="level-wrapper" class:dragging={draggingIndex === i}>
				<div class="drop-zone" use:dropTargetItem={i}>
					<button
						class="level-node"
						onclick={() => onEditLevel(level.id)}
						title="Edit Level"
						use:draggableItem={i}
					>
						<div class="node-content">
							<span class="level-number">{i + 1}</span>
						</div>
						<span class="level-name">{level.name}</span>
					</button>

					<button
						class="delete-badge"
						onclick={(e) => requestDeleteLevel(i, e)}
						title="Delete Level"
					>
						<Trash2 size={14} />
					</button>

					{#if dropTargetIndex === i && closestEdge}
						<div class="drop-indicator {closestEdge}"></div>
					{/if}
				</div>
			</div>
		{/each}

		<button class="add-node" onclick={addLevel} title="Add New Level">
			<div class="node-content">
				<Plus size={24} />
			</div>
			<span class="level-name">Add Level</span>
		</button>
	</div>
</div>

<style>
	.level-organizer {
		display: flex;
		flex-direction: column;
		gap: var(--size-4);
		background-color: var(--surface-1);
		padding: var(--size-6);
		border-radius: var(--radius-3);
		border: 1px solid var(--surface-3);
		min-height: 300px;
	}

	.header h3 {
		font-size: var(--font-size-2);
		font-weight: 700;
		margin: 0;
		color: var(--text-2);
		text-transform: uppercase;
		letter-spacing: 0.05em;
	}

	.level-grid {
		display: flex;
		flex-wrap: wrap;
		gap: var(--size-6);
		padding: var(--size-2);
	}

	.level-wrapper {
		position: relative;
	}

	.level-wrapper.dragging {
		opacity: 0.4;
	}

	.drop-zone {
		position: relative;
	}

	.level-node,
	.add-node {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: var(--size-2);
		background: none;
		border: none;
		cursor: pointer;
		transition: transform 0.2s var(--ease-3);
		padding: 0;
		position: relative;
	}

	.level-node:hover,
	.add-node:hover {
		transform: translateY(-4px);
	}

	.node-content {
		width: 64px;
		height: 64px;
		border-radius: 50%;
		background-color: var(--surface-1);
		border: 2px solid var(--surface-3);
		display: grid;
		place-items: center;
		font-size: var(--font-size-4);
		font-weight: 800;
		color: var(--text-2);
		transition: all 0.2s;
		box-shadow: var(--shadow-1);
	}

	.level-node:hover .node-content {
		border-color: var(--brand);
		color: var(--brand);
		box-shadow: var(--shadow-3);
	}

	.add-node .node-content {
		border-style: dashed;
		color: var(--text-3);
	}

	.add-node:hover .node-content {
		border-color: var(--brand);
		color: var(--brand);
		background-color: var(--surface-2);
	}

	.level-name {
		font-size: var(--font-size-1);
		font-weight: 600;
		color: var(--text-2);
		max-width: 100px;
		text-align: center;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.delete-badge {
		position: absolute;
		top: -4px;
		right: -4px;
		width: 24px;
		height: 24px;
		border-radius: 50%;
		background-color: var(--surface-1);
		border: 1px solid var(--surface-3);
		color: var(--text-3);
		display: grid;
		place-items: center;
		cursor: pointer;
		opacity: 0;
		transition: all 0.2s;
		z-index: 10;
		padding: 0;
	}

	.level-node:hover ~ .delete-badge,
	.delete-badge:hover {
		opacity: 1;
	}

	.delete-badge:hover {
		background-color: var(--red-1);
		color: var(--red-7);
		border-color: var(--red-3);
		transform: scale(1.1);
	}

	/* Drop Indicator */
	.drop-indicator {
		position: absolute;
		top: 0;
		bottom: 0;
		width: 4px;
		background-color: var(--brand);
		border-radius: var(--radius-pill);
		pointer-events: none;
		z-index: 20;
	}

	.drop-indicator.left {
		left: -12px;
	}

	.drop-indicator.right {
		right: -12px;
	}
</style>
