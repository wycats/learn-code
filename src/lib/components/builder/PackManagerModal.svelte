<script lang="ts">
	import { onMount } from 'svelte';
	import {
		listPacks,
		loadPack,
		deletePack,
		createDefaultPack,
		savePack
	} from '$lib/game/persistence';
	import type { BuilderModel } from '$lib/game/builder-model.svelte';
	import { X, Trash2, FolderOpen, Plus, Pencil, Check } from 'lucide-svelte';

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

	onMount(async () => {
		packs = await listPacks();
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
	}

	async function confirmDelete() {
		if (deletingPackId) {
			await deletePack(deletingPackId);
			packs = await listPacks();
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
	}

	async function saveEdit(id: string) {
		const pack = await loadPack(id);
		if (pack) {
			pack.name = editName;
			pack.description = editDesc;
			await savePack(pack);

			// If this is the currently loaded pack, update the builder too
			if (builder.pack.id === id) {
				builder.pack.name = editName;
				builder.pack.description = editDesc;
			}

			editingPackId = null;
			packs = await listPacks();
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
		padding: var(--size-1);
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
		padding: var(--size-2);
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
		justify-content: flex-end;
	}

	.btn-primary {
		background-color: var(--brand);
		color: white;
		border: none;
		padding: var(--size-2) var(--size-4);
		border-radius: var(--radius-2);
		font-weight: bold;
		cursor: pointer;
		display: flex;
		align-items: center;
		gap: var(--size-2);
	}

	.empty-state {
		text-align: center;
		color: var(--text-2);
		padding: var(--size-4);
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
</style>
