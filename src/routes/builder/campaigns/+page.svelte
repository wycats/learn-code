<script lang="ts">
	import { CampaignService } from '$lib/game/campaigns';
	import { PACKS } from '$lib/game/packs';
	import type { LevelPack } from '$lib/game/schema';
	import PackCard from '$lib/components/library/PackCard.svelte';
	import { goto } from '$app/navigation';
	import { base } from '$app/paths';
	import { onMount } from 'svelte';

	let myCampaigns = $state<LevelPack[]>([]);

	onMount(async () => {
		myCampaigns = await CampaignService.loadAll();
	});

	async function handleCreate() {
		const newPack = await CampaignService.create({
			name: 'New Adventure',
			description: 'A brand new level pack.'
		});
		// eslint-disable-next-line svelte/no-navigation-without-resolve
		void goto(`${base}/builder/campaigns/${newPack.id}`);
	}

	function handleEdit(packId: string) {
		// eslint-disable-next-line svelte/no-navigation-without-resolve
		void goto(`${base}/builder/campaigns/${packId}`);
	}

	async function handleClone(packId: string) {
		const cloned = await CampaignService.clone(packId);
		if (cloned) {
			myCampaigns = await CampaignService.loadAll(); // Refresh
			// eslint-disable-next-line svelte/no-navigation-without-resolve
			void goto(`${base}/builder/campaigns/${cloned.id}`);
		}
	}
</script>

<div class="builder-container">
	<header class="builder-header">
		<div class="header-content">
			<h1>Architect's Library</h1>
			<button class="create-btn" onclick={handleCreate}>
				<span class="icon">+</span> Create New Pack
			</button>
		</div>
	</header>

	<main class="builder-content">
		<section class="campaign-section">
			<h2>My Packs</h2>
			{#if myCampaigns.length === 0}
				<div class="empty-state">
					<p>You haven't created any packs yet.</p>
					<button class="secondary-btn" onclick={handleCreate}>Start Fresh</button>
				</div>
			{:else}
				<div class="pack-grid">
					{#each myCampaigns as pack (pack.id)}
						<PackCard {pack} progress={undefined} onClick={() => handleEdit(pack.id)} />
					{/each}
				</div>
			{/if}
		</section>

		<section class="campaign-section">
			<h2>Built-in Packs</h2>
			<p>Clone a built-in pack to start with a solid foundation.</p>
			<div class="pack-grid">
				{#each PACKS as pack (pack.id)}
					<div class="template-card">
						<PackCard {pack} progress={undefined} onClick={() => handleClone(pack.id)} />
						<div class="clone-overlay">
							<button class="clone-btn" onclick={() => handleClone(pack.id)}>Clone</button>
						</div>
					</div>
				{/each}
			</div>
		</section>
	</main>
</div>

<style>
	.builder-container {
		min-height: 100vh;
		background-color: var(--surface-1);
		display: flex;
		flex-direction: column;
	}

	.builder-header {
		padding: var(--size-4) var(--size-6);
		border-bottom: 1px solid var(--surface-2);
		background-color: var(--surface-1);
	}

	.header-content {
		max-width: 1200px;
		margin: 0 auto;
		display: flex;
		justify-content: space-between;
		align-items: center;
	}

	h1 {
		font-size: var(--font-size-4);
		font-weight: 900;
		margin: 0;
		color: var(--text-1);
	}

	.builder-content {
		flex: 1;
		padding: var(--size-6);
		max-width: 1200px;
		margin: 0 auto;
		width: 100%;
		display: flex;
		flex-direction: column;
		gap: var(--size-8);
	}

	.campaign-section h2 {
		font-size: var(--font-size-5);
		font-weight: 800;
		margin: 0 0 var(--size-4);
		color: var(--text-1);
	}

	.campaign-section p {
		color: var(--text-2);
		margin-bottom: var(--size-4);
	}

	.pack-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
		gap: var(--size-5);
	}

	.create-btn {
		background-color: var(--brand);
		color: white;
		border: none;
		padding: var(--size-2) var(--size-4);
		border-radius: var(--radius-2);
		font-weight: 700;
		cursor: pointer;
		display: flex;
		align-items: center;
		gap: var(--size-2);
		transition: background-color 0.2s;
	}

	.create-btn:hover {
		background-color: var(--brand-dark);
	}

	.secondary-btn {
		background-color: var(--surface-2);
		color: var(--text-1);
		border: 1px solid var(--surface-3);
		padding: var(--size-2) var(--size-4);
		border-radius: var(--radius-2);
		font-weight: 600;
		cursor: pointer;
	}

	.empty-state {
		background-color: var(--surface-2);
		padding: var(--size-8);
		border-radius: var(--radius-3);
		text-align: center;
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: var(--size-4);
	}

	.template-card {
		position: relative;
	}

	.clone-overlay {
		position: absolute;
		inset: 0;
		background-color: rgba(0, 0, 0, 0.5);
		display: flex;
		align-items: center;
		justify-content: center;
		opacity: 0;
		transition: opacity 0.2s;
		border-radius: var(--radius-3);
		pointer-events: none;
	}

	.template-card:hover .clone-overlay {
		opacity: 1;
		pointer-events: auto;
	}

	.clone-btn {
		background-color: var(--brand);
		color: white;
		border: none;
		padding: var(--size-3) var(--size-6);
		border-radius: var(--radius-round);
		font-weight: 800;
		cursor: pointer;
		transform: translateY(10px);
		transition: transform 0.2s;
	}

	.template-card:hover .clone-btn {
		transform: translateY(0);
	}
</style>
