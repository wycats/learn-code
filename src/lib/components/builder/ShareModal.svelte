<script lang="ts">
	import { ShareService } from '$lib/services/share';
	import type { BuilderModel } from '$lib/game/builder-model.svelte';
	import { X, Copy, Check } from 'lucide-svelte';
	import { fade, scale } from 'svelte/transition';

	interface Props {
		builder: BuilderModel;
		onClose: () => void;
	}

	let { builder, onClose }: Props = $props();

	let qrCodeUrl = $state<string | null>(null);
	let shareUrl = $state<string | null>(null);
	let copied = $state(false);
	let error = $state<string | null>(null);

	$effect(() => {
		generate();
	});

	async function generate() {
		try {
			const level = builder.level;
			shareUrl = ShareService.getShareUrl(level);
			qrCodeUrl = await ShareService.generateQRCode(shareUrl);
		} catch (e) {
			error = 'Failed to generate QR code. Level might be too large.';
			console.error(e);
		}
	}

	async function copyLink() {
		if (!shareUrl) return;
		try {
			await navigator.clipboard.writeText(shareUrl);
			copied = true;
			setTimeout(() => (copied = false), 2000);
		} catch (e) {
			console.error('Failed to copy', e);
		}
	}
</script>

<div
	class="backdrop"
	transition:fade
	onclick={onClose}
	role="dialog"
	aria-modal="true"
	tabindex="-1"
	onkeydown={(e) => e.key === 'Escape' && onClose()}
>
	<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
	<div
		class="modal"
		transition:scale
		onclick={(e) => e.stopPropagation()}
		role="document"
		onkeydown={(e) => e.stopPropagation()}
	>
		<header>
			<h2>Share Level</h2>
			<button class="close-btn" onclick={onClose} aria-label="Close">
				<X size={24} />
			</button>
		</header>

		<div class="content">
			{#if error}
				<div class="error">{error}</div>
			{:else if qrCodeUrl}
				<div class="qr-container">
					<img src={qrCodeUrl} alt="Level QR Code" />
				</div>
				<p class="instruction">Scan with your camera to play!</p>

				<div class="link-section">
					<input type="text" readonly value={shareUrl} aria-label="Share Link" />
					<button class="copy-btn" onclick={copyLink} title="Copy Link">
						{#if copied}
							<Check size={20} />
						{:else}
							<Copy size={20} />
						{/if}
					</button>
				</div>
			{:else}
				<div class="loading">Generating...</div>
			{/if}
		</div>
	</div>
</div>

<style>
	.backdrop {
		position: fixed;
		inset: 0;
		background-color: rgba(0, 0, 0, 0.5);
		display: flex;
		align-items: center;
		justify-content: center;
		z-index: 1000;
		backdrop-filter: blur(4px);
	}

	.modal {
		background-color: var(--surface-1);
		border-radius: var(--radius-3);
		box-shadow: var(--shadow-5);
		width: 90%;
		max-width: 400px;
		overflow: hidden;
		border: 1px solid var(--surface-3);
	}

	header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: var(--size-3);
		border-bottom: 1px solid var(--surface-2);
	}

	h2 {
		margin: 0;
		font-size: var(--font-size-3);
	}

	.close-btn {
		background: none;
		border: none;
		cursor: pointer;
		color: var(--text-2);
		padding: var(--size-1);
		border-radius: var(--radius-round);
	}

	.close-btn:hover {
		background-color: var(--surface-2);
		color: var(--text-1);
	}

	.content {
		padding: var(--size-4);
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: var(--size-3);
	}

	.qr-container {
		background: white;
		padding: var(--size-3);
		border-radius: var(--radius-2);
		box-shadow: var(--shadow-2);
	}

	.qr-container img {
		display: block;
		width: 200px;
		height: 200px;
	}

	.instruction {
		color: var(--text-2);
		font-weight: 500;
	}

	.link-section {
		display: flex;
		gap: var(--size-2);
		width: 100%;
	}

	input {
		flex: 1;
		padding: var(--size-2);
		border: 1px solid var(--surface-3);
		border-radius: var(--radius-2);
		background-color: var(--surface-2);
		color: var(--text-2);
		font-family: var(--font-mono);
		font-size: var(--font-size-0);
	}

	.copy-btn {
		background-color: var(--surface-2);
		border: 1px solid var(--surface-3);
		border-radius: var(--radius-2);
		padding: var(--size-2);
		cursor: pointer;
		color: var(--text-1);
		display: flex;
		align-items: center;
		justify-content: center;
		transition: all 0.2s;
	}

	.copy-btn:hover {
		background-color: var(--surface-3);
	}

	.error {
		color: var(--red-6);
		text-align: center;
	}

	.loading {
		color: var(--text-2);
	}
</style>
