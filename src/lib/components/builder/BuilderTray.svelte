<script lang="ts">
	import type { BuilderModel } from '$lib/game/builder-model.svelte';
	import type { BlockType } from '$lib/game/types';
	import type { TileDefinition } from '$lib/game/schema';
	import BlockComponent from '$lib/components/game/Block.svelte';
	import HintEditor from './HintEditor.svelte';
	import TileEditorModal from './TileEditorModal.svelte';
	import Cell from '$lib/components/game/Cell.svelte';

	import {
		Infinity as InfinityIcon,
		Backpack,
		Lightbulb,
		Paintbrush,
		Plus,
		Pencil,
		Trash2
	} from 'lucide-svelte';
	import { fade, scale } from 'svelte/transition';

	interface Props {
		builder: BuilderModel;
	}

	let { builder }: Props = $props();

	let activeTab = $state<'backpack' | 'tiles' | 'hints'>('backpack');
	let editingLimitFor = $state<BlockType | null>(null);
	// Store previous limits to restore them when re-enabling
	let previousLimits = $state<Record<string, number | 'unlimited'>>({});

	// Tile Editor State
	let showTileEditor = $state(false);
	let editingTile = $state<TileDefinition | undefined>(undefined);

	const blockTypes: { type: BlockType; label: string; comingSoon?: boolean }[] = [
		{ type: 'move-forward', label: 'Move' },
		{ type: 'turn-left', label: 'Left' },
		{ type: 'turn-right', label: 'Right' },
		{ type: 'loop', label: 'Loop' },
		{ type: 'call', label: 'Call', comingSoon: true }
	];

	function toggleBlock(type: BlockType, comingSoon?: boolean) {
		if (comingSoon) return;

		if (builder.onTargetSelect) {
			builder.onTargetSelect(`block:${type}`);
			builder.onTargetSelect = null;
			return;
		}

		if (type in builder.level.availableBlocks) {
			// Save current limit before removing
			previousLimits[type] = builder.level.availableBlocks[type];

			const newBlocks = { ...builder.level.availableBlocks };
			delete newBlocks[type];
			builder.level.availableBlocks = newBlocks;
			if (editingLimitFor === type) editingLimitFor = null;
		} else {
			// Restore previous limit if available, otherwise default to unlimited
			const limit = previousLimits[type] ?? 'unlimited';
			builder.level.availableBlocks = { ...builder.level.availableBlocks, [type]: limit };
		}
	}

	function setLimit(type: BlockType, limit: number | 'unlimited') {
		builder.level.availableBlocks = { ...builder.level.availableBlocks, [type]: limit };
	}

	function toggleEditLimit(type: BlockType, e: MouseEvent) {
		e.stopPropagation();
		if (editingLimitFor === type) {
			editingLimitFor = null;
		} else {
			editingLimitFor = type;
		}
	}

	function handleKeydown(e: KeyboardEvent) {
		// No-op for now, just to satisfy a11y
		if (e.key === 'Escape') {
			editingLimitFor = null;
		}
	}

	// Tile Functions
	function openNewTile() {
		editingTile = undefined;
		showTileEditor = true;
	}

	function editTile(tile: TileDefinition, e: MouseEvent) {
		e.stopPropagation();
		editingTile = tile;
		showTileEditor = true;
	}

	function saveTile(tile: TileDefinition) {
		if (!builder.level.customTiles) builder.level.customTiles = {};
		builder.level.customTiles[tile.id] = tile;
		showTileEditor = false;
		builder.syncGame();
	}

	function deleteTile(id: string, e: MouseEvent) {
		e.stopPropagation();
		if (builder.level.customTiles) {
			const newTiles = { ...builder.level.customTiles };
			delete newTiles[id];
			builder.level.customTiles = newTiles;
			builder.syncGame();
		}
	}

	function selectTile(id: string) {
		builder.activeTool = { type: 'terrain', value: id };
	}
</script>

<div
	class="builder-tray-container"
	onclick={() => (editingLimitFor = null)}
	role="button"
	tabindex="-1"
	onkeydown={handleKeydown}
>
	<div class="tray-tabs">
		<button
			class="tab-btn"
			class:active={activeTab === 'backpack'}
			onclick={() => (activeTab = 'backpack')}
		>
			<Backpack size={16} /> Backpack
		</button>
		<button
			class="tab-btn"
			class:active={activeTab === 'tiles'}
			onclick={() => (activeTab = 'tiles')}
		>
			<Paintbrush size={16} /> Tiles
		</button>
		<button
			class="tab-btn"
			class:active={activeTab === 'hints'}
			onclick={() => (activeTab = 'hints')}
		>
			<Lightbulb size={16} /> Hints
		</button>
	</div>

	<div class="tray-content">
		{#if activeTab === 'backpack'}
			<div class="backpack-section" transition:fade={{ duration: 200 }}>
				<h3>Backpack</h3>
				<div class="block-list">
					{#each blockTypes as { type, comingSoon } (type)}
						{@const isIncluded = type in builder.level.availableBlocks}
						{@const limit = builder.level.availableBlocks[type]}
						{@const isEditing = editingLimitFor === type}
						<div
							class="block-wrapper"
							class:disabled={!isIncluded && !comingSoon}
							class:coming-soon={comingSoon}
							onclick={() => toggleBlock(type, comingSoon)}
							role="button"
							tabindex="0"
							onkeydown={(e) => {
								if (e.key === 'Enter') toggleBlock(type, comingSoon);
							}}
							title={comingSoon ? 'Coming Soon!' : isIncluded ? 'Click to remove' : 'Click to add'}
						>
							<div class="block-content">
								<BlockComponent block={{ id: 'preview', type }} isPalette={true} />
							</div>
							{#if isIncluded}
								<!-- Limit Badge / Editor -->
								<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
								<div
									class="limit-badge-container"
									onclick={(e) => e.stopPropagation()}
									role="group"
									tabindex="-1"
									onkeydown={(e) => e.stopPropagation()}
								>
									{#if isEditing}
										<div class="limit-editor" transition:scale={{ duration: 150, start: 0.8 }}>
											<button
												class="limit-btn small"
												onclick={() =>
													setLimit(type, typeof limit === 'number' ? Math.max(1, limit - 1) : 1)}
												>-</button
											>

											<span class="limit-value">
												{#if limit === 'unlimited'}
													<InfinityIcon size={14} />
												{:else}
													{limit}
												{/if}
											</span>

											<button
												class="limit-btn small"
												onclick={() => setLimit(type, typeof limit === 'number' ? limit + 1 : 1)}
												>+</button
											>

											<button
												class="limit-btn text"
												class:active={limit === 'unlimited'}
												onclick={() => setLimit(type, 'unlimited')}
												title="Set to Unlimited"
											>
												<InfinityIcon size={14} />
											</button>
										</div>
									{:else}
										<button
											class="limit-badge"
											onclick={(e) => toggleEditLimit(type, e)}
											transition:scale={{ duration: 150 }}
											title="Click to set limit"
										>
											{#if limit === 'unlimited'}
												<InfinityIcon size={12} />
											{:else}
												{limit}
											{/if}
										</button>
									{/if}
								</div>
							{/if}
							{#if comingSoon}
								<div class="coming-soon-overlay">
									<span>SOON</span>
								</div>
							{/if}
						</div>
					{/each}
				</div>
			</div>
		{:else if activeTab === 'tiles'}
			<div class="tiles-section" transition:fade={{ duration: 200 }}>
				<h3>Custom Tiles</h3>
				<div class="tiles-list">
					{#if builder.level.customTiles}
						{#each Object.values(builder.level.customTiles) as tile (tile.id)}
							<div
								class="tile-wrapper"
								class:active={builder.activeTool.type === 'terrain' &&
									builder.activeTool.value === tile.id}
								onclick={() => selectTile(tile.id)}
								role="button"
								tabindex="0"
								onkeydown={(e) => e.key === 'Enter' && selectTile(tile.id)}
							>
								<div class="tile-preview">
									<Cell type="grass" customTile={tile} />
								</div>
								<div class="tile-info">
									<span class="tile-name">{tile.name}</span>
									<span class="tile-type">{tile.type}</span>
								</div>
								<div class="tile-actions">
									<button class="action-btn" onclick={(e) => editTile(tile, e)} title="Edit">
										<Pencil size={14} />
									</button>
									<button class="action-btn delete" onclick={(e) => deleteTile(tile.id, e)} title="Delete">
										<Trash2 size={14} />
									</button>
								</div>
							</div>
						{/each}
					{/if}

					<button class="new-tile-btn" onclick={openNewTile}>
						<Plus size={20} />
						<span>Create New Tile</span>
					</button>
				</div>
			</div>
		{:else}
			<div class="hints-section" transition:fade={{ duration: 200 }}>
				<HintEditor {builder} />
			</div>
		{/if}
	</div>
</div>

{#if showTileEditor}
	<TileEditorModal
		tile={editingTile}
		onSave={saveTile}
		onClose={() => (showTileEditor = false)}
	/>
{/if}

<style>
	.builder-tray-container {
		display: flex;
		flex-direction: column;
		height: 100%;
		gap: var(--size-2);
		padding: var(--size-3);
		overflow: hidden;
	}

	.tray-content {
		display: grid;
		grid-template-areas: 'content';
		flex: 1;
		overflow: hidden;
		position: relative;
	}

	.tray-tabs {
		display: flex;
		gap: var(--size-2);
		border-bottom: 1px solid var(--surface-3);
		padding-bottom: var(--size-2);
		flex-shrink: 0;
	}

	.tab-btn {
		flex: 1;
		background: none;
		border: none;
		padding: var(--size-2);
		border-radius: var(--radius-2);
		cursor: pointer;
		color: var(--text-2);
		font-weight: bold;
		display: flex;
		align-items: center;
		justify-content: center;
		gap: var(--size-2);
		transition: all 0.2s;
	}

	.tab-btn:hover {
		background-color: var(--surface-2);
		color: var(--text-1);
	}

	.tab-btn.active {
		background-color: var(--surface-3);
		color: var(--brand);
	}

	.hints-section,
	.backpack-section,
	.tiles-section {
		grid-area: content;
		width: 100%;
		height: 100%;
		overflow-y: auto;
		display: flex;
		flex-direction: column;
		gap: var(--size-2);
	}

	h3 {
		font-size: var(--font-size-0);
		text-transform: uppercase;
		letter-spacing: 0.1em;
		color: var(--text-3);
		margin-bottom: var(--size-2);
		font-weight: 700;
	}

	.block-list {
		display: flex;
		flex-direction: column;
		gap: var(--size-2);
		padding: var(--size-2);
		background-color: var(--surface-1);
		border-radius: var(--radius-2);
		flex: 1;
	}

	.block-wrapper {
		position: relative;
		cursor: pointer;
		transition: all 0.2s;
		background: none;
		border: none;
		padding: 0;
		text-align: left;
		width: 100%;
	}

	.block-wrapper.disabled {
		opacity: 0.4;
		filter: grayscale(1);
	}

	.block-wrapper:hover {
		transform: scale(1.02);
		z-index: 1;
	}

	.block-wrapper.disabled:hover {
		opacity: 0.6;
		filter: grayscale(0.5);
	}

	.block-wrapper.coming-soon {
		cursor: not-allowed;
		opacity: 0.8;
	}

	.block-wrapper.coming-soon:hover {
		transform: none;
	}

	.block-content {
		pointer-events: none;
		width: 100%;
	}

	.coming-soon-overlay {
		position: absolute;
		inset: 0;
		background-color: rgba(255, 255, 255, 0.4);
		display: flex;
		align-items: center;
		justify-content: center;
		border-radius: var(--radius-2);
	}

	.coming-soon-overlay span {
		background-color: var(--surface-1);
		color: var(--text-2);
		font-size: var(--font-size-00);
		font-weight: bold;
		padding: 2px 6px;
		border-radius: var(--radius-1);
		border: 1px solid var(--surface-3);
		box-shadow: var(--shadow-1);
		transform: rotate(-5deg);
	}

	.limit-badge-container {
		position: absolute;
		top: -6px;
		right: -6px;
		z-index: 5;
	}

	.limit-badge {
		background-color: var(--blue-5);
		color: white;
		font-size: var(--font-size-00);
		font-weight: bold;
		width: 24px;
		height: 24px;
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
		box-shadow: var(--shadow-2);
		border: 2px solid var(--surface-1);
		cursor: pointer;
		transition: transform 0.1s;
	}

	.limit-badge:hover {
		transform: scale(1.1);
		background-color: var(--blue-6);
	}

	.limit-editor {
		background-color: var(--surface-1);
		border-radius: var(--radius-round);
		box-shadow: var(--shadow-3);
		display: flex;
		align-items: center;
		padding: 4px;
		border: 1px solid var(--surface-3);
		gap: 4px;
		/* Position it to cover the badge area but expand leftwards */
		position: absolute;
		top: 0;
		right: 0;
		transform-origin: top right;
	}

	.limit-btn {
		background: none;
		border: none;
		cursor: pointer;
		padding: 4px;
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
		color: var(--text-2);
		font-weight: bold;
		font-size: var(--font-size-00);
		width: 24px;
		height: 24px;
		transition: background-color 0.1s;
	}

	.limit-btn:hover {
		background-color: var(--surface-3);
		color: var(--text-1);
	}

	.limit-btn.active {
		background-color: var(--blue-2);
		color: var(--blue-7);
	}

	.limit-btn.small {
		width: 20px;
		height: 20px;
		font-size: 14px;
		padding: 0;
	}

	.limit-btn.text {
		width: auto;
		padding: 0 4px;
		border-radius: var(--radius-1);
	}

	.limit-value {
		font-size: var(--font-size-00);
		font-weight: bold;
		color: var(--text-1);
		min-width: 20px;
		text-align: center;
		display: flex;
		justify-content: center;
	}

	/* Tiles Styles */
	.tiles-list {
		display: flex;
		flex-direction: column;
		gap: var(--size-2);
		padding: var(--size-2);
		background-color: var(--surface-1);
		border-radius: var(--radius-2);
		flex: 1;
	}

	.tile-wrapper {
		display: flex;
		align-items: center;
		gap: var(--size-3);
		padding: var(--size-2);
		border: 1px solid var(--surface-3);
		border-radius: var(--radius-2);
		cursor: pointer;
		transition: all 0.2s;
		background-color: var(--surface-2);
	}

	.tile-wrapper:hover {
		background-color: var(--surface-3);
	}

	.tile-wrapper.active {
		border-color: var(--brand);
		background-color: var(--blue-1);
	}

	.tile-preview {
		width: 40px;
		height: 40px;
		border-radius: var(--radius-2);
		overflow: hidden;
		flex-shrink: 0;
	}

	.tile-info {
		flex: 1;
		display: flex;
		flex-direction: column;
	}

	.tile-name {
		font-weight: bold;
		color: var(--text-1);
		font-size: var(--font-size-1);
	}

	.tile-type {
		font-size: var(--font-size-0);
		color: var(--text-2);
		text-transform: capitalize;
	}

	.tile-actions {
		display: flex;
		gap: var(--size-1);
	}

	.action-btn {
		background: none;
		border: none;
		cursor: pointer;
		padding: var(--size-1);
		border-radius: var(--radius-1);
		color: var(--text-2);
		transition: all 0.2s;
	}

	.action-btn:hover {
		background-color: var(--surface-3);
		color: var(--text-1);
	}

	.action-btn.delete:hover {
		background-color: var(--red-1);
		color: var(--red-7);
	}

	.new-tile-btn {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: var(--size-2);
		padding: var(--size-3);
		background-color: var(--surface-2);
		border: 2px dashed var(--surface-3);
		border-radius: var(--radius-2);
		color: var(--text-2);
		font-weight: bold;
		cursor: pointer;
		transition: all 0.2s;
	}

	.new-tile-btn:hover {
		background-color: var(--surface-3);
		border-color: var(--text-2);
		color: var(--text-1);
	}
</style>
