<script lang="ts">
	import type { BuilderModel } from '$lib/game/builder-model.svelte';
	import type { StorySegment } from '$lib/game/types';
	import { ArrowRight, Bot, Trash2, Plus, ChevronLeft, ChevronRight, List, X } from 'lucide-svelte';
	import { fly, fade } from 'svelte/transition';

	interface Props {
		builder: BuilderModel;
	}

	let { builder }: Props = $props();
	let isExpanded = $state(false);

	// Helper to find segment index and list
	function findSegment(): { list: 'intro' | 'outro'; index: number; segment: StorySegment } | null {
		if (!builder.activeSegmentId) return null;
		
		const introIndex = builder.level.intro?.findIndex(s => s.id === builder.activeSegmentId) ?? -1;
		if (introIndex !== -1) return { list: 'intro', index: introIndex, segment: builder.level.intro![introIndex] };
		
		const outroIndex = builder.level.outro?.findIndex(s => s.id === builder.activeSegmentId) ?? -1;
		if (outroIndex !== -1) return { list: 'outro', index: outroIndex, segment: builder.level.outro![outroIndex] };
		
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
		const newSegment = { id: crypto.randomUUID(), speaker: 'System', text: '', emotion: 'neutral' } as const;
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
			builder.level.intro = builder.level.intro?.filter(s => s.id !== builder.activeSegmentId);
			// Select previous or next if available
			if (builder.level.intro?.length) {
				builder.activeSegmentId = builder.level.intro[Math.max(0, current.index - 1)].id!;
			} else {
				builder.activeSegmentId = null; // No segments left
			}
		} else {
			builder.level.outro = builder.level.outro?.filter(s => s.id !== builder.activeSegmentId);
			if (builder.level.outro?.length) {
				builder.activeSegmentId = builder.level.outro[Math.max(0, current.index - 1)].id!;
			} else {
				builder.activeSegmentId = null;
			}
		}
	}

	function cycleSpeaker() {
		if (!current) return;
		const speakers = ['System', 'Zoey', 'Jonas', 'Guide'] as const;
		const idx = speakers.indexOf(current.segment.speaker);
		current.segment.speaker = speakers[(idx + 1) % speakers.length];
	}

	function cycleEmotion() {
		if (!current) return;
		const emotions = ['neutral', 'happy', 'concerned', 'excited', 'thinking', 'celebrating'] as const;
		const idx = emotions.indexOf(current.segment.emotion || 'neutral');
		current.segment.emotion = emotions[(idx + 1) % emotions.length];
	}

	function selectSegment(id: string) {
		builder.activeSegmentId = id;
		// Optional: Close expanded view on select?
		// isExpanded = false; 
	}

	const emotionsMap = {
		happy: '😊',
		neutral: '😐',
		concerned: '😟',
		excited: '🤩',
		thinking: '🤔',
		celebrating: '🥳'
	};
</script>

<div class="story-bar-container">
	{#if current}
		<div class="instruction-bar-editor" transition:fly={{ y: -20, duration: 300 }}>
			<div class="editor-controls left">
				<button class="nav-btn" onclick={() => isExpanded = !isExpanded} title="Toggle Timeline List">
					{#if isExpanded}
						<X size={20} />
					{:else}
						<List size={20} />
					{/if}
				</button>
				<div class="separator"></div>
				<button class="nav-btn" onclick={prevSegment} disabled={current.index === 0} title="Previous Segment">
					<ChevronLeft size={20} />
				</button>
			</div>

			<div class="instruction-content">
				<div class="character-portrait" data-character={current.segment.speaker}>
					<div class="avatar-container">
						<button class="avatar" onclick={cycleSpeaker} title="Click to change speaker">
							{#if current.segment.speaker === 'Guide'}
								<Bot size={24} />
							{:else}
								{current.segment.speaker[0]}
							{/if}
						</button>
						<button 
							class="emotion-badge" 
							onclick={(e) => { e.stopPropagation(); cycleEmotion(); }}
							title="Click to change emotion"
						>
							{emotionsMap[current.segment.emotion || 'neutral'] || ''}
						</button>
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
				<button class="nav-btn" onclick={nextSegment} disabled={(current.list === 'intro' ? builder.level.intro?.length : builder.level.outro?.length) === current.index + 1} title="Next Segment">
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
						<button class="btn-secondary" onclick={() => isExpanded = true}>
							<List size={16} /> View Timeline
						</button>
						<button class="btn-primary" onclick={() => addSegment('intro')}>
							<Plus size={16} /> Add Intro
						</button>
					</div>
				{/if}
			</div>
			
			<div class="editor-controls right">
				<button class="nav-btn" onclick={() => isExpanded = !isExpanded} title="Toggle Timeline List">
					{#if isExpanded}
						<X size={20} />
					{:else}
						<List size={20} />
					{/if}
				</button>
			</div>
		</div>
	{/if}

	{#if isExpanded}
		<div class="timeline-popover" transition:fade={{ duration: 200 }}>
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
	{/if}
</div>

<style>
	.story-bar-container {
		position: relative;
		width: 100%;
		height: 100%;
		z-index: 50;
	}

	.instruction-bar-editor {
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
	}

	.timeline-popover {
		position: absolute;
		top: 100%;
		left: 0;
		right: 0;
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
		z-index: 50;
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

	.item-content {
		display: flex;
		flex-direction: column;
		gap: 2px;
		overflow: hidden;
	}

	.speaker {
		font-size: var(--font-size-00);
		font-weight: bold;
		color: var(--text-3);
		text-transform: uppercase;
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

	.character-portrait[data-character='Zoey'] .avatar {
		background-color: var(--pink-3);
		color: var(--pink-9);
	}

	.character-portrait[data-character='Jonas'] .avatar {
		background-color: var(--blue-3);
		color: var(--blue-9);
	}

	.character-portrait[data-character='Guide'] .avatar {
		background-color: var(--teal-3);
		color: var(--teal-9);
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

	.text-editor:hover, .text-editor:focus {
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
