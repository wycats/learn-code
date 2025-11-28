<script lang="ts">
	import type { StorySegment } from '$lib/game/types';
	import { fly } from 'svelte/transition';
	import { ArrowRight } from 'lucide-svelte';

	interface Props {
		segment: StorySegment;
		onNext: () => void;
	}

	let { segment, onNext }: Props = $props();

	const emotions = {
		happy: '😊',
		neutral: '😐',
		concerned: '😟',
		excited: '🤩'
	};

	const hasAdvanceCondition = $derived(segment.advanceCondition !== undefined);
</script>

<div class="instruction-bar" transition:fly={{ y: -20, duration: 300 }}>
	<div class="instruction-content">
		<div class="character-portrait" data-character={segment.speaker}>
			<div class="avatar">
				{segment.speaker[0]}
				{#if segment.emotion}
					<div class="emotion-badge" title={segment.emotion}>
						{emotions[segment.emotion] || ''}
					</div>
				{/if}
			</div>
		</div>
		<div class="content">
			<div class="speaker-name">{segment.speaker}</div>
			<p class="text">{segment.text}</p>
		</div>
		{#if !hasAdvanceCondition}
			<button class="next-btn" onclick={onNext}>
				Next <ArrowRight size={16} />
			</button>
		{/if}
	</div>
</div>

<style>
	.instruction-bar {
		width: 100%;
		height: 100%;
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 0 var(--size-4);
	}

	.instruction-content {
		display: flex;
		align-items: center;
		gap: var(--size-4);
		width: 100%;
		max-width: 800px;
	}

	.character-portrait {
		flex-shrink: 0;
	}

	.avatar {
		width: 48px;
		height: 48px;
		border-radius: var(--radius-round);
		background-color: var(--surface-3);
		display: grid;
		place-items: center;
		font-size: var(--font-size-3);
		font-weight: bold;
		color: var(--text-2);
		border: 2px solid white;
		box-shadow: var(--shadow-2);
		position: relative;
	}

	.emotion-badge {
		position: absolute;
		bottom: -2px;
		right: -2px;
		width: 20px;
		height: 20px;
		background-color: white;
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: var(--font-size-1);
		box-shadow: var(--shadow-1);
		border: 1px solid var(--surface-2);
	}

	.character-portrait[data-character='Zoey'] .avatar {
		background-color: var(--pink-3);
		color: var(--pink-9);
	}

	.character-portrait[data-character='Jonas'] .avatar {
		background-color: var(--blue-3);
		color: var(--blue-9);
	}

	.content {
		flex: 1;
		display: flex;
		flex-direction: column;
		gap: var(--size-1);
	}

	.speaker-name {
		font-weight: bold;
		text-transform: uppercase;
		font-size: var(--font-size-00);
		color: var(--text-2);
		letter-spacing: var(--font-letterspacing-1);
	}

	.text {
		font-size: var(--font-size-2);
		line-height: var(--font-lineheight-2);
		color: var(--text-1);
		margin: 0;
	}

	.next-btn {
		background-color: var(--brand);
		color: white;
		border: none;
		padding: var(--size-2) var(--size-4);
		border-radius: var(--radius-round);
		font-weight: bold;
		cursor: pointer;
		display: flex;
		align-items: center;
		gap: var(--size-2);
		font-size: var(--font-size-1);
		transition: transform 0.1s;
		box-shadow: var(--shadow-2);
	}

	.next-btn:hover {
		transform: scale(1.05);
		background-color: var(--indigo-5);
	}

	.next-btn:active {
		transform: scale(0.95);
	}
</style>
