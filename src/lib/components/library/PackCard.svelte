<script lang="ts">
	import type { LevelPack } from '$lib/game/schema';
	import type { PackProgress } from '$lib/game/progress';
	import { Book, Flame, Save } from 'lucide-svelte';
	import { fileSystem } from '$lib/services/file-system';

	interface Props {
		pack: LevelPack;
		progress?: PackProgress;
		onClick: () => void;
		onSave?: () => void;
	}

	let { pack, progress, onClick, onSave }: Props = $props();

	const completedCount = $derived(
		progress ? Object.values(progress.levels).filter((l) => l.completed).length : 0
	);
	const totalLevels = $derived(pack.levels.length);
	const percent = $derived(Math.round((completedCount / totalLevels) * 100));

	const Icon = $derived(pack.coverImage === 'flame' ? Flame : Book);
	const isFileSystemSupported = fileSystem.isSupported;

	function handleSave(e: MouseEvent) {
		e.stopPropagation();
		onSave?.();
	}
</script>

<!-- svelte-ignore a11y_click_events_have_key_events -->
<!-- svelte-ignore a11y_no_static_element_interactions -->
<div class="pack-card" onclick={onClick}>
	<div class="cover" data-cover={pack.coverImage || 'book'}>
		<div class="icon-wrapper">
			<Icon size={48} strokeWidth={1.5} />
		</div>
		<div class="difficulty-badge" data-difficulty={pack.difficulty}>
			{pack.difficulty}
		</div>
		{#if isFileSystemSupported && onSave}
			<button class="save-btn" onclick={handleSave} title="Save to Disk">
				<Save size={16} />
			</button>
		{/if}
	</div>

	<div class="content">
		<div class="header">
			<h3>{pack.name}</h3>
			<div class="meta">
				<span class="level-count">{totalLevels} Levels</span>
			</div>
		</div>

		<p class="description">{pack.description}</p>

		{#if progress}
			<div class="progress-section">
				<div class="progress-bar">
					<div class="fill" style:width="{percent}%"></div>
				</div>
				<span class="percent">{percent}% Complete</span>
			</div>
		{/if}
	</div>
</div>

<style>
	.pack-card {
		display: flex;
		flex-direction: column;
		background-color: var(--surface-1);
		border: 1px solid var(--surface-3);
		border-radius: var(--radius-3);
		overflow: hidden;
		text-align: left;
		cursor: pointer;
		transition: all 0.2s var(--ease-3);
		padding: 0;
		width: 100%;
		height: 100%;
	}

	.pack-card:hover {
		transform: translateY(-4px);
		box-shadow: var(--shadow-4);
		border-color: var(--brand);
	}

	.cover {
		height: 140px;
		background-color: var(--surface-2);
		display: grid;
		place-items: center;
		position: relative;
		color: var(--text-2);
	}

	.cover[data-cover='book'] {
		background: linear-gradient(135deg, var(--blue-2), var(--blue-1));
		color: var(--blue-7);
	}

	.cover[data-cover='flame'] {
		background: linear-gradient(135deg, var(--orange-2), var(--red-1));
		color: var(--red-7);
	}

	.difficulty-badge {
		position: absolute;
		top: var(--size-2);
		right: var(--size-2);
		font-size: var(--font-size-0);
		font-weight: 700;
		text-transform: uppercase;
		padding: 2px 8px;
		border-radius: var(--radius-pill);
		background-color: rgba(255, 255, 255, 0.9);
		color: var(--text-1);
		box-shadow: var(--shadow-1);
	}

	.save-btn {
		position: absolute;
		top: var(--size-2);
		left: var(--size-2);
		background-color: rgba(255, 255, 255, 0.9);
		color: var(--text-2);
		border: none;
		border-radius: 50%;
		width: 28px;
		height: 28px;
		display: grid;
		place-items: center;
		cursor: pointer;
		box-shadow: var(--shadow-1);
		transition: all 0.2s;
	}

	.save-btn:hover {
		background-color: white;
		color: var(--brand);
		transform: scale(1.1);
	}

	.content {
		padding: var(--size-4);
		display: flex;
		flex-direction: column;
		gap: var(--size-3);
		flex: 1;
	}

	.header h3 {
		font-size: var(--font-size-3);
		font-weight: 800;
		margin: 0;
		color: var(--text-1);
	}

	.meta {
		font-size: var(--font-size-0);
		color: var(--text-3);
		font-weight: 600;
	}

	.description {
		font-size: var(--font-size-1);
		color: var(--text-2);
		margin: 0;
		line-height: 1.4;
		display: -webkit-box;
		-webkit-line-clamp: 2;
		-webkit-box-orient: vertical;
		overflow: hidden;
	}

	.progress-section {
		margin-top: auto;
		display: flex;
		flex-direction: column;
		gap: var(--size-1);
	}

	.progress-bar {
		height: 6px;
		background-color: var(--surface-2);
		border-radius: var(--radius-pill);
		overflow: hidden;
	}

	.fill {
		height: 100%;
		background-color: var(--brand);
		border-radius: var(--radius-pill);
		transition: width 0.5s ease-out;
	}

	.percent {
		font-size: var(--font-size-0);
		color: var(--text-3);
		text-align: right;
	}
</style>
