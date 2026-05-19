<script lang="ts">
	import { PACKS } from '$lib/game/packs';
	import { ProgressService } from '$lib/game/progress';
	import { CampaignService } from '$lib/game/campaigns';
	import { fileSystem } from '$lib/services/file-system';
	import { localPacksStore } from '$lib/game/local-packs.svelte';
	import type { LevelPack } from '$lib/game/types';
	import CampaignShelf from '$lib/components/library/CampaignShelf.svelte';
	import { goto } from '$app/navigation';
	import { base } from '$app/paths';
	import { onMount } from 'svelte';
	import { Hammer, FolderOpen, Share2, Settings, Upload } from 'lucide-svelte';
	import { toast } from '$lib/stores/toast.svelte';
	import P2PModal from '$lib/components/builder/P2PModal.svelte';
	import ThemeToggle from '$lib/components/common/ThemeToggle.svelte';
	import SyncStatus from '$lib/components/common/SyncStatus.svelte';
	import type { PageData } from './$types';

	let { data } = $props<{ data: PageData }>();

	let progress = $state(ProgressService.load());
	let isFileSystemSupported = fileSystem.isSupported;
	let showP2PModal = $state(false);
	let p2pData = $state<unknown | undefined>(undefined);
	let p2pMode = $state<'send' | 'receive'>('receive');
	let customPacks = $state<LevelPack[]>([]);

	function handlePackSelect(packId: string) {
		// eslint-disable-next-line svelte/no-navigation-without-resolve
		goto(`${base}/library/${packId}`);
	}

	function handleSettings() {
		// eslint-disable-next-line svelte/no-navigation-without-resolve
		goto(`${base}/settings`);
	}

	function handleBuilder() {
		// eslint-disable-next-line svelte/no-navigation-without-resolve
		goto(`${base}/builder/packs`);
	}

	function handleImport() {
		// eslint-disable-next-line svelte/no-navigation-without-resolve
		goto(`${base}/import`);
	}

	async function handleOpenLocalFolder() {
		try {
			const root = await fileSystem.openDirectory();
			if (root) {
				const packEntries = await fileSystem.listPacksInDirectory(root);
				const loadedPacks = await Promise.all(
					packEntries.map((entry) => fileSystem.loadPackFromDisk(entry.handle))
				);

				// Update store
				localPacksStore.clear();
				loadedPacks.forEach((p) => localPacksStore.addPack(p));
				toast.success(`Loaded ${loadedPacks.length} packs from folder.`);
			}
		} catch (err) {
			console.error('Failed to open local folder:', err);
			toast.error('Could not open local folder. See console for details.');
		}
	}

	async function handleSavePackToDisk(pack: LevelPack) {
		try {
			await fileSystem.savePackToDisk($state.snapshot(pack));
			toast.success('Pack saved to disk!');
		} catch (err) {
			console.error('Failed to save pack:', err);
			toast.error('Failed to save pack.');
		}
	}

	function handleSharePack(pack: LevelPack) {
		p2pData = $state.snapshot(pack);
		p2pMode = 'send';
		showP2PModal = true;
	}

	function handleReceivePack() {
		p2pData = undefined;
		p2pMode = 'receive';
		showP2PModal = true;
	}

	function onP2PReceive(data: unknown) {
		try {
			// Basic validation
			const pack = data as LevelPack;
			if (!pack.id || !pack.levels) throw new Error('Invalid pack data');

			localPacksStore.addPack(pack);
			toast.success(`Received pack: ${pack.name}`);
			showP2PModal = false;
		} catch (e) {
			console.error(e);
			toast.error('Failed to receive pack. Invalid data.');
		}
	}

	onMount(() => {
		const init = async () => {
			// Refresh progress when returning to the page
			progress = ProgressService.load();
			// Load custom packs from IndexedDB
			customPacks = await CampaignService.loadAll();
		};
		init();

		const handleUpdate = () => {
			progress = ProgressService.load();
		};
		window.addEventListener('kibi-progress-updated', handleUpdate);
		return () => {
			window.removeEventListener('kibi-progress-updated', handleUpdate);
		};
	});
</script>

<div class="library-container">
	<header class="library-header">
		<div class="logo">
			<h1>Kibi</h1>
		</div>
		<div class="actions" aria-label="Library actions">
			<div class="utility-actions" aria-label="Library utilities">
				{#if data.user}
					<SyncStatus />
				{/if}
				<ThemeToggle variant="toolbar" />
				<button
					class="action-btn icon-btn"
					onclick={handleSettings}
					aria-label="Settings"
					title="Settings"
				>
					<Settings size={20} />
				</button>
			</div>

			<nav class="pack-actions" aria-label="Pack actions">
				{#if isFileSystemSupported}
					<button
						class="action-btn secondary-action"
						onclick={handleOpenLocalFolder}
						aria-label="Open local folder"
						title="Open local folder"
					>
						<FolderOpen size={18} />
						<span>Open Folder</span>
					</button>
				{/if}
				<button
					class="action-btn secondary-action"
					onclick={handleReceivePack}
					aria-label="Receive pack"
					title="Receive pack"
				>
					<Share2 size={18} />
					<span>Receive</span>
				</button>
				<button
					class="action-btn secondary-action"
					onclick={handleImport}
					aria-label="Import pack"
					title="Import pack"
				>
					<Upload size={18} />
					<span>Import</span>
				</button>
				<button class="action-btn primary" onclick={handleBuilder}>
					<Hammer size={18} />
					<span>Pack Builder</span>
				</button>
			</nav>
		</div>
	</header>

	<main class="library-content">
		<CampaignShelf
			packs={PACKS}
			{progress}
			onPackSelect={handlePackSelect}
			onSavePack={isFileSystemSupported ? handleSavePackToDisk : undefined}
			onSharePack={handleSharePack}
		/>

		{#if localPacksStore.packs.length > 0}
			<div class="local-section">
				<h2>Local Packs</h2>
				<CampaignShelf
					packs={localPacksStore.packs}
					{progress}
					onPackSelect={handlePackSelect}
					onSavePack={isFileSystemSupported ? handleSavePackToDisk : undefined}
					onSharePack={handleSharePack}
				/>
			</div>
		{/if}

		{#if customPacks.length > 0}
			<div class="local-section">
				<h2>My Projects</h2>
				<CampaignShelf
					packs={customPacks}
					{progress}
					onPackSelect={handlePackSelect}
					onSavePack={isFileSystemSupported ? handleSavePackToDisk : undefined}
					onSharePack={handleSharePack}
				/>
			</div>
		{/if}
	</main>

	{#if showP2PModal}
		<P2PModal
			data={p2pMode === 'send' ? p2pData : undefined}
			onReceive={p2pMode === 'receive' ? onP2PReceive : undefined}
			onClose={() => (showP2PModal = false)}
		/>
	{/if}
</div>

<style>
	.library-container {
		min-height: 100vh;
		background-color: var(--surface-1);
		display: flex;
		flex-direction: column;
	}

	.library-header {
		padding: var(--size-4) clamp(var(--size-4), 4vw, var(--size-8));
		border-bottom: 1px solid var(--surface-2);
		background-color: var(--surface-1);
		display: flex;
		justify-content: space-between;
		align-items: center;
		gap: var(--size-4);
	}

	.logo h1 {
		font-size: clamp(var(--font-size-4), 3vw, var(--font-size-6));
		line-height: 1;
		font-weight: 900;
		margin: 0;
		background: linear-gradient(to right, var(--brand), var(--brand-light));
		background-clip: text;
		-webkit-background-clip: text;
		-webkit-text-fill-color: transparent;
	}

	.actions {
		display: flex;
		align-items: center;
		justify-content: flex-end;
		gap: var(--size-3);
		min-width: 0;
		flex: 1 1 auto;
	}

	.utility-actions,
	.pack-actions {
		display: flex;
		align-items: center;
		gap: var(--size-2);
	}

	.utility-actions {
		flex: 0 0 auto;
	}

	.pack-actions {
		justify-content: flex-end;
		flex-wrap: nowrap;
		min-width: 0;
	}

	.action-btn {
		min-height: var(--touch-target-min);
		background-color: var(--surface-2);
		color: var(--text-1);
		border: 1px solid var(--surface-3);
		padding: 0 var(--size-3);
		border-radius: var(--radius-2);
		font-size: var(--font-size-1);
		font-weight: 700;
		line-height: 1;
		cursor: pointer;
		display: inline-flex;
		align-items: center;
		justify-content: center;
		gap: var(--size-2);
		white-space: nowrap;
		transition:
			background-color 0.2s,
			border-color 0.2s,
			color 0.2s,
			transform 0.2s;
	}

	.action-btn:hover {
		background-color: var(--surface-3);
		border-color: var(--brand);
		transform: translateY(-1px);
	}

	.action-btn:focus-visible {
		outline: 3px solid var(--brand-light);
		outline-offset: 2px;
	}

	.icon-btn {
		width: var(--touch-target-min);
		padding: 0;
	}

	.secondary-action {
		color: var(--text-2);
	}

	.secondary-action:hover {
		color: var(--text-1);
	}

	.action-btn.primary {
		background-color: var(--brand);
		color: white;
		border-color: var(--brand);
		box-shadow: var(--shadow-2);
	}

	.action-btn.primary:hover {
		background-color: var(--brand-dark);
	}

	@media (max-width: 900px) {
		.actions {
			gap: var(--size-2);
		}

		.secondary-action {
			width: var(--touch-target-min);
			padding: 0;
		}

		.secondary-action span {
			display: none;
		}
	}

	@media (max-width: 600px) {
		.library-header {
			padding: var(--size-3);
			gap: var(--size-3);
			align-items: flex-start;
		}

		.library-content {
			padding: var(--size-3);
		}

		.actions {
			width: 100%;
			align-items: stretch;
			flex-direction: column;
		}

		.utility-actions {
			justify-content: flex-end;
		}

		.pack-actions {
			display: grid;
			grid-template-columns: repeat(2, minmax(0, 1fr));
			gap: var(--size-2);
		}

		.pack-actions .action-btn {
			width: 100%;
			padding: 0 var(--size-3);
		}

		.secondary-action span {
			display: inline;
		}

		.pack-actions .primary {
			grid-column: 1 / -1;
		}
	}

	.library-content {
		flex: 1;
		padding: var(--size-6);
		max-width: 1200px;
		margin: 0 auto;
		width: 100%;
		display: flex;
		flex-direction: column;
		gap: var(--size-6);
	}

	.local-section h2 {
		font-size: var(--font-size-3);
		color: var(--text-1);
		margin-bottom: var(--size-4);
		padding-bottom: var(--size-2);
		border-bottom: 1px solid var(--surface-2);
	}
</style>
