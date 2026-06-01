<script lang="ts">
	import { GameModel } from '$lib/game/model.svelte';
	import { StackInterpreter } from '$lib/game/mimic';
	import { simulateGhostPath } from '$lib/game/ghost-path';
	import Grid from '$lib/components/game/Grid.svelte';
	import Tray from '$lib/components/game/Tray.svelte';
	import CodeView from '$lib/components/game/CodeView.svelte';
	import InstructionBar from '$lib/components/game/InstructionBar.svelte';
	import StatusPanel from '$lib/components/game/StatusPanel.svelte';
	import WinModal from '$lib/components/game/WinModal.svelte';
	import GoalModal from '$lib/components/game/GoalModal.svelte';
	import FeedbackModal from '$lib/components/game/FeedbackModal.svelte';
	import { getRunControlState } from '$lib/game/run-control';
	import { createFeedbackContext } from '$lib/game/feedback-context.svelte';
	import type { FeedbackContext, FeedbackRouteContext } from '$lib/services/feedback-schema';
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
		BookOpen,
		MessageCircle
	} from 'lucide-svelte';
	import { soundManager } from '$lib/game/sound';
	import { untrack } from 'svelte';
	import { fade } from 'svelte/transition';
	import ThemeToggle from '$lib/components/common/ThemeToggle.svelte';
	import DevConnectionStatus from '$lib/components/common/DevConnectionStatus.svelte';
	import { bookStore } from '$lib/game/book/store.svelte';
	import { THE_FIELD_GUIDE } from '$lib/game/book/content';
	import type { Book } from '$lib/game/book/schema';
	import type { FieldGuideTarget } from '$lib/game/book/relevance';
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
		feedbackRouteContext?: FeedbackRouteContext;
		fieldGuide?: Book;
		relatedFieldGuideTarget?: FieldGuideTarget | null;
	}

	let {
		game,
		architectMode = false,
		onNextLevel,
		hasNextLevel = false,
		onExit,
		headerLeft,
		onTarget,
		feedbackRouteContext = { source: 'shared' },
		fieldGuide = THE_FIELD_GUIDE,
		relatedFieldGuideTarget = null
	}: Props = $props();

	let isRunning = $state(false);
	let isPaused = $state(false);
	let interpreter = $state<StackInterpreter | null>(null);
	let activeFeedbackContext = $state<FeedbackContext | null>(null);
	let runToken = 0;
	const canEdit = $derived(game.status === 'planning' && !isRunning);
	const isStepMode = $derived(game.status === 'running' && isRunning && isPaused);
	const ghostPath = $derived.by(() => {
		if (architectMode || game.status !== 'planning' || isRunning || game.program.length === 0) {
			return null;
		}

		return simulateGhostPath({
			level: game.level,
			program: game.program,
			functions: game.functions
		});
	});
	const ghostPathDetail = $derived.by(() => {
		if (!ghostPath) return null;
		if (ghostPath.outcome === 'won') return 'Ghost Path: reaches the goal';
		if (ghostPath.outcome === 'blocked') return 'Ghost Path: blocked before the goal';
		if (ghostPath.outcome === 'failed') return 'Ghost Path: hits trouble';
		if (ghostPath.outcome === 'capped') return 'Ghost Path: preview stopped early';
		return 'Ghost Path: stops before the goal';
	});
	const playerMode = $derived.by(() => {
		if (game.status === 'story') {
			return { label: 'Story', detail: 'Guide is speaking', tone: 'story' };
		}
		if (game.status === 'goal') {
			return { label: 'Goal', detail: 'Read the mission', tone: 'goal' };
		}
		if (game.status === 'running') {
			if (isStepMode) {
				return { label: 'Step Mode', detail: 'Paused between steps', tone: 'paused' };
			}
			return { label: 'Running', detail: 'Program is moving', tone: 'running' };
		}
		if (game.status === 'won') {
			return { label: 'Won', detail: 'Level complete', tone: 'won' };
		}
		if (game.status === 'lost') {
			return { label: 'Lost', detail: 'Run stopped before the goal', tone: 'lost' };
		}

		return { label: 'Planning', detail: 'Build and edit blocks', tone: 'planning' };
	});

	const runControl = $derived(
		getRunControlState({
			status: game.status,
			hasProgram: game.program.length > 0,
			isExecuting: isRunning,
			isPaused
		})
	);

	function handleNextStory() {
		if (game.activeHintId) {
			game.dismissHint();
		} else {
			game.nextStorySegment();
		}
	}

	function handleStartPlanning() {
		stopInterpreter();
		game.status = 'planning';
		game.reset();
	}

	async function startExecution({ startPaused = true }: { startPaused?: boolean } = {}) {
		game.reset();
		isRunning = true;
		isPaused = startPaused;
		interpreter = new StackInterpreter(game);
		interpreter.start();
	}

	function finishExecution() {
		isRunning = false;
		isPaused = false;
		interpreter = null;
		if (game.status === 'won') {
			soundManager.play('win');
		}
	}

	async function handleStep() {
		if (!isRunning || !interpreter) {
			await startExecution();
		}

		if (interpreter) {
			isPaused = true;
			const continueExecution = interpreter.step();
			if (!continueExecution) {
				finishExecution();
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

	async function runToTerminal() {
		const token = ++runToken;
		isPaused = false;

		try {
			while (isRunning && !isPaused && interpreter && token === runToken) {
				const continueExecution = interpreter.step();
				if (!continueExecution) {
					finishExecution();
					break;
				}
				await new Promise((r) => setTimeout(r, 500));
			}
		} catch (e) {
			console.error(e);
			handleStop();
		}
	}

	async function restartAndRun() {
		if (isRunning || interpreter) {
			stopInterpreter();
		}
		game.checkTrigger('program-run');
		await startExecution({ startPaused: false });
		await runToTerminal();
	}

	async function handleRunControl() {
		soundManager.play('click');
		switch (runControl.action) {
			case 'stop':
				handleStop();
				return;
			case 'resume':
				await runToTerminal();
				return;
			case 'play':
			case 'replay':
			case 'try-again':
				await restartAndRun();
				return;
			case 'none':
				return;
		}
	}

	function stopInterpreter() {
		runToken++;
		isRunning = false;
		isPaused = false;
		interpreter = null;
	}

	function handleStop() {
		stopInterpreter();
		game.status = 'planning';
		game.activeBlockId = null;
	}

	function handleReset() {
		soundManager.play('click');
		handleStop();
		game.reset();
	}

	function handleDismissWinModal() {
		handleReset();
	}

	async function handleReplay() {
		soundManager.play('click');
		await restartAndRun();
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

	function handleOpenFeedback() {
		activeFeedbackContext = createFeedbackContext({
			game,
			route: feedbackRouteContext,
			interpreter,
			url: window.location.href,
			navigatorInfo: navigator,
			viewport: { width: window.innerWidth, height: window.innerHeight }
		});
	}

	function handleOpenFieldGuide() {
		if (relatedFieldGuideTarget) {
			bookStore.openTo(relatedFieldGuideTarget.chapterId, relatedFieldGuideTarget.pageId);
			return;
		}

		bookStore.open();
	}

	$effect(() => {
		untrack(() => bookStore.setBook(fieldGuide));
	});

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

				<button class="btn-icon" onclick={handleOpenFieldGuide} title="Field Guide">
					<BookOpen size={20} />
				</button>

				{#if architectMode}
					<div class="architect-badge" data-testid="builder-test-mode-indicator">BUILDER TEST</div>
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

				<div
					class="player-mode-chip {playerMode.tone}"
					data-testid="player-mode-indicator"
					data-mode={playerMode.tone}
					role="status"
					aria-live="polite"
					aria-label={`Player mode: ${playerMode.label}. ${playerMode.detail}`}
				>
					<span class="mode-dot"></span>
					<span class="mode-copy">
						<span class="mode-kicker">Player</span>
						<span class="mode-line">
							<strong>{playerMode.label}</strong>
							<span class="mode-detail">{playerMode.detail}</span>
						</span>
					</span>
				</div>

				{#if ghostPathDetail}
					<div class="ghost-path-status" data-testid="ghost-path-status" role="status">
						<span class="ghost-path-status-dot"></span>
						{ghostPathDetail}
					</div>
				{/if}
			</div>

			<div class="controls">
				<button
					class="btn-icon"
					onclick={() => game.undo()}
					disabled={!game.canUndo || !canEdit}
					title="Undo"
				>
					<Undo2 size={20} />
				</button>
				<button
					class="btn-icon"
					onclick={() => game.redo()}
					disabled={!game.canRedo || !canEdit}
					title="Redo"
				>
					<Redo2 size={20} />
				</button>
				<div class="separator"></div>
				<button
					class="btn-primary"
					class:stop={runControl.action === 'stop'}
					onclick={handleRunControl}
					disabled={runControl.disabled}
					aria-label={runControl.label}
				>
					{#if runControl.action === 'stop'}
						<Square size={16} fill="currentColor" /> <span class="btn-label">Stop</span>
					{:else if runControl.action === 'replay' || runControl.action === 'try-again'}
						<RotateCcw size={16} /> <span class="btn-label">{runControl.label}</span>
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
				<button
					class="btn-secondary"
					command="show-modal"
					commandfor="code-view-dialog"
					aria-label="Open Code View"
					title="Open Code View"
				>
					<span class="btn-label">Code View</span>
				</button>
				<DevConnectionStatus />
				<button class="btn-icon" onclick={handleOpenFeedback} title="Report Issue">
					<MessageCircle size={20} />
				</button>
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
						<StatusPanel {game} {isStepMode} />
					</div>
				{/if}
			</div>

			<div class="stage-container">
				{#key game.level.id}
					<Grid {game} {ghostPath} />
				{/key}

				{#if game.status === 'won'}
					<WinModal
						onReplay={handleReplay}
						onNext={onNextLevel || (() => {})}
						onDismiss={handleDismissWinModal}
						{hasNextLevel}
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
				<Tray {game} {onTarget} {isStepMode} />
			{/key}
		</div>
	</div>

	<CodeView
		{game}
		controls={{
			runControl,
			onRunControl: handleRunControl,
			onStepBack: handleStepBack,
			onStepForward: handleStep,
			onReset: handleReset,
			canStepBack: isRunning && Boolean(interpreter),
			canStepForward: game.program.length > 0 && !(isRunning && !isPaused),
			canReset: !(isRunning && !isPaused)
		}}
	/>

	{#if activeFeedbackContext}
		<FeedbackModal context={activeFeedbackContext} onClose={() => (activeFeedbackContext = null)} />
	{/if}
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

	.player-mode-chip {
		--mode-color: var(--brand);
		--mode-bg: var(--brand-surface);
		display: inline-grid;
		grid-template-columns: auto minmax(0, auto);
		align-items: center;
		column-gap: 0.75rem;
		min-height: var(--touch-target-min);
		padding: 0.42rem 0.95rem 0.46rem 0.8rem;
		border-radius: var(--radius-pill);
		border: 1px solid color-mix(in srgb, var(--mode-color), transparent 55%);
		background-color: var(--mode-bg);
		color: var(--text-1);
		box-shadow: var(--shadow-1);
		white-space: nowrap;
		line-height: 1;
	}

	.player-mode-chip.story {
		--mode-color: light-dark(var(--violet-6), var(--violet-4));
		--mode-bg: light-dark(var(--violet-0), var(--violet-9));
	}

	.player-mode-chip.goal {
		--mode-color: light-dark(var(--indigo-6), var(--indigo-4));
		--mode-bg: var(--brand-surface);
	}

	.player-mode-chip.planning {
		--mode-color: light-dark(var(--blue-6), var(--blue-4));
		--mode-bg: light-dark(var(--blue-0), var(--blue-9));
	}

	.player-mode-chip.running {
		--mode-color: light-dark(var(--green-6), var(--green-4));
		--mode-bg: light-dark(var(--green-0), var(--green-9));
	}

	.player-mode-chip.paused {
		--mode-color: light-dark(var(--orange-6), var(--orange-4));
		--mode-bg: light-dark(var(--orange-0), var(--orange-9));
	}

	.player-mode-chip.won {
		--mode-color: light-dark(var(--yellow-6), var(--yellow-4));
		--mode-bg: light-dark(var(--yellow-0), var(--yellow-9));
	}

	.player-mode-chip.lost {
		--mode-color: light-dark(var(--red-6), var(--red-4));
		--mode-bg: light-dark(var(--red-0), var(--red-9));
	}

	.mode-dot {
		width: 0.85rem;
		height: 0.85rem;
		border-radius: 999px;
		background-color: var(--mode-color);
		box-shadow: 0 0 0 3px color-mix(in srgb, var(--mode-color), transparent 80%);
		flex-shrink: 0;
	}

	.player-mode-chip.running .mode-dot {
		animation: mode-pulse 1.2s ease-in-out infinite;
	}

	.mode-copy {
		display: grid;
		row-gap: 0.14rem;
		min-width: 0;
	}

	.mode-kicker {
		font-size: var(--font-size-00);
		font-weight: 800;
		letter-spacing: 0.08em;
		line-height: 1;
		text-transform: uppercase;
		color: var(--mode-color);
	}

	.mode-line {
		display: flex;
		align-items: baseline;
		gap: 0.7rem;
		min-width: 0;
	}

	.mode-line strong {
		font-size: var(--font-size-1);
		font-family: var(--font-heading);
		line-height: 1.05;
	}

	.mode-detail {
		font-size: var(--font-size-0);
		color: var(--text-2);
		font-weight: 600;
		line-height: 1.15;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.ghost-path-status {
		display: flex;
		align-items: center;
		gap: var(--size-1);
		min-height: var(--touch-target-min);
		padding: 0 var(--size-2);
		border-radius: var(--radius-pill);
		border: 1px dashed color-mix(in srgb, var(--brand), transparent 45%);
		background: color-mix(in srgb, var(--brand-surface), transparent 15%);
		color: var(--text-2);
		font-size: var(--font-size-0);
		font-weight: 700;
		white-space: nowrap;
	}

	.ghost-path-status-dot {
		width: 0.65rem;
		height: 0.65rem;
		border-radius: 999px;
		background: color-mix(in srgb, var(--brand), white 20%);
		box-shadow: 0 0 0 3px color-mix(in srgb, var(--brand), transparent 80%);
	}

	@keyframes mode-pulse {
		0%,
		100% {
			transform: scale(1);
			opacity: 1;
		}
		50% {
			transform: scale(1.2);
			opacity: 0.75;
		}
	}

	.architect-controls {
		display: flex;
		gap: var(--size-1);
	}

	.workspace {
		display: grid;
		grid-template-columns: 1fr 400px; /* Stage | Tray */
		height: 100%;
		min-height: 0;
		overflow: hidden;
	}

	@media (max-width: 768px) {
		.workspace {
			grid-template-columns: 1fr;
			grid-template-rows: minmax(0, 3fr) minmax(0, 2fr);
		}
	}

	.stage-area {
		display: flex;
		flex-direction: column;
		align-items: center;
		padding: 0;
		background-color: var(--surface-1);
		overflow: hidden;
		min-height: 0;
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
		min-height: 0;
		overflow: visible;
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
		min-height: 0;
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

	@media (max-width: 600px), (max-width: 768px) and (max-height: 700px) {
		.mode-detail,
		.mode-kicker,
		.ghost-path-status {
			display: none;
		}

		.player-mode-chip {
			padding: 0 var(--size-2);
		}

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
			min-height: clamp(72px, 14dvh, 96px);
		}

		.stage-container {
			padding: clamp(var(--size-2), 2vw, var(--size-4));
		}

		.tray-area {
			border-left: none;
			border-top: 1px solid var(--surface-3);
			overflow: hidden;
		}
	}
</style>
