<script lang="ts">
	import { GameModel } from '$lib/game/model.svelte';
	import { LEVELS } from '$lib/game/levels';
	import Game from '$lib/components/game/Game.svelte';

	let currentLevelIndex = $state(0);
	let game = $state(new GameModel(LEVELS[0]));

	function loadLevel(index: number) {
		if (index >= 0 && index < LEVELS.length) {
			currentLevelIndex = index;
			game = new GameModel(LEVELS[index]);
		}
	}

	function handleNextLevel() {
		loadLevel(currentLevelIndex + 1);
	}
</script>

<div class="page-container">
	<Game {game} onNextLevel={handleNextLevel} hasNextLevel={currentLevelIndex < LEVELS.length - 1}>
		{#snippet headerLeft()}
			<div class="level-info">
				<select
					value={currentLevelIndex}
					onchange={(e) => loadLevel(parseInt(e.currentTarget.value))}
				>
					{#each LEVELS as level, i (level.id)}
						<option value={i}>Level {i + 1}: {level.name}</option>
					{/each}
				</select>
			</div>
		{/snippet}
	</Game>
</div>

<style>
	.page-container {
		height: 100vh;
		width: 100vw;
		overflow: hidden;
	}

	.level-info select {
		font-size: var(--font-size-2);
		font-weight: bold;
		padding: var(--size-2);
		border-radius: var(--radius-2);
		border: 1px solid var(--surface-3);
		background-color: var(--surface-1);
		color: var(--text-1);
	}

	.level-info {
		display: flex;
		align-items: center;
		gap: var(--size-3);
	}
</style>
