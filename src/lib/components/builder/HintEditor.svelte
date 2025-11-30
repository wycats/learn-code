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
		X,
		ChevronDown,
		ChevronRight,
		Lightbulb
	} from 'lucide-svelte';

	interface Props {
		builder: BuilderModel;
	}
	let { builder }: Props = $props();

	let expandedHintId = $state<string | null>(null);

	function addHint() {
		const newHint: Hint = {
			id: crypto.randomUUID(),
			title: '',
			text: '',
			trigger: { type: 'time', value: 10 }
		};
		builder.level.hints = [...(builder.level.hints || []), newHint];
		expandedHintId = newHint.id;
	}

	function deleteHint(id: string, e: MouseEvent) {
		e.stopPropagation();
		builder.level.hints = builder.level.hints?.filter((h) => h.id !== id);
		if (expandedHintId === id) expandedHintId = null;
	}

	function toggleExpand(id: string) {
		if (expandedHintId === id) {
			expandedHintId = null;
		} else {
			expandedHintId = id;
		}
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
		{ type: 'time', label: 'Time', icon: Clock },
		{ type: 'attempts', label: 'Failures', icon: AlertTriangle },
		{ type: 'idle', label: 'Idle', icon: MousePointer },
		{ type: 'story-step', label: 'Story', icon: BookOpen },
		{ type: 'analysis', label: 'Pattern', icon: Brain }
	] as const;

	function getTriggerIcon(type: HintTrigger['type']) {
		return triggerTypes.find((t) => t.type === type)?.icon || Lightbulb;
	}

	function getTriggerLabel(type: HintTrigger['type']) {
		return triggerTypes.find((t) => t.type === type)?.label || 'Unknown';
	}
</script>

<div class="hint-editor">
	<div class="hint-list">
		{#if !builder.level.hints || builder.level.hints.length === 0}
			<div class="empty-state">
				<div class="empty-icon">
					<Lightbulb size={32} />
				</div>
				<p>No hints yet. Add one to help players!</p>
			</div>
		{/if}

		{#each builder.level.hints || [] as hint (hint.id)}
			{@const isExpanded = expandedHintId === hint.id}
			{@const TriggerIcon = getTriggerIcon(hint.trigger.type)}

			<div class="hint-card" class:expanded={isExpanded} style="anchor-name: --hint-card-{hint.id}">
				{#if !isExpanded}
					<div
						class="card-header"
						onclick={() => toggleExpand(hint.id)}
						role="button"
						tabindex="0"
						onkeydown={(e) => {
							if (e.key === 'Enter' || e.key === ' ') {
								e.preventDefault();
								toggleExpand(hint.id);
							}
						}}
						onmouseenter={() => {
							if (hint.highlight) {
								builder.game.triggerPreviewHighlight(hint.highlight);
							}
						}}
					>
						<div class="header-content">
							<div class="trigger-badge">
								<TriggerIcon size={14} />
								<span>{getTriggerLabel(hint.trigger.type)}</span>
							</div>
							<span class="hint-preview">
								{hint.title || hint.text || 'New Hint'}
							</span>
						</div>
						<div class="header-actions">
							<button
								class="icon-btn delete"
								onclick={(e) => deleteHint(hint.id, e)}
								title="Delete Hint"
							>
								<Trash2 size={16} />
							</button>
							<div class="expand-icon">
								<ChevronRight size={18} />
							</div>
						</div>
					</div>
				{:else}
					<!-- Expanded State -->
					<div class="expanded-card">
						<div class="expanded-header">
							<!-- Trigger Selector -->
							<button
								class="trigger-select-btn compact"
								popovertarget={`trigger-popover-${hint.id}`}
								title="Change Trigger"
							>
								<TriggerIcon size={14} />
								<span>{getTriggerLabel(hint.trigger.type)}</span>
							</button>

							<!-- Popover Menu (Same as before, just anchored) -->
							<div
								id={`trigger-popover-${hint.id}`}
								popover="auto"
								class="popover-menu"
								style="position-anchor: --hint-card-{hint.id}"
							>
								{#each triggerTypes as { type, icon: Icon, label } (type)}
									<button
										class="menu-item"
										class:active={hint.trigger.type === type}
										onclick={(e) => {
											updateTriggerType(hint, type);
											(e.currentTarget.closest('[popover]') as HTMLElement)?.hidePopover();
										}}
									>
										<Icon size={18} />
										<span>{label}</span>
									</button>
								{/each}
							</div>

							<!-- Title Input -->
							<input
								type="text"
								class="title-input"
								bind:value={hint.title}
								placeholder="Hint Title"
							/>

							<!-- Actions -->
							<div class="header-actions">
								<button
									class="icon-btn delete"
									onclick={(e) => deleteHint(hint.id, e)}
									title="Delete Hint"
								>
									<Trash2 size={16} />
								</button>
								<button class="icon-btn" onclick={() => toggleExpand(hint.id)} title="Collapse">
									<ChevronDown size={18} />
								</button>
							</div>
						</div>

						<div class="expanded-body">
							<textarea
								class="matte-textarea message-input"
								bind:value={hint.text}
								placeholder="What should the hint say?"
								rows="3"
							></textarea>

							<div class="card-footer">
								<!-- Trigger Configuration (Inline) -->
								<div class="trigger-config">
									{#if hint.trigger.type === 'time'}
										<Clock size={16} class="config-icon" />
										<input
											type="number"
											bind:value={hint.trigger.value}
											min="1"
											class="matte-input inline"
										/>
										<span class="unit">sec</span>
									{:else if hint.trigger.type === 'attempts'}
										<AlertTriangle size={16} class="config-icon" />
										<input
											type="number"
											bind:value={hint.trigger.value}
											min="1"
											class="matte-input inline"
										/>
										<span class="unit">fails</span>
									{:else if hint.trigger.type === 'idle'}
										<MousePointer size={16} class="config-icon" />
										<input
											type="number"
											bind:value={hint.trigger.value}
											min="1"
											class="matte-input inline"
										/>
										<span class="unit">sec</span>
									{:else if hint.trigger.type === 'story-step'}
										<BookOpen size={16} class="config-icon" />
										<select bind:value={hint.trigger.segmentId} class="matte-select inline">
											<optgroup label="Intro">
												{#each builder.level.intro || [] as s, i (s.id)}
													<option value={s.id}>Intro {i + 1}</option>
												{/each}
											</optgroup>
											<optgroup label="Outro">
												{#each builder.level.outro || [] as s, i (s.id)}
													<option value={s.id}>Outro {i + 1}</option>
												{/each}
											</optgroup>
										</select>
									{:else if hint.trigger.type === 'analysis'}
										<Brain size={16} class="config-icon" />
										<select bind:value={hint.trigger.pattern} class="matte-select inline">
											<option value="redundant-turn">Redundant Turn</option>
											<option value="360-turn">360 Turn</option>
											<option value="empty-loop">Empty Loop</option>
											<option value="missed-loop">Missed Loop</option>
										</select>
									{/if}
								</div>

								<div class="spacer"></div>

								<!-- Highlight Control (Compact) -->
								<div class="highlight-control">
									{#if hint.highlight}
										<div
											class="highlight-chip icon-only"
											title={`Target: ${hint.highlight}`}
											role="button"
											tabindex="0"
											onmouseenter={() => builder.game.triggerPreviewHighlight(hint.highlight!)}
										>
											<Target size={16} />
											<button
												class="chip-remove"
												onclick={(e) => {
													e.stopPropagation();
													hint.highlight = undefined;
													builder.game.previewHighlight = null;
												}}
											>
												<X size={14} />
											</button>
										</div>
									{:else}
										<button
											class="icon-btn toggle-select"
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
											title="Select Target Element"
										>
											<Target size={18} />
										</button>
									{/if}
								</div>
							</div>
						</div>
					</div>
				{/if}
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

	.hint-list {
		display: flex;
		flex-direction: column;
		gap: var(--size-2);
	}

	.empty-state {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: var(--size-3);
		padding: var(--size-6);
		color: var(--text-3);
		text-align: center;
		background-color: var(--surface-1);
		border-radius: var(--radius-3);
		border: 2px dashed var(--surface-3);
	}

	.empty-icon {
		background-color: var(--surface-2);
		padding: var(--size-3);
		border-radius: 50%;
		color: var(--text-2);
	}

	/* Hint Card */
	.hint-card {
		background-color: var(--surface-1);
		border: 1px solid var(--surface-3);
		border-radius: var(--radius-2);
		overflow: hidden;
		transition: all 0.2s;
	}

	.hint-card.expanded {
		box-shadow: var(--shadow-2);
		border-color: var(--surface-4);
	}

	.card-header {
		width: 100%;
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: var(--size-3);
		background: none;
		border: none;
		cursor: pointer;
		text-align: left;
	}

	.card-header:hover {
		background-color: var(--surface-2);
	}

	.header-content {
		display: flex;
		align-items: center;
		gap: var(--size-3);
		flex: 1;
		min-width: 0; /* For truncation */
	}

	.trigger-badge {
		display: flex;
		align-items: center;
		gap: var(--size-1);
		background-color: var(--surface-2);
		padding: 2px 8px;
		border-radius: var(--radius-pill);
		font-size: var(--font-size-0);
		font-weight: 700;
		color: var(--text-2);
		flex-shrink: 0;
	}

	.hint-preview {
		font-size: var(--font-size-1);
		color: var(--text-1);
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
		font-weight: 500;
	}

	.header-actions {
		display: flex;
		align-items: center;
		gap: var(--size-2);
		color: var(--text-3);
		flex-shrink: 0;
	}

	.icon-btn {
		background: none;
		border: none;
		padding: 6px;
		border-radius: var(--radius-round);
		cursor: pointer;
		color: var(--text-3);
		display: flex;
		align-items: center;
		justify-content: center;
		transition: all 0.2s;
	}

	.icon-btn:hover {
		background-color: var(--surface-3);
		color: var(--text-1);
	}

	.icon-btn.delete:hover {
		background-color: var(--red-1);
		color: var(--red-7);
	}

	/* Expanded State Styles */
	.expanded-card {
		display: flex;
		flex-direction: column;
	}

	.expanded-header {
		display: flex;
		align-items: center;
		gap: var(--size-3);
		padding: var(--size-3);
		border-bottom: 1px solid var(--surface-2);
		background-color: var(--surface-1);
	}

	.trigger-select-btn.compact {
		padding: 2px 8px;
		background-color: var(--surface-2);
		border: 1px solid transparent;
		border-radius: var(--radius-pill);
		color: var(--text-2);
		display: flex;
		align-items: center;
		gap: var(--size-1);
		flex-shrink: 0;
		font-size: var(--font-size-0);
		font-weight: 700;
		cursor: pointer;
	}

	.trigger-select-btn.compact:hover {
		background-color: var(--surface-3);
		color: var(--text-1);
	}

	.title-input {
		flex: 1;
		min-width: 0;
		background: none;
		border: none;
		font-size: var(--font-size-1);
		font-weight: 500;
		color: var(--text-1);
		padding: 2px 4px;
		border-radius: var(--radius-1);
	}

	.title-input:hover {
		background-color: var(--surface-2);
	}

	.title-input:focus {
		background-color: var(--surface-1);
		outline: 2px solid var(--brand);
	}

	.expanded-body {
		padding: var(--size-3);
		display: flex;
		flex-direction: column;
		gap: var(--size-3);
	}

	.message-input {
		width: 100%;
		resize: vertical;
		min-height: 60px;
		border: 1px solid var(--surface-3);
	}

	.card-footer {
		display: flex;
		align-items: center;
		gap: var(--size-2);
		padding-top: var(--size-2);
		border-top: 1px solid var(--surface-2);
	}

	.trigger-config {
		display: flex;
		align-items: center;
		gap: var(--size-2);
	}

	.matte-input.inline,
	.matte-select.inline {
		padding: 2px 6px;
		font-size: var(--font-size-0);
		height: 24px;
		border-color: var(--surface-3);
	}

	.spacer {
		flex: 1;
	}

	.highlight-control {
		display: flex;
		align-items: center;
		gap: var(--size-1);
	}

	.highlight-chip {
		display: flex;
		align-items: center;
		gap: var(--size-1);
		background-color: var(--brand-light);
		color: var(--brand);
		padding: 2px 6px;
		border-radius: var(--radius-pill);
		font-size: var(--font-size-0);
		font-weight: 600;
		border: 1px solid var(--brand);
	}

	.highlight-chip.icon-only {
		padding: 4px;
		gap: 4px;
		border-radius: var(--radius-2);
	}

	.icon-btn.toggle-select {
		color: var(--text-3);
	}

	.icon-btn.toggle-select:hover {
		color: var(--brand);
		background-color: var(--brand-light);
	}

	.icon-btn.toggle-select.active {
		color: white;
		background-color: var(--brand);
	}

	/* Popover Menu */
	.popover-menu {
		margin: 0;
		padding: var(--size-1);
		background-color: var(--surface-1);
		border: 1px solid var(--surface-3);
		border-radius: var(--radius-2);
		box-shadow: var(--shadow-4);
		display: flex;
		flex-direction: column;
		gap: 2px;
		min-width: 160px;

		/* Fallback: center if anchor not supported */
		position: fixed;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
	}

	@supports (anchor-name: --foo) {
		.popover-menu {
			top: anchor(top);
			right: anchor(left);
			left: auto;
			transform: none;
			margin-right: var(--size-2);
		}
	}

	/* If anchor positioning is supported, we could use it here, 
	   but for simplicity in this list context, fixed centering or 
	   simple absolute positioning relative to viewport is safer 
	   without complex JS or polyfills. 
	   The `popover` attribute handles the top layer.
	*/

	.menu-item {
		display: flex;
		align-items: center;
		gap: var(--size-2);
		padding: var(--size-2);
		background: none;
		border: none;
		border-radius: var(--radius-1);
		cursor: pointer;
		text-align: left;
		color: var(--text-2);
		font-weight: 500;
		width: 100%;
	}

	.menu-item:hover {
		background-color: var(--surface-2);
		color: var(--text-1);
	}

	.menu-item.active {
		background-color: var(--brand-light);
		color: var(--brand);
		font-weight: 700;
	}

	/* Inputs */
	.matte-input,
	.matte-select,
	.matte-textarea {
		background-color: var(--surface-2);
		border: 2px solid transparent;
		border-radius: var(--radius-2);
		padding: 6px 10px;
		font-size: var(--font-size-1);
		color: var(--text-1);
		font-family: inherit;
		transition: all 0.2s;
	}

	.matte-input:hover,
	.matte-select:hover,
	.matte-textarea:hover {
		background-color: var(--surface-3);
	}

	.matte-input:focus,
	.matte-select:focus,
	.matte-textarea:focus {
		background-color: var(--surface-1);
		border-color: var(--brand);
		outline: none;
	}

	.matte-textarea {
		width: 100%;
		resize: vertical;
	}

	/* Highlight Control */
	.highlight-control {
		display: flex;
		align-items: center;
		gap: var(--size-2);
	}

	.highlight-chip {
		display: flex;
		align-items: center;
		gap: var(--size-2);
		background-color: var(--brand-light);
		color: var(--brand);
		padding: 4px 8px;
		border-radius: var(--radius-pill);
		font-size: var(--font-size-1);
		font-weight: 600;
		border: 1px solid var(--brand);
	}

	.chip-remove {
		background: none;
		border: none;
		padding: 2px;
		cursor: pointer;
		color: var(--brand);
		display: flex;
		align-items: center;
		border-radius: 50%;
	}

	.chip-remove:hover {
		background-color: rgba(0, 0, 0, 0.1);
	}

	/* Add Button */
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
		font-weight: 700;
		transition: all 0.2s;
		margin-top: var(--size-2);
	}

	.add-btn:hover {
		background-color: var(--surface-2);
		color: var(--text-1);
		border-color: var(--text-2);
	}
</style>
