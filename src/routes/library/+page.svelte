<script lang="ts">
	import { PACKS } from '$lib/game/packs';
	import { ProgressService } from '$lib/game/progress';
	import CampaignShelf from '$lib/components/library/CampaignShelf.svelte';
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';
	import { Hammer } from 'lucide-svelte';

	let progress = $state(ProgressService.load());

	function handlePackSelect(packId: string) {
		goto(`/library/${packId}`);
	}

	onMount(() => {
		// Refresh progress when returning to the page
		progress = ProgressService.load();
	});
</script>

<div class="library-container">
	<header class="library-header">
		<div class="logo">
			<h1>Code Climber</h1>
		</div>
		<div class="actions">
			<button class="builder-btn" onclick={() => goto('/builder/campaigns')}>
				<Hammer size={20} /> Pack Builder
			</button>
		</div>
	</header>

	<main class="library-content">
		<CampaignShelf packs={PACKS} {progress} onPackSelect={handlePackSelect} />
	</main>
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
	}

	.logo h1 {
		font-size: var(--font-size-4);
		font-weight: 900;
		margin: 0;
		background: linear-gradient(to right, var(--brand), var(--brand-light));
		-webkit-background-clip: text;
		-webkit-text-fill-color: transparent;
	}

	.builder-btn {
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

	.builder-btn:hover {
		background-color: var(--surface-3);
		border-color: var(--brand);
	}

	.library-content {
		flex: 1;
		padding: var(--size-6);
		max-width: 1200px;
		margin: 0 auto;
		width: 100%;
	}
</style>
