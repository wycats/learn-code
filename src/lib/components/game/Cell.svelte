<script lang="ts">
	import type { CellType, HeldItem } from '$lib/game/types';
	import type { TileDefinition } from '$lib/game/schema';
	import { AVATAR_ICONS } from '$lib/game/icons';
	import {
		Star,
		BrickWall,
		Trees,
		Waves,
		Snowflake,
		Mountain,
		Leaf,
		Sun,
		Triangle,
		Cloud,
		Key,
		Ship,
		Skull
	} from 'lucide-svelte';
	import type { CrossfadeParams, TransitionConfig } from 'svelte/transition';

	interface Props {
		type: CellType;
		customTile?: TileDefinition;
		item?: HeldItem;
		x?: number;
		y?: number;
		id?: string;
		highlight?:
			| { targets: string[]; type?: 'pulse' | 'arrow' | 'dim' | 'selection'; fading?: boolean }
			| undefined;
		isCharacterHere?: boolean;
		send?: (node: Element, params: CrossfadeParams & { key: unknown }) => () => TransitionConfig;
	}

	let {
		type,
		customTile,
		item,
		x,
		y,
		id,
		highlight,
		isCharacterHere = false,
		send = () => () => ({ duration: 0 })
	}: Props = $props();

	let lastItem = $state(item);
	$effect(() => {
		if (item) lastItem = item;
	});

	const isHighlighted = $derived(
		highlight &&
			((id && highlight.targets?.includes(id)) ||
				(x !== undefined && y !== undefined && highlight.targets?.includes(`cell:${x},${y}`)))
	);
	const isFading = $derived(isHighlighted && highlight?.fading);
</script>

<div
	class="cell"
	data-type={type}
	class:highlighted={isHighlighted}
	class:fading={isFading}
	style:background-color={customTile?.visuals.color}
	style:border-color={customTile?.type === 'wall' ? 'rgba(0,0,0,0.2)' : undefined}
	style:border-width={customTile?.type === 'wall' ? '2px' : undefined}
	style:border-style={customTile?.type === 'wall' ? 'solid' : undefined}
>
	{#if customTile}
		{#if customTile.visuals.decal && customTile.visuals.decal in AVATAR_ICONS}
			{@const Icon = AVATAR_ICONS[customTile.visuals.decal as keyof typeof AVATAR_ICONS]}
			<div class="marker">
				<Icon size={24} color="rgba(0,0,0,0.5)" />
			</div>
		{/if}

		<!-- Property Overlays -->
		{#if customTile.passableBy === 'key'}
			<div class="property-overlay top-right" title="Requires Key">
				<Key size={14} color="var(--amber-7)" fill="var(--amber-3)" />
			</div>
		{:else if customTile.passableBy === 'boat'}
			<div class="property-overlay top-right" title="Requires Boat">
				<Ship size={14} color="var(--blue-7)" fill="var(--blue-3)" />
			</div>
		{/if}

		{#if customTile.onEnter === 'kill'}
			<div class="property-overlay bottom-right" title="Hazard">
				<Skull size={14} color="var(--red-7)" fill="var(--red-3)" />
			</div>
		{:else if customTile.onEnter === 'slide'}
			<div class="property-overlay bottom-right" title="Slippery">
				<Snowflake size={14} color="var(--blue-5)" />
			</div>
		{/if}
	{:else if type === 'goal'}
		<div class="goal-marker">
			<Star size={24} color="var(--yellow-7)" fill="var(--yellow-4)" />
		</div>
	{:else if type === 'wall'}
		<div class="wall-marker">
			<BrickWall size={28} color="var(--stone-6)" />
		</div>
	{:else if type === 'forest'}
		<div class="marker">
			<Trees size={24} color="var(--green-3)" />
		</div>
	{:else if type === 'sand'}
		<div class="marker">
			<Sun size={24} color="var(--orange-4)" />
		</div>
	{:else if type === 'water'}
		<div class="marker">
			<Waves size={24} color="var(--blue-5)" />
		</div>
	{:else if type === 'snow'}
		<div class="marker">
			<Snowflake size={24} color="var(--blue-2)" />
		</div>
	{:else if type === 'dirt'}
		<div class="marker">
			<Mountain size={24} color="var(--orange-7)" />
		</div>
	{:else if type === 'grass'}
		<div class="marker">
			<Leaf size={20} color="var(--green-4)" style="opacity: 0.5" />
		</div>
	{:else if type === 'spikes'}
		<div class="marker">
			<Triangle size={24} color="var(--red-7)" fill="var(--red-7)" />
		</div>
	{:else if type === 'cover'}
		<div class="cover-marker">
			<Cloud size={32} color="rgba(255,255,255,0.4)" />
		</div>
	{/if}

	{#if item}
		<div
			class="item-marker"
			class:docked={isCharacterHere}
			out:send={{ key: `item-${lastItem?.type}-${lastItem?.value}` }}
		>
			{#if lastItem?.type === 'key'}
				<Key size={24} color="var(--amber-7)" fill="var(--amber-3)" />
			{:else if lastItem?.type === 'boat'}
				<Ship size={24} color="var(--blue-7)" fill="var(--blue-3)" />
			{:else if lastItem?.type === 'number'}
				<span class="number-item">{lastItem.value}</span>
			{:else if lastItem?.type === 'color'}
				<div class="color-item" style:background-color={lastItem.value}></div>
			{:else if lastItem?.icon && lastItem.icon.toLowerCase() in AVATAR_ICONS}
				{@const Icon = AVATAR_ICONS[lastItem.icon.toLowerCase() as keyof typeof AVATAR_ICONS]}
				<Icon size={24} color="var(--text-1)" />
			{/if}
		</div>
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

	.cell[data-type='forest'] {
		background-color: var(--green-8);
	}

	.cell[data-type='sand'] {
		background-color: var(--yellow-2);
	}

	.cell[data-type='snow'] {
		background-color: var(--gray-1);
	}

	.cell[data-type='dirt'] {
		background-color: var(--orange-3);
	}

	.cell[data-type='water'] {
		background-color: var(--blue-3);
	}

	.cell[data-type='spikes'] {
		background-color: var(--red-2);
	}

	.cell[data-type='cover'] {
		background: light-dark(
			linear-gradient(135deg, rgba(255, 255, 255, 0.2) 0%, rgba(255, 255, 255, 0.05) 100%),
			linear-gradient(135deg, rgba(0, 0, 0, 0.2) 0%, rgba(0, 0, 0, 0.05) 100%)
		);
		backdrop-filter: blur(8px);
		-webkit-backdrop-filter: blur(8px);
		border: 1px solid light-dark(rgba(255, 255, 255, 0.3), rgba(255, 255, 255, 0.05));
		box-shadow:
			0 4px 6px rgba(0, 0, 0, 0.05),
			inset 0 0 20px light-dark(rgba(255, 255, 255, 0.2), rgba(255, 255, 255, 0.02));
	}

	.cell[data-type='wall'] {
		background-color: var(--stone-3);
		border: 2px solid var(--stone-4);
		box-shadow: var(--shadow-2);
	}

	.cell[data-type='goal'] {
		background-color: var(--yellow-2);
		border: 2px solid var(--yellow-5);
	}

	.goal-marker,
	.marker,
	.item-marker {
		display: grid;
		place-items: center;
	}

	.item-marker {
		position: absolute;
		z-index: 5;
		filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.2));
		transition: all 0.3s var(--ease-spring-3);
	}

	.item-marker.docked {
		top: 4px;
		right: 4px;
		transform: scale(0.7);
		z-index: 20;
	}

	.property-overlay {
		position: absolute;
		z-index: 4;
		background-color: rgba(255, 255, 255, 0.8);
		border-radius: 50%;
		padding: 2px;
		box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
		display: grid;
		place-items: center;
	}

	.property-overlay.top-right {
		top: 2px;
		right: 2px;
	}

	.property-overlay.bottom-right {
		bottom: 2px;
		right: 2px;
	}

	.number-item {
		font-family: var(--font-mono);
		font-weight: bold;
		font-size: var(--font-size-3);
		color: var(--text-1);
		background: var(--surface-1);
		padding: 2px 6px;
		border-radius: var(--radius-2);
		border: 1px solid var(--surface-4);
	}

	.color-item {
		width: 20px;
		height: 20px;
		border-radius: 50%;
		border: 2px solid white;
		box-shadow: var(--shadow-1);
	}

	.cell.highlighted {
		outline: 3px solid var(--brand);
		box-shadow: 0 0 10px var(--brand-dim);
		z-index: 10;
	}

	.cell.highlighted.fading {
		animation: none;
		outline-color: transparent;
		box-shadow: none;
		transition:
			outline-color 2s ease-out,
			box-shadow 2s ease-out;
	}
</style>
