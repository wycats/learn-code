<script lang="ts">
	import { PartyPopper, ChevronRight, RotateCcw } from 'lucide-svelte';
	import { Stack } from '$lib';

	interface Props {
		onReplay: () => void;
		onNext: () => void;
		hasNextLevel: boolean;
	}

	let { onReplay, onNext, hasNextLevel }: Props = $props();
</script>

<div class="overlay success">
	<div class="modal">
		<Stack gap="var(--size-4)" align="center">
			<h2><PartyPopper size={32} /> Level Complete!</h2>
			<p>Great job! You solved the puzzle.</p>
			<div class="actions">
				<button class="btn-secondary" onclick={onReplay}>
					<RotateCcw size={16} /> Replay
				</button>
				{#if hasNextLevel}
					<button class="btn-primary" onclick={onNext}>
						Next Level <ChevronRight size={16} />
					</button>
				{:else}
					<p class="finished">You finished all available levels!</p>
				{/if}
			</div>
		</Stack>
	</div>
</div>

<style>
	.overlay {
		position: absolute;
		inset: 0;
		background-color: rgba(0, 0, 0, 0.7);
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		color: white;
		border-radius: var(--radius-3);
		backdrop-filter: blur(5px);
		animation: fade-in 0.3s ease;
		z-index: 50;
	}

	.modal {
		background-color: var(--surface-1);
		color: var(--text-1);
		padding: var(--size-6);
		border-radius: var(--radius-3);
		box-shadow: var(--shadow-4);
		text-align: center;
		min-width: 300px;
	}

	h2 {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: var(--size-2);
		color: var(--green-7);
		margin: 0;
	}

	.actions {
		display: flex;
		gap: var(--size-3);
		justify-content: center;
		margin-top: var(--size-2);
	}

	.btn-primary {
		background-color: var(--green-5);
		color: white;
		padding: var(--size-2) var(--size-4);
		border-radius: var(--radius-round);
		font-weight: bold;
		border: none;
		cursor: pointer;
		display: flex;
		align-items: center;
		gap: var(--size-2);
	}

	.btn-secondary {
		background-color: var(--surface-3);
		color: var(--text-1);
		padding: var(--size-2) var(--size-4);
		border-radius: var(--radius-round);
		border: none;
		cursor: pointer;
		display: flex;
		align-items: center;
		gap: var(--size-2);
	}

	.finished {
		font-weight: bold;
		color: var(--indigo-6);
	}

	@keyframes fade-in {
		from {
			opacity: 0;
		}
		to {
			opacity: 1;
		}
	}
</style>
