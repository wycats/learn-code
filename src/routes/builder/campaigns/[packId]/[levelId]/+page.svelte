<script lang="ts">
	import { onMount } from 'svelte';
	import { page } from '$app/stores';
	import { BuilderModel } from '$lib/game/builder-model.svelte';
	import { CampaignService } from '$lib/game/campaigns';
	import Grid from '$lib/components/game/Grid.svelte';
	import BuilderTray from '$lib/components/builder/BuilderTray.svelte';
	import BuilderStoryBar from '$lib/components/builder/BuilderStoryBar.svelte';
	import BuilderStoryTrigger from '$lib/components/builder/BuilderStoryTrigger.svelte';
	import BuilderGoalModal from '$lib/components/builder/BuilderGoalModal.svelte';
	import BuilderToolbar from '$lib/components/builder/BuilderToolbar.svelte';
	import Game from '$lib/components/game/Game.svelte';
	import { goto } from '$app/navigation';

	let builder = $state(new BuilderModel());
	let showSettings = $state(false);
	let loading = $state(true);
	let error = $state<string | null>(null);

	const packId = $derived($page.params.packId ?? '');
	const levelId = $derived($page.params.levelId ?? '');
	const mode = $derived($page.url.searchParams.get('mode'));

	onMount(async () => {
		try {
			const pack = await CampaignService.get(packId);
			if (pack) {
				builder.pack = pack;
				builder.activeLevelId = levelId;
				builder.syncGame();
				builder.restoreActiveSegment();
				
				if (mode === 'test') {
					builder.setMode('test');
				}
			} else {
				error = 'Campaign not found';
			}
		} catch (e) {
			console.error(e);
			error = 'Failed to load campaign';
		} finally {
			loading = false;
		}
	});

	let game = $derived(builder.game);
	
	function handleExit() {
		if (builder.mode === 'test' && mode === 'test') {
			// If we started in test mode (Play Level), go back to editor
			goto(`/builder/campaigns/${packId}`);
		} else if (builder.mode === 'test') {
			builder.setMode('edit');
		} else {
			// Exit builder
			goto(`/builder/campaigns/${packId}`);
		}
	}
</script>

{#if loading}
	<div class="loading">Loading...</div>
{:else if error}
	<div class="error">{error}</div>
{:else}
	{#if builder.mode === 'test'}
		<Game game={builder.game} architectMode={true} onExit={handleExit} />
	{:else}
		<div class="builder-interface">
			<BuilderToolbar
				{builder}
				{showSettings}
				onToggleSettings={() => (showSettings = !showSettings)}
				onExit={handleExit} 
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
	
	.loading, .error {
		display: grid;
		place-items: center;
		height: 100vh;
		font-size: var(--font-size-3);
		color: var(--text-2);
	}
</style>
