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
	import { Hammer, FolderOpen, Share2 } from 'lucide-svelte';
	import { toast } from '$lib/stores/toast.svelte';
	import P2PModal from '$lib/components/builder/P2PModal.svelte';
	import ThemeToggle from '$lib/components/common/ThemeToggle.svelte';
	import SyncStatus from '$lib/components/common/SyncStatus.svelte';

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

	function handleBuilder() {
		// eslint-disable-next-line svelte/no-navigation-without-resolve
		goto(`${base}/builder/packs`);
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
		<div class="actions">
			<SyncStatus />
			<ThemeToggle />
			{#if isFileSystemSupported}
				<button class="action-btn" onclick={handleOpenLocalFolder}>
					<FolderOpen size={20} /> Open Local Folder
				</button>
			{/if}
			<button class="action-btn" onclick={handleReceivePack}>
				<Share2 size={20} /> Receive Pack
			</button>
			<button class="action-btn primary" onclick={handleBuilder}>
				<Hammer size={20} /> Pack Builder
			</button>
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
		padding: var(--size-4) var(--size-6);
		border-bottom: 1px solid var(--surface-2);
		background-color: var(--surface-1);
		display: flex;
		justify-content: space-between;
		align-items: center;
		flex-wrap: wrap;
		gap: var(--size-3);
	}

	@media (max-width: 600px) {
		.library-header {
			flex-direction: column;
			align-items: stretch;
			padding: var(--size-3);
		}

		.logo {
			text-align: center;
		}

		.actions {
			justify-content: center;
			flex-wrap: wrap;
		}

		.library-content {
			padding: var(--size-3);
		}
	}

	.logo h1 {
		font-size: var(--font-size-4);
		font-weight: 900;
		margin: 0;
		background: linear-gradient(to right, var(--brand), var(--brand-light));
		-webkit-background-clip: text;
		-webkit-text-fill-color: transparent;
	}

	.actions {
		display: flex;
		gap: var(--size-3);
	}

	.action-btn {
		background-color: var(--surface-2);
		color: var(--text-1);
		border: 1px solid var(--surface-3);
		padding: var(--size-2) var(--size-4);
		border-radius: var(--radius-2);
		font-weight: 600;
		cursor: pointer;
		display: flex;
		align-items: center;
		gap: var(--size-2);
		transition: all 0.2s;
	}

	.action-btn:hover {
		background-color: var(--surface-3);
		border-color: var(--brand);
	}

	.action-btn.primary {
		background-color: var(--brand);
		color: white;
		border-color: var(--brand);
	}

	.action-btn.primary:hover {
		background-color: var(--brand-dark);
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
