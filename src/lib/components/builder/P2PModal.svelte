<script lang="ts">
	import { P2PConnection, type P2PStatus } from '$lib/services/p2p';
	import { ShareService } from '$lib/services/share';
	import QRScanner from '$lib/components/common/QRScanner.svelte';
	import { X, Check, ArrowRight, ArrowLeft, Smartphone, Upload, Download } from 'lucide-svelte';
	import { onDestroy } from 'svelte';

	interface Props {
		data?: unknown;
		onReceive?: (data: unknown) => void;
		onClose: () => void;
	}

	let { data, onReceive, onClose }: Props = $props();

	type Step =
		| 'initial'
		| 'sender-offer'
		| 'sender-scan-answer'
		| 'receiver-scan-offer'
		| 'receiver-answer'
		| 'connected'
		| 'transferring'
		| 'completed'
		| 'error';

	let step = $state<Step>('initial');
	let p2p = $state<P2PConnection | null>(null);
	let qrCodeUrl = $state<string | null>(null);
	let currentCodeData = $state<string | null>(null);
	let showManualInput = $state(false);
	let manualInputValue = $state('');
	let status = $state<P2PStatus>('disconnected');
	let error = $state<string | null>(null);
	let dialog: HTMLDialogElement;

	$effect(() => {
		dialog?.showModal();
	});

	$effect(() => {
		// Auto-start if intent is unambiguous
		if (step === 'initial') {
			if (data && !onReceive) {
				startSender();
			} else if (onReceive && !data) {
				startReceiver();
			}
		}
	});

	onDestroy(() => {
		if (p2p) {
			p2p.pc.close();
		}
	});

	async function startSender() {
		if (!data) {
			error = 'No data to send';
			return;
		}
		try {
			step = 'sender-offer';
			p2p = new P2PConnection(
				'sender',
				(s) => {
					status = s;
					if (s === 'connected') {
						step = 'connected';
						startTransfer();
					}
				},
				() => {} // Sender doesn't expect data
			);

			const offer = await p2p.createOffer();
			currentCodeData = offer;
			qrCodeUrl = await ShareService.generateQRCode(offer);
		} catch (e) {
			error = 'Failed to create offer';
			console.error(e);
		}
	}

	async function startReceiver() {
		step = 'receiver-scan-offer';
		p2p = new P2PConnection(
			'receiver',
			(s) => {
				status = s;
				if (s === 'connected') {
					step = 'connected';
				}
			},
			(receivedData) => {
				if (onReceive) {
					onReceive(receivedData);
					step = 'completed';
				}
			}
		);
	}

	async function handleScan(scannedData: string) {
		if (!p2p) return;

		try {
			if (step === 'receiver-scan-offer') {
				const answer = await p2p.handleOffer(scannedData);
				currentCodeData = answer;
				qrCodeUrl = await ShareService.generateQRCode(answer);
				step = 'receiver-answer';
			} else if (step === 'sender-scan-answer') {
				await p2p.handleAnswer(scannedData);
				// Wait for connection...
			}
		} catch (e) {
			error = 'Invalid Code';
			console.error(e);
		}
	}

	async function handleManualSubmit() {
		if (!manualInputValue) return;
		await handleScan(manualInputValue);
		showManualInput = false;
		manualInputValue = '';
	}

	function startTransfer() {
		if (!p2p || !data) return;
		step = 'transferring';
		// Simulate progress for now, or just send
		p2p.send(data);
		setTimeout(() => {
			step = 'completed';
		}, 500);
	}
</script>

<dialog
	bind:this={dialog}
	class="p2p-modal"
	onclose={onClose}
	onclick={(e) => e.target === dialog && onClose()}
>
	<header>
		<h2>P2P Transfer</h2>
		<button class="close-btn" onclick={onClose} aria-label="Close">
			<X size={24} />
		</button>
	</header>

	<div class="content">
		{#if error}
			<div class="error-state">
				<p class="error">{error}</p>
				<button
					onclick={() => {
						error = null;
						step = 'initial';
					}}>Try Again</button
				>
			</div>
		{:else if step === 'initial'}
			<div class="actions">
				{#if data}
					<button class="action-btn primary" onclick={startSender}>
						<Upload size={32} />
						<span>Send Data</span>
						<small>Show QR code to receiver</small>
					</button>
				{/if}
				{#if onReceive}
					<button class="action-btn secondary" onclick={startReceiver}>
						<Download size={32} />
						<span>Receive Data</span>
						<small>Scan sender's QR code</small>
					</button>
				{/if}
			</div>
		{:else if step === 'sender-offer'}
			<div class="step-container">
				<h3>Step 1: Show this to Receiver</h3>
				{#if qrCodeUrl}
					<div class="qr-container">
						<img src={qrCodeUrl} alt="Offer QR Code" />
					</div>
					<p class="instruction">Ask the receiver to scan this code.</p>

					<details class="manual-code-details">
						<summary>Show Manual Code</summary>
						<div class="manual-code-box">
							<textarea readonly value={currentCodeData} onclick={(e) => e.currentTarget.select()}
							></textarea>
							<button
								class="btn-copy"
								onclick={() => navigator.clipboard.writeText(currentCodeData || '')}>Copy</button
							>
						</div>
					</details>

					<button class="btn-next" onclick={() => (step = 'sender-scan-answer')}>
						Next: Scan Receiver's Answer <ArrowRight size={16} />
					</button>
				{:else}
					<div class="loading">Generating Offer...</div>
				{/if}
			</div>
		{:else if step === 'sender-scan-answer'}
			<div class="step-container">
				<h3>Step 2: Scan Receiver's Answer</h3>
				{#if showManualInput}
					<div class="manual-input-box">
						<textarea bind:value={manualInputValue} placeholder="Paste code here..."></textarea>
						<div class="manual-actions">
							<button class="btn-secondary" onclick={() => (showManualInput = false)}>Cancel</button
							>
							<button class="btn-primary" onclick={handleManualSubmit}>Submit</button>
						</div>
					</div>
				{:else}
					<div class="scanner-wrapper">
						<QRScanner onScan={handleScan} onError={(e) => console.warn(e)} />
					</div>
					<button class="btn-text" onclick={() => (showManualInput = true)}
						>Enter Manual Code</button
					>
				{/if}
				<button class="btn-back" onclick={() => (step = 'sender-offer')}>
					<ArrowLeft size={16} /> Back to Offer
				</button>
			</div>
		{:else if step === 'receiver-scan-offer'}
			<div class="step-container">
				<h3>Step 1: Scan Sender's Offer</h3>
				{#if showManualInput}
					<div class="manual-input-box">
						<textarea bind:value={manualInputValue} placeholder="Paste code here..."></textarea>
						<div class="manual-actions">
							<button class="btn-secondary" onclick={() => (showManualInput = false)}>Cancel</button
							>
							<button class="btn-primary" onclick={handleManualSubmit}>Submit</button>
						</div>
					</div>
				{:else}
					<div class="scanner-wrapper">
						<QRScanner onScan={handleScan} onError={(e) => console.warn(e)} />
					</div>
					<button class="btn-text" onclick={() => (showManualInput = true)}
						>Enter Manual Code</button
					>
				{/if}
			</div>
		{:else if step === 'receiver-answer'}
			<div class="step-container">
				<h3>Step 2: Show this to Sender</h3>
				{#if qrCodeUrl}
					<div class="qr-container">
						<img src={qrCodeUrl} alt="Answer QR Code" />
					</div>
					<p class="instruction">Ask the sender to scan this code.</p>

					<details class="manual-code-details">
						<summary>Show Manual Code</summary>
						<div class="manual-code-box">
							<textarea readonly value={currentCodeData} onclick={(e) => e.currentTarget.select()}
							></textarea>
							<button
								class="btn-copy"
								onclick={() => navigator.clipboard.writeText(currentCodeData || '')}>Copy</button
							>
						</div>
					</details>

					<div class="status">Waiting for connection...</div>
				{:else}
					<div class="loading">Generating Answer...</div>
				{/if}
			</div>
		{:else if step === 'connected' || step === 'transferring'}
			<div class="step-container">
				<h3>Connected!</h3>
				<div class="transfer-status">
					<Smartphone size={48} />
					<div class="dots">...</div>
					<Smartphone size={48} />
				</div>
				<p>Status: {status}</p>
				<p>Transferring data...</p>
			</div>
		{:else if step === 'completed'}
			<div class="step-container success">
				<Check size={64} color="var(--green-5)" />
				<h3>Transfer Complete!</h3>
				<button class="btn-primary" onclick={onClose}>Done</button>
			</div>
		{/if}
	</div>
</dialog>

<style>
	.p2p-modal {
		background-color: var(--surface-1);
		border-radius: var(--radius-3);
		box-shadow: var(--shadow-5);
		width: 90%;
		max-width: 500px;
		max-height: 90vh;
		overflow-y: auto;
		border: none;
		padding: 0;
		color: var(--text-1);
	}

	.p2p-modal::backdrop {
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

	.content {
		padding: var(--size-4);
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: var(--size-3);
		min-height: 300px;
	}

	.actions {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: var(--size-3);
		width: 100%;
	}

	.action-btn {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: var(--size-2);
		padding: var(--size-5);
		border: 1px solid var(--surface-3);
		border-radius: var(--radius-3);
		background: var(--surface-2);
		cursor: pointer;
		transition: all 0.2s;
		text-align: center;
	}

	.action-btn:hover {
		background: var(--surface-3);
		transform: translateY(-2px);
	}

	.action-btn span {
		font-weight: bold;
		font-size: var(--font-size-2);
	}

	.action-btn small {
		color: var(--text-2);
		font-size: var(--font-size-0);
	}

	.step-container {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: var(--size-3);
		width: 100%;
		text-align: center;
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

	.scanner-wrapper {
		width: 100%;
		max-width: 300px;
		aspect-ratio: 1;
		overflow: hidden;
		border-radius: var(--radius-2);
	}

	.btn-next,
	.btn-primary {
		background-color: var(--brand);
		color: white;
		border: none;
		padding: 0 var(--size-4);
		min-height: var(--touch-target-min);
		border-radius: var(--radius-2);
		cursor: pointer;
		display: flex;
		align-items: center;
		gap: var(--size-2);
		font-weight: bold;
		margin-top: var(--size-2);
	}

	.btn-back {
		background: none;
		border: none;
		color: var(--text-2);
		cursor: pointer;
		display: flex;
		align-items: center;
		gap: var(--size-1);
		margin-top: var(--size-2);
		min-height: var(--touch-target-min);
		padding: 0 var(--size-2);
	}

	.transfer-status {
		display: flex;
		align-items: center;
		gap: var(--size-4);
		color: var(--brand);
		margin: var(--size-4) 0;
	}

	.dots {
		font-size: var(--font-size-5);
		animation: pulse 1.5s infinite;
	}

	@keyframes pulse {
		0% {
			opacity: 0.3;
		}
		50% {
			opacity: 1;
		}
		100% {
			opacity: 0.3;
		}
	}

	.error-state {
		color: var(--red-6);
		text-align: center;
	}

	.manual-code-details {
		width: 100%;
		max-width: 300px;
		text-align: left;
		margin-top: var(--size-2);
	}

	.manual-code-details summary {
		cursor: pointer;
		color: var(--brand);
		font-weight: bold;
		margin-bottom: var(--size-2);
	}

	.manual-code-box {
		display: flex;
		flex-direction: column;
		gap: var(--size-2);
	}

	.manual-code-box textarea {
		width: 100%;
		height: 100px;
		padding: var(--size-2);
		border: 1px solid var(--surface-3);
		border-radius: var(--radius-2);
		background-color: var(--surface-2);
		color: var(--text-2);
		font-family: var(--font-mono);
		font-size: var(--font-size-0);
		resize: none;
	}

	.btn-copy {
		background-color: var(--surface-2);
		border: 1px solid var(--surface-3);
		border-radius: var(--radius-2);
		padding: var(--size-2);
		cursor: pointer;
		color: var(--text-1);
		font-weight: bold;
	}

	.btn-copy:hover {
		background-color: var(--surface-3);
	}

	.manual-input-box {
		width: 100%;
		max-width: 300px;
		display: flex;
		flex-direction: column;
		gap: var(--size-2);
	}

	.manual-input-box textarea {
		width: 100%;
		height: 150px;
		padding: var(--size-2);
		border: 1px solid var(--surface-3);
		border-radius: var(--radius-2);
		background-color: var(--surface-1);
		color: var(--text-1);
		font-family: var(--font-mono);
		font-size: var(--font-size-0);
		resize: none;
	}

	.manual-actions {
		display: flex;
		gap: var(--size-2);
		justify-content: flex-end;
	}

	.btn-text {
		background: none;
		border: none;
		color: var(--brand);
		font-weight: bold;
		cursor: pointer;
		margin-top: var(--size-2);
		text-decoration: underline;
	}

	.btn-text:hover {
		color: var(--brand-dark);
	}
</style>
