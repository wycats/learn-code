<script lang="ts">
	/* eslint-disable svelte/no-navigation-without-resolve */
	import QRScanner from '$lib/components/common/QRScanner.svelte';
	import { goto } from '$app/navigation';
	import { ArrowLeft, Keyboard } from 'lucide-svelte';

	let showManualInput = $state(false);
	let manualCode = $state('');
	let error = $state<string | null>(null);

	async function handleScan(decodedText: string) {
		try {
			const url = new URL(decodedText);
			const code = url.searchParams.get('code');
			if (code) {
				await goto(`/auth/handshake?code=${code}`);
			} else {
				error = 'Invalid QR Code';
			}
		} catch {
			// Maybe it's just the code itself?
			if (decodedText.length > 5) {
				await goto(`/auth/handshake?code=${decodedText}`);
			} else {
				error = 'Invalid QR Code format';
			}
		}
	}

	async function handleManualSubmit() {
		if (manualCode.trim()) {
			await goto(`/auth/handshake?code=${manualCode.trim()}`);
		}
	}
</script>

<div class="page-container">
	<div class="card">
		<div class="header">
			<a href="/profiles" class="back-link">
				<ArrowLeft size={20} />
				Back
			</a>
			<h2>Scan Device Code</h2>
		</div>

		<div class="content">
			{#if !showManualInput}
				<div class="scanner-wrapper">
					<QRScanner onScan={handleScan} />
				</div>
				{#if error}
					<p class="error">{error}</p>
				{/if}
				<div class="divider">
					<span>Or</span>
				</div>
				<button class="btn secondary" onclick={() => (showManualInput = true)}>
					<Keyboard size={20} />
					Enter Code Manually
				</button>
			{:else}
				<div class="manual-input-wrapper">
					<label for="code">Enter the code displayed on the device:</label>
					<input
						type="text"
						id="code"
						bind:value={manualCode}
						placeholder="e.g. abc-123"
						class="code-input"
					/>
					<button class="btn primary" onclick={handleManualSubmit}> Continue </button>
					<button class="btn text" onclick={() => (showManualInput = false)}>
						Cancel (Use Camera)
					</button>
				</div>
			{/if}
		</div>
	</div>
</div>

<style>
	.page-container {
		min-height: 100vh;
		display: flex;
		align-items: center;
		justify-content: center;
		background-color: var(--surface-1);
		padding: var(--size-4);
	}

	.card {
		width: 100%;
		max-width: var(--size-sm);
		background-color: var(--surface-2);
		border-radius: var(--radius-3);
		border: 1px solid var(--surface-3);
		box-shadow: var(--shadow-2);
		overflow: hidden;
	}

	.header {
		padding: var(--size-4);
		border-bottom: 1px solid var(--surface-3);
		display: flex;
		align-items: center;
		justify-content: center;
		position: relative;
	}

	.back-link {
		position: absolute;
		left: var(--size-4);
		display: flex;
		align-items: center;
		gap: var(--size-2);
		color: var(--text-2);
		text-decoration: none;
		font-size: var(--font-size-1);
	}

	.back-link:hover {
		color: var(--text-1);
	}

	h2 {
		font-size: var(--font-size-3);
		margin: 0;
	}

	.content {
		padding: var(--size-6);
		display: flex;
		flex-direction: column;
		gap: var(--size-4);
	}

	.scanner-wrapper {
		border-radius: var(--radius-2);
		overflow: hidden;
		border: 2px solid var(--surface-3);
	}

	.error {
		color: var(--red-5);
		text-align: center;
		font-size: var(--font-size-1);
	}

	.divider {
		display: flex;
		align-items: center;
		text-align: center;
		color: var(--text-2);
		font-size: var(--font-size-0);
		text-transform: uppercase;
		letter-spacing: 0.05em;
	}

	.divider::before,
	.divider::after {
		content: '';
		flex: 1;
		border-bottom: 1px solid var(--surface-3);
	}

	.divider span {
		padding-inline: var(--size-2);
	}

	.btn {
		width: 100%;
		display: flex;
		align-items: center;
		justify-content: center;
		gap: var(--size-2);
		padding: var(--size-2) var(--size-4);
		border-radius: var(--radius-2);
		font-weight: 600;
		cursor: pointer;
		border: none;
		height: var(--size-8);
	}

	.btn.primary {
		background-color: var(--brand);
		color: white;
	}

	.btn.secondary {
		background-color: var(--surface-3);
		color: var(--text-1);
	}

	.btn.text {
		background: none;
		color: var(--text-2);
	}

	.manual-input-wrapper {
		display: flex;
		flex-direction: column;
		gap: var(--size-4);
	}

	.code-input {
		font-family: var(--font-mono);
		font-size: var(--font-size-4);
		text-align: center;
		padding: var(--size-2);
		border-radius: var(--radius-2);
		border: 1px solid var(--surface-3);
		background-color: var(--surface-1);
		color: var(--text-1);
		letter-spacing: 0.1em;
	}
</style>
