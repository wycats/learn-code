<script lang="ts">
	import { page } from '$app/stores';
	import { ShareService } from '$lib/services/share';
	import { GameModel } from '$lib/game/model.svelte';
	import Game from '$lib/components/game/Game.svelte';
	import QRScanner from '$lib/components/common/QRScanner.svelte';
	import { goto } from '$app/navigation';
	import { base } from '$app/paths';
	import { ArrowLeft } from 'lucide-svelte';

	let game = $state<GameModel | null>(null);
	let error = $state<string | null>(null);
	let isScanning = $state(false);

	$effect(() => {
		const levelData = $page.url.searchParams.get('level');
		if (levelData) {
			loadLevel(levelData);
		} else {
			// Default to scanning mode if no level provided
			isScanning = true;
		}
	});

	function loadLevel(data: string) {
		const level = ShareService.decompressLevel(data);
		if (level) {
			game = new GameModel(level);
			isScanning = false;
			error = null;
		} else {
			error = 'Invalid or corrupted level data.';
			isScanning = false;
		}
	}

	function handleScan(data: string) {
		// Check if it's a URL
		try {
			const url = new URL(data);
			const levelData = url.searchParams.get('level');
			if (levelData) {
				// Update URL without reloading if possible, or just load directly
				loadLevel(levelData);
				// Optionally update browser URL
				window.history.pushState({}, '', url.toString());
			} else {
				// Maybe raw data?
				loadLevel(data);
			}
		} catch {
			// Not a URL, try raw data
			loadLevel(data);
		}
	}

	function handleExit() {
		// eslint-disable-next-line svelte/no-navigation-without-resolve
		goto(`${base}/`);
	}
</script>

{#if game}
	<div class="play-container">
		<Game {game} hasNextLevel={false} onNextLevel={handleExit}>
			{#snippet headerLeft()}
				<button class="back-button" onclick={handleExit} title="Exit">
					<ArrowLeft size={20} />
					<span>Home</span>
				</button>
			{/snippet}
		</Game>
	</div>
{:else if isScanning}
	<div class="scan-container">
		<header>
			<button class="back-button" onclick={handleExit}>
				<ArrowLeft size={24} />
			</button>
			<h1>Scan Level</h1>
		</header>
		<div class="scanner-wrapper">
			<QRScanner onScan={handleScan} onError={(e) => console.warn(e)} />
		</div>
		<p class="hint">Point your camera at a Wonderblocks QR code</p>
	</div>
{:else if error}
	<div class="error-container">
		<h1>Oops!</h1>
		<p>{error}</p>
		<button class="primary-btn" onclick={() => (isScanning = true)}>Try Scanning Again</button>
		<button class="secondary-btn" onclick={handleExit}>Go Home</button>
	</div>
{:else}
	<div class="loading">Loading...</div>
{/if}

<style>
	.play-container {
		height: 100vh;
		width: 100vw;
		overflow: hidden;
	}

	.scan-container,
	.error-container {
		height: 100vh;
		display: flex;
		flex-direction: column;
		align-items: center;
		padding: var(--size-4);
		background-color: var(--surface-1);
		color: var(--text-1);
	}

	header {
		width: 100%;
		display: flex;
		align-items: center;
		margin-bottom: var(--size-6);
		position: relative;
	}

	header h1 {
		flex: 1;
		text-align: center;
		margin: 0;
		font-size: var(--font-size-4);
	}

	.back-button {
		position: absolute;
		left: 0;
		background: none;
		border: none;
		color: var(--text-1);
		cursor: pointer;
		padding: var(--size-2);
		display: flex;
		align-items: center;
		gap: var(--size-2);
	}

	.scanner-wrapper {
		width: 100%;
		max-width: 500px;
		background: black;
		border-radius: var(--radius-3);
		overflow: hidden;
		margin-bottom: var(--size-4);
	}

	.hint {
		color: var(--text-2);
		font-size: var(--font-size-2);
		text-align: center;
	}

	.error-container {
		justify-content: center;
		gap: var(--size-4);
	}

	.primary-btn,
	.secondary-btn {
		padding: var(--size-3) var(--size-6);
		border-radius: var(--radius-2);
		font-weight: bold;
		cursor: pointer;
		border: none;
	}

	.primary-btn {
		background-color: var(--brand);
		color: white;
	}

	.secondary-btn {
		background-color: var(--surface-2);
		color: var(--text-1);
	}

	.loading {
		display: grid;
		place-items: center;
		height: 100vh;
		font-size: var(--font-size-4);
		color: var(--text-2);
	}
</style>
