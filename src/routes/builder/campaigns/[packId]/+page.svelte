<script lang="ts">
	import { page } from '$app/stores';
	import { CampaignService } from '$lib/game/campaigns';
	import type { LevelPack, LevelDefinition } from '$lib/game/schema';
	import PackMetadataEditor from '$lib/components/builder/campaign/PackMetadataEditor.svelte';
	import LevelOrganizer from '$lib/components/builder/campaign/LevelOrganizer.svelte';
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';
	import { ArrowLeft, Trash2, Undo, Redo } from 'lucide-svelte';
	import ConfirmModal from '$lib/components/common/ConfirmModal.svelte';

	let pack = $state<LevelPack | null>(null);
	let loading = $state(true);
	let error = $state<string | null>(null);
	let showDeleteConfirm = $state(false);
	let history = $state<LevelPack[]>([]);
	let future = $state<LevelPack[]>([]);

	const packId = $derived($page.params.packId ?? '');

	onMount(async () => {
		await loadPack();
	});

	function handleKeydown(e: KeyboardEvent) {
		if (e.ctrlKey || e.metaKey) {
			if (e.key === 'z') {
				e.preventDefault();
				if (e.shiftKey) {
					handleRedo();
				} else {
					handleUndo();
				}
			} else if (e.key === 'y') {
				e.preventDefault();
				handleRedo();
			}
		}
	}

	async function loadPack() {
		loading = true;
		error = null;
		try {
			pack = await CampaignService.get(packId);
			if (!pack) {
				error = 'Pack not found';
			}
		} catch (e) {
			console.error(e);
			error = 'Failed to load pack';
		} finally {
			loading = false;
		}
	}

	function saveToHistory() {
		if (!pack) return;
		// Clear future on new change
		future = [];

		// Keep last 20 states
		// Use $state.snapshot to unwrap the proxy before cloning
		const snapshot = $state.snapshot(pack);
		if (history.length >= 20) {
			history = [...history.slice(1), structuredClone(snapshot)];
		} else {
			history = [...history, structuredClone(snapshot)];
		}
	}

	async function handleUndo() {
		if (history.length === 0 || !pack) return;

		// Save current state to future
		const currentSnapshot = $state.snapshot(pack);
		future = [structuredClone(currentSnapshot), ...future];

		const previous = history[history.length - 1];
		// Remove from history
		history = history.slice(0, -1);

		// Restore
		if (previous) {
			pack = await CampaignService.update(previous.id, previous);
		}
	}

	async function handleRedo() {
		if (future.length === 0 || !pack) return;

		// Save current state to history
		const currentSnapshot = $state.snapshot(pack);
		history = [...history, structuredClone(currentSnapshot)];

		const next = future[0];
		// Remove from future
		future = future.slice(1);

		// Restore
		if (next) {
			pack = await CampaignService.update(next.id, next);
		}
	}

	async function handleMetadataChange(data: Partial<LevelPack>) {
		if (!pack) return;
		saveToHistory();
		pack = await CampaignService.update(pack.id, data);
	}

	async function handleLevelsUpdate(levels: LevelDefinition[]) {
		if (!pack) return;
		saveToHistory();
		pack = await CampaignService.update(pack.id, { levels });
	}

	function handleEditLevel(levelId: string) {
		void goto(`/builder/campaigns/${packId}/${levelId}`);
	}

	async function handleDelete() {
		await CampaignService.delete(pack!.id);
		void goto('/builder/campaigns');
	}
</script>

{#if showDeleteConfirm}
	<ConfirmModal
		title="Delete Pack"
		message="Are you sure you want to delete this pack? This cannot be undone."
		confirmText="Delete"
		onConfirm={handleDelete}
		onCancel={() => (showDeleteConfirm = false)}
	/>
{/if}

<svelte:window onkeydown={handleKeydown} />

<div class="editor-container">
	<header class="editor-header">
		<div class="header-content">
			<div class="header-left">
				<button class="back-btn" onclick={() => void goto('/builder/campaigns')}>
					<ArrowLeft size={20} /> Back to Library
				</button>
				<div class="divider-vertical"></div>
				<h1>Pack Editor</h1>
				<div class="divider-vertical"></div>
				<button
					class="action-btn"
					onclick={handleUndo}
					disabled={history.length === 0}
					title="Undo (Ctrl+Z)"
				>
					<Undo size={20} />
				</button>
				<button
					class="action-btn"
					onclick={handleRedo}
					disabled={future.length === 0}
					title="Redo (Ctrl+Y)"
				>
					<Redo size={20} />
				</button>
			</div>
			<button class="delete-btn" onclick={() => (showDeleteConfirm = true)} title="Delete Pack">
				<Trash2 size={20} />
			</button>
		</div>
	</header>

	<main class="editor-content">
		{#if loading}
			<div class="loading">Loading...</div>
		{:else if error}
			<div class="error">{error}</div>
		{:else if pack}
			<div class="editor-grid">
				<div class="left-col">
					<PackMetadataEditor {pack} onChange={handleMetadataChange} />
				</div>
				<div class="right-col">
					<LevelOrganizer
						levels={pack.levels}
						onUpdate={handleLevelsUpdate}
						onEditLevel={handleEditLevel}
					/>
				</div>
			</div>
		{/if}
	</main>
</div>

<style>
	.editor-container {
		min-height: 100vh;
		background-color: var(--surface-1);
		display: flex;
		flex-direction: column;
	}

	.editor-header {
		padding: var(--size-4) var(--size-6);
		border-bottom: 1px solid var(--surface-2);
		background-color: var(--surface-1);
	}

	.header-content {
		max-width: 1200px;
		margin: 0 auto;
		display: flex;
		align-items: center;
		justify-content: space-between;
	}

	.header-left {
		display: flex;
		align-items: center;
		gap: var(--size-4);
	}

	h1 {
		font-size: var(--font-size-3);
		font-weight: 800;
		margin: 0;
		color: var(--text-1);
	}

	.back-btn {
		background: none;
		border: none;
		color: var(--text-2);
		cursor: pointer;
		display: flex;
		align-items: center;
		gap: var(--size-2);
		font-weight: 600;
		padding: var(--size-2);
		border-radius: var(--radius-2);
	}

	.back-btn:hover {
		background-color: var(--surface-2);
		color: var(--text-1);
	}

	.action-btn {
		background: none;
		border: none;
		color: var(--text-2);
		cursor: pointer;
		padding: var(--size-2);
		border-radius: var(--radius-2);
		transition: all 0.2s;
		display: grid;
		place-items: center;
	}

	.action-btn:hover:not(:disabled) {
		background-color: var(--surface-2);
		color: var(--text-1);
	}

	.action-btn:disabled {
		opacity: 0.3;
		cursor: not-allowed;
	}

	.divider-vertical {
		width: 1px;
		height: 24px;
		background-color: var(--surface-3);
		margin: 0 var(--size-2);
	}

	.delete-btn {
		background: none;
		border: none;
		color: var(--text-3);
		cursor: pointer;
		padding: var(--size-2);
		border-radius: var(--radius-2);
		transition: all 0.2s;
	}

	.delete-btn:hover {
		background-color: var(--red-1);
		color: var(--red-7);
	}

	.editor-content {
		flex: 1;
		padding: var(--size-6);
		max-width: 1200px;
		margin: 0 auto;
		width: 100%;
	}

	.editor-grid {
		display: grid;
		grid-template-columns: 1fr 2fr;
		gap: var(--size-6);
		align-items: start;
	}

	@media (max-width: 800px) {
		.editor-grid {
			grid-template-columns: 1fr;
		}
	}

	.loading,
	.error {
		text-align: center;
		padding: var(--size-8);
		color: var(--text-2);
		font-size: var(--font-size-2);
	}

	.error {
		color: var(--red-7);
	}
</style>
