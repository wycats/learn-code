<script lang="ts">
	import { page } from '$app/stores';
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { base } from '$app/paths';
	import { persistence } from '$lib/game/persistence';
	import { fetchPackFromUrl, readPackFromFile } from '$lib/game/import-pack';
	import { Loader2, AlertTriangle, Check, Download, Upload } from 'lucide-svelte';
	import type { LevelPack } from '$lib/game/schema';

	let status = $state<'ready' | 'loading' | 'confirm' | 'success' | 'error'>('ready');
	let error = $state<string | null>(null);
	let pack = $state<LevelPack | null>(null);
	let importUrl = $state('');

	onMount(async () => {
		const urlParam = $page.url.searchParams.get('url');
		if (!urlParam) {
			status = 'ready';
			return;
		}

		importUrl = urlParam;
		await fetchPack(urlParam);
	});

	async function fetchPack(url: string) {
		try {
			status = 'loading';
			error = null;
			pack = await fetchPackFromUrl(url);
			status = 'confirm';
		} catch (e) {
			console.error(e);
			status = 'error';
			error =
				'Could not load pack. Make sure the URL is reachable, allows browser access, and points to a valid pack.json.';
		}
	}

	async function handleUrlImport() {
		const trimmed = importUrl.trim();
		if (!trimmed) return;
		await fetchPack(trimmed);
	}

	async function handleFileImport(event: Event) {
		const input = event.currentTarget as HTMLInputElement;
		const file = input.files?.[0];
		if (!file) return;

		try {
			status = 'loading';
			error = null;
			pack = await readPackFromFile(file);
			status = 'confirm';
		} catch (e) {
			console.error(e);
			status = 'error';
			error = 'Could not read that file. Make sure it is a valid Kibi pack.json.';
		} finally {
			input.value = '';
		}
	}

	async function importPack() {
		if (!pack) return;
		const importedPackId = pack.id;

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
				goto(`${base}/builder/packs/${importedPackId}`);
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
		{#if status === 'ready'}
			<div class="state">
				<Upload size={48} />
				<h2>Import Pack</h2>
				<p>Paste a GitHub repository URL, a raw pack.json URL, or choose a local pack file.</p>

				<form
					class="url-form"
					onsubmit={(e) => {
						e.preventDefault();
						void handleUrlImport();
					}}
				>
					<label for="import-url">Pack URL</label>
					<input
						id="import-url"
						bind:value={importUrl}
						placeholder="https://github.com/you/kibi-pack"
					/>
					<button class="btn-primary" type="submit" disabled={!importUrl.trim()}>
						Load from URL
					</button>
				</form>

				<div class="divider"><span>Or</span></div>

				<label class="file-import">
					<input type="file" accept="application/json,.json" onchange={handleFileImport} />
					<span>Choose pack.json</span>
				</label>
			</div>
		{:else if status === 'loading'}
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
				<button class="btn-secondary" onclick={() => (status = 'ready')}>Try Another Import</button>
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
		max-width: 480px;
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

	.url-form {
		width: 100%;
		display: flex;
		flex-direction: column;
		gap: var(--size-2);
		text-align: left;
	}

	.url-form label {
		font-weight: 700;
		color: var(--text-1);
	}

	.url-form input {
		width: 100%;
		min-height: var(--touch-target-min);
		border: 1px solid var(--surface-3);
		border-radius: var(--radius-2);
		padding: 0 var(--size-3);
		background-color: var(--surface-1);
		color: var(--text-1);
	}

	.divider {
		width: 100%;
		display: flex;
		align-items: center;
		gap: var(--size-3);
		color: var(--text-3);
		font-size: var(--font-size-0);
	}

	.divider::before,
	.divider::after {
		content: '';
		flex: 1;
		height: 1px;
		background-color: var(--surface-3);
	}

	.file-import {
		width: 100%;
		min-height: var(--touch-target-min);
		display: flex;
		align-items: center;
		justify-content: center;
		border: 1px dashed var(--surface-4);
		border-radius: var(--radius-2);
		color: var(--text-1);
		font-weight: 700;
		cursor: pointer;
	}

	.file-import:hover {
		background-color: var(--surface-1);
	}

	.file-import input {
		position: absolute;
		inline-size: 1px;
		block-size: 1px;
		overflow: hidden;
		clip: rect(0 0 0 0);
		clip-path: inset(50%);
		white-space: nowrap;
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

	.btn-primary:disabled {
		opacity: 0.5;
		cursor: not-allowed;
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
