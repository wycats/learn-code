<script lang="ts">
	import type { BuilderModel, BuilderTool } from '$lib/game/builder-model.svelte';
	import type { BlockType } from '$lib/game/types';
	import type { TileDefinition } from '$lib/game/schema';
	import BlockComponent from '$lib/components/game/Block.svelte';
	import HintEditor from './HintEditor.svelte';
	import TileEditorModal from './TileEditorModal.svelte';
	import { AVATAR_ICONS } from '$lib/game/icons';

	import {
		Infinity as InfinityIcon,
		Backpack,
		Lightbulb,
		Paintbrush,
		Plus,
		Pencil,
		Trash2,
		Box,
		Leaf,
		Trees,
		Sun,
		Snowflake,
		Mountain,
		Eraser,
		User,
		Flag,
		Grid3x3
	} from 'lucide-svelte';
	import { fade, scale } from 'svelte/transition';

	interface Props {
		builder: BuilderModel;
	}

	let { builder }: Props = $props();

	let activeTab = $state<'terrain' | 'actors' | 'logic' | 'story'>('terrain');
	let editingLimitFor = $state<BlockType | null>(null);
	// Store previous limits to restore them when re-enabling
	let previousLimits = $state<Record<string, number | 'unlimited'>>({});

	// Tile Editor State
	let showTileEditor = $state(false);
	let editingTile = $state<TileDefinition | undefined>(undefined);

	// Terrain Tools
	type TerrainTool = {
		id: string;
		value: string;
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		icon: any;
		label: string;
		type?: string;
		color?: string;
		isCustom?: boolean;
		tileDef?: TileDefinition;
	};

	const standardTerrainTools: TerrainTool[] = [
		{ id: 'wall', value: 'wall', icon: Box, label: 'Wall' },
		{ id: 'water', value: 'water', icon: Box, label: 'Water' },
		{ id: 'grass', value: 'grass', icon: Leaf, label: 'Grass' },
		{ id: 'forest', value: 'forest', icon: Trees, label: 'Forest' },
		{ id: 'sand', value: 'sand', icon: Sun, label: 'Sand' },
		{ id: 'snow', value: 'snow', icon: Snowflake, label: 'Snow' },
		{ id: 'dirt', value: 'dirt', icon: Mountain, label: 'Dirt' },
		{ id: 'erase', value: 'erase', icon: Eraser, label: 'Erase', type: 'erase' },
		{ id: 'grid', value: 'grid', icon: Grid3x3, label: 'Grid', type: 'grid' }
	];

	let terrainTools = $derived.by(() => {
		const customTools: TerrainTool[] = Object.values(builder.level.customTiles || {}).map(
			(tile) => {
				const Icon =
					tile.visuals.decal && tile.visuals.decal in AVATAR_ICONS
						? AVATAR_ICONS[tile.visuals.decal as keyof typeof AVATAR_ICONS]
						: Box;

				return {
					id: tile.id,
					value: tile.id,
					icon: Icon,
					label: tile.name,
					color: tile.visuals.color,
					isCustom: true,
					tileDef: tile
				};
			}
		);

		return [...standardTerrainTools, ...customTools];
	});

	function selectTool(tool: BuilderTool) {
		if (builder.onTargetSelect) {
			let target = `tool:${tool.type}`;
			if ('value' in tool) {
				target += `:${tool.value}`;
			}
			builder.onTargetSelect(target);
			builder.onTargetSelect = null;
			return;
		}

		builder.activeTool = tool;
		builder.selectedActor = null;
	}

	function isToolHighlighted(tool: TerrainTool) {
		const highlight = builder.game.previewHighlight;
		if (!highlight) return false;
		const type = tool.type || 'terrain';
		let target = `tool:${type}`;
		if (type === 'terrain') {
			target += `:${tool.value}`;
		}
		return highlight.target === target;
	}

	function isBlockHighlighted(type: BlockType) {
		const highlight = builder.game.previewHighlight;
		if (!highlight) return false;
		const target = `block:${type}`;
		return highlight.target === target;
	}

	function isToolActive(type: string, value?: string) {
		if (builder.activeTool.type !== type) return false;
		if (type === 'terrain' && builder.activeTool.type === 'terrain') {
			return builder.activeTool.value === value;
		}
		return true;
	}

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
			class:active={activeTab === 'terrain'}
			onclick={() => (activeTab = 'terrain')}
		>
			<Paintbrush size={16} /> Terrain
		</button>
		<button
			class="tab-btn"
			class:active={activeTab === 'actors'}
			onclick={() => (activeTab = 'actors')}
		>
			<User size={16} /> Actors
		</button>
		<button
			class="tab-btn"
			class:active={activeTab === 'logic'}
			onclick={() => (activeTab = 'logic')}
		>
			<Backpack size={16} /> Logic
		</button>
		<button
			class="tab-btn"
			class:active={activeTab === 'story'}
			onclick={() => (activeTab = 'story')}
		>
			<Lightbulb size={16} /> Story
		</button>
	</div>

	<div class="tray-content">
		{#if activeTab === 'terrain'}
			<div class="terrain-section" transition:fade={{ duration: 200 }}>
				<div class="tools-grid">
					{#each terrainTools as tool (tool.id)}
						{@const Icon = tool.icon}
						<div class="tool-wrapper">
							<button
								class="tool-btn"
								class:active={isToolActive(tool.type || 'terrain', tool.value)}
								class:highlighted={isToolHighlighted(tool)}
								onclick={() =>
									selectTool({ type: tool.type || 'terrain', value: tool.value } as BuilderTool)}
								style:--tool-color={tool.color}
							>
								<Icon size={24} />
								<span class="tool-label">{tool.label}</span>
							</button>
							{#if tool.isCustom}
								<div class="custom-actions">
									<button class="action-btn edit" onclick={(e) => editTile(tool.tileDef!, e)}>
										<Pencil size={12} />
									</button>
									<button class="action-btn delete" onclick={(e) => deleteTile(tool.id, e)}>
										<Trash2 size={12} />
									</button>
								</div>
							{/if}
						</div>
					{/each}
				</div>
				<button class="new-tile-btn" onclick={openNewTile}>
					<Plus size={20} />
					<span>Create New Tile</span>
				</button>
			</div>
		{:else if activeTab === 'actors'}
			<div class="actors-section" transition:fade={{ duration: 200 }}>
				<button
					class="actor-btn"
					class:active={builder.selectedActor === 'start'}
					onclick={() => builder.selectActor('start')}
				>
					<div class="actor-preview start">
						<User size={24} />
					</div>
					<span>Start Position</span>
				</button>

				<button
					class="actor-btn"
					class:active={builder.selectedActor === 'goal'}
					onclick={() => builder.selectActor('goal')}
				>
					<div class="actor-preview goal">
						<Flag size={24} />
					</div>
					<span>Goal Position</span>
				</button>
			</div>
		{:else if activeTab === 'logic'}
			<div class="backpack-section" transition:fade={{ duration: 200 }}>
				<div class="block-list">
					{#each blockTypes as { type, comingSoon } (type)}
						{@const isIncluded = type in builder.level.availableBlocks}
						{@const limit = builder.level.availableBlocks[type]}
						{@const isEditing = editingLimitFor === type}
						<div
							class="block-wrapper"
							class:disabled={!isIncluded && !comingSoon}
							class:coming-soon={comingSoon}
							class:highlighted={isBlockHighlighted(type)}
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
		{:else}
			<div class="hints-section" transition:fade={{ duration: 200 }}>
				<HintEditor {builder} />
			</div>
		{/if}
	</div>
</div>

{#if showTileEditor}
	<TileEditorModal tile={editingTile} onSave={saveTile} onClose={() => (showTileEditor = false)} />
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
		overflow-x: auto;
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
		white-space: nowrap;
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
	.terrain-section,
	.actors-section {
		grid-area: content;
		width: 100%;
		height: 100%;
		overflow-y: auto;
		display: flex;
		flex-direction: column;
		gap: var(--size-2);
	}

	/* Terrain Tools */
	.tools-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(80px, 1fr));
		gap: var(--size-2);
	}

	.tool-wrapper {
		position: relative;
	}

	.tool-btn {
		width: 100%;
		aspect-ratio: 1;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: var(--size-2);
		background-color: var(--surface-1);
		border: 2px solid transparent;
		border-radius: var(--radius-2);
		cursor: pointer;
		color: var(--tool-color, var(--text-2));
		transition: all 0.2s;
	}

	.tool-btn:hover {
		background-color: var(--surface-2);
		transform: translateY(-2px);
	}

	.tool-btn.active {
		background-color: color-mix(in srgb, var(--tool-color, var(--blue-5)) 10%, transparent);
		border-color: var(--tool-color, var(--blue-5));
		color: var(--tool-color, var(--blue-7));
	}

	.tool-btn.highlighted {
		animation: pulse-highlight 1.5s infinite;
		border-color: var(--brand);
		box-shadow: 0 0 0 2px var(--brand-surface);
		z-index: 10;
	}

	@keyframes pulse-highlight {
		0% {
			box-shadow: 0 0 0 0px var(--brand);
		}
		70% {
			box-shadow: 0 0 0 6px transparent;
		}
		100% {
			box-shadow: 0 0 0 0px transparent;
		}
	}

	.tool-label {
		font-size: var(--font-size-00);
		font-weight: 500;
	}

	.custom-actions {
		position: absolute;
		top: 4px;
		right: 4px;
		display: flex;
		gap: 4px;
		opacity: 0;
		transition: opacity 0.2s;
	}

	.tool-wrapper:hover .custom-actions {
		opacity: 1;
	}

	.action-btn {
		background-color: var(--surface-3);
		border: none;
		border-radius: 50%;
		width: 20px;
		height: 20px;
		display: flex;
		align-items: center;
		justify-content: center;
		cursor: pointer;
		color: var(--text-2);
		transition: all 0.2s;
	}

	.action-btn:hover {
		background-color: var(--surface-4);
		color: var(--text-1);
	}

	.action-btn.delete:hover {
		background-color: var(--red-2);
		color: var(--red-7);
	}

	/* Actors */
	.actor-btn {
		display: flex;
		align-items: center;
		gap: var(--size-3);
		padding: var(--size-3);
		background-color: var(--surface-1);
		border: 2px solid transparent;
		border-radius: var(--radius-2);
		cursor: pointer;
		text-align: left;
		transition: all 0.2s;
	}

	.actor-btn:hover {
		background-color: var(--surface-2);
		transform: translateX(4px);
	}

	.actor-btn.active {
		border-color: var(--brand);
		background-color: var(--blue-1);
	}

	.actor-preview {
		width: 48px;
		height: 48px;
		border-radius: var(--radius-2);
		display: flex;
		align-items: center;
		justify-content: center;
		background-color: var(--surface-2);
	}

	.actor-preview.start {
		color: var(--brand);
	}

	.actor-preview.goal {
		color: var(--yellow-6);
	}

	/* Existing Styles */
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

	.block-wrapper.highlighted {
		animation: pulse-highlight 1.5s infinite;
		border-radius: var(--radius-2);
		box-shadow: 0 0 0 2px var(--brand-surface);
		z-index: 10;
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
