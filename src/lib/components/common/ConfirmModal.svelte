<script lang="ts">
	import { AlertTriangle, X } from 'lucide-svelte';

	interface Props {
		title: string;
		message: string;
		confirmText?: string;
		cancelText?: string;
		onConfirm: () => void;
		onCancel: () => void;
	}

	let {
		title,
		message,
		confirmText = 'Confirm',
		cancelText = 'Cancel',
		onConfirm,
		onCancel
	}: Props = $props();

	let dialog: HTMLDialogElement;

	$effect(() => {
		dialog?.showModal();
	});

	function handleBackdropClick(e: MouseEvent) {
		if (e.target === dialog) {
			onCancel();
		}
	}
</script>

<dialog bind:this={dialog} onclose={onCancel} onclick={handleBackdropClick} class="confirm-modal">
	<div class="modal-header">
		<div class="icon-wrapper">
			<AlertTriangle size={24} />
		</div>
		<h2>{title}</h2>
		<button class="close-btn" onclick={onCancel} aria-label="Close">
			<X size={20} />
		</button>
	</div>

	<div class="modal-content">
		<p>{message}</p>
	</div>

	<div class="modal-actions">
		<button class="btn-cancel" onclick={onCancel}>{cancelText}</button>
		<button class="btn-confirm" onclick={onConfirm}>{confirmText}</button>
	</div>
</dialog>

<style>
	.confirm-modal {
		border: none;
		border-radius: var(--radius-3);
		padding: 0;
		width: 400px;
		max-width: 90vw;
		background-color: var(--surface-1);
		box-shadow: var(--shadow-5);
		color: var(--text-1);
	}

	.confirm-modal::backdrop {
		background-color: rgba(0, 0, 0, 0.5);
		backdrop-filter: blur(2px);
	}

	.modal-header {
		display: flex;
		align-items: center;
		gap: var(--size-3);
		padding: var(--size-4);
		border-bottom: 1px solid var(--surface-2);
	}

	.icon-wrapper {
		color: var(--red-6);
		background-color: var(--red-1);
		padding: var(--size-2);
		border-radius: var(--radius-round);
		display: grid;
		place-items: center;
	}

	h2 {
		margin: 0;
		font-size: var(--font-size-3);
		flex: 1;
	}

	.close-btn {
		background: none;
		border: none;
		cursor: pointer;
		color: var(--text-2);
		min-width: var(--touch-target-min);
		min-height: var(--touch-target-min);
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 0;
		border-radius: var(--radius-round);
	}

	.close-btn:hover {
		background-color: var(--surface-2);
		color: var(--text-1);
	}

	.modal-content {
		padding: var(--size-4);
	}

	p {
		margin: 0;
		color: var(--text-2);
		line-height: 1.5;
	}

	.modal-actions {
		padding: var(--size-4);
		background-color: var(--surface-2);
		display: flex;
		justify-content: flex-end;
		gap: var(--size-3);
		border-top: 1px solid var(--surface-3);
	}

	button {
		min-height: var(--touch-target-min);
		padding: 0 var(--size-4);
		border-radius: var(--radius-2);
		font-weight: 600;
		cursor: pointer;
		border: 1px solid transparent;
		transition: all 0.2s;
	}

	.btn-cancel {
		background-color: var(--surface-1);
		border-color: var(--surface-3);
		color: var(--text-1);
	}

	.btn-cancel:hover {
		background-color: var(--surface-2);
		border-color: var(--text-2);
	}

	.btn-confirm {
		background-color: var(--red-6);
		color: white;
	}

	.btn-confirm:hover {
		background-color: var(--red-7);
	}
</style>
