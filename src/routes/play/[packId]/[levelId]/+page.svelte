<script lang="ts">
	import { page } from '$app/stores';
	import { getPack } from '$lib/game/packs';
	import { ProgressService } from '$lib/game/progress';
	import { GameModel } from '$lib/game/model.svelte';
	import type { Character, Emotion } from '$lib/game/types';
	import Game from '$lib/components/game/Game.svelte';
	import { goto } from '$app/navigation';
	import { base } from '$app/paths';
	import { ArrowLeft } from 'lucide-svelte';

	const packId = $derived($page.params.packId ?? '');
	const levelId = $derived($page.params.levelId ?? '');
	const pack = $derived(getPack(packId));

	let game = $state<GameModel | null>(null);
	let hasNextLevel = $state(false);
	let nextLevelId = $state<string | null>(null);

	// Load level when params change
	$effect(() => {
		if (pack && levelId) {
			const levelIndex = pack.levels.findIndex((l) => l.id === levelId);
			if (levelIndex !== -1) {
				// Clone level to avoid mutating the source
				const level = structuredClone(pack.levels[levelIndex]);

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
		// eslint-disable-next-line svelte/no-navigation-without-resolve
		goto(`${base}/library/${packId}`);
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
