<script lang="ts">
	import { GameModel } from '$lib/game/model.svelte';
	import { LEVEL_1 } from '$lib/game/levels';
	import { runProgram } from '$lib/game/mimic';
	import Grid from '$lib/components/game/Grid.svelte';
	import Tray from '$lib/components/game/Tray.svelte';
	import { Cluster } from '$lib';

	// Initialize game
	// We use a factory or just new it up. Since it uses Runes, it's reactive.
	const game = new GameModel(LEVEL_1);

	let isRunning = $state(false);

	async function handlePlay() {
		if (isRunning) return;

		// Reset character to start before running
		game.reset();

		isRunning = true;

		const generator = runProgram(game);

		try {
			for await (const step of generator) {
				// We could trigger sounds here
				// step.type === 'step-start' | 'step-end'
				void step;
			}
		} catch (e) {
			console.error(e);
		} finally {
			isRunning = false;
		}
	}

	function handleReset() {
		game.reset();
		isRunning = false;
		// TODO: Cancel running generator if any
	}
</script>

<div class="game-layout">
	<header>
		<Cluster justify="space-between" align="center">
			<h1>{game.level.name}</h1>
			<div class="controls">
				<button
					class="btn-icon"
					onclick={() => game.undo()}
					disabled={!game.canUndo || isRunning}
					title="Undo"
				>
					↶
				</button>
				<button
					class="btn-icon"
					onclick={() => game.redo()}
					disabled={!game.canRedo || isRunning}
					title="Redo"
				>
					↷
				</button>
				<div class="separator"></div>
				<button
					class="btn-primary"
					onclick={handlePlay}
					disabled={isRunning || game.program.length === 0}
				>
					{#if isRunning}Running...{:else}▶ Play{/if}
				</button>
				<button class="btn-secondary" onclick={handleReset} disabled={isRunning}> ↺ Reset </button>
			</div>
		</Cluster>
	</header>

	<main>
		<div class="stage-container">
			<Grid {game} />

			{#if game.status === 'won'}
				<div class="overlay success">
					<h2>🎉 Level Complete!</h2>
					<button onclick={handleReset}>Play Again</button>
				</div>
			{/if}
		</div>
	</main>

	<footer>
		<Tray {game} />
	</footer>
</div>

<style>
	.game-layout {
		display: grid;
		grid-template-rows: auto 1fr 300px;
		height: 100vh;
		background-color: var(--surface-1);
		overflow: hidden;
	}

	header {
		padding: var(--size-3);
		background-color: var(--surface-2);
		border-bottom: 1px solid var(--surface-3);
	}

	main {
		display: grid;
		place-items: center;
		padding: var(--size-5);
		background-color: var(--surface-1);
		overflow: auto;
	}

	.stage-container {
		position: relative;
		width: 100%;
		max-width: 600px;
	}

	footer {
		height: 300px;
		overflow: hidden;
	}

	.btn-primary {
		background-color: var(--green-5);
		color: white;
		padding: var(--size-2) var(--size-4);
		border-radius: var(--radius-round);
		font-weight: bold;
		border: none;
		cursor: pointer;
		transition: transform 0.1s;
	}

	.btn-primary:active {
		transform: scale(0.95);
	}

	.btn-primary:disabled {
		background-color: var(--surface-4);
		cursor: not-allowed;
	}

	.btn-secondary {
		background-color: var(--surface-3);
		color: var(--text-1);
		padding: var(--size-2) var(--size-4);
		border-radius: var(--radius-round);
		border: none;
		cursor: pointer;
	}

	.btn-icon {
		background-color: transparent;
		color: var(--text-1);
		width: var(--size-8);
		height: var(--size-8);
		border-radius: var(--radius-round);
		border: 1px solid var(--surface-3);
		cursor: pointer;
		display: grid;
		place-items: center;
		font-size: var(--font-size-3);
	}

	.btn-icon:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}

	.btn-icon:hover:not(:disabled) {
		background-color: var(--surface-3);
	}

	.controls {
		display: flex;
		gap: var(--size-2);
		align-items: center;
	}

	.separator {
		width: 1px;
		height: var(--size-6);
		background-color: var(--surface-3);
		margin: 0 var(--size-2);
	}

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
