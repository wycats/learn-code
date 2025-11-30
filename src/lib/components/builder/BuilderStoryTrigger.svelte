<script lang="ts">
	import type { BuilderModel } from '$lib/game/builder-model.svelte';
	import { BookOpen } from 'lucide-svelte';
	import Avatar from '$lib/components/game/Avatar.svelte';

	interface Props {
		builder: BuilderModel;
	}

	let { builder }: Props = $props();

	// Derived state to check if we have any story segments
	let hasStory = $derived(
		(builder.level.intro?.length || 0) > 0 || (builder.level.outro?.length || 0) > 0
	);

	// Derived state to find the active segment to preview
	let activeSegment = $derived.by(() => {
		if (!hasStory) return null;

		// Try to find by active ID
		if (builder.activeSegmentId) {
			const introSeg = builder.level.intro?.find((s) => s.id === builder.activeSegmentId);
			if (introSeg) return introSeg;
			const outroSeg = builder.level.outro?.find((s) => s.id === builder.activeSegmentId);
			if (outroSeg) return outroSeg;
		}

		// Fallback to first intro, then first outro
		if (builder.level.intro?.length) return builder.level.intro[0];
		if (builder.level.outro?.length) return builder.level.outro[0];

		return null;
	});

	// Helper to get character color/avatar (copied from BuilderStoryBar logic roughly)
	// In a real app we might want to centralize this helper
	function getCharacter(name: string) {
		const defaultCharacters = [
			{ id: 'Zoey', name: 'Zoey', color: 'var(--pink-3)', avatar: 'Z' },
			{ id: 'Jonas', name: 'Jonas', color: 'var(--blue-3)', avatar: 'J' },
			{ id: 'Guide', name: 'Guide', color: 'var(--teal-3)', avatar: 'Bot' },
			{ id: 'System', name: 'System', color: 'var(--surface-3)', avatar: 'S' }
		];

		const chars = builder.level.characters || defaultCharacters;
		return (
			chars.find((c) => c.name === name) ||
			defaultCharacters.find((c) => c.name === name) || {
				color: 'var(--surface-3)',
				avatar: name[0]
			}
		);
	}

	function openStory() {
		builder.mode = 'story';
	}
</script>

<div class="story-trigger">
	{#if hasStory && activeSegment}
		<button class="content preview-mode" onclick={openStory}>
			<div class="mini-avatar" style:background-color={getCharacter(activeSegment.speaker).color}>
				<Avatar value={getCharacter(activeSegment.speaker).avatar || '?'} size={20} />
			</div>
			<div class="text-preview">
				<span class="speaker">{activeSegment.speaker}:</span>
				<span class="text">{activeSegment.text || '(Empty segment)'}</span>
			</div>
			<div class="edit-icon">
				<BookOpen size={16} />
			</div>
		</button>
	{:else}
		<div class="content">
			<p class="hint">Add story segments to guide the player.</p>
			<button class="trigger-btn" onclick={openStory}>
				<BookOpen size={16} />
				Edit Story
			</button>
		</div>
	{/if}
</div>

<style>
	.story-trigger {
		width: 100%;
		height: 100%;
		display: grid;
		place-items: center;
		background-color: var(--surface-1);
		/* border-bottom is handled by parent container */
	}

	.content {
		display: flex;
		align-items: center;
		gap: var(--size-3);
		padding: var(--size-2) var(--size-4);
		background-color: var(--surface-2);
		border-radius: var(--radius-round);
		border: 1px dashed var(--surface-3);
		transition: all 0.2s;
	}

	.content.preview-mode {
		cursor: pointer;
		border-style: solid;
		padding-right: var(--size-3);
		width: auto;
		max-width: 90%;
		border: none; /* Remove border for preview mode to look cleaner */
		background-color: var(--surface-1); /* Blend in more */
	}

	.content.preview-mode:hover {
		background-color: var(--surface-2);
		transform: translateY(-1px);
		box-shadow: var(--shadow-1);
	}

	.hint {
		color: var(--text-2);
		font-size: var(--font-size-1);
		margin: 0;
	}

	.trigger-btn {
		display: flex;
		align-items: center;
		gap: var(--size-2);
		padding: var(--size-1) var(--size-3);
		background-color: var(--blue-6);
		color: white;
		border: none;
		border-radius: var(--radius-round);
		font-weight: bold;
		cursor: pointer;
		font-size: var(--font-size-1);
		transition: background-color 0.2s;
	}

	.trigger-btn:hover {
		background-color: var(--blue-7);
	}

	.mini-avatar {
		width: 32px;
		height: 32px;
		border-radius: 50%;
		display: grid;
		place-items: center;
		border: 2px solid white;
		flex-shrink: 0;
		box-shadow: var(--shadow-1);
	}

	.text-preview {
		display: flex;
		gap: var(--size-2);
		align-items: baseline;
		overflow: hidden;
		white-space: nowrap;
		max-width: 400px;
	}

	.speaker {
		font-weight: bold;
		font-size: var(--font-size-0);
		color: var(--text-1);
		text-transform: uppercase;
	}

	.text {
		color: var(--text-2);
		font-size: var(--font-size-1);
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.edit-icon {
		color: var(--text-3);
		margin-left: var(--size-2);
	}
</style>
