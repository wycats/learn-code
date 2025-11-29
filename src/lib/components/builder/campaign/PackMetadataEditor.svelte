<script lang="ts">
	import type { LevelPack } from '$lib/game/schema';
	import { Book, Flame, Star, Zap, Heart, Trophy } from 'lucide-svelte';

	interface Props {
		pack: LevelPack;
		onChange: (data: Partial<LevelPack>) => void;
	}

	let { pack, onChange }: Props = $props();

	let name = $state(pack.name);
	let description = $state(pack.description || '');
	let coverImage = $state(pack.coverImage || 'book');
	let difficulty = $state(pack.difficulty);

	const ICONS = [
		{ id: 'book', icon: Book, label: 'Book' },
		{ id: 'flame', icon: Flame, label: 'Flame' },
		{ id: 'star', icon: Star, label: 'Star' },
		{ id: 'zap', icon: Zap, label: 'Zap' },
		{ id: 'heart', icon: Heart, label: 'Heart' },
		{ id: 'trophy', icon: Trophy, label: 'Trophy' }
	];

	function update() {
		onChange({
			name,
			description,
			coverImage,
			difficulty
		});
	}
</script>

<div class="metadata-editor">
	<div class="form-group">
		<label for="pack-name">Campaign Name</label>
		<input 
			id="pack-name" 
			type="text" 
			bind:value={name} 
			oninput={update} 
			placeholder="My Awesome Campaign"
		/>
	</div>

	<div class="form-group">
		<label for="pack-desc">Description</label>
		<textarea 
			id="pack-desc" 
			bind:value={description} 
			oninput={update} 
			placeholder="What is this campaign about?"
			rows="3"
		></textarea>
	</div>

	<div class="row">
		<div class="form-group">
			<label>Cover Icon</label>
			<div class="icon-grid">
				{#each ICONS as { id, icon: Icon, label }}
					<button 
						class="icon-btn" 
						class:selected={coverImage === id}
						onclick={() => { coverImage = id; update(); }}
						title={label}
					>
						<Icon size={24} />
					</button>
				{/each}
			</div>
		</div>

		<div class="form-group">
			<label for="pack-diff">Difficulty</label>
			<select id="pack-diff" bind:value={difficulty} onchange={update}>
				<option value="beginner">Beginner</option>
				<option value="intermediate">Intermediate</option>
				<option value="advanced">Advanced</option>
			</select>
		</div>
	</div>
</div>

<style>
	.metadata-editor {
		display: flex;
		flex-direction: column;
		gap: var(--size-4);
		background-color: var(--surface-1);
		padding: var(--size-4);
		border-radius: var(--radius-3);
		border: 1px solid var(--surface-3);
	}

	.form-group {
		display: flex;
		flex-direction: column;
		gap: var(--size-2);
	}

	label {
		font-size: var(--font-size-1);
		font-weight: 700;
		color: var(--text-2);
		text-transform: uppercase;
		letter-spacing: 0.05em;
	}

	input, textarea, select {
		padding: var(--size-2) var(--size-3);
		border: 1px solid var(--surface-3);
		border-radius: var(--radius-2);
		background-color: var(--surface-2);
		color: var(--text-1);
		font-family: inherit;
		font-size: var(--font-size-1);
	}

	input:focus, textarea:focus, select:focus {
		outline: 2px solid var(--brand);
		border-color: transparent;
	}

	.row {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: var(--size-4);
	}

	.icon-grid {
		display: flex;
		gap: var(--size-2);
		flex-wrap: wrap;
	}

	.icon-btn {
		width: 40px;
		height: 40px;
		display: grid;
		place-items: center;
		border: 1px solid var(--surface-3);
		border-radius: var(--radius-2);
		background-color: var(--surface-2);
		color: var(--text-2);
		cursor: pointer;
		transition: all 0.2s;
	}

	.icon-btn:hover {
		background-color: var(--surface-3);
		color: var(--text-1);
	}

	.icon-btn.selected {
		background-color: var(--brand);
		color: white;
		border-color: var(--brand);
	}
</style>
