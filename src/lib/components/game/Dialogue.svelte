<script lang="ts">
	import type { StorySegment } from '$lib/game/types';
	import { fade, fly } from 'svelte/transition';
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
</script>

<div class="dialogue-overlay" transition:fade={{ duration: 200 }}>
	<div class="dialogue-box" transition:fly={{ y: 50, duration: 300 }}>
		<div class="character-portrait" data-character={segment.speaker}>
			<!-- Placeholder for character art -->
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
			<button class="next-btn" onclick={onNext}>Next <ArrowRight size={16} /></button>
		</div>
	</div>
</div>

<style>
	.dialogue-overlay {
		position: absolute;
		inset: 0;
		background-color: rgba(0, 0, 0, 0.4);
		display: flex;
		align-items: flex-end;
		justify-content: center;
		padding: var(--size-5);
		z-index: 100;
	}

	.dialogue-box {
		background-color: var(--surface-1);
		border-radius: var(--radius-3);
		box-shadow: var(--shadow-5);
		width: 100%;
		max-width: 600px;
		display: flex;
		gap: var(--size-4);
		padding: var(--size-4);
		border: 2px solid var(--surface-3);
	}

	.character-portrait {
		flex-shrink: 0;
	}

	.avatar {
		width: 80px;
		height: 80px;
		border-radius: var(--radius-round);
		background-color: var(--surface-3);
		display: grid;
		place-items: center;
		font-size: var(--font-size-5);
		font-weight: bold;
		color: var(--text-2);
		border: 3px solid white;
		box-shadow: var(--shadow-2);
		position: relative;
	}

	.emotion-badge {
		position: absolute;
		bottom: -5px;
		right: -5px;
		width: 32px;
		height: 32px;
		background-color: white;
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: var(--font-size-3);
		box-shadow: var(--shadow-2);
		border: 2px solid var(--surface-2);
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
		gap: var(--size-2);
	}

	.speaker-name {
		font-weight: bold;
		text-transform: uppercase;
		font-size: var(--font-size-0);
		color: var(--text-2);
		letter-spacing: var(--font-letterspacing-1);
	}

	.text {
		font-size: var(--font-size-2);
		line-height: var(--font-lineheight-3);
		color: var(--text-1);
		margin: 0;
	}

	.next-btn {
		align-self: flex-end;
		background-color: var(--brand);
		color: white;
		border: none;
		padding: var(--size-1) var(--size-3);
		border-radius: var(--radius-round);
		font-weight: bold;
		cursor: pointer;
		margin-top: var(--size-2);
		display: flex;
		align-items: center;
		gap: var(--size-2);
	}

	.next-btn:hover {
		transform: scale(1.05);
	}
</style>
