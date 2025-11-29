<script lang="ts">
	import type { BuilderModel } from '$lib/game/builder-model.svelte';
	import type { StorySegment } from '$lib/game/types';
	import {
		ArrowRight,
		Trash2,
		Plus,
		ChevronLeft,
		ChevronRight,
		List,
		X,
		Edit,
		Settings2
	} from 'lucide-svelte';
	import { fly, fade } from 'svelte/transition';
	import StoryConfigModal from './StoryConfigModal.svelte';
	import Avatar from '$lib/components/game/Avatar.svelte';

	interface Props {
		builder: BuilderModel;
	}

	let { builder }: Props = $props();
	let isExpanded = $state(false);
	let isConfigOpen = $state(false);
	let configTab = $state<'characters' | 'emotions'>('characters');
	let dialog: HTMLDialogElement;
	let charPopover = $state<HTMLElement>();
	let emotionPopover = $state<HTMLElement>();

	const defaultCharacters = [
		{ id: 'Zoey', name: 'Zoey', color: 'var(--pink-3)', avatar: 'Z' },
		{ id: 'Jonas', name: 'Jonas', color: 'var(--blue-3)', avatar: 'J' },
		{ id: 'Guide', name: 'Guide', color: 'var(--teal-3)', avatar: 'Bot' },
		{ id: 'System', name: 'System', color: 'var(--surface-3)', avatar: 'S' }
	];

	const defaultEmotions = [
		{ id: 'neutral', name: 'Neutral', icon: '😐' },
		{ id: 'happy', name: 'Happy', icon: '😊' },
		{ id: 'concerned', name: 'Concerned', icon: '😟' },
		{ id: 'excited', name: 'Excited', icon: '🤩' },
		{ id: 'thinking', name: 'Thinking', icon: '🤔' },
		{ id: 'celebrating', name: 'Celebrating', icon: '🥳' }
	];

	let characters = $derived(builder.level.characters || defaultCharacters);
	let emotions = $derived(builder.level.emotions || defaultEmotions);

	$effect(() => {
		if (isExpanded) {
			dialog?.showPopover();
		} else {
			dialog?.hidePopover();
		}
	});

	// Helper to find segment index and list
	function findSegment(): { list: 'intro' | 'outro'; index: number; segment: StorySegment } | null {
		if (!builder.activeSegmentId) return null;

		const introIndex =
			builder.level.intro?.findIndex((s) => s.id === builder.activeSegmentId) ?? -1;
		if (introIndex !== -1)
			return { list: 'intro', index: introIndex, segment: builder.level.intro![introIndex] };

		const outroIndex =
			builder.level.outro?.findIndex((s) => s.id === builder.activeSegmentId) ?? -1;
		if (outroIndex !== -1)
			return { list: 'outro', index: outroIndex, segment: builder.level.outro![outroIndex] };

		return null;
	}

	let current = $derived(findSegment());

	function nextSegment() {
		if (!current) return;
		const list = current.list === 'intro' ? builder.level.intro : builder.level.outro;
		if (list && current.index < list.length - 1) {
			builder.activeSegmentId = list[current.index + 1].id!;
		}
	}

	function prevSegment() {
		if (!current) return;
		const list = current.list === 'intro' ? builder.level.intro : builder.level.outro;
		if (list && current.index > 0) {
			builder.activeSegmentId = list[current.index - 1].id!;
		}
	}

	function addSegmentAfter() {
		if (!current) return;
		const newSegment: StorySegment = {
			id: crypto.randomUUID(),
			speaker: current.segment.speaker, // Copy previous speaker
			text: '',
			emotion: 'neutral'
		};

		if (current.list === 'intro') {
			const newIntro = [...(builder.level.intro || [])];
			newIntro.splice(current.index + 1, 0, newSegment);
			builder.level.intro = newIntro;
		} else {
			const newOutro = [...(builder.level.outro || [])];
			newOutro.splice(current.index + 1, 0, newSegment);
			builder.level.outro = newOutro;
		}

		builder.activeSegmentId = newSegment.id!;
	}

	function addSegment(list: 'intro' | 'outro') {
		const newSegment = {
			id: crypto.randomUUID(),
			speaker: 'System',
			text: '',
			emotion: 'neutral'
		} as const;
		if (list === 'intro') {
			builder.level.intro = [...(builder.level.intro || []), newSegment];
		} else {
			builder.level.outro = [...(builder.level.outro || []), newSegment];
		}
		builder.activeSegmentId = newSegment.id;
	}

	function deleteSegment() {
		if (!current) return;

		if (current.list === 'intro') {
			builder.level.intro = builder.level.intro?.filter((s) => s.id !== builder.activeSegmentId);
			// Select previous or next if available
			if (builder.level.intro?.length) {
				builder.activeSegmentId = builder.level.intro[Math.max(0, current.index - 1)].id!;
			} else {
				builder.activeSegmentId = null; // No segments left
			}
		} else {
			builder.level.outro = builder.level.outro?.filter((s) => s.id !== builder.activeSegmentId);
			if (builder.level.outro?.length) {
				builder.activeSegmentId = builder.level.outro[Math.max(0, current.index - 1)].id!;
			} else {
				builder.activeSegmentId = null;
			}
		}
	}

	function setSpeaker(name: string) {
		if (!current) return;
		current.segment.speaker = name;
		charPopover?.hidePopover();
	}

	function setEmotion(emotionId: string) {
		if (!current) return;
		current.segment.emotion = emotionId;
		emotionPopover?.hidePopover();
	}

	function selectSegment(id: string) {
		builder.activeSegmentId = id;
		// Optional: Close expanded view on select?
		// isExpanded = false;
	}

	function getCharacter(name: string) {
		return (
			characters.find((c) => c.name === name) ||
			defaultCharacters.find((c) => c.name === name) || {
				color: 'var(--surface-3)',
				avatar: name[0]
			}
		);
	}

	function getEmotion(id: string) {
		return (
			emotions.find((e) => e.id === id) ||
			defaultEmotions.find((e) => e.id === id) || { icon: '😐' }
		);
	}

	function openConfig(tab: 'characters' | 'emotions') {
		configTab = tab;
		isConfigOpen = true;
		charPopover?.hidePopover();
		emotionPopover?.hidePopover();
	}
</script>

<div class="story-bar-container">
	<StoryConfigModal
		{builder}
		isOpen={isConfigOpen}
		onClose={() => (isConfigOpen = false)}
		initialTab={configTab}
	/>

	{#if current}
		<div class="instruction-bar-editor" transition:fly={{ y: -20, duration: 300 }}>
			<div class="editor-controls left">
				<button
					class="nav-btn"
					onclick={() => (isExpanded = !isExpanded)}
					title="Toggle Timeline List"
				>
					{#if isExpanded}
						<X size={20} />
					{:else}
						<List size={20} />
					{/if}
				</button>
				<div class="separator"></div>
				<button
					class="nav-btn"
					onclick={prevSegment}
					disabled={current.index === 0}
					title="Previous Segment"
				>
					<ChevronLeft size={20} />
				</button>
			</div>

			<div class="instruction-content">
				<div class="character-portrait" data-character={current.segment.speaker}>
					<div class="avatar-container" style:anchor-name="--char-trigger">
						<button
							class="avatar"
							popovertarget="character-popover"
							title="Change speaker"
							style:background-color={getCharacter(current.segment.speaker).color}
						>
							<Avatar value={getCharacter(current.segment.speaker).avatar || '?'} size={24} />
						</button>

						<button
							class="emotion-badge"
							popovertarget="emotion-popover"
							title="Change emotion"
							style:anchor-name="--emo-trigger"
						>
							{getEmotion(current.segment.emotion || 'neutral').icon}
						</button>
					</div>

					<!-- Character Popover -->
					<div
						id="character-popover"
						bind:this={charPopover}
						popover="auto"
						class="selection-popover"
					>
						<div class="popover-list">
							{#each characters as char}
								<button
									class="selection-item"
									onclick={() => setSpeaker(char.name)}
									title={char.name}
								>
									<div class="mini-avatar-circle" style:background-color={char.color}>
										<Avatar value={char.avatar || '?'} size={14} />
									</div>
								</button>
							{/each}
						</div>
						<div class="popover-footer">
							<button
								class="edit-btn"
								title="Edit Characters"
								onclick={() => openConfig('characters')}
							>
								<Settings2 size={14} />
							</button>
						</div>
					</div>

					<!-- Emotion Popover -->
					<div
						id="emotion-popover"
						bind:this={emotionPopover}
						popover="auto"
						class="selection-popover emotion-popover"
					>
						<div class="popover-list">
							{#each emotions as emo}
								<button class="selection-item" onclick={() => setEmotion(emo.id)} title={emo.name}>
									<span class="emoji">{emo.icon}</span>
								</button>
							{/each}
						</div>
						<div class="popover-footer">
							<button class="edit-btn" title="Edit Emotions" onclick={() => openConfig('emotions')}>
								<Settings2 size={14} />
							</button>
						</div>
					</div>
				</div>
				<div class="content">
					<div class="speaker-name">{current.segment.speaker}</div>
					<textarea
						class="text-editor"
						bind:value={current.segment.text}
						rows="2"
						placeholder="Enter dialogue..."
					></textarea>
				</div>

				<div class="segment-actions">
					<button class="action-btn add" onclick={addSegmentAfter} title="Add Segment After">
						<Plus size={16} />
					</button>
					<button class="action-btn delete" onclick={deleteSegment} title="Delete Segment">
						<Trash2 size={16} />
					</button>
				</div>
			</div>

			<div class="editor-controls right">
				<button
					class="nav-btn"
					onclick={nextSegment}
					disabled={(current.list === 'intro'
						? builder.level.intro?.length
						: builder.level.outro?.length) ===
						current.index + 1}
					title="Next Segment"
				>
					<ChevronRight size={20} />
				</button>
			</div>
		</div>
	{:else}
		<div class="instruction-bar-editor empty-state" transition:fly={{ y: -20, duration: 300 }}>
			<div class="empty-content">
				{#if (builder.level.intro?.length || 0) + (builder.level.outro?.length || 0) === 0}
					<p class="text-2">Start your story by adding an intro segment.</p>
					<button class="btn-primary" onclick={() => addSegment('intro')}>
						<Plus size={16} /> Create Intro
					</button>
				{:else}
					<p class="text-2">Select a segment to edit or add a new one.</p>
					<div class="actions">
						<button class="btn-secondary" onclick={() => (isExpanded = true)}>
							<List size={16} /> View Timeline
						</button>
						<button class="btn-primary" onclick={() => addSegment('intro')}>
							<Plus size={16} /> Add Intro
						</button>
					</div>
				{/if}
			</div>

			<div class="editor-controls right">
				<button
					class="nav-btn"
					onclick={() => (isExpanded = !isExpanded)}
					title="Toggle Timeline List"
				>
					{#if isExpanded}
						<X size={20} />
					{:else}
						<List size={20} />
					{/if}
				</button>
			</div>
		</div>
	{/if}

	<dialog
		bind:this={dialog}
		class="timeline-dialog"
		popover="manual"
		ontoggle={(e) => {
			if (e.newState === 'closed') isExpanded = false;
		}}
	>
		<div class="timeline-popover">
			<div class="timeline-column">
				<h3>Intro</h3>
				<div class="timeline-list">
					{#each builder.level.intro || [] as segment, i}
						<button
							class="timeline-item"
							class:active={builder.activeSegmentId === segment.id}
							onclick={() => selectSegment(segment.id!)}
						>
							<span class="index">{i + 1}</span>
							<div class="mini-avatar" data-character={segment.speaker}>
								<Avatar value={getCharacter(segment.speaker).avatar || '?'} size={14} />
							</div>
							<div class="item-content">
								<span class="speaker">{segment.speaker}</span>
								<span class="preview">{segment.text || '(Empty)'}</span>
							</div>
						</button>
					{/each}
					<button class="add-btn" onclick={() => addSegment('intro')}>
						<Plus size={14} /> Add Intro Segment
					</button>
				</div>
			</div>

			<div class="timeline-column">
				<h3>Outro</h3>
				<div class="timeline-list">
					{#each builder.level.outro || [] as segment, i}
						<button
							class="timeline-item"
							class:active={builder.activeSegmentId === segment.id}
							onclick={() => selectSegment(segment.id!)}
						>
							<span class="index">{i + 1}</span>
							<div class="mini-avatar" data-character={segment.speaker}>
								<Avatar value={getCharacter(segment.speaker).avatar || '?'} size={14} />
							</div>
							<div class="item-content">
								<span class="speaker">{segment.speaker}</span>
								<span class="preview">{segment.text || '(Empty)'}</span>
							</div>
						</button>
					{/each}
					<button class="add-btn" onclick={() => addSegment('outro')}>
						<Plus size={14} /> Add Outro Segment
					</button>
				</div>
			</div>
		</div>
	</dialog>
</div>

<style>
	.story-bar-container {
		position: relative;
		width: 100%;
		height: 100%;
		z-index: 50;
		display: grid;
		grid-template-areas: 'stack';
	}

	.instruction-bar-editor {
		grid-area: stack;
		width: 100%;
		height: 100%;
		display: flex;
		align-items: center;
		justify-content: center;
		padding: var(--size-2) var(--size-4);
		background-color: var(--surface-1);
		border-bottom: 1px solid var(--surface-3);
		gap: var(--size-2);
		position: relative;
		z-index: 60; /* Above popover */
		anchor-name: --story-bar;
	}

	.timeline-dialog {
		position: fixed;
		position-anchor: --story-bar;
		top: anchor(bottom);
		left: anchor(left);
		right: anchor(right);
		width: anchor-size(width);
		margin: 0;
		padding: 0;
		border: none;
		background: transparent;
		max-width: none;
		overflow: visible;
	}

	.timeline-dialog::backdrop {
		background: transparent;
	}

	.timeline-popover {
		height: 400px; /* Fixed height or max-height */
		background-color: rgba(255, 255, 255, 0.95);
		backdrop-filter: blur(10px);
		border-bottom: 1px solid var(--surface-3);
		box-shadow: var(--shadow-4);
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: var(--size-4);
		padding: var(--size-4);
		overflow-y: auto;
	}

	.timeline-column {
		display: flex;
		flex-direction: column;
		gap: var(--size-2);
	}

	h3 {
		font-size: var(--font-size-1);
		font-weight: bold;
		color: var(--text-2);
		text-transform: uppercase;
		letter-spacing: 0.05em;
		padding-bottom: var(--size-2);
		border-bottom: 1px solid var(--surface-3);
	}

	.timeline-list {
		display: flex;
		flex-direction: column;
		gap: var(--size-2);
	}

	.timeline-item {
		display: flex;
		align-items: center;
		gap: var(--size-3);
		padding: var(--size-2);
		background-color: var(--surface-1);
		border: 1px solid var(--surface-3);
		border-radius: var(--radius-2);
		cursor: pointer;
		text-align: left;
		transition: all 0.2s;
	}

	.timeline-item:hover {
		background-color: var(--surface-2);
		transform: translateX(2px);
	}

	.timeline-item.active {
		border-color: var(--brand);
		background-color: var(--blue-1);
		box-shadow: var(--shadow-1);
	}

	.mini-avatar {
		width: 24px;
		height: 24px;
		border-radius: var(--radius-round);
		background-color: var(--surface-3);
		display: grid;
		place-items: center;
		font-size: 10px;
		font-weight: bold;
		color: var(--text-2);
		flex-shrink: 0;
		border: 1px solid white;
		box-shadow: var(--shadow-1);
	}

	.mini-avatar[data-character='Zoey'] {
		background-color: var(--pink-3);
		color: var(--pink-9);
	}

	.mini-avatar[data-character='Jonas'] {
		background-color: var(--blue-3);
		color: var(--blue-9);
	}

	.mini-avatar[data-character='Guide'] {
		background-color: var(--teal-3);
		color: var(--teal-9);
	}

	.item-content {
		display: flex;
		flex-direction: column;
		gap: 0;
		overflow: hidden;
		flex: 1;
	}

	.speaker {
		font-size: var(--font-size-00);
		font-weight: bold;
		color: var(--text-3);
		text-transform: uppercase;
		line-height: 1.2;
	}

	.editor-controls {
		display: flex;
		align-items: center;
		gap: var(--size-2);
	}

	.separator {
		width: 1px;
		height: 20px;
		background-color: var(--surface-3);
	}

	.nav-btn {
		background: none;
		border: none;
		color: var(--text-2);
		cursor: pointer;
		padding: var(--size-2);
		border-radius: var(--radius-round);
		display: grid;
		place-items: center;
	}

	.nav-btn:disabled {
		opacity: 0.3;
		cursor: not-allowed;
	}

	.nav-btn:not(:disabled):hover {
		background-color: var(--surface-2);
		color: var(--text-1);
	}

	.instruction-content {
		display: flex;
		align-items: center;
		gap: var(--size-4);
		width: 100%;
		max-width: 800px;
		background-color: var(--surface-2); /* Highlight that it's editable */
		padding: var(--size-2);
		border-radius: var(--radius-3);
		border: 1px dashed var(--surface-3);
	}

	.character-portrait {
		flex-shrink: 0;
		align-self: flex-start;
		margin-top: var(--size-1);
	}

	.avatar-container {
		position: relative;
		width: 48px;
		height: 48px;
	}

	.selection-popover {
		/* Reset UA styles */
		margin: 0;
		inset: auto;

		position: fixed;
		background-color: var(--surface-1);
		border: 1px solid var(--surface-3);
		border-radius: var(--radius-3);
		box-shadow: var(--shadow-3);
		padding: var(--size-1);
		display: none;
		flex-direction: column;
		gap: var(--size-1);
		min-width: 40px;
		z-index: 100;
	}

	.selection-popover:popover-open {
		display: flex;
	}

	#character-popover {
		position-anchor: --char-trigger;
		top: anchor(top);
		left: anchor(right);
		margin-left: var(--size-2);
	}

	#emotion-popover {
		position-anchor: --emo-trigger;
		top: anchor(top);
		left: anchor(right);
		margin-left: var(--size-2);
	}

	.popover-list {
		display: flex;
		flex-direction: column;
		gap: var(--size-1);
		max-height: 300px;
		flex-wrap: wrap;
	}

	.selection-item {
		background: none;
		border: none;
		padding: var(--size-1);
		border-radius: var(--radius-round);
		cursor: pointer;
		display: flex;
		align-items: center;
		justify-content: center;
		transition: background-color 0.1s;
		width: 40px;
		height: 40px;
	}

	.selection-item:hover {
		background-color: var(--surface-2);
	}

	.mini-avatar-circle {
		width: 32px;
		height: 32px;
		border-radius: var(--radius-round);
		display: grid;
		place-items: center;
		font-size: 12px;
		font-weight: bold;
		color: var(--text-2);
		border: 1px solid white;
		box-shadow: var(--shadow-1);
	}

	.emoji {
		font-size: 24px;
		line-height: 1;
	}

	.popover-footer {
		border-top: 1px solid var(--surface-3);
		padding-top: var(--size-1);
		display: flex;
		justify-content: center;
	}

	.edit-btn {
		background: none;
		border: none;
		padding: var(--size-1);
		border-radius: var(--radius-round);
		cursor: pointer;
		color: var(--text-3);
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.edit-btn:hover {
		background-color: var(--surface-2);
		color: var(--text-1);
	}

	.avatar {
		width: 100%;
		height: 100%;
		border-radius: var(--radius-round);
		background-color: var(--surface-3);
		display: grid;
		place-items: center;
		font-size: var(--font-size-3);
		font-weight: bold;
		color: var(--text-2);
		border: 2px solid white;
		box-shadow: var(--shadow-2);
		transition: transform 0.1s;
		padding: 0;
		cursor: pointer;
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
		background-color: white;
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: var(--font-size-1);
		box-shadow: var(--shadow-1);
		border: 1px solid var(--surface-2);
		cursor: pointer;
		padding: 0;
	}

	/* Remove old character specific styles as we use dynamic colors now */
	/* .character-portrait[data-character='Zoey'] .avatar { ... } */

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

	.text-editor {
		font-size: var(--font-size-2);
		line-height: var(--font-lineheight-2);
		color: var(--text-1);
		margin: 0;
		background: transparent;
		border: 1px dashed transparent;
		border-radius: var(--radius-1);
		resize: none;
		font-family: inherit;
		width: 100%;
	}

	.text-editor:hover,
	.text-editor:focus {
		background-color: var(--surface-1);
		border-color: var(--surface-3);
	}

	.segment-actions {
		display: flex;
		flex-direction: column;
		gap: var(--size-1);
	}

	.action-btn {
		background: none;
		border: none;
		padding: var(--size-1);
		border-radius: var(--radius-1);
		cursor: pointer;
		color: var(--text-3);
	}

	.action-btn:hover {
		background-color: var(--surface-3);
		color: var(--text-1);
	}

	.action-btn.delete:hover {
		background-color: var(--red-1);
		color: var(--red-7);
	}

	.index {
		font-weight: bold;
		color: var(--text-3);
		font-size: var(--font-size-00);
		width: 1.5em;
	}

	.preview {
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
		font-size: var(--font-size-1);
		color: var(--text-2);
	}

	.add-btn {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: var(--size-2);
		padding: var(--size-2);
		background: none;
		border: 1px dashed var(--surface-3);
		border-radius: var(--radius-2);
		color: var(--text-3);
		cursor: pointer;
		font-size: var(--font-size-1);
		margin-top: var(--size-2);
	}

	.add-btn:hover {
		background-color: var(--surface-2);
		color: var(--text-1);
	}

	.empty-state {
		justify-content: space-between;
	}

	.empty-content {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: var(--size-3);
		margin: 0 auto;
	}

	.empty-content .actions {
		display: flex;
		gap: var(--size-2);
	}

	.btn-primary {
		background-color: var(--brand);
		color: white;
		padding: var(--size-2) var(--size-4);
		border-radius: var(--radius-round);
		font-weight: bold;
		border: none;
		cursor: pointer;
		display: flex;
		align-items: center;
		gap: var(--size-2);
	}

	.btn-secondary {
		background-color: var(--surface-2);
		color: var(--text-1);
		padding: var(--size-2) var(--size-4);
		border-radius: var(--radius-round);
		border: 1px solid var(--surface-3);
		cursor: pointer;
		display: flex;
		align-items: center;
		gap: var(--size-2);
	}
</style>
