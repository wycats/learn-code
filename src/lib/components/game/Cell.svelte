<script lang="ts">
	import type { CellType } from '$lib/game/types';

	interface Props {
		type: CellType;
	}

	let { type }: Props = $props();
</script>

<div class="cell" data-type={type}>
	{#if type === 'goal'}
		<div class="goal-marker">★</div>
	{/if}
</div>

<style>
	.cell {
		width: 100%;
		height: 100%;
		border-radius: var(--radius-2);
		background-color: var(--surface-2);
		display: grid;
		place-items: center;
		position: relative;
		transition: background-color 0.2s var(--ease-3);
	}

	.cell[data-type='grass'] {
		background-color: var(--green-2);
	}

	.cell[data-type='water'] {
		background-color: var(--blue-3);
	}

	.cell[data-type='wall'] {
		background-color: var(--stone-4);
		box-shadow: var(--shadow-2);
	}

	.cell[data-type='goal'] {
		background-color: var(--yellow-2);
		border: 2px solid var(--yellow-5);
	}

	.goal-marker {
		font-size: var(--font-size-4);
		color: var(--yellow-7);
	}
</style>
