<script lang="ts">
	import type { BuilderModel } from '$lib/game/builder-model.svelte';
	import { BUILDER_NUMBER_ITEM_MAX, BUILDER_NUMBER_ITEM_MIN } from '$lib/game/builder-model.svelte';
	import Grid from '$lib/components/game/Grid.svelte';
	import { Hash, Plus, Trash2 } from 'lucide-svelte';
	import { fade, fly } from 'svelte/transition';

	interface Props {
		builder: BuilderModel;
	}

	let { builder }: Props = $props();

	const isGridMode = $derived(builder.activeTool.type === 'grid');

	// Combine hover and selection state
	// Selection takes precedence, then hover
	const activeRow = $derived(
		builder.selectedGridPosition?.y ?? builder.hoveredGridPosition?.y ?? null
	);
	const activeCol = $derived(
		builder.selectedGridPosition?.x ?? builder.hoveredGridPosition?.x ?? null
	);

	const width = $derived(builder.level.gridSize.width);
	const height = $derived(builder.level.gridSize.height);

	const rows = $derived(Array.from({ length: height }, (_, i) => i));
	const cols = $derived(Array.from({ length: width }, (_, i) => i));
	const selectedNumberValue = $derived(builder.selectedNumberItemValue);

	function handleRemoveRow(index: number) {
		builder.removeRow(index);
		builder.selectedGridPosition = null;
		builder.hoveredGridPosition = null;
	}

	function handleRemoveCol(index: number) {
		builder.removeColumn(index);
		builder.selectedGridPosition = null;
		builder.hoveredGridPosition = null;
	}

	function setNumberValue(value: number) {
		builder.setSelectedNumberItemValue(value);
	}
</script>

<div class="builder-grid-wrapper" class:grid-mode={isGridMode}>
	{#if isGridMode}
		<!-- Top Controls (Trash + Add) -->
		<div class="control-area top" transition:fade>
			<div class="control-track horizontal" style:--cols={width}>
				<!-- Centered Add Button (Behind) -->
				<div class="add-btn-container">
					<button class="add-btn" onclick={() => builder.addRow('top')} title="Add Row Top">
						<Plus size={16} />
					</button>
				</div>

				<!-- Trash Buttons (Overlay) -->
				{#each cols as col (col)}
					<div class="trash-cell">
						{#if activeCol === col}
							<button
								class="trash-btn"
								onclick={() => handleRemoveCol(col)}
								transition:fly={{ y: 5, duration: 150 }}
								title="Remove Column {col + 1}"
							>
								<Trash2 size={14} />
							</button>
						{/if}
					</div>
				{/each}
			</div>
		</div>

		<!-- Left Controls (Trash + Add) -->
		<div class="control-area left" transition:fade>
			<div class="control-track vertical" style:--rows={height}>
				<!-- Centered Add Button (Behind) -->
				<div class="add-btn-container">
					<button class="add-btn" onclick={() => builder.addColumn('left')} title="Add Column Left">
						<Plus size={16} />
					</button>
				</div>

				<!-- Trash Buttons (Overlay) -->
				{#each rows as row (row)}
					<div class="trash-cell">
						{#if activeRow === row}
							<button
								class="trash-btn"
								onclick={() => handleRemoveRow(row)}
								transition:fly={{ x: 5, duration: 150 }}
								title="Remove Row {row + 1}"
							>
								<Trash2 size={14} />
							</button>
						{/if}
					</div>
				{/each}
			</div>
		</div>
	{/if}

	<!-- The Grid -->
	<div class="grid-center">
		<Grid
			game={builder.game}
			isBuilder={true}
			selectedActor={builder.selectedActor}
			onCellClick={(pos) => builder.handleCellClick(pos)}
			onCellHover={(pos) => {
				if (isGridMode) {
					builder.hoveredGridPosition = pos;
				}
			}}
			onRotateStart={() => builder.rotateStartActor()}
			onActorDrop={() => builder.selectActor(null)}
			onActorSelect={(actor) => builder.selectActor(actor)}
			onInteractionEnd={() => builder.endInteraction()}
		/>

		{#if selectedNumberValue !== null}
			<div
				class="number-editor"
				transition:fade={{ duration: 150 }}
				role="group"
				aria-label="Edit number item value"
				data-testid="builder-number-editor"
			>
				<div class="number-editor-title">
					<Hash size={18} />
					<span>Number</span>
				</div>
				<div class="number-editor-controls">
					<button
						class="number-editor-btn"
						onclick={() => setNumberValue(selectedNumberValue - 1)}
						disabled={selectedNumberValue <= BUILDER_NUMBER_ITEM_MIN}
						aria-label="Decrease number value"
					>
						−
					</button>
					<output class="number-editor-value" aria-label="Number value">
						{selectedNumberValue}
					</output>
					<button
						class="number-editor-btn"
						onclick={() => setNumberValue(selectedNumberValue + 1)}
						disabled={selectedNumberValue >= BUILDER_NUMBER_ITEM_MAX}
						aria-label="Increase number value"
					>
						+
					</button>
				</div>
			</div>
		{/if}

		{#if !isGridMode}
			<div class="grid-overlay-hint" transition:fade>
				<!-- Optional: Hint that grid is editable via tool -->
			</div>
		{/if}
	</div>

	{#if isGridMode}
		<!-- Right Controls (Add Only) -->
		<div class="control-area right" transition:fade>
			<button class="add-btn" onclick={() => builder.addColumn('right')} title="Add Column Right">
				<Plus size={16} />
			</button>
		</div>

		<!-- Bottom Controls (Add Only) -->
		<div class="control-area bottom" transition:fade>
			<button class="add-btn" onclick={() => builder.addRow('bottom')} title="Add Row Bottom">
				<Plus size={16} />
			</button>
		</div>
	{/if}
</div>

<style>
	.builder-grid-wrapper {
		display: grid;
		grid-template-columns: auto 1fr auto;
		grid-template-rows: auto 1fr auto;
		gap: var(--size-2);
		align-items: center;
		justify-items: center;
		padding: var(--size-4);
		transition: gap 0.3s;
	}

	.builder-grid-wrapper:not(.grid-mode) {
		gap: 0;
		padding: var(--size-2);
	}

	.grid-center {
		grid-column: 2;
		grid-row: 2;
		width: 100%;
		height: 100%;
		position: relative;
	}

	.number-editor {
		position: absolute;
		left: 50%;
		bottom: var(--size-3);
		transform: translateX(-50%);
		z-index: 40;
		display: flex;
		align-items: center;
		gap: var(--size-3);
		padding: var(--size-2) var(--size-3);
		border-radius: var(--radius-round);
		background: light-dark(rgba(255, 255, 255, 0.92), rgba(18, 18, 18, 0.9));
		border: 1px solid color-mix(in srgb, var(--blue-5), transparent 40%);
		box-shadow: var(--shadow-4);
		backdrop-filter: blur(10px);
		-webkit-backdrop-filter: blur(10px);
	}

	.number-editor-title,
	.number-editor-controls {
		display: flex;
		align-items: center;
	}

	.number-editor-title {
		gap: var(--size-1);
		font-size: var(--font-size-0);
		font-weight: 800;
		color: var(--blue-7);
		white-space: nowrap;
	}

	.number-editor-controls {
		gap: var(--size-2);
	}

	.number-editor-btn {
		width: var(--touch-target-min);
		height: var(--touch-target-min);
		border-radius: var(--radius-round);
		border: 1px solid var(--surface-3);
		background: var(--surface-2);
		color: var(--text-1);
		font-size: var(--font-size-3);
		font-weight: 900;
		line-height: 1;
		cursor: pointer;
		display: grid;
		place-items: center;
		padding: 0;
	}

	.number-editor-btn:hover:not(:disabled) {
		background: var(--blue-2);
		border-color: var(--blue-5);
		color: var(--blue-8);
	}

	.number-editor-btn:disabled {
		opacity: 0.42;
		cursor: not-allowed;
	}

	.number-editor-value {
		min-width: 34px;
		font-family: var(--font-mono);
		font-size: var(--font-size-4);
		font-weight: 900;
		line-height: 1;
		text-align: center;
		color: var(--text-1);
	}

	.control-area {
		display: flex;
		align-items: center;
		justify-content: center;
		position: relative;
	}

	.control-area.top {
		grid-column: 2;
		grid-row: 1;
		width: 100%;
		padding-bottom: var(--size-1);
	}

	.control-area.bottom {
		grid-column: 2;
		grid-row: 3;
		width: 100%;
		padding-top: var(--size-1);
	}

	.control-area.left {
		grid-column: 1;
		grid-row: 2;
		height: 100%;
		padding-right: var(--size-1);
	}

	.control-area.right {
		grid-column: 3;
		grid-row: 2;
		height: 100%;
		padding-left: var(--size-1);
	}

	/* Control Tracks (Container for Trash + Add) */
	.control-track {
		display: grid;
		position: relative;
		width: 100%;
		height: 100%;
	}

	.control-track.horizontal {
		grid-template-columns: repeat(var(--cols), 1fr);
		gap: var(--size-2); /* Match Grid gap */
		padding: 0 var(--size-3); /* Match Grid padding */
	}

	.control-track.vertical {
		grid-template-rows: repeat(var(--rows), 1fr);
		gap: var(--size-2); /* Match Grid gap */
		padding: var(--size-3) 0; /* Match Grid padding */
	}

	/* Add Button Container (Centered Behind) */
	.add-btn-container {
		position: absolute;
		inset: 0;
		display: flex;
		align-items: center;
		justify-content: center;
		pointer-events: none; /* Let clicks pass through to trash if needed, but button itself has pointer-events: auto */
		z-index: 0;
	}

	.add-btn {
		width: var(--touch-target-min);
		height: var(--touch-target-min);
		border-radius: 50%;
		border: 1px solid var(--surface-3);
		background-color: var(--surface-2);
		color: var(--text-2);
		display: grid;
		place-items: center;
		cursor: pointer;
		transition: all 0.2s;
		padding: 0;
		pointer-events: auto; /* Re-enable clicks */
		box-shadow: var(--shadow-1);
	}

	.add-btn:hover {
		background-color: var(--brand);
		color: white;
		border-color: var(--brand);
		transform: scale(1.1);
	}

	/* Trash Cells */
	.trash-cell {
		display: grid;
		place-items: center;
		width: 100%;
		height: 100%;
		min-width: var(--touch-target-min);
		min-height: var(--touch-target-min);
		z-index: 1; /* Above Add Button */
	}

	.trash-btn {
		width: var(--touch-target-min);
		height: var(--touch-target-min);
		border-radius: 50%;
		background-color: var(--red-1);
		color: var(--red-7);
		border: 1px solid var(--red-3);
		display: grid;
		place-items: center;
		cursor: pointer;
		padding: 0;
		transition: all 0.2s;
		box-shadow: var(--shadow-2);
	}

	.trash-btn:hover {
		background-color: var(--red-6);
		color: white;
		transform: scale(1.1);
	}
</style>
