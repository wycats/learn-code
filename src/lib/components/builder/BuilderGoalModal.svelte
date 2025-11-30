<script lang="ts">
	import type { BuilderModel } from '$lib/game/builder-model.svelte';
	import {
		Play,
		Camera,
		Flower,
		Sun,
		Snowflake,
		TreePine,
		Mountain,
		ChevronDown
	} from 'lucide-svelte';
	import { Stack } from '$lib';
	import { slide } from 'svelte/transition';
	import IconPicker from './IconPicker.svelte';

	interface Props {
		builder: BuilderModel;
		onClose: () => void;
	}

	let { builder, onClose }: Props = $props();
	let showBiomePicker = $state(false);
	let snapshotStatus = $state<'idle' | 'saved'>('idle');

	// Local state for constraints toggles
	let parEnabled = $state(!!builder.level.solutionPar);
	let maxBlocksEnabled = $state(!!builder.level.maxBlocks);

	// Sync local state to model
	$effect(() => {
		if (!parEnabled) {
			builder.level.solutionPar = undefined;
		} else if (!builder.level.solutionPar) {
			builder.level.solutionPar = 10; // Default
		}

		if (!maxBlocksEnabled) {
			builder.level.maxBlocks = undefined;
		} else if (!builder.level.maxBlocks) {
			builder.level.maxBlocks = 20; // Default
		}
	});

	// Validation: Ensure maxBlocks >= solutionPar if both are enabled
	$effect(() => {
		if (
			parEnabled &&
			maxBlocksEnabled &&
			builder.level.solutionPar &&
			builder.level.maxBlocks &&
			builder.level.maxBlocks < builder.level.solutionPar
		) {
			// Auto-adjust maxBlocks to be at least solutionPar
			builder.level.maxBlocks = builder.level.solutionPar;
		}
	});

	const BIOME_OPTIONS = [
		{ value: 'grass', icon: Flower, color: 'var(--green-5)', label: 'Grass' },
		{ value: 'sand', icon: Sun, color: 'var(--yellow-5)', label: 'Sand' },
		{ value: 'snow', icon: Snowflake, color: 'var(--blue-3)', label: 'Snow' },
		{ value: 'forest', icon: TreePine, color: 'var(--green-8)', label: 'Forest' },
		{ value: 'dirt', icon: Mountain, color: 'var(--stone-6)', label: 'Dirt' }
	];

	const currentBiome = $derived(
		BIOME_OPTIONS.find((b) => b.value === builder.level.defaultTerrain) || BIOME_OPTIONS[0]
	);

	const DIFFICULTY_OPTIONS = [
		{ value: 'beginner', label: 'Beginner' },
		{ value: 'intermediate', label: 'Intermediate' },
		{ value: 'advanced', label: 'Advanced' }
	];

	function selectBiome(value: string) {
		builder.level.defaultTerrain = value;
		builder.syncGame();
		showBiomePicker = false;
	}

	function toggleDifficulty() {
		const current = builder.level.difficulty || 'beginner';
		const currentIndex = DIFFICULTY_OPTIONS.findIndex((o) => o.value === current);
		const nextIndex = (currentIndex + 1) % DIFFICULTY_OPTIONS.length;
		builder.level.difficulty = DIFFICULTY_OPTIONS[nextIndex].value as
			| 'beginner'
			| 'intermediate'
			| 'advanced';
	}

	function handleSnapshot() {
		builder.snapshotTray();
		snapshotStatus = 'saved';
		setTimeout(() => {
			snapshotStatus = 'idle';
		}, 2000);
	}
</script>

<div class="overlay goal">
	<div class="modal">
		<Stack gap="var(--size-4)" align="center">
			<div class="icon-wrapper">
				<IconPicker
					value={builder.level.icon}
					onChange={(icon) => {
						builder.level.icon = icon;
						builder.syncGame();
					}}
				/>
			</div>
			<div class="content">
				<input
					type="text"
					class="title-input"
					bind:value={builder.level.name}
					placeholder="Level Name"
				/>
				<textarea
					class="description-input"
					bind:value={builder.level.description}
					placeholder="Enter a short description or instruction for the level..."
					rows="2"
				></textarea>

				<div class="settings-grid">
					<div class="setting-item">
						<div class="picker-wrapper">
							<button class="difficulty-badge" onclick={toggleDifficulty}>
								{builder.level.difficulty || 'beginner'}
							</button>
						</div>
					</div>

					<div class="setting-item">
						<div class="picker-wrapper">
							<button
								class="biome-trigger"
								onclick={() => (showBiomePicker = !showBiomePicker)}
								style:--biome-color={currentBiome.color}
							>
								<currentBiome.icon size={16} />
								<span>{currentBiome.label}</span>
								<span class="chevron">
									<ChevronDown size={14} />
								</span>
							</button>

							{#if showBiomePicker}
								<div class="popover" transition:slide={{ duration: 200 }}>
									{#each BIOME_OPTIONS as option (option.value)}
										<button
											class="option"
											class:selected={option.value === builder.level.defaultTerrain}
											onclick={() => selectBiome(option.value)}
											style:--option-color={option.color}
										>
											<option.icon size={16} />
											<span>{option.label}</span>
										</button>
									{/each}
								</div>
							{/if}
						</div>
					</div>

					<div class="constraints">
						<div class="constraint-line">
							<input type="checkbox" bind:checked={parEnabled} id="par-toggle" />
							<label for="par-toggle" class:disabled={!parEnabled}>
								Solve in
								<div class="inline-edit" class:disabled={!parEnabled}>
									<input
										type="number"
										bind:value={builder.level.solutionPar}
										min="1"
										max="99"
										disabled={!parEnabled}
										title="Target number of blocks for 3 stars"
									/>
								</div>
								blocks
							</label>
						</div>

						<div class="constraint-line">
							<input type="checkbox" bind:checked={maxBlocksEnabled} id="max-toggle" />
							<label for="max-toggle" class:disabled={!maxBlocksEnabled}>
								Max
								<div class="inline-edit" class:disabled={!maxBlocksEnabled}>
									<input
										type="number"
										bind:value={builder.level.maxBlocks}
										min={parEnabled ? builder.level.solutionPar : 1}
										max="50"
										disabled={!maxBlocksEnabled}
										title="Maximum blocks allowed in the workspace"
									/>
								</div>
								blocks allowed
							</label>
						</div>
					</div>
				</div>

				<div class="hint-row">
					<div class="starting-code-section">
						<button class="btn-secondary" onclick={handleSnapshot}>
							<Camera size={20} />
							{snapshotStatus === 'saved' ? 'Saved!' : 'Use Current Workspace as Starting Code'}
						</button>
					</div>
				</div>
			</div>
			<button class="btn-primary" onclick={onClose}>
				<Play size={16} fill="currentColor" /> Done
			</button>
		</Stack>
	</div>
</div>

<style>
	.overlay {
		position: absolute;
		inset: 0;
		background-color: rgba(255, 255, 255, 0.5);
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		color: white;
		border-radius: var(--radius-3);
		backdrop-filter: blur(8px);
		animation: fade-in 0.3s ease;
		z-index: 50;
	}

	.modal {
		background-color: var(--surface-1);
		color: var(--text-1);
		padding: var(--size-6);
		border-radius: var(--radius-3);
		box-shadow: var(--shadow-4);
		text-align: center;
		min-width: 350px;
		max-width: 90%;
	}

	.icon-wrapper {
		background-color: var(--surface-2);
		padding: var(--size-2);
		border-radius: var(--radius-2);
		display: inline-flex;
		border: 1px solid var(--surface-3);
	}

	.content {
		display: flex;
		flex-direction: column;
		gap: var(--size-4);
		width: 100%;
	}

	/* Difficulty Badge Style */
	.difficulty-badge {
		font-size: var(--font-size-0);
		font-weight: 700;
		text-transform: uppercase;
		padding: 4px 12px;
		border-radius: var(--radius-pill);
		background-color: white;
		color: var(--text-1);
		box-shadow: var(--shadow-1);
		border: none;
		cursor: pointer;
		transition: transform 0.1s;
	}

	.difficulty-badge:hover {
		transform: scale(1.05);
	}

	.difficulty-badge:active {
		transform: scale(0.95);
	}

	.title-input {
		font-size: var(--font-size-4);
		font-weight: bold;
		color: var(--text-1);
		text-align: center;
		border: 1px dashed transparent;
		background: transparent;
		padding: var(--size-1);
		border-radius: var(--radius-2);
		width: 100%;
	}

	.title-input:hover,
	.title-input:focus {
		border-color: var(--surface-3);
		background-color: var(--surface-2);
	}

	.description-input {
		font-size: var(--font-size-1);
		color: var(--text-2);
		text-align: center;
		border: 1px dashed transparent;
		background: transparent;
		padding: var(--size-1);
		border-radius: var(--radius-2);
		width: 100%;
		resize: none;
		font-family: inherit;
	}

	.description-input:hover,
	.description-input:focus {
		border-color: var(--surface-3);
		background-color: var(--surface-2);
	}

	.settings-grid {
		display: flex;
		flex-direction: column;
		gap: var(--size-2);
		align-items: center;
	}

	.setting-item {
		display: flex;
		align-items: center;
		gap: var(--size-2);
		font-size: var(--font-size-1);
		color: var(--text-2);
	}

	.constraints {
		display: flex;
		flex-direction: column;
		gap: var(--size-2);
		align-items: center;
		margin-top: var(--size-2);
		color: var(--text-2);
	}

	.constraint-line {
		display: flex;
		align-items: center;
		gap: var(--size-2);
		font-size: var(--font-size-1);
	}

	.constraint-line label {
		display: flex;
		align-items: center;
		gap: var(--size-2);
		cursor: pointer;
	}

	.constraint-line label.disabled {
		color: var(--text-3);
		cursor: default;
	}

	.inline-edit {
		display: flex;
		align-items: center;
		gap: var(--size-1);
		background-color: var(--surface-2);
		padding: 2px var(--size-2);
		border-radius: var(--radius-1);
		border: 1px solid transparent;
		transition: all 0.2s;
	}

	.inline-edit.disabled {
		background-color: transparent;
		border-color: var(--surface-2);
		opacity: 0.5;
	}

	.inline-edit:focus-within {
		background-color: var(--surface-1);
		border-color: var(--brand);
		box-shadow: 0 0 0 2px var(--brand-dim);
	}

	.inline-edit input {
		width: 2em;
		text-align: center;
		font-weight: bold;
		border: none;
		background: transparent;
		color: var(--text-1);
		padding: 0;
		font-size: var(--font-size-1);
	}

	.inline-edit input:focus {
		outline: none;
	}

	/* Pickers */
	.picker-wrapper {
		position: relative;
	}

	.biome-trigger {
		display: flex;
		align-items: center;
		gap: var(--size-2);
		background-color: var(--surface-2);
		border: 1px solid var(--surface-3);
		padding: var(--size-1) var(--size-2);
		border-radius: var(--radius-2);
		cursor: pointer;
		color: var(--text-1);
		font-size: var(--font-size-1);
		transition: all 0.2s;
		min-width: 120px;
	}

	.biome-trigger:hover {
		background-color: var(--surface-3);
	}

	.biome-trigger :global(svg) {
		color: var(--biome-color);
	}

	.chevron {
		margin-left: auto;
		color: var(--text-3);
		display: flex;
	}

	.popover {
		position: absolute;
		top: 100%;
		left: 50%;
		transform: translateX(-50%);
		background-color: var(--surface-1);
		border: 1px solid var(--surface-3);
		border-radius: var(--radius-2);
		box-shadow: var(--shadow-3);
		margin-top: var(--size-1);
		z-index: 10;
		overflow: hidden;
		display: flex;
		flex-direction: column;
		min-width: 140px;
	}

	.option {
		display: flex;
		align-items: center;
		gap: var(--size-2);
		padding: var(--size-2);
		border: none;
		background: none;
		cursor: pointer;
		color: var(--text-2);
		font-size: var(--font-size-1);
		text-align: left;
		transition: background 0.1s;
		white-space: nowrap;
	}

	.option:hover {
		background-color: var(--surface-2);
		color: var(--text-1);
	}

	.option.selected {
		background-color: var(--brand-dim);
		color: var(--brand);
		font-weight: 600;
	}

	.option :global(svg) {
		color: var(--option-color);
	}

	.hint-row {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: var(--size-2);
		font-size: var(--font-size-1);
		color: var(--text-3);
		margin-top: var(--size-2);
		width: 100%;
	}

	.starting-code-section {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: var(--size-2);
		background-color: var(--surface-2);
		padding: var(--size-3);
		border-radius: var(--radius-2);
		width: 100%;
	}

	.btn-primary {
		background-color: var(--indigo-5);
		color: white;
		padding: var(--size-3) var(--size-6);
		border-radius: var(--radius-round);
		font-weight: bold;
		font-size: var(--font-size-2);
		border: none;
		cursor: pointer;
		display: flex;
		align-items: center;
		gap: var(--size-2);
		transition: transform 0.1s;
	}

	.btn-primary:hover {
		background-color: var(--brand-dark);
	}

	.btn-primary:active {
		transform: scale(0.95);
	}

	.btn-secondary {
		background-color: var(--surface-2);
		color: var(--text-1);
		padding: var(--size-2) var(--size-4);
		border-radius: var(--radius-round);
		font-weight: bold;
		font-size: var(--font-size-1);
		border: 1px solid var(--surface-3);
		cursor: pointer;
		display: flex;
		align-items: center;
		gap: var(--size-2);
		transition: all 0.1s;
	}

	.btn-secondary:hover {
		background-color: var(--surface-3);
		border-color: var(--text-2);
	}

	.btn-secondary:active {
		transform: scale(0.95);
	}

	@keyframes fade-in {
		from {
			opacity: 0;
		}
		to {
			opacity: 1;
		}
	}
</style>
