<script lang="ts">
	import type { StorySegment, Character } from '$lib/game/types';
	import { ArrowRight } from 'lucide-svelte';
	import Avatar from './Avatar.svelte';
	import Guide from './Guide.svelte';

	interface Props {
		segment: StorySegment;
		characters?: Character[];
		onNext: () => void;
	}

	let { segment, characters = [], onNext }: Props = $props();

	const emotions: Record<string, string> = {
		happy: '😊',
		neutral: '😐',
		concerned: '😟',
		excited: '🤩',
		thinking: '🤔',
		celebrating: '🥳'
	};

	const hasAdvanceCondition = $derived(segment.advanceCondition !== undefined);

	function getCharacterColor(name: string) {
		const char = characters.find((c) => c.name === name);
		if (char) return char.color;

		// Fallback for default characters if not in list (though they should be)
		if (name === 'Zoey') return 'var(--pink-3)';
		if (name === 'Jonas') return 'var(--blue-3)';
		if (name === 'Guide') return 'var(--teal-3)';
		return 'var(--surface-3)';
	}

	function getCharacterAvatar(name: string) {
		if (segment.avatar) return segment.avatar;

		const char = characters.find((c) => c.name === name);
		if (char) return char.avatar;

		if (name === 'Zoey') return 'Z';
		if (name === 'Jonas') return 'J';
		if (name === 'Guide') return 'Bot';
		return name[0];
	}
</script>

<div class="instruction-bar">
	<div class="instruction-content">
		<div class="character-portrait" data-character={segment.speaker}>
			{#if segment.speaker === 'Guide'}
				<Guide
					emotion={segment.emotion as 'idle' | 'thinking' | 'talking' | 'happy' | 'sad'}
					size={56}
				/>
			{:else}
				<div class="avatar" style:background-color={getCharacterColor(segment.speaker)}>
					<Avatar value={getCharacterAvatar(segment.speaker) || '?'} size={24} />
					{#if segment.emotion}
						<div class="emotion-badge" title={segment.emotion}>
							{emotions[segment.emotion] || ''}
						</div>
					{/if}
				</div>
			{/if}
		</div>
		<div class="content" aria-live="polite">
			<div class="speaker-name">{segment.speaker}</div>
			<p class="text">{segment.text}</p>
			{#if segment.media}
				<div class="media-container">
					{#if segment.media.type === 'image'}
						<img src={segment.media.src} alt={segment.media.alt} />
					{/if}
				</div>
			{/if}
		</div>
		{#if !hasAdvanceCondition}
			<button class="next-btn" onclick={onNext}>
				<span class="btn-label">Next</span>
				<ArrowRight size={16} />
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
		padding: var(--size-2) var(--size-4);
	}

	@media (max-width: 600px) {
		.instruction-bar {
			padding: var(--size-2);
		}
		.instruction-content {
			gap: var(--size-2);
		}
		.btn-label {
			display: none;
		}
		.next-btn {
			padding: 0;
			width: var(--touch-target-min);
			justify-content: center;
		}
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
		align-self: flex-start; /* Align to top if content grows */
		margin-top: var(--size-1);
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
		border: 2px solid light-dark(white, var(--surface-3));
		box-shadow: var(--shadow-2);
		position: relative;
		line-height: 1;
	}

	.content {
		flex: 1;
		display: flex;
		flex-direction: column;
		gap: var(--size-1);
	}

	.media-container {
		margin-top: var(--size-2);
		border-radius: var(--radius-2);
		overflow: hidden;
		border: 1px solid var(--surface-3);
		max-width: 300px;
		background-color: light-dark(white, var(--surface-2));
	}

	.media-container img {
		display: block;
		width: 100%;
		height: auto;
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
		padding: 0 var(--size-4);
		min-height: var(--touch-target-min);
		border-radius: var(--radius-round);
		font-weight: bold;
		cursor: pointer;
		display: flex;
		align-items: center;
		justify-content: center;
		gap: var(--size-2);
		font-size: var(--font-size-1);
		transition: transform 0.1s;
		box-shadow: var(--shadow-2);
		align-self: center; /* Keep centered vertically */
	}

	.next-btn:hover {
		transform: scale(1.05);
		background-color: var(--indigo-5);
	}

	.next-btn:active {
		transform: scale(0.95);
	}

	.avatar:hover {
		transform: scale(1.05);
	}

	.emotion-badge {
		position: absolute;
		bottom: -2px;
		right: -2px;
		width: 20px;
		height: 20px;
		background-color: light-dark(white, var(--surface-3));
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: var(--font-size-1);
		box-shadow: var(--shadow-1);
		border: 1px solid var(--surface-2);
		padding: 0;
		line-height: 1;
	}
</style>
