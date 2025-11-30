<script lang="ts">
	import type { LevelPack } from '$lib/game/schema';
	import { Book, Flame, Star, Zap, Heart, Trophy, Edit2 } from 'lucide-svelte';

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
		{
			id: 'book',
			icon: Book,
			label: 'Book',
			color: 'var(--blue-7)',
			bg: 'linear-gradient(135deg, var(--blue-2), var(--blue-1))'
		},
		{
			id: 'flame',
			icon: Flame,
			label: 'Flame',
			color: 'var(--red-7)',
			bg: 'linear-gradient(135deg, var(--orange-2), var(--red-1))'
		},
		{
			id: 'star',
			icon: Star,
			label: 'Star',
			color: 'var(--yellow-7)',
			bg: 'linear-gradient(135deg, var(--yellow-2), var(--orange-1))'
		},
		{
			id: 'zap',
			icon: Zap,
			label: 'Zap',
			color: 'var(--violet-7)',
			bg: 'linear-gradient(135deg, var(--violet-2), var(--indigo-1))'
		},
		{
			id: 'heart',
			icon: Heart,
			label: 'Heart',
			color: 'var(--pink-7)',
			bg: 'linear-gradient(135deg, var(--pink-2), var(--red-1))'
		},
		{
			id: 'trophy',
			icon: Trophy,
			label: 'Trophy',
			color: 'var(--teal-7)',
			bg: 'linear-gradient(135deg, var(--teal-2), var(--green-1))'
		}
	];

	const DIFFICULTIES = ['beginner', 'intermediate', 'advanced'];

	const currentIcon = $derived(ICONS.find((i) => i.id === coverImage) || ICONS[0]);
	const IconComponent = $derived(currentIcon.icon);

	function update() {
		onChange({
			name,
			description,
			coverImage,
			difficulty
		});
	}

	function cycleDifficulty() {
		const idx = DIFFICULTIES.indexOf(difficulty);
		difficulty = DIFFICULTIES[(idx + 1) % DIFFICULTIES.length] as
			| 'beginner'
			| 'intermediate'
			| 'advanced';
		update();
	}
</script>

<div class="pack-card-editor">
	<div class="cover" style:background={currentIcon.bg} style:color={currentIcon.color}>
		<button class="icon-trigger" popovertarget="icon-picker" title="Change Icon">
			<IconComponent size={48} strokeWidth={1.5} />
			<div class="edit-hint"><Edit2 size={16} /></div>
		</button>

		<div id="icon-picker" popover="auto" class="icon-popover">
			<div class="icon-grid">
				{#each ICONS as { id, icon: Icon, label, color, bg }}
					<button
						class="icon-option"
						class:selected={coverImage === id}
						style:background={bg}
						style:color
						onclick={(e) => {
							coverImage = id;
							update();
							e.currentTarget.closest('[popover]')?.hidePopover();
						}}
						title={label}
					>
						<Icon size={24} />
					</button>
				{/each}
			</div>
		</div>

		<button class="difficulty-badge" onclick={cycleDifficulty} title="Change Difficulty">
			{difficulty}
		</button>
	</div>

	<div class="content">
		<div class="header">
			<input
				type="text"
				class="title-input"
				bind:value={name}
				oninput={update}
				placeholder="Pack Name"
			/>
			<div class="meta">
				<span class="level-count">{pack.levels.length} Levels</span>
			</div>
		</div>

		<textarea
			class="description-input"
			bind:value={description}
			oninput={update}
			placeholder="Enter a description..."
			rows="3"
		></textarea>
	</div>
</div>

<style>
	.pack-card-editor {
		display: flex;
		flex-direction: column;
		background-color: var(--surface-1);
		border: 1px solid var(--surface-3);
		border-radius: var(--radius-3);
		overflow: hidden;
		text-align: left;
		width: 100%;
		box-shadow: var(--shadow-2);
	}

	.cover {
		height: 160px;
		display: grid;
		place-items: center;
		position: relative;
		transition: background 0.3s;
	}

	.icon-trigger {
		background: none;
		border: none;
		cursor: pointer;
		color: inherit;
		position: relative;
		padding: var(--size-4);
		border-radius: var(--radius-round);
		transition: transform 0.2s;
	}

	.icon-trigger:hover {
		transform: scale(1.1);
		background-color: rgba(255, 255, 255, 0.2);
	}

	.edit-hint {
		position: absolute;
		bottom: 0;
		right: 0;
		background-color: var(--surface-1);
		color: var(--text-1);
		padding: 4px;
		border-radius: 50%;
		box-shadow: var(--shadow-2);
		opacity: 0;
		transition: opacity 0.2s;
	}

	.icon-trigger:hover .edit-hint {
		opacity: 1;
	}

	.difficulty-badge {
		position: absolute;
		top: var(--size-3);
		right: var(--size-3);
		font-size: var(--font-size-0);
		font-weight: 700;
		text-transform: uppercase;
		padding: 4px 12px;
		border-radius: var(--radius-pill);
		background-color: rgba(255, 255, 255, 0.9);
		color: var(--text-1);
		box-shadow: var(--shadow-1);
		border: none;
		cursor: pointer;
		transition: transform 0.1s;
	}

	.difficulty-badge:hover {
		transform: scale(1.05);
		background-color: white;
	}

	.content {
		padding: var(--size-4);
		display: flex;
		flex-direction: column;
		gap: var(--size-3);
	}

	.header {
		display: flex;
		flex-direction: column;
		gap: var(--size-1);
	}

	.title-input {
		font-size: var(--font-size-3);
		font-weight: 800;
		color: var(--text-1);
		background: transparent;
		border: 1px solid transparent;
		border-radius: var(--radius-2);
		padding: var(--size-1);
		width: 100%;
	}

	.title-input:hover,
	.title-input:focus {
		background-color: var(--surface-2);
		border-color: var(--surface-3);
	}

	.meta {
		font-size: var(--font-size-0);
		color: var(--text-3);
		font-weight: 600;
		padding-left: var(--size-1);
	}

	.description-input {
		font-size: var(--font-size-1);
		color: var(--text-2);
		background: transparent;
		border: 1px solid transparent;
		border-radius: var(--radius-2);
		padding: var(--size-1);
		width: 100%;
		resize: none;
		font-family: inherit;
		line-height: 1.5;
	}

	.description-input:hover,
	.description-input:focus {
		background-color: var(--surface-2);
		border-color: var(--surface-3);
	}

	/* Popover Styles */
	.icon-popover {
		margin: 0;
		inset: auto;
		position: fixed;
		padding: var(--size-3);
		background: var(--surface-1);
		border: 1px solid var(--surface-3);
		border-radius: var(--radius-3);
		box-shadow: var(--shadow-5);
		display: none;
	}

	.icon-popover:popover-open {
		display: block;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
	}

	.icon-grid {
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		gap: var(--size-2);
	}

	.icon-option {
		width: 48px;
		height: 48px;
		border-radius: var(--radius-2);
		border: 2px solid transparent;
		cursor: pointer;
		display: grid;
		place-items: center;
		transition: transform 0.1s;
	}

	.icon-option:hover {
		transform: scale(1.1);
	}

	.icon-option.selected {
		border-color: var(--text-1);
		transform: scale(1.1);
	}
</style>
