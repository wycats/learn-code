<script lang="ts">
	import { page } from '$app/stores';
	import { getPack } from '$lib/game/packs';
	import { localPacksStore } from '$lib/game/local-packs.svelte';
	import { CampaignService } from '$lib/game/campaigns';
	import { ProgressService } from '$lib/game/progress';
	import LevelMap from '$lib/components/library/LevelMap.svelte';
	import { goto } from '$app/navigation';
	import { base } from '$app/paths';
	import { ArrowLeft } from 'lucide-svelte';
	import { onMount } from 'svelte';
	import type { LevelPack } from '$lib/game/schema';

	const packId = $derived($page.params.packId ?? '');
	let pack = $state<LevelPack | null>(null);
	let loading = $state(true);
	let progress = $state(ProgressService.load());

	function handleLevelSelect(levelId: string) {
		// eslint-disable-next-line svelte/no-navigation-without-resolve
		goto(`${base}/play/${packId}/${levelId}`);
	}

	function handleBack() {
		// eslint-disable-next-line svelte/no-navigation-without-resolve
		goto(`${base}/library`);
	}

	$effect(() => {
		if (packId) {
			loadPackData();
		}
	});

	async function loadPackData() {
		loading = true;
		// 1. Check System Packs
		let p = getPack(packId);

		// 2. Check Local/P2P Packs
		if (!p) {
			p = localPacksStore.getPack(packId);
		}

		// 3. Check IndexedDB (My Projects)
		if (!p) {
			const local = await CampaignService.get(packId);
			if (local) p = local;
		}

		pack = p ?? null;
		loading = false;
	}

	onMount(() => {
		progress = ProgressService.load();
	});
</script>

{#if loading}
	<div class="loading">Loading...</div>
{:else if pack}
	<div class="pack-detail">
		<header class="detail-header">
			<button class="back-button" onclick={handleBack}>
				<ArrowLeft size={24} />
				<span>Back to Library</span>
			</button>
			<div class="header-content">
				<h1>{pack.name}</h1>
				<p>{pack.description}</p>
			</div>
		</header>

		<main class="detail-content">
			<div class="map-container">
				<LevelMap {pack} progress={progress.packs[pack.id]} onLevelSelect={handleLevelSelect} />
			</div>
		</main>
	</div>
{:else}
	<div class="error">
		<h1>Pack not found</h1>
		<button onclick={handleBack}>Return to Library</button>
	</div>
{/if}

<style>
	.pack-detail {
		min-height: 100vh;
		background-color: var(--surface-1);
		display: flex;
		flex-direction: column;
	}

	.detail-header {
		padding: var(--size-6);
		background-color: var(--surface-2);
		border-bottom: 1px solid var(--surface-3);
	}

	.back-button {
		display: flex;
		align-items: center;
		gap: var(--size-2);
		background: none;
		border: none;
		color: var(--text-2);
		font-weight: 600;
		cursor: pointer;
		margin-bottom: var(--size-4);
		padding: 0;
	}

	.back-button:hover {
		color: var(--brand);
	}

	.header-content h1 {
		font-size: var(--font-size-6);
		font-weight: 900;
		margin: 0 0 var(--size-2);
		color: var(--text-1);
	}

	.header-content p {
		font-size: var(--font-size-3);
		color: var(--text-2);
		margin: 0;
		max-width: 60ch;
	}

	.detail-content {
		flex: 1;
		padding: var(--size-6);
		max-width: 1000px;
		margin: 0 auto;
		width: 100%;
	}

	.map-container {
		background-color: var(--surface-1);
		border: 1px solid var(--surface-3);
		border-radius: var(--radius-3);
		padding: var(--size-4);
	}

	.error {
		display: grid;
		place-items: center;
		height: 100vh;
		gap: var(--size-4);
	}

	.loading {
		display: grid;
		place-items: center;
		height: 100vh;
		font-size: var(--font-size-3);
		color: var(--text-2);
	}
</style>
