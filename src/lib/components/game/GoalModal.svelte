<script lang="ts">
	import { Star, Play } from 'lucide-svelte';
	import { Stack } from '$lib';

	interface Props {
		onStart: () => void;
		levelName: string;
		par?: number;
	}

	let { onStart, levelName, par }: Props = $props();
</script>

<div class="overlay goal">
	<div class="modal">
		<Stack gap="var(--size-4)" align="center">
			<div class="icon-wrapper">
				<Star size={48} color="var(--star-color)" fill="var(--star-fill)" />
			</div>
			<div class="content">
				<h2>{levelName}</h2>
				<p>Program the robot to reach the star!</p>
				{#if par}
					<p class="hint">Try to solve it in <strong>{par} blocks</strong>.</p>
				{/if}
			</div>
			<button class="btn-primary" onclick={onStart}>
				<Play size={16} fill="currentColor" /> Start Planning
			</button>
		</Stack>
	</div>
</div>

<style>
	.overlay {
		position: absolute;
		inset: 0;
		background-color: light-dark(rgba(255, 255, 255, 0.5), rgba(0, 0, 0, 0.5));
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		color: white;
		border-radius: var(--radius-3);
		backdrop-filter: blur(8px);
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
		max-width: 90%;
	}

	.icon-wrapper {
		background-color: light-dark(var(--yellow-1), var(--yellow-9));
		padding: var(--size-4);
		border-radius: var(--radius-round);
		display: inline-flex;
		border: 2px solid light-dark(var(--yellow-3), var(--yellow-7));
		--star-color: light-dark(var(--yellow-7), var(--yellow-3));
		--star-fill: light-dark(var(--yellow-4), var(--yellow-6));
	}

	h2 {
		color: var(--text-1);
		margin-bottom: var(--size-2);
	}

	p {
		color: var(--text-2);
		margin: 0;
	}

	.hint {
		margin-top: var(--size-2);
		font-size: var(--font-size-1);
		color: var(--text-3);
	}

	.btn-primary {
		background-color: var(--indigo-5);
		color: white;
		padding: 0 var(--size-6);
		min-height: var(--touch-target-min);
		border-radius: var(--radius-round);
		font-weight: bold;
		font-size: var(--font-size-2);
		border: none;
		cursor: pointer;
		display: flex;
		align-items: center;
		justify-content: center;
		gap: var(--size-2);
		transition: transform 0.1s;
	}

	.btn-primary:hover {
		background-color: var(--indigo-6);
	}

	.btn-primary:active {
		transform: scale(0.95);
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
