<script lang="ts">
	import { GameModel } from '$lib/game/model.svelte';
	import { LEVELS } from '$lib/game/levels';
	import { StackInterpreter } from '$lib/game/mimic';
	import Grid from '$lib/components/game/Grid.svelte';
	import Tray from '$lib/components/game/Tray.svelte';
	import Dialogue from '$lib/components/game/Dialogue.svelte';
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
	let currentStoryIndex = $state(0);

	function loadLevel(index: number) {
		if (index >= 0 && index < LEVELS.length) {
			currentLevelIndex = index;
			game = new GameModel(LEVELS[index]);
			currentStoryIndex = 0;
			isRunning = false;
			isPaused = false;
			interpreter = null;
		}
	}

	function handleNextLevel() {
		loadLevel(currentLevelIndex + 1);
	}

	// Derived state for current story segment
	let currentStorySegment = $derived.by(() => {
		if (game.status !== 'story') return null;
		if (game.level.intro && currentStoryIndex < game.level.intro.length) {
			return game.level.intro[currentStoryIndex];
		}
		return null;
	});

	function handleNextStory() {
		if (game.level.intro && currentStoryIndex < game.level.intro.length - 1) {
			currentStoryIndex++;
		} else {
			// End of story, show goal
			game.status = 'goal';
			currentStoryIndex = 0;
		}
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
				{#if game.level.solutionPar}
					<div class="target-badge" title="Try to solve it in {game.level.solutionPar} blocks">
						Target: {game.level.solutionPar}
					</div>
				{/if}
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
			<div class="stage-container">
				<div class="phase-indicator" class:running={game.status === 'running'}>
					{#if game.status === 'running'}
						<span class="dot running"></span> Running...
					{:else if game.status === 'planning'}
						<span class="dot planning"></span> Planning
					{:else if game.status === 'won'}
						<span class="dot success"></span> Success!
					{/if}
				</div>

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

				{#if game.status === 'story' && currentStorySegment}
					<Dialogue segment={currentStorySegment} onNext={handleNextStory} />
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

	.target-badge {
		font-size: var(--font-size-1);
		font-weight: bold;
		color: var(--indigo-7);
		background-color: var(--indigo-1);
		padding: var(--size-1) var(--size-3);
		border-radius: var(--radius-round);
		border: 1px solid var(--indigo-2);
	}

	.workspace {
		display: grid;
		grid-template-columns: 1fr 400px; /* Stage | Tray */
		height: 100%;
		overflow: hidden;
	}

	.stage-area {
		display: flex;
		justify-content: center;
		align-items: center;
		padding: var(--size-5);
		background-color: var(--surface-1);
		overflow: hidden;
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
		max-width: 600px;
		max-height: 100%;
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
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

	.phase-indicator {
		margin-bottom: var(--size-3);
		background-color: var(--surface-2);
		padding: var(--size-1) var(--size-3);
		border-radius: var(--radius-round);
		font-size: var(--font-size-1);
		font-weight: bold;
		color: var(--text-2);
		display: flex;
		align-items: center;
		gap: var(--size-2);
		box-shadow: var(--shadow-2);
		z-index: 20;
		transition: all 0.3s ease;
	}

	.phase-indicator.running {
		background-color: var(--surface-1);
		border: 1px solid var(--green-3);
		color: var(--green-7);
	}

	.dot {
		width: 8px;
		height: 8px;
		border-radius: 50%;
		background-color: var(--text-3);
	}

	.dot.planning {
		background-color: var(--blue-5);
	}

	.dot.running {
		background-color: var(--green-5);
		animation: pulse 1s infinite;
	}

	.dot.success {
		background-color: var(--yellow-5);
	}

	@keyframes pulse {
		0% {
			opacity: 1;
		}
		50% {
			opacity: 0.5;
		}
		100% {
			opacity: 1;
		}
	}
</style>
