<script lang="ts">
	import { page } from '$app/stores';
	import { CampaignService } from '$lib/game/campaigns';
	import type { LevelPack, LevelDefinition } from '$lib/game/schema';
	import PackMetadataEditor from '$lib/components/builder/campaign/PackMetadataEditor.svelte';
	import LevelOrganizer from '$lib/components/builder/campaign/LevelOrganizer.svelte';
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';
	import { ArrowLeft } from 'lucide-svelte';

	let pack = $state<LevelPack | null>(null);
	let loading = $state(true);
	let error = $state<string | null>(null);

	const packId = $derived($page.params.packId ?? '');

	onMount(async () => {
		await loadPack();
	});

	async function loadPack() {
		loading = true;
		error = null;
		try {
			pack = await CampaignService.get(packId);
			if (!pack) {
				error = 'Campaign not found';
			}
		} catch (e) {
			console.error(e);
			error = 'Failed to load campaign';
		} finally {
			loading = false;
		}
	}

	async function handleMetadataChange(data: Partial<LevelPack>) {
		if (!pack) return;
		pack = await CampaignService.update(pack.id, data);
	}

	async function handleLevelsUpdate(levels: LevelDefinition[]) {
		if (!pack) return;
		pack = await CampaignService.update(pack.id, { levels });
	}

	function handleEditLevel(levelId: string) {
		goto(`/builder/campaigns/${packId}/${levelId}`);
	}

	function handlePlayLevel(levelId: string) {
		goto(`/builder/campaigns/${packId}/${levelId}?mode=test`);
	}
</script>

<div class="editor-container">
	<header class="editor-header">
		<div class="header-content">
			<button class="back-btn" onclick={() => goto('/builder/campaigns')}>
				<ArrowLeft size={20} /> Back to Library
			</button>
			<h1>Campaign Editor</h1>
		</div>
	</header>

	<main class="editor-content">
		{#if loading}
			<div class="loading">Loading...</div>
		{:else if error}
			<div class="error">{error}</div>
		{:else if pack}
			<div class="editor-grid">
				<div class="left-col">
					<PackMetadataEditor {pack} onChange={handleMetadataChange} />
				</div>
				<div class="right-col">
					<LevelOrganizer 
						levels={pack.levels} 
						onUpdate={handleLevelsUpdate}
						onEditLevel={handleEditLevel}
						onPlayLevel={handlePlayLevel}
					/>
				</div>
			</div>
		{/if}
	</main>
</div>

<style>
	.editor-container {
		min-height: 100vh;
		background-color: var(--surface-1);
		display: flex;
		flex-direction: column;
	}

	.editor-header {
		padding: var(--size-4) var(--size-6);
		border-bottom: 1px solid var(--surface-2);
		background-color: var(--surface-1);
	}

	.header-content {
		max-width: 1200px;
		margin: 0 auto;
		display: flex;
		align-items: center;
		gap: var(--size-4);
	}

	h1 {
		font-size: var(--font-size-3);
		font-weight: 800;
		margin: 0;
		color: var(--text-1);
	}

	.back-btn {
		background: none;
		border: none;
		color: var(--text-2);
		cursor: pointer;
		display: flex;
		align-items: center;
		gap: var(--size-2);
		font-weight: 600;
		padding: var(--size-2);
		border-radius: var(--radius-2);
	}

	.back-btn:hover {
		background-color: var(--surface-2);
		color: var(--text-1);
	}

	.editor-content {
		flex: 1;
		padding: var(--size-6);
		max-width: 1200px;
		margin: 0 auto;
		width: 100%;
	}

	.editor-grid {
		display: grid;
		grid-template-columns: 1fr 2fr;
		gap: var(--size-6);
		align-items: start;
	}

	@media (max-width: 800px) {
		.editor-grid {
			grid-template-columns: 1fr;
		}
	}

	.loading, .error {
		text-align: center;
		padding: var(--size-8);
		color: var(--text-2);
		font-size: var(--font-size-2);
	}

	.error {
		color: var(--red-7);
	}
</style>
