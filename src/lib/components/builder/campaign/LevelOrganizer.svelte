<script lang="ts">
	import type { LevelDefinition } from '$lib/game/schema';
	import { Plus, Trash2, ArrowUp, ArrowDown, Edit, Play } from 'lucide-svelte';

	interface Props {
		levels: LevelDefinition[];
		onUpdate: (levels: LevelDefinition[]) => void;
		onEditLevel: (levelId: string) => void;
		onPlayLevel: (levelId: string) => void;
	}

	let { levels, onUpdate, onEditLevel, onPlayLevel }: Props = $props();

	function moveLevel(index: number, direction: -1 | 1) {
		if (index + direction < 0 || index + direction >= levels.length) return;
		
		const newLevels = [...levels];
		const temp = newLevels[index];
		newLevels[index] = newLevels[index + direction];
		newLevels[index + direction] = temp;
		
		onUpdate(newLevels);
	}

	function deleteLevel(index: number) {
		if (!confirm('Are you sure you want to delete this level?')) return;
		const newLevels = levels.filter((_, i) => i !== index);
		onUpdate(newLevels);
	}

	function addLevel() {
		// Create a basic new level
		const newLevel: LevelDefinition = {
			id: crypto.randomUUID(),
			name: `Level ${levels.length + 1}`,
			gridSize: { width: 5, height: 5 },
			start: { x: 0, y: 0 },
			startOrientation: 'E',
			goal: { x: 4, y: 4 },
			layout: {},
			availableBlocks: {
				'move-forward': 'unlimited',
				'turn-left': 'unlimited',
				'turn-right': 'unlimited'
			},
			intro: [],
			outro: []
		};
		
		onUpdate([...levels, newLevel]);
	}
</script>

<div class="level-organizer">
	<div class="header">
		<h3>Levels ({levels.length})</h3>
		<button class="add-btn" onclick={addLevel}>
			<Plus size={16} /> Add Level
		</button>
	</div>

	<div class="level-list">
		{#each levels as level, i}
			<div class="level-item">
				<div class="level-info">
					<span class="level-number">{i + 1}</span>
					<span class="level-name">{level.name}</span>
				</div>

				<div class="actions">
					<button 
						class="icon-btn" 
						onclick={() => onPlayLevel(level.id)}
						title="Play Level"
					>
						<Play size={16} />
					</button>
					<button 
						class="icon-btn" 
						onclick={() => onEditLevel(level.id)}
						title="Edit Level"
					>
						<Edit size={16} />
					</button>
					
					<div class="divider"></div>

					<button 
						class="icon-btn" 
						disabled={i === 0}
						onclick={() => moveLevel(i, -1)}
						title="Move Up"
					>
						<ArrowUp size={16} />
					</button>
					<button 
						class="icon-btn" 
						disabled={i === levels.length - 1}
						onclick={() => moveLevel(i, 1)}
						title="Move Down"
					>
						<ArrowDown size={16} />
					</button>
					
					<div class="divider"></div>

					<button 
						class="icon-btn danger" 
						onclick={() => deleteLevel(i)}
						title="Delete Level"
					>
						<Trash2 size={16} />
					</button>
				</div>
			</div>
		{/each}

		{#if levels.length === 0}
			<div class="empty-state">
				<p>No levels yet. Add one to get started!</p>
			</div>
		{/if}
	</div>
</div>

<style>
	.level-organizer {
		display: flex;
		flex-direction: column;
		gap: var(--size-4);
		background-color: var(--surface-1);
		padding: var(--size-4);
		border-radius: var(--radius-3);
		border: 1px solid var(--surface-3);
	}

	.header {
		display: flex;
		justify-content: space-between;
		align-items: center;
	}

	h3 {
		font-size: var(--font-size-2);
		font-weight: 700;
		margin: 0;
		color: var(--text-1);
		text-transform: uppercase;
		letter-spacing: 0.05em;
	}

	.add-btn {
		background-color: var(--brand);
		color: white;
		border: none;
		padding: var(--size-1) var(--size-3);
		border-radius: var(--radius-2);
		font-weight: 600;
		font-size: var(--font-size-1);
		cursor: pointer;
		display: flex;
		align-items: center;
		gap: var(--size-2);
	}

	.level-list {
		display: flex;
		flex-direction: column;
		gap: var(--size-2);
	}

	.level-item {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: var(--size-3);
		background-color: var(--surface-2);
		border-radius: var(--radius-2);
		border: 1px solid var(--surface-3);
	}

	.level-info {
		display: flex;
		align-items: center;
		gap: var(--size-3);
	}

	.level-number {
		background-color: var(--surface-3);
		color: var(--text-2);
		font-weight: 700;
		width: 24px;
		height: 24px;
		display: grid;
		place-items: center;
		border-radius: var(--radius-round);
		font-size: var(--font-size-0);
	}

	.level-name {
		font-weight: 600;
		color: var(--text-1);
	}

	.actions {
		display: flex;
		align-items: center;
		gap: var(--size-1);
	}

	.icon-btn {
		background: none;
		border: none;
		color: var(--text-2);
		padding: var(--size-2);
		border-radius: var(--radius-2);
		cursor: pointer;
		display: grid;
		place-items: center;
	}

	.icon-btn:hover:not(:disabled) {
		background-color: var(--surface-3);
		color: var(--text-1);
	}

	.icon-btn:disabled {
		opacity: 0.3;
		cursor: not-allowed;
	}

	.icon-btn.danger:hover {
		background-color: var(--red-1);
		color: var(--red-7);
	}

	.divider {
		width: 1px;
		height: 20px;
		background-color: var(--surface-3);
		margin: 0 var(--size-1);
	}

	.empty-state {
		text-align: center;
		padding: var(--size-6);
		color: var(--text-2);
		font-style: italic;
	}
</style>
