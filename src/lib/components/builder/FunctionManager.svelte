<script lang="ts">
	import type { BuilderModel } from '$lib/game/builder-model.svelte';
	import { Plus, Pencil, Trash2, FunctionSquare, Check, X } from 'lucide-svelte';

	interface Props {
		builder: BuilderModel;
	}

	let { builder }: Props = $props();

	let newFunctionName = $state('');
	let isCreating = $state(false);
	let deletingFunction = $state<string | null>(null);

	function createFunction() {
		if (!newFunctionName.trim()) return;
		builder.createFunction(newFunctionName.trim());
		newFunctionName = '';
		isCreating = false;
	}

	function requestDelete(name: string) {
		deletingFunction = name;
	}

	function confirmDelete() {
		if (deletingFunction) {
			builder.deleteFunction(deletingFunction);
			deletingFunction = null;
		}
	}

	function cancelDelete() {
		deletingFunction = null;
	}

	function editFunction(name: string) {
		if (builder.game.editingContext === name) {
			builder.closeFunctionEditor();
		} else {
			builder.editFunction(name);
		}
	}
</script>

<div class="function-manager">
	<div class="function-list">
		{#if builder.level.functions}
			{#each Object.keys(builder.level.functions) as name (name)}
				<div class="function-item" class:active={builder.game.editingContext === name}>
					{#if deletingFunction === name}
						<div class="function-info delete-mode">
							<span>Delete "{name}"?</span>
						</div>
						<div class="actions">
							<button
								class="action-btn confirm-delete"
								onclick={confirmDelete}
								title="Confirm Delete"
							>
								<Check size={16} />
							</button>
							<button class="action-btn cancel" onclick={cancelDelete} title="Cancel">
								<X size={16} />
							</button>
						</div>
					{:else}
						<div class="function-info">
							<FunctionSquare size={20} />
							<span class="function-name">{name}</span>
						</div>
						<div class="actions">
							<button
								class="action-btn"
								class:active={builder.game.editingContext === name}
								onclick={() => editFunction(name)}
								title={builder.game.editingContext === name ? 'Stop Editing' : 'Edit Function'}
							>
								<Pencil size={16} />
							</button>
							<button class="action-btn delete" onclick={() => requestDelete(name)} title="Delete">
								<Trash2 size={16} />
							</button>
						</div>
					{/if}
				</div>
			{/each}
		{/if}
	</div>

	{#if isCreating}
		<div class="create-form">
			<input
				type="text"
				bind:value={newFunctionName}
				placeholder="Function Name"
				onkeydown={(e) => e.key === 'Enter' && createFunction()}
			/>
			<div class="form-actions">
				<button class="cancel-btn" onclick={() => (isCreating = false)}>Cancel</button>
				<button class="confirm-btn" onclick={createFunction}>Create</button>
			</div>
		</div>
	{:else}
		<button class="new-btn" onclick={() => (isCreating = true)}>
			<Plus size={20} />
			<span>New Function</span>
		</button>
	{/if}
</div>

<style>
	.function-manager {
		display: flex;
		flex-direction: column;
		gap: var(--size-3);
		padding: var(--size-2);
	}

	.function-list {
		display: flex;
		flex-direction: column;
		gap: var(--size-2);
	}

	.function-item {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: var(--size-2);
		background-color: var(--surface-1);
		border: 1px solid var(--surface-3);
		border-radius: var(--radius-2);
	}

	.function-item.active {
		border-color: var(--brand);
		background-color: var(--brand-surface);
	}

	.function-info {
		display: flex;
		align-items: center;
		gap: var(--size-2);
		font-weight: bold;
		color: var(--text-1);
	}

	.actions {
		display: flex;
		gap: var(--size-1);
	}

	.action-btn {
		background: none;
		border: none;
		padding: 0;
		border-radius: var(--radius-1);
		cursor: pointer;
		color: var(--text-2);
		display: flex;
		align-items: center;
		justify-content: center;
		width: var(--touch-target-min);
		height: var(--touch-target-min);
	}

	.action-btn:hover {
		background-color: var(--surface-2);
		color: var(--text-1);
	}

	.action-btn.active {
		background-color: var(--brand);
		color: white;
	}

	.action-btn.delete:hover {
		background-color: var(--red-2);
		color: var(--red-7);
	}

	.action-btn.confirm-delete {
		background-color: var(--red-5);
		color: white;
	}

	.action-btn.confirm-delete:hover {
		background-color: var(--red-6);
	}

	.function-info.delete-mode {
		color: var(--red-7);
		font-weight: bold;
	}

	.new-btn {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: var(--size-2);
		padding: 0 var(--size-2);
		min-height: var(--touch-target-min);
		background-color: var(--surface-2);
		border: 2px dashed var(--surface-3);
		border-radius: var(--radius-2);
		color: var(--text-2);
		font-weight: bold;
		cursor: pointer;
		transition: all 0.2s;
	}

	.new-btn:hover {
		background-color: var(--surface-3);
		border-color: var(--text-2);
		color: var(--text-1);
	}

	.create-form {
		display: flex;
		flex-direction: column;
		gap: var(--size-2);
		padding: var(--size-2);
		background-color: var(--surface-2);
		border-radius: var(--radius-2);
	}

	input {
		padding: var(--size-2);
		border: 1px solid var(--surface-3);
		border-radius: var(--radius-1);
		background-color: var(--surface-1);
		color: var(--text-1);
	}

	.form-actions {
		display: flex;
		gap: var(--size-2);
		justify-content: flex-end;
	}

	.cancel-btn,
	.confirm-btn {
		padding: 0 var(--size-3);
		min-height: var(--touch-target-min);
		border-radius: var(--radius-1);
		border: none;
		cursor: pointer;
		font-weight: bold;
	}

	.cancel-btn {
		background: none;
		color: var(--text-2);
	}

	.confirm-btn {
		background-color: var(--brand);
		color: white;
	}
</style>
