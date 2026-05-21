<script lang="ts">
	import { onMount } from 'svelte';
	import { fade } from 'svelte/transition';
	import { BuilderModel } from '$lib/game/builder-model.svelte';
	import Grid from '$lib/components/game/Grid.svelte';
	import BuilderTray from '$lib/components/builder/BuilderTray.svelte';
	import BuilderStoryBar from '$lib/components/builder/BuilderStoryBar.svelte';
	import BuilderGoalModal from '$lib/components/builder/BuilderGoalModal.svelte';
	import BuilderToolbar from '$lib/components/builder/BuilderToolbar.svelte';
	import { mergeFieldGuide } from '$lib/game/book/merge';
	import { findRelatedFieldGuideTarget } from '$lib/game/book/relevance';
	import Game from '$lib/components/game/Game.svelte';

	// Initialize with a default empty level
	let builder = $state(new BuilderModel());
	let showSettings = $state(false);

	onMount(() => {
		builder.init();
	});

	// We need a GameModel to render the Grid.
	// The BuilderModel will maintain a live GameModel instance that reflects the current edit state.
	let game = $derived(builder.game);
	const fieldGuide = $derived(mergeFieldGuide(builder.pack.guide));
	const relatedFieldGuideTarget = $derived(
		findRelatedFieldGuideTarget({ book: fieldGuide, level: builder.game.level, pack: builder.pack })
	);
</script>

{#if builder.mode === 'test'}
	<Game
		game={builder.game}
		{fieldGuide}
		{relatedFieldGuideTarget}
		architectMode={true}
		onExit={() => builder.setMode('edit')}
		onTarget={(target) => {
			if (builder.targetingState.isActive) {
				builder.targetingState.onToggle(target);
			}
		}}
	/>
{:else}
	<div class="builder-interface" class:targeting-active={builder.targetingState.isActive}>
		{#if builder.targetingState.isActive}
			<div class="focus-overlay" transition:fade={{ duration: 200 }}></div>
		{/if}

		{#if showSettings}
			<div class="settings-mode-banner" data-testid="builder-settings-mode-indicator">
				<strong>Settings Open</strong>
				<span>Editing {builder.level.name}</span>
			</div>
		{/if}

		<BuilderToolbar
			{builder}
			{showSettings}
			onToggleSettings={() => (showSettings = !showSettings)}
		/>

		<div class="workspace">
			<div class="stage-area">
				<div class="dashboard-area">
					<BuilderStoryBar {builder} />
				</div>

				<div class="grid-container">
					<Grid
						{game}
						isBuilder={true}
						selectedActor={builder.selectedActor}
						onCellClick={(pos) => builder.handleCellClick(pos)}
						onRotateStart={() => builder.rotateStartActor()}
						onActorDrop={() => builder.selectActor(null)}
						onActorSelect={(actor) => builder.selectActor(actor)}
					/>
				</div>

				{#if showSettings}
					<BuilderGoalModal {builder} onClose={() => (showSettings = false)} />
				{/if}
			</div>

			<div class="tray-area">
				<BuilderTray {builder} />
			</div>
		</div>
	</div>
{/if}

<style>
	.builder-interface {
		display: grid;
		grid-template-rows: auto 1fr;
		height: 100vh;
		overflow: hidden;
		position: relative;
	}

	.settings-mode-banner {
		position: fixed;
		top: calc(var(--size-2) + var(--touch-target-min));
		left: 50%;
		transform: translateX(-50%);
		display: flex;
		align-items: center;
		gap: var(--size-2);
		z-index: 35;
		padding: var(--size-2) var(--size-4);
		border-radius: var(--radius-pill);
		border: 1px solid light-dark(var(--orange-2), var(--orange-7));
		background-color: light-dark(var(--orange-0), var(--orange-9));
		color: var(--text-1);
		box-shadow: var(--shadow-3);
		pointer-events: none;
	}

	.settings-mode-banner strong {
		font-family: var(--font-heading);
		font-size: var(--font-size-1);
	}

	.settings-mode-banner span {
		font-size: var(--font-size-0);
		font-weight: 700;
		color: var(--text-2);
	}

	.workspace {
		display: grid;
		grid-template-columns: 1fr 400px;
		height: 100%;
		overflow: hidden;
	}

	@media (max-width: 768px) {
		.workspace {
			grid-template-columns: 1fr;
			grid-template-rows: 1.5fr 1fr;
		}
	}

	.stage-area {
		display: grid;
		grid-template-rows: auto 1fr;
		background-color: var(--surface-1);
		overflow: hidden;
		position: relative;
	}

	.dashboard-area {
		width: 100%;
		min-height: 100px;
		background-color: var(--surface-1);
		border-bottom: 1px solid var(--surface-3);
		display: grid;
		place-items: center;
		z-index: 10;
		grid-template-columns: 1fr;
		grid-template-rows: 1fr;
		grid-template-areas: 'layer';
	}

	.grid-container {
		display: grid;
		place-items: center;
		overflow: auto;
		padding: var(--size-4);
	}

	.tray-area {
		background-color: var(--surface-2);
		border-left: 1px solid var(--surface-3);
		height: 100%;
		overflow: hidden;
	}

	.focus-overlay {
		position: fixed;
		inset: 0;
		background-color: rgba(0, 0, 0, 0.6);
		z-index: 90;
		pointer-events: auto;
	}

	/* Elevate interactive elements during targeting */
	:global(.targeting-active) .dashboard-area {
		z-index: 110;
		position: relative;
	}

	:global(.targeting-active) .grid-container {
		z-index: 100;
		position: relative;
	}

	:global(.targeting-active) .tray-area {
		z-index: 100;
		position: relative;
	}
</style>
