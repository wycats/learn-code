<script lang="ts">
	import type { BuilderModel, BuilderTool } from '$lib/game/builder-model.svelte';
	import { 
		Play, 
		SquarePen, 
		Download, 
		Upload, 
		RotateCw, 
		RefreshCcw, 
		Settings,
		Box,
		MapPin,
		Eraser,
		Star,
		ChevronDown,
		Bot
	} from 'lucide-svelte';
	import { fade, fly } from 'svelte/transition';

	interface Props {
		builder: BuilderModel;
		showSettings: boolean;
		onToggleSettings: () => void;
	}

	let { builder, showSettings, onToggleSettings }: Props = $props();

	let isTerrainPickerOpen = $state(false);

	// Terrain tools (grouped)
	const terrainTools: { id: string; tool: BuilderTool; icon: any; label: string; color?: string }[] = [
		{ id: 'wall', tool: { type: 'terrain', value: 'wall' }, icon: Box, label: 'Wall' },
		{ id: 'water', tool: { type: 'terrain', value: 'water' }, icon: Box, label: 'Water' },
	];

	// Special tools (top level)
	const specialTools: { id: string; tool: BuilderTool; icon: any; label: string; color?: string }[] = [
		{ id: 'grass', tool: { type: 'terrain', value: 'grass' }, icon: Eraser, label: 'Erase' },
	];

	// Determine which terrain tool is "active" in the picker (last selected or default)
	let activeTerrainTool = $state(terrainTools[0]);
	let ActiveIcon = $derived(activeTerrainTool.icon);

	// Update activeTerrainTool when builder.activeTool changes to a terrain type
	$effect(() => {
		const tool = builder.activeTool;
		if (tool.type === 'terrain' && tool.value !== 'grass') {
			const found = terrainTools.find(t => t.tool.type === 'terrain' && t.tool.value === tool.value);
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
		isTerrainPickerOpen = false;
	}

	function handleMainPickerClick() {
		if (isToolActive(activeTerrainTool.tool)) {
			isTerrainPickerOpen = !isTerrainPickerOpen;
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
		const dirs = ['N', 'E', 'S', 'W'];
		const currentIdx = dirs.indexOf(builder.game.characterOrientation);
		builder.game.characterOrientation = dirs[(currentIdx + 1) % 4] as any;
	}

	function resetCharacter() {
		builder.game.reset();
	}

	function exportLevel() {
		const data = JSON.stringify(builder.level, null, 2);
		const blob = new Blob([data], { type: 'application/json' });
		const url = URL.createObjectURL(blob);
		const a = document.createElement('a');
		a.href = url;
		a.download = `${builder.level.name.replace(/\s+/g, '-').toLowerCase()}.json`;
		a.click();
		URL.revokeObjectURL(url);
	}

	function importLevel() {
		const input = document.createElement('input');
		input.type = 'file';
		input.accept = '.json';
		input.onchange = (e) => {
			const file = (e.target as HTMLInputElement).files?.[0];
			if (!file) return;
			const reader = new FileReader();
			reader.onload = (e) => {
				try {
					const json = JSON.parse(e.target?.result as string);
					builder.level = json;
					builder.syncGame();
				} catch (err) {
					console.error('Failed to parse level file', err);
					alert('Invalid level file');
				}
			};
			reader.readAsText(file);
		};
		input.click();
	}
</script>

<div class="toolbar">
	<div class="left-group">
		<div class="actions">
			<button class="action-btn" onclick={importLevel} title="Import Level">
				<Upload size={20} />
			</button>
			<button class="action-btn" onclick={exportLevel} title="Export Level">
				<Download size={20} />
			</button>
			<div class="separator"></div>
			<button class="action-btn" class:active={showSettings} onclick={onToggleSettings} title="Level Settings">
				<Settings size={20} />
			</button>
		</div>

		{#if builder.mode === 'edit' || builder.mode === 'story'}
			<div class="separator"></div>
			<div class="tools-group">
				<!-- Terrain Picker -->
				<div class="tool-picker-container" class:active={isToolActive(activeTerrainTool.tool)}>
					<button 
						class="tool-btn picker-btn" 
						onclick={handleMainPickerClick}
						title={activeTerrainTool.label}
					>
						<ActiveIcon size={20} />
						<span class="tool-label">{activeTerrainTool.label}</span>
					</button>
					<button 
						class="picker-trigger"
						onclick={(e) => { e.stopPropagation(); isTerrainPickerOpen = !isTerrainPickerOpen; }}
					>
						<ChevronDown size={14} />
					</button>

					{#if isTerrainPickerOpen}
						<div class="tool-popover" transition:fly={{ y: 10, duration: 200 }}>
							{#each terrainTools as { id, tool, icon: Icon, label, color }}
								<button
									class="tool-option"
									class:active={isToolActive(tool)}
									onclick={() => selectTool(tool)}
								>
									<Icon size={20} />
									<span>{label}</span>
								</button>
							{/each}
						</div>
					{/if}
				</div>

				<!-- Special Tools -->
				{#each specialTools as { id, tool, icon: Icon, label, color }}
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

{#if isTerrainPickerOpen}
	<button class="backdrop" onclick={() => isTerrainPickerOpen = false} transition:fade={{ duration: 100 }} aria-label="Close picker"></button>
{/if}

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
		position: absolute;
		top: calc(100% + var(--size-2));
		left: 0;
		background-color: var(--surface-1);
		border: 1px solid var(--surface-3);
		border-radius: var(--radius-2);
		box-shadow: var(--shadow-3);
		padding: var(--size-1);
		display: flex;
		flex-direction: column;
		gap: var(--size-1);
		min-width: 150px;
		z-index: 101;
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
		color: var(--text-2);
		font-weight: 500;
		transition: all 0.1s;
	}

	.tool-option:hover {
		background-color: var(--surface-2);
		color: var(--text-1);
	}

	.tool-option.active {
		background-color: var(--blue-1);
		color: var(--blue-7);
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

	.backdrop {
		position: fixed;
		inset: 0;
		z-index: 99;
		background: transparent;
		border: none;
		cursor: default;
		width: 100%;
		height: 100%;
	}
</style>