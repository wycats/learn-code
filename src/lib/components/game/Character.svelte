<script lang="ts">
	import type { Direction } from '$lib/game/types';
	import type { GameModel } from '$lib/game/model.svelte';
	import { Bot, Ship } from 'lucide-svelte';

	interface Props {
		direction: Direction;
		game?: GameModel;
	}

	let { direction, game }: Props = $props();

	const rotation = $derived(
		direction === 'N' ? 0 : direction === 'E' ? 90 : direction === 'S' ? 180 : 270
	);

	const hasBoat = $derived(game?.vehicle?.type === 'boat');

	let isBlocked = $state(false);

	$effect(() => {
		if (game?.lastEvent?.type === 'blocked') {
			isBlocked = true;
			const timer = setTimeout(() => (isBlocked = false), 300);
			return () => clearTimeout(timer);
		}
	});
</script>

<div class="character" class:blocked={isBlocked} style:--rotation="{rotation}deg">
	{#if hasBoat}
		<div class="boat-container">
			<Ship size={48} color="var(--blue-7)" fill="var(--blue-3)" />
		</div>
	{/if}
	<div class="avatar" class:in-boat={hasBoat}>
		<Bot size={32} color="var(--indigo-7)" strokeWidth={2} />
	</div>
</div>

<style>
	.character {
		width: 80%;
		height: 80%;
		display: grid;
		place-items: center;
		transition: transform 0.3s var(--ease-spring-3);
		transform: rotate(var(--rotation));
		z-index: 10;
		position: relative;
	}

	.character.blocked {
		animation: shake 0.3s cubic-bezier(0.36, 0.07, 0.19, 0.97) both;
	}

	.avatar {
		display: grid;
		place-items: center;
		filter: drop-shadow(0 2px 4px rgb(0 0 0 / 0.2));
		transition: transform 0.3s;
		z-index: 2;
	}

	.avatar.in-boat {
		transform: translateY(-4px) scale(0.85);
	}

	.boat-container {
		position: absolute;
		z-index: 1;
		filter: drop-shadow(0 2px 4px rgb(0 0 0 / 0.2));
	}

	@keyframes shake {
		10%,
		90% {
			transform: rotate(var(--rotation)) translate3d(-1px, 0, 0);
		}
		20%,
		80% {
			transform: rotate(var(--rotation)) translate3d(2px, 0, 0);
		}
		30%,
		50%,
		70% {
			transform: rotate(var(--rotation)) translate3d(-4px, 0, 0);
		}
		40%,
		60% {
			transform: rotate(var(--rotation)) translate3d(4px, 0, 0);
		}
	}
</style>
