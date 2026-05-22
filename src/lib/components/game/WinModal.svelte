<script lang="ts">
	import type { Attachment } from 'svelte/attachments';
	import { PartyPopper, ChevronRight, RotateCcw } from 'lucide-svelte';
	import { Stack } from '$lib';

	interface Props {
		onReplay: () => void;
		onNext: () => void;
		onDismiss: () => void;
		hasNextLevel: boolean;
	}

	let { onReplay, onNext, onDismiss, hasNextLevel }: Props = $props();

	const showModal: Attachment<HTMLDialogElement> = (dialog) => {
		dialog?.showModal();

		return () => {
			if (dialog.open) dialog.close();
		};
	};
</script>

<dialog {@attach showModal} class="win-modal" oncancel={() => onDismiss()}>
	<Stack gap="var(--size-4)" align="center">
		<h2><PartyPopper size={32} /> Level Complete!</h2>
		<p>Great job! You solved the puzzle.</p>
		<div class="actions">
			<button class="btn-secondary" onclick={onReplay}>
				<RotateCcw size={16} /> Replay
			</button>
			<button class="btn-secondary" onclick={onDismiss}>Back to Planning</button>
			{#if hasNextLevel}
				<button class="btn-primary" onclick={onNext}>
					Next Level <ChevronRight size={16} />
				</button>
			{:else}
				<p class="finished">You finished all available levels!</p>
			{/if}
		</div>
	</Stack>
</dialog>

<style>
	.win-modal {
		background-color: var(--surface-1);
		color: var(--text-1);
		padding: var(--size-6);
		border-radius: var(--radius-3);
		box-shadow: var(--shadow-4);
		text-align: center;
		min-width: 300px;
		max-width: 90%;
		border: none;
		animation: pop-in 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275) both;
	}

	.win-modal::backdrop {
		background-color: light-dark(rgba(255, 255, 255, 0.5), rgba(0, 0, 0, 0.5));
		backdrop-filter: blur(8px);
		animation: fade-in 0.3s ease;
	}

	h2 {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: var(--size-2);
		color: light-dark(var(--green-7), var(--green-4));
		margin: 0;
	}

	h2 :global(svg) {
		animation: shake-rotate 0.5s ease-in-out 0.5s;
	}

	.actions {
		display: grid;
		grid-template-columns: repeat(3, minmax(0, 1fr));
		align-items: center;
		gap: var(--size-3);
		margin-top: var(--size-2);
		width: 100%;
	}

	.btn-primary {
		background-color: var(--green-5);
		color: white;
		padding: 0 var(--size-4);
		min-height: var(--touch-target-min);
		border-radius: var(--radius-round);
		font-weight: bold;
		border: none;
		cursor: pointer;
		display: flex;
		align-items: center;
		justify-content: center;
		gap: var(--size-2);
	}

	.btn-secondary {
		background-color: var(--surface-3);
		color: var(--text-1);
		padding: 0 var(--size-4);
		min-height: var(--touch-target-min);
		border-radius: var(--radius-round);
		border: none;
		cursor: pointer;
		display: flex;
		align-items: center;
		justify-content: center;
		gap: var(--size-2);
	}

	.finished {
		font-weight: bold;
		color: light-dark(var(--indigo-6), var(--indigo-4));
		margin: 0;
		display: flex;
		align-items: center;
		justify-content: center;
		min-height: var(--touch-target-min);
	}

	@media (max-width: 640px) {
		.actions {
			grid-template-columns: 1fr;
		}
	}

	@keyframes fade-in {
		from {
			opacity: 0;
		}
		to {
			opacity: 1;
		}
	}

	@keyframes pop-in {
		from {
			opacity: 0;
			transform: scale(0.8) translateY(20px);
		}
		to {
			opacity: 1;
			transform: scale(1) translateY(0);
		}
	}

	@keyframes shake-rotate {
		0%,
		100% {
			transform: rotate(0deg);
		}
		25% {
			transform: rotate(-15deg);
		}
		75% {
			transform: rotate(15deg);
		}
	}
</style>
