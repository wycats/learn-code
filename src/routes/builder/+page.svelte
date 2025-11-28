<script lang="ts">
	import { onMount } from 'svelte';
	import { BuilderModel } from '$lib/game/builder-model.svelte';
	import Grid from '$lib/components/game/Grid.svelte';
	import BuilderTray from '$lib/components/builder/BuilderTray.svelte';
	import BuilderStoryBar from '$lib/components/builder/BuilderStoryBar.svelte';
	import BuilderStoryTrigger from '$lib/components/builder/BuilderStoryTrigger.svelte';
	import BuilderGoalModal from '$lib/components/builder/BuilderGoalModal.svelte';
	import BuilderToolbar from '$lib/components/builder/BuilderToolbar.svelte';
	import InstructionBar from '$lib/components/game/InstructionBar.svelte';
	import Tray from '$lib/components/game/Tray.svelte';
	import { GameModel } from '$lib/game/model.svelte';
	import { LEVELS } from '$lib/game/levels';

	// Initialize with a default empty level
	let builder = $state(new BuilderModel());
	let showSettings = $state(false);

	// We need a GameModel to render the Grid.
	// The BuilderModel will maintain a live GameModel instance that reflects the current edit state.
	let game = $derived(builder.game);
</script>

<div class="builder-interface">
	<BuilderToolbar 
		{builder} 
		{showSettings} 
		onToggleSettings={() => showSettings = !showSettings} 
	/>

	<div class="workspace">
		<div class="stage-area">
			<div class="dashboard-area">
				{#if builder.mode === 'story'}
					<BuilderStoryBar {builder} />
				{:else if builder.mode === 'edit'}
					<BuilderStoryTrigger {builder} />
				{/if}
			</div>

			<div class="grid-container">
				<Grid 
					{game} 
					isBuilder={builder.mode === 'edit'} 
					selectedActor={builder.selectedActor}
					onCellClick={(pos) => builder.handleCellClick(pos)} 
					onRotateStart={() => builder.rotateStartActor()}
					onActorDrop={() => builder.selectActor(null)}
					onActorSelect={(actor) => builder.selectActor(actor)}
				/>
			</div>

			{#if showSettings}
				<div class="settings-overlay">
					<BuilderGoalModal {builder} onClose={() => showSettings = false} />
				</div>
			{/if}
		</div>
		
		<div class="tray-area">
			{#if builder.mode === 'edit' || builder.mode === 'story'}
				<BuilderTray {builder} />
			{:else}
				<Tray {game} />
			{/if}
		</div>
	</div>
</div>

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
</style>
