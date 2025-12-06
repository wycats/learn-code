<script lang="ts">
	import { GameModel } from '$lib/game/model.svelte';
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
		StepBack,
		RotateCw,
		RefreshCcw,
		BookOpen
	} from 'lucide-svelte';
	import { soundManager } from '$lib/game/sound';
	import { fade } from 'svelte/transition';
	import ThemeToggle from '$lib/components/common/ThemeToggle.svelte';
	import DevConnectionStatus from '$lib/components/common/DevConnectionStatus.svelte';
	import { bookStore } from '$lib/game/book/store.svelte';
	import BookModal from '$lib/components/game/book/BookModal.svelte';
	import HealthDisplay from '$lib/components/game/HealthDisplay.svelte';

	interface Props {
		game: GameModel;
		architectMode?: boolean;
		onNextLevel?: () => void;
		hasNextLevel?: boolean;
		onExit?: () => void; // For builder to exit test mode
		headerLeft?: import('svelte').Snippet;
		onTarget?: (target: string) => void;
	}

	let {
		game,
		architectMode = false,
		onNextLevel,
		hasNextLevel = false,
		onExit,
		headerLeft,
		onTarget
	}: Props = $props();

	let isRunning = $state(false);
	let isPaused = $state(false);
	let interpreter = $state<StackInterpreter | null>(null);

	function handleNextStory() {
		if (game.activeHintId) {
			game.dismissHint();
		} else {
			game.nextStorySegment();
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
		if (!isRunning || !interpreter) {
			await startExecution();
		}

		if (interpreter) {
			isPaused = true;
			const continueExecution = interpreter.step();
			if (!continueExecution) {
				if (game.status !== 'won') {
					// Failed
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

		// If we are paused in a failure state, restart instead of resuming
		if (
			isRunning &&
			isPaused &&
			(game.lastEvent?.type === 'blocked' ||
				game.lastEvent?.type === 'fail' ||
				game.status === 'planning')
		) {
			handleStop();
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
						isPaused = true;
					} else {
						isRunning = false;
						isPaused = false;
						interpreter = null;
						soundManager.play('win');
					}
					break;
				}
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

	// Architect Controls
	function rotateCharacter() {
		const dirs = ['N', 'E', 'S', 'W'] as const;
		const currentIdx = dirs.indexOf(game.characterOrientation);
		game.characterOrientation = dirs[(currentIdx + 1) % 4];
	}

	function resetCharacterPosition() {
		game.reset();
	}

	$effect(() => {
		if (game.level.ambientSoundId) {
			soundManager.playAmbient(game.level.ambientSoundId);
		} else {
			soundManager.stopAmbient();
		}
	});

	$effect(() => {
		const interval = setInterval(() => {
			game.checkHints();
		}, 1000);
		return () => clearInterval(interval);
	});

	$effect(() => {
		if (game.displaySegment?.targets) {
			game.triggerPreviewHighlight(game.displaySegment.targets);
		}
	});
</script>

<div class="game-layout">
	<BookModal />
	<header>
		<Cluster justify="space-between" align="center">
			<div class="left-controls">
				{@render headerLeft?.()}

				<button class="btn-icon" onclick={() => bookStore.open()} title="Field Guide">
					<BookOpen size={20} />
				</button>

				{#if architectMode}
					<div class="architect-badge">ARCHITECT</div>
					<div class="architect-controls">
						<button class="btn-icon" onclick={rotateCharacter} title="Rotate Character">
							<RotateCw size={18} />
						</button>
						<button class="btn-icon" onclick={resetCharacterPosition} title="Reset Position">
							<RefreshCcw size={18} />
						</button>
					</div>
					<div class="separator"></div>
				{/if}

				<button class="btn-icon" onclick={() => (game.status = 'goal')} title="Level Info">
					<Info size={20} />
				</button>

				{#if game.maxLives > 1}
					<div class="separator"></div>
					<HealthDisplay lives={game.lives} maxLives={game.maxLives} />
				{/if}
			</div>

			<div class="controls">
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
					aria-label={isRunning && !isPaused ? 'Stop' : 'Play'}
				>
					{#if isRunning && !isPaused}
						<Square size={16} fill="currentColor" /> <span class="btn-label">Stop</span>
					{:else}
						<Play size={16} fill="currentColor" /> <span class="btn-label">Play</span>
					{/if}
				</button>
				<button
					class="btn-secondary"
					onclick={handleStepBack}
					disabled={!isRunning || !interpreter}
					title="Step Back"
				>
					<StepBack size={16} /> <span class="btn-label">Back</span>
				</button>
				<button
					class="btn-secondary"
					onclick={handleStep}
					disabled={game.program.length === 0 || (isRunning && !isPaused)}
					title="Step Forward"
				>
					<StepForward size={16} /> <span class="btn-label">Step</span>
				</button>
				<button class="btn-secondary" onclick={handleReset} disabled={isRunning && !isPaused}>
					<RotateCcw size={16} /> <span class="btn-label">Reset</span>
				</button>
			</div>

			<div class="right-controls">
				<DevConnectionStatus />
				<ThemeToggle />
				{#if onExit}
					<div class="separator"></div>
					<button class="btn-secondary" onclick={onExit}> Exit Test </button>
				{/if}
			</div>
		</Cluster>
	</header>

	<div class="workspace">
		<div class="stage-area">
			<div class="dashboard-area">
				{#if game.displaySegment}
					<div class="dashboard-layer" transition:fade={{ duration: 200 }}>
						<InstructionBar
							segment={game.displaySegment}
							characters={game.level.characters}
							onNext={handleNextStory}
						/>
					</div>
				{:else if game.status !== 'goal'}
					<div class="dashboard-layer" transition:fade={{ duration: 200 }}>
						<StatusPanel {game} />
					</div>
				{/if}
			</div>

			<div class="stage-container">
				{#key game.level.id}
					<Grid {game} />
				{/key}

				{#if game.status === 'won'}
					<WinModal onReplay={handleReset} onNext={onNextLevel || (() => {})} {hasNextLevel} />
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
				<Tray {game} {onTarget} />
			{/key}
		</div>
	</div>
</div>

<style>
	.game-layout {
		display: grid;
		grid-template-rows: auto 1fr;
		height: 100%;
		background-color: var(--surface-1);
		overflow: hidden;
	}

	header {
		padding: var(--size-3);
		background-color: var(--surface-2);
		border-bottom: 1px solid var(--surface-3);
	}

	.left-controls,
	.right-controls {
		display: flex;
		align-items: center;
		gap: var(--size-2);
	}

	.architect-badge {
		font-size: var(--font-size-00);
		font-weight: 800;
		color: var(--brand);
		letter-spacing: 0.05em;
		padding: 2px var(--size-2);
		background-color: var(--surface-3);
		border-radius: var(--radius-1);
	}

	.architect-controls {
		display: flex;
		gap: var(--size-1);
	}

	.workspace {
		display: grid;
		grid-template-columns: 1fr 400px; /* Stage | Tray */
		height: 100%;
		overflow: hidden;
	}

	@media (max-width: 768px) {
		.workspace {
			grid-template-columns: 1fr;
			grid-template-rows: 1fr 1fr;
		}
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
		min-height: 120px; /* Allow growth */
		background-color: var(--surface-1);
		border-bottom: 1px solid var(--surface-3);
		display: grid;
		place-items: center;
		flex-shrink: 0;
		z-index: 20;
		grid-template-columns: 1fr;
		grid-template-rows: 1fr;
		grid-template-areas: 'layer';
	}

	.dashboard-layer {
		grid-area: layer;
		width: 100%;
		height: 100%;
		display: flex;
		justify-content: center;
		align-items: center;
	}

	.tray-area {
		border-left: 1px solid var(--surface-3);
		background-color: var(--surface-2);
		position: relative;
		z-index: 10;
	}

	.stage-container {
		position: relative;
		width: 100%;
		max-width: 100%;
		height: 100%;
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		flex: 1;
		padding: var(--size-5);
		overflow: hidden;
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
		transition: transform 0.1s;
		display: flex;
		align-items: center;
		justify-content: center;
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

	.btn-icon {
		background-color: transparent;
		color: var(--text-1);
		width: var(--touch-target-min);
		height: var(--touch-target-min);
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

	@media (max-width: 600px) {
		.btn-label {
			display: none;
		}

		.btn-primary,
		.btn-secondary {
			padding: 0;
			width: 44px; /* Fixed width for icon-only */
			height: 44px;
			justify-content: center;
		}

		.controls {
			position: fixed;
			bottom: var(--size-4);
			left: 50%;
			transform: translateX(-50%);
			background-color: var(--surface-1);
			padding: var(--size-2) var(--size-3);
			border-radius: var(--radius-pill);
			box-shadow: var(--shadow-5);
			z-index: 100;
			border: 1px solid var(--surface-3);
			width: auto;
			gap: var(--size-3);
		}

		.separator {
			display: none; /* Hide separator in floating bar */
		}

		.dashboard-area {
			min-height: 90px;
		}
	}
</style>
