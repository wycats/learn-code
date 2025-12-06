<script lang="ts">
	import { ShareService } from '$lib/services/share';
	import type { BuilderModel } from '$lib/game/builder-model.svelte';
	import { X, Copy, Check, Smartphone, QrCode } from 'lucide-svelte';
	import P2PModal from './P2PModal.svelte';

	interface Props {
		builder: BuilderModel;
		onClose: () => void;
	}

	let { builder, onClose }: Props = $props();

	let qrCodeUrl = $state<string | null>(null);
	let shareUrl = $state<string | null>(null);
	let copied = $state(false);
	let error = $state<string | null>(null);
	let activeTab = $state<'level' | 'pack'>('level');
	let showP2P = $state(false);
	let dialog: HTMLDialogElement;

	$effect(() => {
		if (!showP2P) {
			dialog?.showModal();
		}
	});

	$effect(() => {
		if (activeTab === 'level') {
			generate();
		}
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

{#if showP2P}
	<P2PModal
		data={$state.snapshot(builder.pack)}
		onClose={() => {
			showP2P = false;
			// When P2P closes, we want to show ShareModal again?
			// Or close everything?
			// The original code just set showP2P = false, which would re-render ShareModal.
			// And our effect will call showModal() again.
		}}
	/>
{:else}
	<dialog
		bind:this={dialog}
		class="share-modal"
		onclose={onClose}
		onclick={(e) => e.target === dialog && onClose()}
	>
		<header>
			<h2>Share</h2>
			<button class="close-btn" onclick={onClose} aria-label="Close">
				<X size={24} />
			</button>
		</header>

		<div class="tabs">
			<button
				class="tab-btn"
				class:active={activeTab === 'level'}
				onclick={() => (activeTab = 'level')}
			>
				<QrCode size={18} /> Current Level
			</button>
			<button
				class="tab-btn"
				class:active={activeTab === 'pack'}
				onclick={() => (activeTab = 'pack')}
			>
				<Smartphone size={18} /> Full Pack
			</button>
		</div>

		<div class="content">
			{#if activeTab === 'level'}
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
			{:else}
				<div class="pack-share-info">
					<div class="info-icon">
						<Smartphone size={48} />
					</div>
					<h3>Share "{builder.pack.name}"</h3>
					<p>
						Transfer the entire pack directly to another device nearby using a secure P2P
						connection.
					</p>
					<p class="note">Requires both devices to be online to establish connection.</p>
					<button class="btn-primary" onclick={() => (showP2P = true)}> Start Transfer </button>
				</div>
			{/if}
		</div>
	</dialog>
{/if}

<style>
	.share-modal {
		background-color: var(--surface-1);
		border-radius: var(--radius-3);
		box-shadow: var(--shadow-5);
		width: 90%;
		max-width: 400px;
		overflow: hidden;
		border: none;
		padding: 0;
		color: var(--text-1);
	}

	.share-modal::backdrop {
		background-color: rgba(0, 0, 0, 0.5);
		backdrop-filter: blur(4px);
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
		padding: 0;
		width: 44px;
		height: 44px;
		display: flex;
		align-items: center;
		justify-content: center;
		border-radius: var(--radius-round);
	}

	.close-btn:hover {
		background-color: var(--surface-2);
		color: var(--text-1);
	}

	.tabs {
		display: flex;
		border-bottom: 1px solid var(--surface-2);
	}

	.tab-btn {
		flex: 1;
		background: none;
		border: none;
		padding: var(--size-3);
		cursor: pointer;
		font-weight: 600;
		color: var(--text-2);
		display: flex;
		align-items: center;
		justify-content: center;
		gap: var(--size-2);
		border-bottom: 2px solid transparent;
		transition: all 0.2s;
	}

	.tab-btn:hover {
		background-color: var(--surface-2);
		color: var(--text-1);
	}

	.tab-btn.active {
		color: var(--brand);
		border-bottom-color: var(--brand);
		background-color: var(--surface-1);
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
		text-align: center;
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
		padding: 0;
		width: 44px;
		height: 44px;
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

	.pack-share-info {
		display: flex;
		flex-direction: column;
		align-items: center;
		text-align: center;
		gap: var(--size-3);
		padding: var(--size-2);
	}

	.info-icon {
		color: var(--brand);
		background-color: var(--brand-dim);
		padding: var(--size-4);
		border-radius: 50%;
		margin-bottom: var(--size-2);
	}

	.pack-share-info h3 {
		margin: 0;
		font-size: var(--font-size-3);
	}

	.pack-share-info p {
		margin: 0;
		color: var(--text-2);
		line-height: 1.5;
	}

	.pack-share-info .note {
		font-size: var(--font-size-0);
		color: var(--text-3);
		font-style: italic;
	}

	.btn-primary {
		background-color: var(--brand);
		color: white;
		border: none;
		padding: 0 var(--size-4);
		min-height: var(--touch-target-min);
		border-radius: var(--radius-2);
		font-weight: bold;
		cursor: pointer;
		margin-top: var(--size-2);
		width: 100%;
	}

	.btn-primary:hover {
		background-color: var(--brand-dark);
	}
</style>
