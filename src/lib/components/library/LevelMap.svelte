<script lang="ts">
	import type { LevelPack } from '$lib/game/schema';
	import type { PackProgress } from '$lib/game/progress';
	import { Lock, Star } from 'lucide-svelte';

	interface Props {
		pack: LevelPack;
		progress?: PackProgress;
		onLevelSelect: (levelId: string) => void;
	}

	let { pack, progress, onLevelSelect }: Props = $props();

	// Helper to check if a level is unlocked
	function isUnlocked(index: number) {
		if (index === 0) return true; // First level always unlocked
		const prevLevelId = pack.levels[index - 1].id;
		return progress?.levels[prevLevelId]?.completed ?? false;
	}
</script>

<div class="level-map">
	{#each pack.levels as level, i (level.id)}
		{@const unlocked = isUnlocked(i)}
		{@const levelProgress = progress?.levels[level.id]}
		{@const completed = levelProgress?.completed}
		{@const stars = levelProgress?.stars ?? 0}

		<button
			class="level-node"
			class:completed
			class:locked={!unlocked}
			disabled={!unlocked}
			onclick={() => onLevelSelect(level.id)}
		>
			<div class="node-content">
				{#if !unlocked}
					<Lock size={20} />
				{:else if completed}
					<div class="stars">
						{#each [0, 1, 2] as s (s)}
							<Star
								size={12}
								class={s < stars ? 'star-filled' : 'star-empty'}
								fill={s < stars ? 'currentColor' : 'none'}
							/>
						{/each}
					</div>
					<span class="level-number">{i + 1}</span>
				{:else}
					<span class="level-number">{i + 1}</span>
				{/if}

				{#if unlocked}
					<div
						class="difficulty-dot"
						data-difficulty={level.difficulty || 'beginner'}
						title={level.difficulty || 'beginner'}
					></div>
				{/if}
			</div>
			<div class="level-info">
				<span class="level-name">{level.name}</span>
			</div>
		</button>
	{/each}
</div>

<style>
	.level-map {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
		gap: var(--size-4);
		padding: var(--size-4);
	}

	.level-node {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: var(--size-2);
		background: none;
		border: none;
		cursor: pointer;
		transition: transform 0.2s var(--ease-3);
		opacity: 1;
	}

	.level-node:disabled {
		cursor: not-allowed;
		opacity: 0.6;
	}

	.level-node:not(:disabled):hover {
		transform: translateY(-4px);
	}

	.node-content {
		width: 64px;
		height: 64px;
		border-radius: 50%;
		background-color: var(--surface-2);
		border: 2px solid var(--surface-3);
		display: grid;
		place-items: center;
		font-size: var(--font-size-4);
		font-weight: 800;
		color: var(--text-2);
		position: relative;
		transition: all 0.2s var(--ease-3);
	}

	.level-node.completed .node-content {
		background-color: var(--green-1);
		border-color: var(--green-5);
		color: var(--green-7);
	}

	.level-node:not(:disabled):hover .node-content {
		border-color: var(--brand);
		box-shadow: 0 0 0 4px var(--brand-dim);
	}

	.stars {
		position: absolute;
		top: -8px;
		display: flex;
		gap: 2px;
		color: var(--yellow-5);
	}

	:global(.star-filled) {
		color: var(--yellow-5);
	}

	:global(.star-empty) {
		color: var(--surface-4);
	}

	.level-info {
		text-align: center;
	}

	.level-name {
		font-size: var(--font-size-0);
		font-weight: 600;
		color: var(--text-2);
		display: block;
		max-width: 120px;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.difficulty-dot {
		position: absolute;
		bottom: -4px;
		width: 12px;
		height: 12px;
		border-radius: 50%;
		border: 2px solid var(--surface-1);
		box-shadow: var(--shadow-1);
	}

	.difficulty-dot[data-difficulty='beginner'] {
		background-color: var(--green-5);
	}

	.difficulty-dot[data-difficulty='intermediate'] {
		background-color: var(--yellow-5);
	}

	.difficulty-dot[data-difficulty='advanced'] {
		background-color: var(--red-5);
	}
</style>
