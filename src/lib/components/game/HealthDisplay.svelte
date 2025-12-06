<script lang="ts">
	import { Heart } from 'lucide-svelte';

	interface Props {
		lives: number;
		maxLives: number;
	}

	let { lives, maxLives }: Props = $props();
</script>

<div class="health-display">
	<!-- eslint-disable-next-line @typescript-eslint/no-unused-vars -->
	{#each Array(maxLives) as _, i (i)}
		<div class="heart" class:lost={i >= lives}>
			<Heart size={20} fill={i < lives ? 'var(--red-5)' : 'transparent'} />
		</div>
	{/each}
</div>

<style>
	.health-display {
		display: flex;
		gap: var(--size-1);
		align-items: center;
		padding: var(--size-1) var(--size-2);
		background-color: var(--surface-3);
		border-radius: var(--radius-pill);
	}

	.heart {
		color: var(--red-5);
		transition: transform 0.2s var(--ease-elastic-3);
	}

	.heart.lost {
		color: var(--surface-4);
		transform: scale(0.8);
	}
</style>
