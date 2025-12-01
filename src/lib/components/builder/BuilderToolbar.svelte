<script lang="ts">
	import type { BuilderModel, BuilderTool } from '$lib/game/builder-model.svelte';
	import {
		Play,
		SquarePen,
		RotateCw,
		RefreshCcw,
		Settings,
		Eraser,
		Save,
		FolderOpen,
		Plus,
		ArrowLeft,
		Grid3x3,
		Link,
		Undo,
		Redo,
		ChevronDown,
		Share2
	} from 'lucide-svelte';
	import PackManagerModal from './PackManagerModal.svelte';
	import ShareModal from './ShareModal.svelte';
	import { fade, slide } from 'svelte/transition';

	interface Props {
		builder: BuilderModel;
		showSettings: boolean;
		onToggleSettings: () => void;
		onExit?: () => void;
	}

	let { builder, showSettings, onToggleSettings, onExit }: Props = $props();

	let showPackManager = $state(false);
	let showShareModal = $state(false);
	let showLevelList = $state(false);
	let statusMessage = $state<string | null>(null);
	let statusType = $state<'success' | 'error'>('success');

	function showStatus(msg: string, type: 'success' | 'error' = 'success') {
		statusMessage = msg;
		statusType = type;
		setTimeout(() => {
			statusMessage = null;
		}, 3000);
	}

	// Special tools (top level)
	const specialTools: {
		id: string;
		tool: BuilderTool;
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		icon: any;
		label: string;
		color?: string;
	}[] = [
		{ id: 'grid', tool: { type: 'grid' }, icon: Grid3x3, label: 'Grid' },
		{ id: 'erase', tool: { type: 'erase' }, icon: Eraser, label: 'Erase' }
	];

	function isToolActive(tool: BuilderTool) {
		if (builder.activeTool.type !== tool.type) return false;
		if (builder.activeTool.type === 'terrain' && tool.type === 'terrain') {
			return builder.activeTool.value === tool.value;
		}
		return true;
	}

	function selectTool(tool: BuilderTool) {
		builder.activeTool = tool;
		builder.selectedActor = null;
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
			showStatus('Saved!');
		} catch {
			showStatus('Failed to save', 'error');
		}
	}

	async function handleLink() {
		try {
			await builder.linkToDisk();
			showStatus('Linked!');
		} catch {
			showStatus('Failed to link', 'error');
		}
	}

	async function handleReconnect() {
		try {
			await builder.reconnectDisk();
			showStatus('Reconnected!');
		} catch {
			showStatus('Failed to reconnect', 'error');
		}
	}

	function handleKeydown(e: KeyboardEvent) {
		if (builder.mode !== 'edit' && builder.mode !== 'story') return;
		// Ignore if typing in an input
		if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

		if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
			e.preventDefault();
			if (e.shiftKey) {
				builder.redo();
			} else {
				builder.undo();
			}
		} else if ((e.ctrlKey || e.metaKey) && e.key === 'y') {
			e.preventDefault();
			builder.redo();
		}
	}
</script>

<svelte:window onkeydown={handleKeydown} />

{#if showPackManager}
	<PackManagerModal {builder} onClose={() => (showPackManager = false)} />
{/if}

{#if showShareModal}
	<ShareModal {builder} onClose={() => (showShareModal = false)} />
{/if}

<div class="toolbar">
	<div class="left-group">
		{#if onExit}
			<button class="action-btn" onclick={onExit} title="Exit Builder">
				<ArrowLeft size={20} />
			</button>
			<div class="separator"></div>
		{/if}
		<div class="actions">
			<button class="action-btn" onclick={() => (showPackManager = true)} title="Open Pack Manager">
				<FolderOpen size={20} />
			</button>
			<button class="action-btn" onclick={savePack} title="Save Pack">
				<Save size={20} />
			</button>
			<button class="action-btn" onclick={() => (showShareModal = true)} title="Share Level">
				<Share2 size={20} />
			</button>

			<div class="separator"></div>

			<button
				class="action-btn"
				onclick={() => builder.undo()}
				disabled={builder.history.length === 0}
				title="Undo"
			>
				<Undo size={20} />
			</button>
			<button
				class="action-btn"
				onclick={() => builder.redo()}
				disabled={builder.future.length === 0}
				title="Redo"
			>
				<Redo size={20} />
			</button>

			{#if builder.isLinked}
				{#if builder.needsPermission}
					<button
						class="action-btn warning"
						onclick={handleReconnect}
						title="Permission Needed - Click to Reconnect"
					>
						<Link size={20} />
					</button>
				{:else}
					<button
						class="action-btn success"
						onclick={handleLink}
						title="Linked to Disk (Click to Change)"
					>
						<Link size={20} />
					</button>
				{/if}
			{:else}
				<button class="action-btn" onclick={handleLink} title="Link to Disk">
					<Link size={20} />
				</button>
			{/if}

			{#if statusMessage}
				<span class="status-msg {statusType}" transition:fade={{ duration: 200 }}>
					{statusMessage}
				</span>
			{/if}

			<div class="separator"></div>

			<div class="level-controls">
				<div class="level-select-wrapper">
					<button
						class="level-trigger"
						onclick={() => (showLevelList = !showLevelList)}
						title="Switch Level"
					>
						<span class="level-name">{builder.level.name}</span>
						<ChevronDown size={14} />
					</button>

					{#if showLevelList}
						<div class="level-popover" transition:slide={{ duration: 200 }}>
							{#each builder.pack.levels as level (level.id)}
								<button
									class="level-option"
									class:active={builder.level.id === level.id}
									onclick={() => {
										builder.switchLevel(level.id);
										showLevelList = false;
									}}
								>
									{level.name}
								</button>
							{/each}
						</div>
					{/if}
				</div>
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
				<Play size={20} /> Play Level
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

	.action-btn.warning {
		color: var(--orange-5);
	}

	.action-btn.success {
		color: var(--green-5);
	}

	.action-btn:disabled {
		opacity: 0.3;
		cursor: not-allowed;
	}

	.action-btn:disabled:hover {
		background-color: transparent;
		color: var(--text-2);
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

	.active-tile-display {
		display: flex;
		align-items: center;
		gap: var(--size-2);
		padding: var(--size-1) var(--size-2);
		background-color: var(--surface-1);
		border: 1px solid var(--surface-3);
		border-radius: var(--radius-2);
		color: var(--text-1);
	}

	.tile-preview {
		width: 24px;
		height: 24px;
		border-radius: var(--radius-1);
		overflow: hidden;
		box-shadow: var(--shadow-1);
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

	.level-select-wrapper {
		position: relative;
	}

	.level-trigger {
		display: flex;
		align-items: center;
		gap: var(--size-2);
		background-color: var(--surface-1);
		border: 1px solid var(--surface-3);
		color: var(--text-1);
		padding: var(--size-2) var(--size-3);
		border-radius: var(--radius-2);
		font-size: var(--font-size-1);
		cursor: pointer;
		min-width: 150px;
		justify-content: space-between;
		transition: all 0.2s;
	}

	.level-trigger:hover {
		background-color: var(--surface-3);
	}

	.level-name {
		font-weight: 600;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
		max-width: 120px;
	}

	.level-popover {
		position: absolute;
		top: calc(100% + 4px);
		left: 0;
		width: 100%;
		min-width: 180px;
		background-color: var(--surface-1);
		border: 1px solid var(--surface-3);
		border-radius: var(--radius-2);
		box-shadow: var(--shadow-3);
		z-index: 20;
		max-height: 300px;
		overflow-y: auto;
		display: flex;
		flex-direction: column;
		padding: 4px;
	}

	.level-option {
		text-align: left;
		background: none;
		border: none;
		padding: var(--size-2);
		cursor: pointer;
		color: var(--text-2);
		border-radius: var(--radius-1);
		font-size: var(--font-size-1);
		transition: all 0.1s;
	}

	.level-option:hover {
		background-color: var(--surface-2);
		color: var(--text-1);
	}

	.level-option.active {
		background-color: var(--brand-dim);
		color: var(--brand);
		font-weight: bold;
	}

	.status-msg {
		font-size: var(--font-size-1);
		font-weight: 600;
		margin-left: var(--size-2);
		animation: fadeIn 0.2s ease-out;
	}

	.status-msg.success {
		color: var(--green-6);
	}

	.status-msg.error {
		color: var(--red-6);
	}

	@keyframes fadeIn {
		from {
			opacity: 0;
			transform: translateY(2px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}
</style>
