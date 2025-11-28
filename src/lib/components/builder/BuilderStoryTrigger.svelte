<script lang="ts">
	import type { BuilderModel } from '$lib/game/builder-model.svelte';
	import { BookOpen } from 'lucide-svelte';

	interface Props {
		builder: BuilderModel;
	}

	let { builder }: Props = $props();

	function openStory() {
		builder.mode = 'story';
	}
</script>

<div class="story-trigger">
	<div class="content">
		<p class="hint">Add story segments to guide the player.</p>
		<button class="trigger-btn" onclick={openStory}>
			<BookOpen size={16} />
			Edit Story
		</button>
	</div>
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
</style>
