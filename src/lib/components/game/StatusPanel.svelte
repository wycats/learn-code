<script lang="ts">
	import type { GameModel } from '$lib/game/model.svelte';
	import { Play, CheckCircle2, BrainCircuit } from 'lucide-svelte';
	import { fade } from 'svelte/transition';

	interface Props {
		game: GameModel;
	}

	let { game }: Props = $props();
</script>

<div class="status-panel" in:fade={{ duration: 300, delay: 150 }}>
	{#if game.status === 'running'}
		<div class="status-content running">
			<div class="icon-wrapper">
				<Play size={24} />
			</div>
			<div class="info">
				<h3>Running Code...</h3>
				<p>Watch your character execute the program.</p>
			</div>
		</div>
	{:else if game.status === 'won'}
		<div class="status-content won">
			<div class="icon-wrapper">
				<CheckCircle2 size={24} />
			</div>
			<div class="info">
				<h3>Level Complete!</h3>
				<p>Great work!</p>
			</div>
		</div>
	{:else}
		<div class="status-content planning">
			<div class="icon-wrapper">
				<BrainCircuit size={24} />
			</div>
			<div class="info">
				<h3>Planning Phase</h3>
				<p>Drag blocks to the program area to solve the puzzle.</p>
			</div>
			{#if game.level.solutionPar}
				<div class="par-badge">
					<span class="label">Target</span>
					<span class="value">{game.level.solutionPar} blocks</span>
				</div>
			{/if}
		</div>
	{/if}
</div>

<style>
	.status-panel {
		width: 100%;
		height: 100%;
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 0 var(--size-4);
	}

	.status-content {
		display: flex;
		align-items: center;
		gap: var(--size-4);
		width: 100%;
		max-width: 800px;
	}

	.icon-wrapper {
		width: 48px;
		height: 48px;
		border-radius: 50%;
		display: grid;
		place-items: center;
		background-color: var(--surface-1);
		box-shadow: var(--shadow-2);
		flex-shrink: 0;
	}

	.running .icon-wrapper {
		color: var(--green-6);
		background-color: var(--green-0);
	}
	.won .icon-wrapper {
		color: var(--yellow-6);
		background-color: var(--yellow-0);
	}
	.planning .icon-wrapper {
		color: var(--blue-6);
		background-color: var(--blue-0);
	}

	.info h3 {
		margin: 0;
		font-size: var(--font-size-2);
		color: var(--text-1);
		font-weight: 700;
	}

	.info p {
		margin: 0;
		font-size: var(--font-size-1);
		color: var(--text-2);
	}

	.par-badge {
		margin-left: auto;
		display: flex;
		flex-direction: column;
		align-items: flex-end;
		background-color: var(--surface-1);
		padding: var(--size-2) var(--size-3);
		border-radius: var(--radius-2);
		border: 1px solid var(--surface-3);
		box-shadow: var(--shadow-1);
	}

	.par-badge .label {
		font-size: var(--font-size-00);
		text-transform: uppercase;
		letter-spacing: 0.05em;
		color: var(--text-3);
		font-weight: 600;
	}

	.par-badge .value {
		font-size: var(--font-size-2);
		font-weight: 700;
		color: var(--indigo-7);
	}
</style>
