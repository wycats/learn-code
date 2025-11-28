<script lang="ts">
	import { GameModel } from '$lib/game/model.svelte';
	import { LEVELS } from '$lib/game/levels';
	import { StackInterpreter } from '$lib/game/mimic';
	import Grid from '$lib/components/game/Grid.svelte';
	import Tray from '$lib/components/game/Tray.svelte';
	import InstructionBar from '$lib/components/game/InstructionBar.svelte';
	import StatusPanel from '$lib/components/game/StatusPanel.svelte';
	import WinModal from '$lib/components/game/WinModal.svelte';
	import GoalModal from '$lib/components/game/GoalModal.svelte';
	import { Cluster } from '$lib';
	import {
		Undo2,
		Redo2,
		Play,
		Square,
		RotateCcw,
		Info,
		StepForward,
		StepBack
	} from 'lucide-svelte';
	import { soundManager } from '$lib/game/sound';

	// Initialize game
	// We use a factory or just new it up. Since it uses Runes, it's reactive.
	let currentLevelIndex = $state(0);
	let game = $state(new GameModel(LEVELS[0]));

	let isRunning = $state(false);
	let isPaused = $state(false);
	let interpreter = $state<StackInterpreter | null>(null);

	function loadLevel(index: number) {
		if (index >= 0 && index < LEVELS.length) {
			currentLevelIndex = index;
			game = new GameModel(LEVELS[index]);
			isRunning = false;
			isPaused = false;
			interpreter = null;
		}
	}

	function handleNextLevel() {
		loadLevel(currentLevelIndex + 1);
	}

	function handleNextStory() {
		game.nextStorySegment();
	}

	function handleStartPlanning() {
		game.status = 'planning';
	}

	async function startExecution() {
		game.reset();
		isRunning = true;
		isPaused = true;
		interpreter = new StackInterpreter(game);
		interpreter.start();
	}

	async function handleStep() {
		soundManager.play('click');
		if (!isRunning || !interpreter) {
			await startExecution();
		}

		if (interpreter) {
			isPaused = true;
			const continueExecution = interpreter.step();
			if (!continueExecution) {
				// Don't stop immediately if won, let the modal show
				if (game.status !== 'won') {
					handleStop();
				} else {
					isRunning = false;
					isPaused = false;
					interpreter = null;
					soundManager.play('win');
				}
			}
		}
	}

	function handleStepBack() {
		soundManager.play('click');
		if (interpreter) {
			isPaused = true;
			interpreter.stepBack();
		}
	}

	async function handlePlay() {
		soundManager.play('click');
		if (isRunning && !isPaused) {
			handleStop();
			return;
		}

		if (!isRunning) {
			game.checkTrigger('program-run');
			await startExecution();
		}

		isPaused = false;

		try {
			while (isRunning && !isPaused && interpreter) {
				const continueExecution = interpreter.step();
				if (!continueExecution) {
					if (game.status !== 'won') {
						handleStop();
					} else {
						isRunning = false;
						isPaused = false;
						interpreter = null;
						soundManager.play('win');
					}
					break;
				}
				// Add delay between steps for visualization
				await new Promise((r) => setTimeout(r, 500));
			}
		} catch (e) {
			console.error(e);
			handleStop();
		}
	}

	function handleStop() {
		isRunning = false;
		isPaused = false;
		interpreter = null;
		game.status = 'planning';
		game.activeBlockId = null;
	}

	function handleReset() {
		soundManager.play('click');
		handleStop();
		game.reset();
	}
</script>

<div class="game-layout">
	<header>
		<Cluster justify="space-between" align="center">
			<div class="level-info">
				<select
					value={currentLevelIndex}
					onchange={(e) => loadLevel(parseInt(e.currentTarget.value))}
				>
					{#each LEVELS as level, i (level.id)}
						<option value={i}>Level {i + 1}: {level.name}</option>
					{/each}
				</select>
			</div>
			<div class="controls">
				<button class="btn-icon" onclick={() => (game.status = 'goal')} title="Level Info">
					<Info size={20} />
				</button>
				<div class="separator"></div>
				<button
					class="btn-icon"
					onclick={() => game.undo()}
					disabled={!game.canUndo || isRunning}
					title="Undo"
				>
					<Undo2 size={20} />
				</button>
				<button
					class="btn-icon"
					onclick={() => game.redo()}
					disabled={!game.canRedo || isRunning}
					title="Redo"
				>
					<Redo2 size={20} />
				</button>
				<div class="separator"></div>
				<button
					class="btn-primary"
					class:stop={isRunning && !isPaused}
					onclick={handlePlay}
					disabled={!isRunning && game.program.length === 0}
				>
					{#if isRunning && !isPaused}
						<Square size={16} fill="currentColor" /> Stop
					{:else}
						<Play size={16} fill="currentColor" /> Play
					{/if}
				</button>
				<button
					class="btn-secondary"
					onclick={handleStepBack}
					disabled={!isRunning || !interpreter}
					title="Step Back"
				>
					<StepBack size={16} /> Back
				</button>
				<button
					class="btn-secondary"
					onclick={handleStep}
					disabled={game.program.length === 0 || (isRunning && !isPaused)}
					title="Step Forward"
				>
					<StepForward size={16} /> Step
				</button>
				<button class="btn-secondary" onclick={handleReset} disabled={isRunning && !isPaused}>
					<RotateCcw size={16} /> Reset
				</button>
			</div>
		</Cluster>
	</header>

	<div class="workspace">
		<div class="stage-area">
			<div class="dashboard-area">
				{#if game.status === 'story' && game.currentStorySegment}
					<InstructionBar segment={game.currentStorySegment} onNext={handleNextStory} />
				{:else if game.status !== 'goal'}
					<StatusPanel {game} />
				{/if}
			</div>

			<div class="stage-container">
				{#key game.level.id}
					<Grid {game} />
				{/key}

				{#if game.status === 'won'}
					<WinModal
						onReplay={handleReset}
						onNext={handleNextLevel}
						hasNextLevel={currentLevelIndex < LEVELS.length - 1}
					/>
				{/if}

				{#if game.status === 'goal'}
					<GoalModal
						levelName={game.level.name}
						par={game.level.solutionPar}
						onStart={handleStartPlanning}
					/>
				{/if}
			</div>
		</div>

		<div class="tray-area">
			{#key game.level.id}
				<Tray {game} />
			{/key}
		</div>
	</div>
</div>

<style>
	.game-layout {
		display: grid;
		grid-template-rows: auto 1fr;
		height: 100vh;
		background-color: var(--surface-1);
		overflow: hidden;
	}

	header {
		padding: var(--size-3);
		background-color: var(--surface-2);
		border-bottom: 1px solid var(--surface-3);
	}

	.level-info select {
		font-size: var(--font-size-2);
		font-weight: bold;
		padding: var(--size-2);
		border-radius: var(--radius-2);
		border: 1px solid var(--surface-3);
		background-color: var(--surface-1);
		color: var(--text-1);
	}

	.level-info {
		display: flex;
		align-items: center;
		gap: var(--size-3);
	}

	.workspace {
		display: grid;
		grid-template-columns: 1fr 400px; /* Stage | Tray */
		height: 100%;
		overflow: hidden;
	}

	.stage-area {
		display: flex;
		flex-direction: column;
		align-items: center;
		padding: 0;
		background-color: var(--surface-1);
		overflow: hidden;
	}

	.dashboard-area {
		width: 100%;
		height: 120px; /* Fixed budget */
		background-color: var(--surface-1);
		border-bottom: 1px solid var(--surface-3);
		display: grid;
		place-items: center;
		flex-shrink: 0;
		z-index: 20;
	}

	.dashboard-area > :global(*) {
		grid-area: 1 / 1;
		width: 100%;
		height: 100%;
	}

	.tray-area {
		border-left: 1px solid var(--surface-3);
		background-color: var(--surface-2);
		/* overflow: hidden; Removed to allow toolbar to overlap stage */
		position: relative; /* For absolute positioning context if needed */
		z-index: 10;
	}

	.stage-container {
		position: relative;
		width: 100%;
		max-width: 100%; /* Allow full width */
		height: 100%; /* Fill remaining height */
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		flex: 1;
		padding: var(--size-5);
		overflow: hidden; /* Contain grid */
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
		display: flex;
		align-items: center;
		gap: var(--size-2);
	}

	.btn-primary:active {
		transform: scale(0.95);
	}

	.btn-primary.stop {
		background-color: var(--red-5);
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
		display: flex;
		align-items: center;
		gap: var(--size-2);
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

	/* Removed .phase-indicator styles as they are now in StatusPanel */
</style>
