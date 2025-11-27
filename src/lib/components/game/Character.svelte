<script lang="ts">
	import type { Direction } from '$lib/game/types';

	interface Props {
		direction: Direction;
	}

	let { direction }: Props = $props();

	const rotation = $derived(
		direction === 'N' ? 0 : direction === 'E' ? 90 : direction === 'S' ? 180 : 270
	);
</script>

<div class="character" style:transform="rotate({rotation}deg)">
	<div class="avatar">🤖</div>
</div>

<style>
	.character {
		width: 80%;
		height: 80%;
		display: grid;
		place-items: center;
		transition: transform 0.3s var(--ease-spring-3);
		z-index: 10;
	}

	.avatar {
		font-size: var(--font-size-5);
		filter: drop-shadow(0 2px 4px rgb(0 0 0 / 0.2));
	}
</style>
