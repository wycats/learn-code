<script lang="ts">
	import { page } from '$app/stores';
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { persistence } from '$lib/game/persistence';
	import { Loader2, AlertTriangle, Check, Download } from 'lucide-svelte';
	import type { LevelPack } from '$lib/game/schema';

	let status = $state<'loading' | 'confirm' | 'success' | 'error'>('loading');
	let error = $state<string | null>(null);
	let pack = $state<LevelPack | null>(null);

	onMount(async () => {
		const urlParam = $page.url.searchParams.get('url');
		if (!urlParam) {
			status = 'error';
			error = 'No repository URL provided.';
			return;
		}

		await fetchPack(urlParam);
	});

	async function fetchPack(url: string) {
		try {
			// Convert github.com URL to raw.githubusercontent.com
			// Format: https://github.com/user/repo -> https://raw.githubusercontent.com/user/repo/main/pack.json
			let rawUrl = url;
			if (url.includes('github.com')) {
				const parts = url.replace('https://github.com/', '').split('/');
				if (parts.length >= 2) {
					const user = parts[0];
					const repo = parts[1];
					// Default to main branch for now
					rawUrl = `https://raw.githubusercontent.com/${user}/${repo}/main/pack.json`;
				}
			}

			const response = await fetch(rawUrl);
			if (!response.ok) {
				throw new Error('Failed to fetch pack.json');
			}

			const data = await response.json();
			// Basic validation (could use Zod schema here)
			if (!data.id || !data.levels) {
				throw new Error('Invalid pack format.');
			}

			pack = data;
			status = 'confirm';
		} catch (e) {
			console.error(e);
			status = 'error';
			error =
				'Could not load pack. Make sure the repository is public and contains a valid pack.json.';
		}
	}

	async function importPack() {
		if (!pack) return;

		try {
			// Check if pack already exists
			const existing = await persistence.loadPack(pack.id);
			if (existing) {
				// For now, just overwrite or maybe prompt?
				// Let's just overwrite/update for "Sync" behavior
				await persistence.savePack(pack);
			} else {
				await persistence.savePack(pack);
			}

			status = 'success';
			setTimeout(() => {
				// eslint-disable-next-line svelte/no-navigation-without-resolve
				goto('/builder'); // Or wherever we want to go
			}, 1500);
		} catch (e) {
			console.error(e);
			status = 'error';
			error = 'Failed to save pack to local storage.';
		}
	}
</script>

<div class="import-page">
	<div class="card">
		{#if status === 'loading'}
			<div class="state">
				<div class="spin-wrapper">
					<Loader2 size={48} />
				</div>
				<h2>Loading Pack...</h2>
				<p>Fetching data from GitHub</p>
			</div>
		{:else if status === 'confirm' && pack}
			<div class="state">
				<Download size={48} />
				<h2>Import Pack?</h2>
				<div class="pack-preview">
					<h3>{pack.name}</h3>
					<p>{pack.description || 'No description'}</p>
					<div class="meta">
						<span>{pack.levels.length} Levels</span>
						<span>By {pack.author || 'Unknown'}</span>
					</div>
				</div>
				<div class="actions">
					<button class="btn-primary" onclick={importPack}>Import Pack</button>
					<!-- eslint-disable-next-line svelte/no-navigation-without-resolve -->
					<a href="/" class="btn-secondary">Cancel</a>
				</div>
			</div>
		{:else if status === 'success'}
			<div class="state success">
				<Check size={48} />
				<h2>Import Successful!</h2>
				<p>Redirecting to Builder...</p>
			</div>
		{:else if status === 'error'}
			<div class="state error">
				<AlertTriangle size={48} />
				<h2>Import Failed</h2>
				<p>{error}</p>
				<!-- eslint-disable-next-line svelte/no-navigation-without-resolve -->
				<a href="/" class="btn-secondary">Go Home</a>
			</div>
		{/if}
	</div>
</div>

<style>
	.import-page {
		display: flex;
		align-items: center;
		justify-content: center;
		min-height: 100vh;
		background-color: var(--surface-1);
		padding: var(--size-4);
	}

	.card {
		background-color: var(--surface-2);
		padding: var(--size-6);
		border-radius: var(--radius-3);
		box-shadow: var(--shadow-4);
		width: 100%;
		max-width: 400px;
		text-align: center;
	}

	.state {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: var(--size-3);
	}

	.spin-wrapper {
		animation: spin 1s linear infinite;
		color: var(--brand);
		display: flex;
		align-items: center;
		justify-content: center;
	}

	@keyframes spin {
		to {
			transform: rotate(360deg);
		}
	}

	h2 {
		margin: 0;
		font-size: var(--font-size-3);
	}

	p {
		color: var(--text-2);
		margin: 0;
	}

	.pack-preview {
		background-color: var(--surface-1);
		padding: var(--size-3);
		border-radius: var(--radius-2);
		width: 100%;
		text-align: left;
		margin: var(--size-2) 0;
		border: 1px solid var(--surface-3);
	}

	.pack-preview h3 {
		margin: 0 0 var(--size-1);
		font-size: var(--font-size-2);
	}

	.meta {
		display: flex;
		gap: var(--size-3);
		font-size: var(--font-size-0);
		color: var(--text-3);
		margin-top: var(--size-2);
	}

	.actions {
		display: flex;
		gap: var(--size-3);
		width: 100%;
	}

	.btn-primary,
	.btn-secondary {
		flex: 1;
		padding: var(--size-2);
		border-radius: var(--radius-2);
		font-weight: bold;
		cursor: pointer;
		text-decoration: none;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.btn-primary {
		background-color: var(--brand);
		color: white;
		border: none;
	}

	.btn-secondary {
		background-color: transparent;
		color: var(--text-1);
		border: 1px solid var(--surface-3);
	}

	.success {
		color: var(--green-6);
	}

	.error {
		color: var(--red-6);
	}
</style>
