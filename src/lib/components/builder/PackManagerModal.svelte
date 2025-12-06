<script lang="ts">
	import { onMount } from 'svelte';
	import { page } from '$app/stores';
	import { persistence, createDefaultPack } from '$lib/game/persistence';
	import { fileSystem } from '$lib/services/file-system';
	import { localPacksStore } from '$lib/game/local-packs.svelte';
	import type { BuilderModel } from '$lib/game/builder-model.svelte';
	import { X, Trash2, FolderOpen, Plus, Pencil, Check, Github, Loader2 } from 'lucide-svelte';

	interface Props {
		builder: BuilderModel;
		onClose: () => void;
	}

	let { builder, onClose }: Props = $props();
	let packs = $state<{ id: string; name: string; description?: string }[]>([]);
	let dialog: HTMLDialogElement;
	let editingPackId = $state<string | null>(null);
	let deletingPackId = $state<string | null>(null);
	let editName = $state('');
	let editDesc = $state('');
	let errorMessage = $state<string | null>(null);
	let syncingPackId = $state<string | null>(null);
	let isFileSystemSupported = fileSystem.isSupported;

	onMount(async () => {
		packs = await persistence.listPacks();
		dialog?.showModal();
	});

	async function load(id: string) {
		await builder.load(id);
		onClose();
	}

	function requestDelete(id: string) {
		deletingPackId = id;
		// Cancel any active edit
		editingPackId = null;
		errorMessage = null;
	}

	async function confirmDelete() {
		if (deletingPackId) {
			await persistence.deletePack(deletingPackId);
			packs = await persistence.listPacks();
			deletingPackId = null;
		}
	}

	function cancelDelete() {
		deletingPackId = null;
	}

	function startEdit(pack: { id: string; name: string; description?: string }) {
		editingPackId = pack.id;
		editName = pack.name;
		editDesc = pack.description || '';
		// Cancel any active delete
		deletingPackId = null;
		errorMessage = null;
	}

	async function saveEdit(id: string) {
		const pack = await persistence.loadPack(id);
		if (pack) {
			pack.name = editName;
			pack.description = editDesc;
			await persistence.savePack(pack);

			// If this is the currently loaded pack, update the builder too
			if (builder.pack.id === id) {
				builder.pack.name = editName;
				builder.pack.description = editDesc;
			}

			editingPackId = null;
			packs = await persistence.listPacks();
		}
	}

	function cancelEdit() {
		editingPackId = null;
	}

	async function createNew() {
		const newPack = createDefaultPack();

		// Generate a unique name
		let counter = 1;
		let name = 'My Adventure';
		while (packs.some((p) => p.name === (counter === 1 ? name : `${name} ${counter}`))) {
			counter++;
		}
		newPack.name = counter === 1 ? name : `${name} ${counter}`;

		builder.pack = newPack;

		// Ensure default level exists
		if (builder.pack.levels.length === 0) {
			builder.pack.levels.push({
				id: crypto.randomUUID(),
				name: 'New Level',
				gridSize: { width: 5, height: 5 },
				start: { x: 0, y: 0 },
				startOrientation: 'E',
				goal: { x: 4, y: 4 },
				layout: {},
				availableBlocks: {
					'move-forward': 'unlimited',
					'turn-left': 'unlimited',
					'turn-right': 'unlimited',
					loop: 'unlimited'
				},
				maxBlocks: 10
			});
		}
		builder.activeLevelId = builder.pack.levels[0].id;
		builder.syncGame();

		// Save the new pack immediately so it appears in the list next time
		await builder.save();

		onClose();
	}

	async function syncPack(packMeta: { id: string; name: string }) {
		syncingPackId = packMeta.id;
		errorMessage = null;
		try {
			const fullPack = await persistence.loadPack(packMeta.id);
			if (!fullPack) throw new Error('Pack not found');

			const response = await fetch('/api/github/sync', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify(fullPack)
			});

			if (!response.ok) {
				throw new Error('Sync failed');
			}

			const result = await response.json();
			window.open(result.repoUrl, '_blank');
		} catch (e) {
			console.error(e);
			errorMessage = 'Failed to sync to GitHub.';
		} finally {
			syncingPackId = null;
		}
	}

	async function handleOpenLocalFolder() {
		errorMessage = null;
		try {
			const root = await fileSystem.openDirectory();
			if (root) {
				const packEntries = await fileSystem.listPacksInDirectory(root);
				const loadedPacks = await Promise.all(
					packEntries.map((entry) => fileSystem.loadPackFromDisk(entry.handle))
				);

				// Update store
				localPacksStore.clear();
				loadedPacks.forEach((p) => localPacksStore.addPack(p));

				// If we found packs, maybe load the first one?
				// Or just show them in the list?
				// The current modal only shows IndexedDB packs.
				// We should probably add a "Local Packs" section to this modal too.
			}
		} catch (err) {
			console.error('Failed to open local folder:', err);
			errorMessage = 'Could not open local folder. Please try again.';
		}
	}
</script>

<dialog
	bind:this={dialog}
	onclose={onClose}
	class="pack-modal"
	onclick={(e) => e.target === dialog && onClose()}
>
	<div class="modal-header">
		<h2>My Level Packs</h2>
		<button class="close-btn" onclick={onClose}>
			<X size={20} />
		</button>
	</div>

	<div class="pack-list">
		{#if errorMessage}
			<div class="error-message">
				{errorMessage}
			</div>
		{/if}
		{#if localPacksStore.packs.length > 0}
			<div class="section-header">Local Packs</div>
			{#each localPacksStore.packs as pack (pack.id)}
				<div class="pack-item" class:active={builder.pack.id === pack.id}>
					<div class="pack-info">
						<h3>{pack.name}</h3>
						{#if pack.description}<p>{pack.description}</p>{/if}
					</div>
					<div class="pack-actions">
						{#if builder.pack.id !== pack.id}
							<button class="btn-icon" onclick={() => load(pack.id)} title="Load Pack">
								<FolderOpen size={20} />
							</button>
						{/if}
					</div>
				</div>
			{/each}
			<div class="section-header">Saved Packs</div>
		{/if}

		{#each packs as pack (pack.id)}
			<div class="pack-item" class:active={builder.pack.id === pack.id}>
				{#if editingPackId === pack.id}
					<div class="pack-info">
						<input
							type="text"
							bind:value={editName}
							placeholder="Pack Name"
							class="edit-input name inline"
						/>
						<input
							type="text"
							bind:value={editDesc}
							placeholder="Description"
							class="edit-input desc inline"
						/>
					</div>
					<div class="pack-actions">
						<button class="btn-icon save" onclick={() => saveEdit(pack.id)} title="Save Changes">
							<Check size={18} />
						</button>
						<button class="btn-icon cancel" onclick={cancelEdit} title="Cancel">
							<X size={18} />
						</button>
					</div>
				{:else if deletingPackId === pack.id}
					<div class="pack-info delete-mode">
						<h3>Delete "{pack.name}"?</h3>
						<p class="warning-text">This cannot be undone.</p>
					</div>
					<div class="pack-actions">
						<button class="btn-icon confirm-delete" onclick={confirmDelete} title="Confirm Delete">
							<Check size={20} />
						</button>
						<button class="btn-icon cancel" onclick={cancelDelete} title="Cancel">
							<X size={20} />
						</button>
					</div>
				{:else}
					<div class="pack-info">
						<h3>{pack.name}</h3>
						{#if pack.description}<p>{pack.description}</p>{/if}
					</div>
					<div class="pack-actions">
						{#if builder.pack.id !== pack.id}
							<button class="btn-icon" onclick={() => load(pack.id)} title="Load Pack">
								<FolderOpen size={20} />
							</button>
						{/if}

						{#if $page.data.session?.githubAccessToken}
							<button
								class="btn-icon"
								onclick={() => syncPack(pack)}
								title="Sync to GitHub"
								disabled={syncingPackId === pack.id}
							>
								{#if syncingPackId === pack.id}
									<div class="spin-wrapper">
										<Loader2 size={20} />
									</div>
								{:else}
									<Github size={20} />
								{/if}
							</button>
						{/if}

						<button class="btn-icon" onclick={() => startEdit(pack)} title="Edit Details">
							<Pencil size={20} />
						</button>
						<button
							class="btn-icon delete"
							onclick={() => requestDelete(pack.id)}
							title="Delete Pack"
						>
							<Trash2 size={20} />
						</button>
					</div>
				{/if}
			</div>
		{/each}

		{#if packs.length === 0}
			<div class="empty-state">
				<p>No saved packs found.</p>
			</div>
		{/if}
	</div>

	<div class="modal-footer">
		<div class="left-actions">
			{#if isFileSystemSupported}
				<button class="btn-secondary" onclick={handleOpenLocalFolder}>
					<FolderOpen size={18} /> Open Local Folder
				</button>
			{/if}

			{#if $page.data.session?.githubAccessToken}
				<div class="connected-badge" title="Connected to GitHub">
					<div class="icon-stack">
						<Github size={18} />
						<div class="check-badge">
							<Check size={10} strokeWidth={4} />
						</div>
					</div>
					<span>Connected</span>
				</div>
			{:else if $page.data.user}
				<!-- eslint-disable-next-line svelte/no-navigation-without-resolve -->
				<a href="/login/github/connect" class="btn-secondary github-connect">
					<Github size={18} /> Connect GitHub
				</a>
			{/if}
		</div>

		<button class="btn-primary" onclick={createNew}>
			<Plus size={18} /> New Pack
		</button>
	</div>
</dialog>

<style>
	.pack-modal {
		border: none;
		border-radius: var(--radius-3);
		padding: 0;
		width: 500px;
		max-width: 90vw;
		background-color: var(--surface-1);
		box-shadow: var(--shadow-5);
		color: var(--text-1);
	}

	.pack-modal::backdrop {
		background-color: rgba(0, 0, 0, 0.5);
		backdrop-filter: blur(2px);
	}

	.modal-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: var(--size-3) var(--size-4);
		border-bottom: 1px solid var(--surface-3);
	}

	h2 {
		margin: 0;
		font-size: var(--font-size-3);
	}

	.close-btn {
		background: none;
		border: none;
		cursor: pointer;
		color: var(--text-2);
		padding: 0;
		width: 44px;
		height: 44px;
		display: flex;
		align-items: center;
		justify-content: center;
		border-radius: var(--radius-round);
	}

	.pack-list {
		padding: var(--size-4);
		display: flex;
		flex-direction: column;
		gap: var(--size-3);
		max-height: 60vh;
		overflow-y: auto;
	}

	.section-header {
		font-size: var(--font-size-1);
		font-weight: bold;
		color: var(--text-3);
		text-transform: uppercase;
		letter-spacing: 0.05em;
		margin-bottom: var(--size-2);
		margin-top: var(--size-2);
	}

	.pack-item {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: var(--size-3);
		background-color: var(--surface-2);
		border-radius: var(--radius-2);
		border: 1px solid var(--surface-3);
	}

	.pack-item.active {
		border-color: var(--brand);
		background-color: var(--surface-3);
	}

	.pack-info h3 {
		margin: 0;
		font-size: var(--font-size-2);
	}

	.pack-info p {
		margin: var(--size-1) 0 0;
		color: var(--text-2);
		font-size: var(--font-size-1);
	}

	.pack-actions {
		display: flex;
		gap: var(--size-2);
	}

	.btn-icon {
		background: none;
		border: none;
		cursor: pointer;
		color: var(--text-2);
		padding: 0;
		width: 44px;
		height: 44px;
		display: flex;
		align-items: center;
		justify-content: center;
		border-radius: var(--radius-1);
	}

	.btn-icon:hover {
		background-color: var(--surface-3);
		color: var(--text-1);
	}

	.btn-icon.delete:hover {
		background-color: var(--red-1);
		color: var(--red-7);
	}

	.btn-icon.confirm-delete {
		background-color: var(--red-5);
		color: white;
	}

	.btn-icon.confirm-delete:hover {
		background-color: var(--red-6);
	}

	.warning-text {
		color: var(--red-7);
		font-weight: bold;
	}

	.modal-footer {
		padding: var(--size-3) var(--size-4);
		border-top: 1px solid var(--surface-3);
		display: flex;
		justify-content: space-between;
		align-items: center;
	}

	.btn-primary {
		background-color: var(--brand);
		color: white;
		border: none;
		padding: 0 var(--size-4);
		min-height: var(--touch-target-min);
		border-radius: var(--radius-2);
		font-weight: bold;
		cursor: pointer;
		display: flex;
		align-items: center;
		gap: var(--size-2);
	}

	.btn-primary:hover {
		background-color: var(--brand-dark);
	}

	.btn-secondary {
		background-color: var(--surface-2);
		color: var(--text-1);
		border: 1px solid var(--surface-3);
		padding: 0 var(--size-4);
		min-height: var(--touch-target-min);
		border-radius: var(--radius-2);
		font-weight: bold;
		cursor: pointer;
		display: flex;
		align-items: center;
		gap: var(--size-2);
	}

	.btn-secondary:hover {
		background-color: var(--surface-3);
		border-color: var(--text-2);
	}

	.empty-state {
		text-align: center;
		color: var(--text-2);
		padding: var(--size-4);
	}

	.error-message {
		background-color: var(--red-1);
		color: var(--red-7);
		padding: var(--size-2);
		border-radius: var(--radius-2);
		border: 1px solid var(--red-3);
		font-size: var(--font-size-1);
	}

	/* Edit Form Styles */
	.edit-input {
		padding: var(--size-1);
		border-radius: var(--radius-1);
		border: 1px solid var(--surface-4);
		background-color: var(--surface-1);
		color: var(--text-1);
		width: 100%;
	}

	.edit-input.inline {
		display: block;
		margin: 0;
	}

	.edit-input.name {
		font-size: var(--font-size-2);
		font-weight: bold;
		margin-bottom: var(--size-1);
	}

	.edit-input.desc {
		font-size: var(--font-size-1);
		color: var(--text-2);
	}

	.left-actions {
		display: flex;
		gap: var(--size-2);
		align-items: center;
	}

	.btn-secondary {
		text-decoration: none;
	}

	.github-connect {
		color: var(--text-1);
	}

	.connected-badge {
		display: flex;
		align-items: center;
		gap: var(--size-2);
		color: var(--green-7);
		font-weight: bold;
		font-size: var(--font-size-1);
		padding: 0 var(--size-2);
	}

	.icon-stack {
		position: relative;
		width: 24px;
		height: 24px;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.spin-wrapper {
		animation: spin 1s linear infinite;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	@keyframes spin {
		from {
			transform: rotate(0deg);
		}
		to {
			transform: rotate(360deg);
		}
	}

	.check-badge {
		position: absolute;
		bottom: -2px;
		right: -2px;
		background-color: var(--green-5);
		color: white;
		border-radius: 50%;
		width: 14px;
		height: 14px;
		display: flex;
		align-items: center;
		justify-content: center;
		border: 2px solid var(--surface-1);
	}
</style>
