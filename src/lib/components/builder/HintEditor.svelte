<script lang="ts">
	import type { BuilderModel } from '$lib/game/builder-model.svelte';
	import type { Hint, HintTrigger } from '$lib/game/schema';
	import {
		Plus,
		Trash2,
		Clock,
		AlertTriangle,
		MousePointer,
		BookOpen,
		Brain,
		Target,
		X
	} from 'lucide-svelte';
	import { slide } from 'svelte/transition';

	interface Props {
		builder: BuilderModel;
	}
	let { builder }: Props = $props();

	function addHint() {
		const newHint: Hint = {
			id: crypto.randomUUID(),
			text: '',
			trigger: { type: 'time', value: 10 }
		};
		builder.level.hints = [...(builder.level.hints || []), newHint];
	}

	function deleteHint(id: string) {
		builder.level.hints = builder.level.hints?.filter((h) => h.id !== id);
	}

	function updateTriggerType(hint: Hint, type: HintTrigger['type']) {
		if (type === 'time') hint.trigger = { type: 'time', value: 10 };
		if (type === 'attempts') hint.trigger = { type: 'attempts', value: 3 };
		if (type === 'idle') hint.trigger = { type: 'idle', value: 15 };
		if (type === 'story-step')
			hint.trigger = { type: 'story-step', segmentId: builder.level.intro?.[0]?.id || '' };
		if (type === 'analysis') hint.trigger = { type: 'analysis', pattern: 'redundant-turn' };
	}

	const triggerTypes = [
		{ type: 'time', label: 'Time (sec)', icon: Clock },
		{ type: 'attempts', label: 'Failures', icon: AlertTriangle },
		{ type: 'idle', label: 'Idle (sec)', icon: MousePointer },
		{ type: 'story-step', label: 'Story Step', icon: BookOpen },
		{ type: 'analysis', label: 'Pattern', icon: Brain }
	] as const;
</script>

<div class="hint-editor">
	<div class="header">
		<h3>Hints</h3>
		<p class="subtitle">Guide players when they get stuck.</p>
	</div>

	<div class="hint-list">
		{#each builder.level.hints || [] as hint (hint.id)}
			<div class="hint-card" transition:slide>
				<div class="card-header">
					<div class="trigger-selector">
						{#each triggerTypes as { type, icon: Icon, label } (type)}
							<button
								class="trigger-btn"
								class:active={hint.trigger.type === type}
								onclick={() => updateTriggerType(hint, type)}
								title={label}
							>
								<Icon size={14} />
							</button>
						{/each}
					</div>
					<button class="delete-btn" onclick={() => deleteHint(hint.id)}>
						<Trash2 size={14} />
					</button>
				</div>

				<div class="card-body">
					<div class="trigger-config">
						{#if hint.trigger.type === 'time'}
							<div class="input-group">
								<Clock size={14} />
								<span>Show after</span>
								<input type="number" bind:value={hint.trigger.value} min="1" class="small-input" />
								<span>seconds</span>
							</div>
						{:else if hint.trigger.type === 'attempts'}
							<div class="input-group">
								<AlertTriangle size={14} />
								<span>Show after</span>
								<input type="number" bind:value={hint.trigger.value} min="1" class="small-input" />
								<span>failures</span>
							</div>
						{:else if hint.trigger.type === 'idle'}
							<div class="input-group">
								<MousePointer size={14} />
								<span>Show after</span>
								<input type="number" bind:value={hint.trigger.value} min="1" class="small-input" />
								<span>seconds idle</span>
							</div>
						{:else if hint.trigger.type === 'story-step'}
							<div class="input-group story-step-group">
								<div class="label-row">
									<BookOpen size={14} />
									<span>At step:</span>
								</div>
								<div class="select-wrapper">
									<select bind:value={hint.trigger.segmentId} class="select-input">
										<optgroup label="Intro">
											{#each builder.level.intro || [] as s, i (s.id)}
												<option value={s.id}>Intro {i + 1}: {s.text.slice(0, 20)}...</option>
											{/each}
										</optgroup>
										<optgroup label="Outro">
											{#each builder.level.outro || [] as s, i (s.id)}
												<option value={s.id}>Outro {i + 1}: {s.text.slice(0, 20)}...</option>
											{/each}
										</optgroup>
									</select>
								</div>
							</div>
						{:else if hint.trigger.type === 'analysis'}
							<div class="input-group">
								<Brain size={14} />
								<span>Detect:</span>
								<select bind:value={hint.trigger.pattern} class="select-input">
									<option value="redundant-turn">Redundant Turn</option>
									<option value="360-turn">360 Turn</option>
									<option value="empty-loop">Empty Loop</option>
									<option value="missed-loop">Missed Loop</option>
								</select>
							</div>
						{/if}
					</div>

					<textarea
						class="hint-text"
						bind:value={hint.text}
						placeholder="Enter hint text..."
						rows="2"
					></textarea>

					<div class="highlight-config">
						{#if hint.highlight}
							<!-- svelte-ignore a11y_click_events_have_key_events -->
							<!-- svelte-ignore a11y_no_static_element_interactions -->
							<div
								class="highlight-badge"
								onmouseenter={() => builder.game.triggerPreviewHighlight(hint.highlight!)}
								onclick={() => builder.game.triggerPreviewHighlight(hint.highlight!)}
							>
								<Target size={14} />
								<span>Target: {hint.highlight}</span>
								<button
									class="clear-highlight-btn"
									onclick={(e) => {
										e.stopPropagation();
										hint.highlight = undefined;
										builder.game.previewHighlight = null;
									}}
									title="Clear Target"
								>
									<X size={12} />
								</button>
							</div>
						{:else}
							<button
								class="highlight-btn"
								class:active={builder.targetSelectionMode}
								onclick={() => {
									if (builder.targetSelectionMode) {
										builder.cancelTargetSelection();
									} else {
										builder.startTargetSelection((target) => {
											hint.highlight = target;
											builder.game.triggerPreviewHighlight(target);
										});
									}
								}}
								title="Click to select a block or grid cell to highlight"
							>
								<Target size={14} />
								{builder.targetSelectionMode ? 'Cancel Selection' : 'Select Target'}
							</button>
						{/if}
					</div>
				</div>
			</div>
		{/each}

		<button class="add-btn" onclick={addHint}>
			<Plus size={16} /> Add Hint
		</button>
	</div>
</div>

<style>
	.hint-editor {
		display: flex;
		flex-direction: column;
		height: 100%;
		gap: var(--size-4);
		padding: var(--size-4);
		overflow-y: auto;
	}

	.header {
		margin-bottom: var(--size-2);
	}

	h3 {
		font-size: var(--font-size-2);
		font-weight: bold;
		color: var(--text-1);
		margin: 0;
	}

	.subtitle {
		font-size: var(--font-size-1);
		color: var(--text-2);
		margin: 0;
	}

	.hint-list {
		display: flex;
		flex-direction: column;
		gap: var(--size-3);
	}

	.hint-card {
		background-color: var(--surface-1);
		border: 1px solid var(--surface-3);
		border-radius: var(--radius-2);
		padding: var(--size-3);
		display: flex;
		flex-direction: column;
		gap: var(--size-3);
		box-shadow: var(--shadow-1);
	}

	.card-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		border-bottom: 1px solid var(--surface-3);
		padding-bottom: var(--size-2);
	}

	.trigger-selector {
		display: flex;
		gap: 4px;
		background-color: var(--surface-2);
		padding: 4px;
		border-radius: var(--radius-1);
	}

	.trigger-btn {
		background: none;
		border: none;
		padding: 6px;
		border-radius: var(--radius-1);
		cursor: pointer;
		color: var(--text-3);
		display: flex;
		align-items: center;
		justify-content: center;
		transition: all 0.2s;
	}

	.trigger-btn:hover {
		background-color: var(--surface-3);
		color: var(--text-1);
	}

	.trigger-btn.active {
		background-color: var(--surface-1);
		color: var(--brand);
		box-shadow: var(--shadow-1);
	}

	.delete-btn {
		background: none;
		border: none;
		color: var(--text-3);
		cursor: pointer;
		padding: 6px;
		border-radius: var(--radius-1);
		transition: color 0.2s;
	}

	.delete-btn:hover {
		color: var(--red-7);
		background-color: var(--red-1);
	}

	.card-body {
		display: flex;
		flex-direction: column;
		gap: var(--size-3);
	}

	.trigger-config {
		font-size: var(--font-size-1);
		color: var(--text-2);
		background-color: var(--surface-2);
		padding: var(--size-2);
		border-radius: var(--radius-1);
	}

	.input-group {
		display: flex;
		align-items: center;
		gap: var(--size-2);
	}

	.small-input {
		width: 70px;
		padding: 4px 8px;
		border: 1px solid var(--surface-3);
		border-radius: var(--radius-1);
		background-color: var(--surface-1);
	}

	.story-step-group {
		flex-direction: column;
		align-items: stretch;
		gap: var(--size-1);
	}

	.label-row {
		display: flex;
		align-items: center;
		gap: var(--size-2);
		color: var(--text-2);
		font-size: var(--font-size-0);
	}

	.select-wrapper {
		position: relative;
	}

	.select-input {
		width: 100%;
		padding: 6px 8px;
		border: 1px solid var(--surface-3);
		border-radius: var(--radius-1);
		background-color: var(--surface-1);
		font-size: var(--font-size-1);
		color: var(--text-1);
		cursor: pointer;
		max-width: 100%;
	}

	.select-input:focus {
		outline: 2px solid var(--brand);
		border-color: transparent;
	}

	.hint-text {
		width: 100%;
		padding: var(--size-2);
		border: 1px solid var(--surface-3);
		border-radius: var(--radius-1);
		background-color: var(--surface-1);
		font-family: inherit;
		font-size: var(--font-size-1);
		resize: vertical;
		min-height: 80px;
	}

	.highlight-config {
		display: flex;
		justify-content: flex-end;
	}

	.highlight-btn {
		background: none;
		border: 1px dashed var(--surface-3);
		padding: 4px 8px;
		border-radius: var(--radius-1);
		font-size: var(--font-size-1);
		color: var(--text-2);
		cursor: pointer;
		display: flex;
		align-items: center;
		gap: 6px;
		transition: all 0.2s;
	}

	.highlight-btn:hover {
		background-color: var(--surface-2);
		color: var(--text-1);
		border-color: var(--text-2);
	}

	.highlight-btn.active {
		background-color: var(--brand);
		color: white;
		border-color: var(--brand);
	}

	.highlight-badge {
		display: flex;
		align-items: center;
		gap: var(--size-2);
		background-color: var(--surface-2);
		padding: 4px 8px;
		border-radius: var(--radius-1);
		font-size: var(--font-size-1);
		color: var(--text-1);
		border: 1px solid var(--surface-3);
	}

	.clear-highlight-btn {
		background: none;
		border: none;
		padding: 2px;
		cursor: pointer;
		color: var(--text-3);
		display: flex;
		align-items: center;
	}

	.clear-highlight-btn:hover {
		color: var(--red-6);
	}

	.add-btn {
		background: none;
		border: 2px dashed var(--surface-3);
		padding: var(--size-3);
		border-radius: var(--radius-2);
		color: var(--text-2);
		cursor: pointer;
		display: flex;
		align-items: center;
		justify-content: center;
		gap: var(--size-2);
		font-weight: bold;
		transition: all 0.2s;
	}

	.add-btn:hover {
		background-color: var(--surface-2);
		color: var(--text-1);
		border-color: var(--text-2);
	}
</style>
