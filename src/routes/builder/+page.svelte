<script lang="ts">
	import { onMount } from 'svelte';
	import { fade } from 'svelte/transition';
	import { BuilderModel } from '$lib/game/builder-model.svelte';
	import Grid from '$lib/components/game/Grid.svelte';
	import BuilderTray from '$lib/components/builder/BuilderTray.svelte';
	import BuilderStoryBar from '$lib/components/builder/BuilderStoryBar.svelte';
	import BuilderGoalModal from '$lib/components/builder/BuilderGoalModal.svelte';
	import BuilderToolbar from '$lib/components/builder/BuilderToolbar.svelte';
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
</script>

{#if builder.mode === 'test'}
	<Game game={builder.game} architectMode={true} onExit={() => builder.setMode('edit')} />
{:else}
	<div class="builder-interface" class:targeting-active={builder.targetingState.isActive}>
		{#if builder.targetingState.isActive}
			<div class="focus-overlay" transition:fade={{ duration: 200 }}></div>
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
					<div class="settings-overlay">
						<BuilderGoalModal {builder} onClose={() => (showSettings = false)} />
					</div>
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

	.settings-overlay {
		position: absolute;
		inset: 0;
		display: grid;
		place-items: center;
		background-color: rgba(0, 0, 0, 0.5);
		z-index: 20;
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
