<script lang="ts">
	import type { LevelPack } from '$lib/game/schema';
	import type { UserProgress } from '$lib/game/progress';
	import PackCard from './PackCard.svelte';

	interface Props {
		packs: LevelPack[];
		progress: UserProgress;
		onPackSelect: (packId: string) => void;
		onSavePack?: (pack: LevelPack) => void;
		onSharePack?: (pack: LevelPack) => void;
	}

	let { packs, progress, onPackSelect, onSavePack, onSharePack }: Props = $props();
</script>

<div class="campaign-shelf">
	<div class="shelf-header">
		<h2>Packs</h2>
		<p>Master the basics and take on new challenges.</p>
	</div>

	<div class="pack-grid">
		{#each packs as pack (pack.id)}
			<PackCard
				{pack}
				progress={progress.packs[pack.id]}
				onClick={() => onPackSelect(pack.id)}
				onSave={onSavePack ? () => onSavePack(pack) : undefined}
				onShare={onSharePack ? () => onSharePack(pack) : undefined}
			/>
		{/each}
	</div>
</div>

<style>
	.campaign-shelf {
		display: flex;
		flex-direction: column;
		gap: var(--size-6);
	}

	.shelf-header h2 {
		font-size: var(--font-size-5);
		font-weight: 800;
		margin: 0 0 var(--size-2);
		color: var(--text-1);
	}

	.shelf-header p {
		font-size: var(--font-size-2);
		color: var(--text-2);
		margin: 0;
		max-width: 60ch;
	}

	.pack-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
		gap: var(--size-4);
	}

	@media (max-width: 480px) {
		.pack-grid {
			grid-template-columns: 1fr;
			gap: var(--size-3);
		}
	}
</style>
