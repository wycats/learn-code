<script lang="ts">
	import { page } from '$app/stores';
	import { getPack } from '$lib/game/packs';
	import { localPacksStore } from '$lib/game/local-packs.svelte';
	import { CampaignService } from '$lib/game/campaigns';
	import { ProgressService } from '$lib/game/progress';
	import { CloudSyncService } from '$lib/services/cloud-sync';
	import { GameModel } from '$lib/game/model.svelte';
	import type { Character, Emotion, LevelPack, LevelDefinition } from '$lib/game/types';
	import Game from '$lib/components/game/Game.svelte';
	import { goto } from '$app/navigation';
	import { base } from '$app/paths';
	import { ArrowLeft } from 'lucide-svelte';
	import type { PageData } from './$types';

	let { data } = $props<{ data: PageData }>();

	const packId = $derived($page.params.packId ?? '');
	const levelId = $derived($page.params.levelId ?? '');

	let pack = $state<LevelPack | null>(null);
	let game = $state<GameModel | null>(null);
	let hasNextLevel = $state(false);
	let nextLevelId = $state<string | null>(null);

	// Load pack
	$effect(() => {
		if (packId) {
			loadPack();
		}
	});

	async function loadPack() {
		// 1. Check System Packs
		let p = getPack(packId);

		// 2. Check Local/P2P Packs
		if (!p) {
			p = localPacksStore.getPack(packId);
		}

		// 3. Check IndexedDB (My Projects)
		if (!p) {
			const local = await CampaignService.get(packId);
			if (local) {
				p = local as LevelPack;
			}
		}

		pack = p ?? null;
	}

	// Load level when pack and levelId are ready
	$effect(() => {
		if (pack && levelId) {
			const levelIndex = pack.levels.findIndex((l) => l.id === levelId);
			if (levelIndex !== -1) {
				// Clone level to avoid mutating the source
				// Use $state.snapshot to unwrap proxy before cloning
				const level = structuredClone($state.snapshot(pack.levels[levelIndex])) as LevelDefinition;

				// Check if unlocked
				const progress = ProgressService.load();
				const isUnlocked = ProgressService.isLevelUnlocked(progress, packId, levelIndex);

				if (!isUnlocked) {
					// Redirect to pack view if locked
					// eslint-disable-next-line svelte/no-navigation-without-resolve
					goto(`${base}/library/${packId}`);
					return;
				}

				// Merge pack characters (Level overrides Pack by ID)
				const charMap: Record<string, Character> = {};
				(pack.characters || []).forEach((c) => (charMap[c.id] = c));
				(level.characters || []).forEach((c) => (charMap[c.id] = c));
				level.characters = Object.values(charMap);

				// Merge pack emotions (Level overrides Pack by ID)
				const emoMap: Record<string, Emotion> = {};
				(pack.emotions || []).forEach((e) => (emoMap[e.id] = e));
				(level.emotions || []).forEach((e) => (emoMap[e.id] = e));
				level.emotions = Object.values(emoMap);

				game = new GameModel(level);

				// Determine next level
				if (levelIndex < pack.levels.length - 1) {
					hasNextLevel = true;
					nextLevelId = pack.levels[levelIndex + 1].id;
				} else {
					hasNextLevel = false;
					nextLevelId = null;
				}
			}
		}
	});

	// Watch for win state to save progress
	$effect(() => {
		if (game && game.status === 'won') {
			const stars = calculateStars();
			ProgressService.completeLevel(packId, levelId, stars);
			if (data.user) {
				CloudSyncService.push([
					{
						levelId,
						status: 'completed',
						stars,
						updatedAt: new Date().toISOString()
					}
				]);
			}
		}
	});

	function calculateStars(): number {
		// Simple star logic for now: 3 stars for completion
		// Future: based on par/efficiency
		return 3;
	}

	function handleNextLevel() {
		if (nextLevelId) {
			// eslint-disable-next-line svelte/no-navigation-without-resolve
			goto(`${base}/play/${packId}/${nextLevelId}`);
		} else {
			// Pack completed!
			// eslint-disable-next-line svelte/no-navigation-without-resolve
			goto(`${base}/library/${packId}`);
		}
	}

	function handleExit() {
		// Force a full reload to ensure clean state
		window.location.href = `${base}/library/${packId}`;
	}
</script>

{#if game}
	<div class="play-container">
		<Game {game} {hasNextLevel} onNextLevel={handleNextLevel}>
			{#snippet headerLeft()}
				<button class="back-button" onclick={handleExit} title="Back to Pack">
					<ArrowLeft size={20} />
					<span class="pack-name">{pack?.name}</span>
				</button>
			{/snippet}
		</Game>
	</div>
{:else}
	<div class="loading">Loading...</div>
{/if}

<style>
	.play-container {
		height: 100vh;
		width: 100vw;
		overflow: hidden;
	}

	.back-button {
		display: flex;
		align-items: center;
		gap: var(--size-2);
		background: none;
		border: none;
		color: var(--text-1);
		font-weight: 600;
		cursor: pointer;
		padding: var(--size-1) var(--size-2);
		border-radius: var(--radius-2);
	}

	.back-button:hover {
		background-color: var(--surface-3);
	}

	.pack-name {
		font-size: var(--font-size-1);
	}

	.loading {
		display: grid;
		place-items: center;
		height: 100vh;
		font-size: var(--font-size-4);
		color: var(--text-2);
	}
</style>
