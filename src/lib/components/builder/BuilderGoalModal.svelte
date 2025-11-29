<script lang="ts">
	import type { BuilderModel } from '$lib/game/builder-model.svelte';
	import { Star, Play } from 'lucide-svelte';
	import { Stack } from '$lib';

	interface Props {
		builder: BuilderModel;
		onClose: () => void;
	}

	let { builder, onClose }: Props = $props();
</script>

<div class="overlay goal">
	<div class="modal">
		<Stack gap="var(--size-4)" align="center">
			<div class="icon-wrapper">
				<Star size={48} color="var(--yellow-7)" fill="var(--yellow-4)" />
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
				<div class="hint-row">
					<span>Par:</span>
					<input
						type="number"
						class="par-input"
						bind:value={builder.level.solutionPar}
						min="1"
						max="99"
						title="Target number of blocks for 3 stars"
					/>
					<span>blocks</span>

					<span class="separator">•</span>

					<span>Limit:</span>
					<input
						type="number"
						class="par-input"
						bind:value={builder.level.maxBlocks}
						min="1"
						max="50"
						title="Maximum blocks allowed in the workspace"
					/>
					<span>blocks</span>
				</div>

				<div class="hint-row">
					<span>Grid:</span>
					<input
						type="number"
						class="par-input"
						bind:value={builder.level.gridSize.width}
						min="3"
						max="10"
						onchange={() => builder.syncGame()}
						title="Grid Width"
					/>
					<span>x</span>
					<input
						type="number"
						class="par-input"
						bind:value={builder.level.gridSize.height}
						min="3"
						max="10"
						onchange={() => builder.syncGame()}
						title="Grid Height"
					/>
				</div>

				<div class="hint-row">
					<span>Biome:</span>
					<select
						class="biome-select"
						bind:value={builder.level.defaultTerrain}
						onchange={() => builder.syncGame()}
					>
						<option value="grass">Grass</option>
						<option value="sand">Sand</option>
						<option value="snow">Snow</option>
						<option value="forest">Forest</option>
						<option value="dirt">Dirt</option>
					</select>
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
		background-color: var(--yellow-1);
		padding: var(--size-4);
		border-radius: var(--radius-round);
		display: inline-flex;
		border: 2px solid var(--yellow-3);
	}

	.content {
		display: flex;
		flex-direction: column;
		gap: var(--size-2);
		width: 100%;
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

	.hint-row {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: var(--size-2);
		font-size: var(--font-size-1);
		color: var(--text-3);
		margin-top: var(--size-2);
	}

	.separator {
		color: var(--text-3);
		font-weight: bold;
	}

	.par-input {
		width: 3em;
		text-align: center;
		font-weight: bold;
		border: 1px solid var(--surface-3);
		border-radius: var(--radius-1);
		padding: var(--size-1);
		background-color: var(--surface-1);
	}

	.biome-select {
		background-color: var(--surface-1);
		border: 1px solid var(--surface-3);
		color: var(--text-1);
		padding: var(--size-1) var(--size-2);
		border-radius: var(--radius-1);
		font-size: var(--font-size-1);
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
		background-color: var(--indigo-6);
	}

	.btn-primary:active {
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
