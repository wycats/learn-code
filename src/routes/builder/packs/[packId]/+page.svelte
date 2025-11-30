<script lang="ts">
	import { page } from '$app/stores';
	import { CampaignService } from '$lib/game/campaigns';
	import { fileSystem } from '$lib/services/file-system';
	import type { LevelPack, LevelDefinition } from '$lib/game/schema';
	import PackMetadataEditor from '$lib/components/builder/campaign/PackMetadataEditor.svelte';
	import LevelOrganizer from '$lib/components/builder/campaign/LevelOrganizer.svelte';
	import { goto } from '$app/navigation';
	import { base } from '$app/paths';
	import { onMount } from 'svelte';
	import { ArrowLeft, Trash2, Undo, Redo, Save, Link } from 'lucide-svelte';
	import ConfirmModal from '$lib/components/common/ConfirmModal.svelte';
	import { fade } from 'svelte/transition';

	let pack = $state<LevelPack | null>(null);
	let loading = $state(true);
	let error = $state<string | null>(null);
	let showDeleteConfirm = $state(false);
	let history = $state<LevelPack[]>([]);
	let future = $state<LevelPack[]>([]);
	let isFileSystemSupported = fileSystem.isSupported;
	let isLinked = $state(false);
	let needsPermission = $state(false);
	let statusMessage = $state<string | null>(null);
	let statusType = $state<'success' | 'error'>('success');

	const packId = $derived($page.params.packId ?? '');

	onMount(async () => {
		await loadPack();
	});

	function showStatus(msg: string, type: 'success' | 'error' = 'success') {
		statusMessage = msg;
		statusType = type;
		setTimeout(() => {
			statusMessage = null;
		}, 3000);
	}

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
			} else if (e.key === 's') {
				e.preventDefault();
				handleSaveToDisk();
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
			} else {
				// Check if linked
				isLinked = await fileSystem.isPackLinked(pack.id);
				if (isLinked) {
					// Try to load from disk to verify permission/sync
					try {
						const diskPack = await fileSystem.loadLinkedPack(pack.id);
						if (diskPack) {
							// Optional: Ask user if they want to use the disk version if it differs?
							// For now, we assume the local DB is the source of truth unless explicitly loaded from disk.
							// But we might want to sync TO disk to ensure consistency.
						}
					} catch (err) {
						console.warn('Linked pack needs permission:', err);
						needsPermission = true;
					}
				}
			}
		} catch (e) {
			console.error(e);
			error = 'Failed to load pack';
		} finally {
			loading = false;
		}
	}

	async function handleLinkToDisk() {
		if (!pack) return;
		try {
			await fileSystem.linkPackToDisk(pack.id);
			isLinked = true;
			needsPermission = false;
			// Sync immediately
			await fileSystem.syncPackToDisk(pack.id, $state.snapshot(pack));
			showStatus('Linked!');
		} catch (err) {
			console.error('Failed to link pack:', err);
			showStatus('Failed to link', 'error');
		}
	}

	async function handleReconnectDisk() {
		if (!pack || !isLinked) return;
		try {
			await fileSystem.loadLinkedPack(pack.id);
			needsPermission = false;
			showStatus('Reconnected!');
		} catch {
			showStatus('Failed to reconnect', 'error');
		}
	}

	async function handleSaveToDisk() {
		if (!pack) return;
		try {
			// If linked, sync to the linked folder
			if (isLinked) {
				try {
					await fileSystem.syncPackToDisk(pack.id, $state.snapshot(pack));
					showStatus('Synced!');
				} catch (err) {
					console.warn('Failed to sync to disk:', err);
					needsPermission = true;
					showStatus('Sync failed', 'error');
				}
			} else {
				// Otherwise, just save as a file download (or new handle)
				await fileSystem.savePackToDisk($state.snapshot(pack));
				showStatus('Saved!');
			}
		} catch (err) {
			console.error(err);
			showStatus('Save failed', 'error');
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
			if (isLinked && !needsPermission && pack) {
				fileSystem
					.syncPackToDisk(pack.id, $state.snapshot(pack))
					.catch(() => (needsPermission = true));
			}
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
			if (isLinked && !needsPermission && pack) {
				fileSystem
					.syncPackToDisk(pack.id, $state.snapshot(pack))
					.catch(() => (needsPermission = true));
			}
		}
	}

	async function handleMetadataChange(data: Partial<LevelPack>) {
		if (!pack) return;
		saveToHistory();
		pack = await CampaignService.update(pack.id, data);
		if (isLinked && !needsPermission && pack) {
			fileSystem
				.syncPackToDisk(pack.id, $state.snapshot(pack))
				.catch(() => (needsPermission = true));
		}
	}

	async function handleLevelsUpdate(levels: LevelDefinition[]) {
		if (!pack) return;
		saveToHistory();
		pack = await CampaignService.update(pack.id, { levels });
		if (isLinked && !needsPermission && pack) {
			fileSystem
				.syncPackToDisk(pack.id, $state.snapshot(pack))
				.catch(() => (needsPermission = true));
		}
	}

	function handleEditLevel(levelId: string) {
		// eslint-disable-next-line svelte/no-navigation-without-resolve
		void goto(`${base}/builder/packs/${packId}/${levelId}`);
	}

	async function handleDelete() {
		await CampaignService.delete(pack!.id);
		// eslint-disable-next-line svelte/no-navigation-without-resolve
		void goto(`${base}/builder/packs`);
	}

	function handleBack() {
		// eslint-disable-next-line svelte/no-navigation-without-resolve
		void goto(`${base}/builder/packs`);
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
				<button class="back-btn" onclick={handleBack}>
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
				{#if isFileSystemSupported}
					<div class="divider-vertical"></div>
					{#if isLinked}
						{#if needsPermission}
							<button
								class="action-btn warning"
								onclick={handleReconnectDisk}
								title="Permission Needed - Click to Reconnect"
							>
								<Link size={20} />
							</button>
						{:else}
							<button
								class="action-btn success"
								onclick={handleLinkToDisk}
								title="Linked to Disk (Click to Change)"
							>
								<Link size={20} />
							</button>
						{/if}
					{:else}
						<button class="action-btn" onclick={handleLinkToDisk} title="Link to Disk">
							<Link size={20} />
						</button>
					{/if}
					<button class="action-btn" onclick={handleSaveToDisk} title="Save to Disk (Ctrl+S)">
						<Save size={20} />
					</button>
					{#if statusMessage}
						<span class="status-msg {statusType}" transition:fade={{ duration: 200 }}>
							{statusMessage}
						</span>
					{/if}
				{/if}
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
