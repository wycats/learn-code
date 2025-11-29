<script lang="ts">
	import type { BuilderModel, BuilderTool } from '$lib/game/builder-model.svelte';
	import { AVATAR_ICONS } from '$lib/game/icons';
	import {
		Play,
		SquarePen,
		RotateCw,
		RefreshCcw,
		Settings,
		Box,
		Eraser,
		ChevronDown,
		Save,
		FolderOpen,
		Plus,
		Trees,
		Snowflake,
		Mountain,
		Sun,
		Leaf
	} from 'lucide-svelte';
	import PackManagerModal from './PackManagerModal.svelte';

	interface Props {
		builder: BuilderModel;
		showSettings: boolean;
		onToggleSettings: () => void;
	}

	let { builder, showSettings, onToggleSettings }: Props = $props();

	let pickerPopover = $state<HTMLElement>();
	let showPackManager = $state(false);

	// Terrain tools (grouped)
	const standardTerrainTools: {
		id: string;
		tool: BuilderTool;
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		icon: any;
		label: string;
		color?: string;
	}[] = [
		{ id: 'wall', tool: { type: 'terrain', value: 'wall' }, icon: Box, label: 'Wall' },
		{ id: 'water', tool: { type: 'terrain', value: 'water' }, icon: Box, label: 'Water' },
		{ id: 'grass', tool: { type: 'terrain', value: 'grass' }, icon: Leaf, label: 'Grass' },
		{ id: 'forest', tool: { type: 'terrain', value: 'forest' }, icon: Trees, label: 'Forest' },
		{ id: 'sand', tool: { type: 'terrain', value: 'sand' }, icon: Sun, label: 'Sand' },
		{ id: 'snow', tool: { type: 'terrain', value: 'snow' }, icon: Snowflake, label: 'Snow' },
		{ id: 'dirt', tool: { type: 'terrain', value: 'dirt' }, icon: Mountain, label: 'Dirt' }
	];

	let terrainTools = $derived.by(() => {
		const customTools = Object.values(builder.level.customTiles || {}).map((tile) => {
			const Icon =
				tile.visuals.decal && tile.visuals.decal in AVATAR_ICONS
					? AVATAR_ICONS[tile.visuals.decal as keyof typeof AVATAR_ICONS]
					: Box;

			return {
				id: tile.id,
				tool: { type: 'terrain', value: tile.id } as BuilderTool,
				icon: Icon,
				label: tile.name,
				color: tile.visuals.color
			};
		});

		return [...standardTerrainTools, ...customTools];
	});

	// Special tools (top level)
	const specialTools: {
		id: string;
		tool: BuilderTool;
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		icon: any;
		label: string;
		color?: string;
	}[] = [{ id: 'erase', tool: { type: 'erase' }, icon: Eraser, label: 'Erase' }];

	// Determine which terrain tool is "active" in the picker (last selected or default)
	let activeTerrainTool = $state(standardTerrainTools[0]);
	let ActiveIcon = $derived(activeTerrainTool.icon);

	// Update activeTerrainTool when builder.activeTool changes to a terrain type
	$effect(() => {
		const tool = builder.activeTool;
		if (tool.type === 'terrain') {
			const found = terrainTools.find(
				(t) => t.tool.type === 'terrain' && t.tool.value === tool.value
			);
			if (found) activeTerrainTool = found;
		}
	});

	function isToolActive(tool: BuilderTool) {
		if (builder.activeTool.type !== tool.type) return false;
		if (builder.activeTool.type === 'terrain' && tool.type === 'terrain') {
			return builder.activeTool.value === tool.value;
		}
		return false;
	}

	function selectTool(tool: BuilderTool) {
		builder.activeTool = tool;
		builder.selectedActor = null;
		pickerPopover?.hidePopover();
	}

	function handleMainPickerClick() {
		if (isToolActive(activeTerrainTool.tool)) {
			pickerPopover?.togglePopover();
		} else {
			selectTool(activeTerrainTool.tool);
		}
	}

	function toggleMode() {
		if (builder.mode === 'edit' || builder.mode === 'story') {
			builder.mode = 'test';
			builder.syncGame();
		} else {
			builder.mode = 'edit';
			builder.syncGame();
		}
	}

	function rotateCharacter() {
		const dirs = ['N', 'E', 'S', 'W'] as const;
		const currentIdx = dirs.indexOf(builder.game.characterOrientation);
		builder.game.characterOrientation = dirs[(currentIdx + 1) % 4];
	}

	function resetCharacter() {
		builder.game.reset();
	}

	async function savePack() {
		try {
			await builder.save();
			// Optional: toast notification
		} catch {
			alert('Failed to save pack');
		}
	}
</script>

{#if showPackManager}
	<PackManagerModal {builder} onClose={() => (showPackManager = false)} />
{/if}

<div class="toolbar">
	<div class="left-group">
		<div class="actions">
			<button class="action-btn" onclick={() => (showPackManager = true)} title="Open Pack Manager">
				<FolderOpen size={20} />
			</button>
			<button class="action-btn" onclick={savePack} title="Save Pack">
				<Save size={20} />
			</button>

			<div class="separator"></div>

			<div class="level-controls">
				<select
					class="level-select"
					value={builder.level.id}
					onchange={({ currentTarget }) => builder.switchLevel(currentTarget.value)}
				>
					{#each builder.pack.levels as level (level.id)}
						<option value={level.id}>{level.name}</option>
					{/each}
				</select>
				<button class="action-btn" onclick={() => builder.createNewLevel()} title="New Level">
					<Plus size={18} />
				</button>
			</div>

			<div class="separator"></div>

			<button
				class="action-btn"
				class:active={showSettings}
				onclick={onToggleSettings}
				title="Level Settings"
			>
				<Settings size={20} />
			</button>
		</div>

		{#if builder.mode === 'edit' || builder.mode === 'story'}
			<div class="separator"></div>
			<div class="tools-group">
				<!-- Terrain Picker -->
				<div
					class="tool-picker-container"
					class:active={isToolActive(activeTerrainTool.tool)}
					style:anchor-name="--terrain-trigger"
				>
					<button
						class="tool-btn picker-btn"
						onclick={handleMainPickerClick}
						title={activeTerrainTool.label}
					>
						<ActiveIcon size={20} />
						<span class="tool-label">{activeTerrainTool.label}</span>
					</button>
					<button class="picker-trigger" popovertarget="terrain-picker-popover">
						<ChevronDown size={14} />
					</button>

					<div
						id="terrain-picker-popover"
						bind:this={pickerPopover}
						popover="auto"
						class="tool-popover"
					>
						{#each terrainTools as { id, tool, icon: Icon, label, color } (id)}
							<button
								class="tool-option"
								class:active={isToolActive(tool)}
								onclick={() => selectTool(tool)}
								style:--tool-color={color}
							>
								<Icon size={20} />
								<span>{label}</span>
							</button>
						{/each}
					</div>
				</div>

				<!-- Special Tools -->
				{#each specialTools as { id, tool, icon: Icon, label, color } (id)}
					<button
						class="tool-btn"
						class:active={isToolActive(tool)}
						onclick={() => selectTool(tool)}
						title={label}
						style:--tool-color={color}
					>
						<Icon size={20} />
						<span class="tool-label">{label}</span>
					</button>
				{/each}
			</div>
		{/if}

		{#if builder.mode === 'test'}
			<div class="separator"></div>
			<div class="architect-section">
				<span class="architect-label">ARCHITECT</span>
				<div class="architect-actions">
					<button class="action-btn" onclick={rotateCharacter} title="Rotate Character">
						<RotateCw size={18} />
					</button>
					<button class="action-btn" onclick={resetCharacter} title="Reset Position">
						<RefreshCcw size={18} />
					</button>
				</div>
			</div>
		{/if}
	</div>

	<div class="right-group">
		<button class="mode-btn primary" onclick={toggleMode}>
			{#if builder.mode === 'edit' || builder.mode === 'story'}
				<Play size={20} /> Test Level
			{:else}
				<SquarePen size={20} /> Edit Level
			{/if}
		</button>
	</div>
</div>

<style>
	.toolbar {
		padding: var(--size-2) var(--size-3);
		background-color: var(--surface-2);
		border-bottom: 1px solid var(--surface-3);
		display: flex;
		justify-content: space-between;
		align-items: center;
		position: relative;
		z-index: 100;
	}

	.left-group {
		display: flex;
		align-items: center;
		gap: var(--size-2);
	}

	.actions {
		display: flex;
		gap: var(--size-2);
	}

	.action-btn {
		background: none;
		border: none;
		color: var(--text-2);
		cursor: pointer;
		padding: var(--size-2);
		border-radius: var(--radius-2);
		transition: background-color 0.2s;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.action-btn:hover {
		background-color: var(--surface-3);
		color: var(--text-1);
	}

	.action-btn.active {
		background-color: var(--surface-3);
		color: var(--brand);
	}

	.separator {
		width: 1px;
		height: 24px;
		background-color: var(--surface-3);
		margin: 0 var(--size-1);
	}

	.mode-btn {
		display: flex;
		align-items: center;
		gap: var(--size-2);
		padding: var(--size-2) var(--size-4);
		background-color: var(--blue-6);
		color: white;
		border: none;
		border-radius: var(--radius-2);
		font-weight: bold;
		cursor: pointer;
		transition: background-color 0.2s;
	}

	.mode-btn:hover {
		background-color: var(--blue-7);
	}

	/* Tools Group */
	.tools-group {
		display: flex;
		gap: var(--size-1);
	}

	.tool-btn {
		display: flex;
		align-items: center;
		gap: var(--size-2);
		padding: var(--size-1) var(--size-2);
		background: none;
		border: 1px solid transparent;
		border-radius: var(--radius-2);
		cursor: pointer;
		transition: all 0.2s;
		color: var(--tool-color, var(--text-2));
	}

	.tool-btn:hover {
		background-color: var(--surface-3);
	}

	.tool-btn.active {
		background-color: color-mix(in srgb, var(--tool-color, var(--blue-5)) 10%, transparent);
		color: var(--tool-color, var(--blue-7));
		font-weight: bold;
	}

	.tool-label {
		font-weight: 500;
		font-size: var(--font-size-1);
	}

	/* Tool Picker Styles */
	.tool-picker-container {
		position: relative;
		display: flex;
		align-items: stretch;
		background-color: transparent;
		border: 1px solid transparent;
		border-radius: var(--radius-2);
		transition: all 0.2s;
	}

	.tool-picker-container:hover {
		background-color: var(--surface-3);
	}

	.tool-picker-container.active {
		background-color: color-mix(in srgb, var(--blue-5) 10%, transparent);
		color: var(--blue-7);
		font-weight: bold;
	}

	.picker-btn {
		border: none;
		border-radius: var(--radius-2) 0 0 var(--radius-2);
		padding-right: var(--size-1);
		background: transparent;
		color: inherit;
	}

	.picker-btn:hover {
		background-color: transparent;
	}

	.picker-trigger {
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 0 var(--size-1);
		background: transparent;
		border: none;
		cursor: pointer;
		color: inherit;
		border-radius: 0 var(--radius-2) var(--radius-2) 0;
		opacity: 0.7;
	}

	.picker-trigger:hover {
		background-color: transparent;
		opacity: 1;
	}

	.tool-popover {
		/* Reset UA styles */
		margin: 0;
		inset: auto;

		position: fixed;
		position-anchor: --terrain-trigger;
		top: anchor(bottom);
		left: anchor(left);
		margin-top: var(--size-2);

		background-color: var(--surface-1);
		border: 1px solid var(--surface-3);
		border-radius: var(--radius-2);
		box-shadow: var(--shadow-3);
		padding: var(--size-1);
		display: none;
		flex-direction: column;
		gap: var(--size-1);
		min-width: 150px;
	}

	.tool-popover:popover-open {
		display: flex;
	}

	.tool-option {
		display: flex;
		align-items: center;
		gap: var(--size-2);
		padding: var(--size-2);
		background: none;
		border: none;
		border-radius: var(--radius-1);
		cursor: pointer;
		text-align: left;
		color: var(--tool-color, var(--text-2));
		font-weight: 500;
		transition: all 0.1s;
	}

	.tool-option:hover {
		background-color: var(--surface-2);
		color: var(--tool-color, var(--text-1));
	}

	.tool-option.active {
		background-color: color-mix(in srgb, var(--tool-color, var(--blue-5)) 10%, transparent);
		color: var(--tool-color, var(--blue-7));
		font-weight: bold;
	}

	.architect-section {
		display: flex;
		align-items: center;
		gap: var(--size-2);
		background-color: var(--surface-1);
		padding: 2px var(--size-2);
		border-radius: var(--radius-2);
		border: 1px solid var(--surface-3);
	}

	.architect-label {
		font-size: var(--font-size-00);
		font-weight: 800;
		color: var(--text-3);
		letter-spacing: 0.05em;
	}

	.architect-actions {
		display: flex;
		gap: var(--size-1);
	}

	.level-controls {
		display: flex;
		align-items: center;
		gap: var(--size-1);
	}

	.level-select {
		background-color: var(--surface-1);
		border: 1px solid var(--surface-3);
		color: var(--text-1);
		padding: var(--size-1) var(--size-2);
		border-radius: var(--radius-2);
		font-size: var(--font-size-1);
		max-width: 150px;
	}
</style>
