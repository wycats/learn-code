<script lang="ts">
	import { Github, Smartphone } from 'lucide-svelte';
	import { onDestroy, onMount } from 'svelte';
	import QRCode from 'qrcode';
	import { base } from '$app/paths';
	import { goto } from '$app/navigation';

	let handshakeCode = $state<string | null>(null);
	let qrDataUrl = $state<string | null>(null);
	let pollingInterval: ReturnType<typeof setInterval>;
	let showParentLogin = $state(false);

	const googleLoginUrl = `${base}/login/google`;
	const githubLoginUrl = `${base}/login/github`;
	const backUrl = `${base}/`;

	function goToGoogle() {
		// eslint-disable-next-line svelte/no-navigation-without-resolve
		goto(googleLoginUrl);
	}

	function goToGithub() {
		// eslint-disable-next-line svelte/no-navigation-without-resolve
		goto(githubLoginUrl);
	}

	function goBack() {
		// eslint-disable-next-line svelte/no-navigation-without-resolve
		goto(backUrl);
	}

	async function startHandshake() {
		if (handshakeCode) return;

		try {
			const res = await fetch('/api/auth/handshake/create', { method: 'POST' });
			const data = await res.json();
			handshakeCode = data.id;

			const url = `${window.location.origin}/auth/handshake?code=${handshakeCode}`;
			qrDataUrl = await QRCode.toDataURL(url, { width: 240, margin: 2 });

			pollingInterval = setInterval(checkStatus, 2000);
		} catch (e) {
			console.error('Failed to start handshake', e);
		}
	}

	async function checkStatus() {
		if (!handshakeCode) return;
		try {
			const res = await fetch(`/api/auth/handshake/status?code=${handshakeCode}`);
			const data = await res.json();

			if (data.status === 'authorized') {
				clearInterval(pollingInterval);
				window.location.href = '/profiles';
			}
		} catch (e) {
			console.error('Polling failed', e);
		}
	}

	onMount(() => {
		startHandshake();
	});

	onDestroy(() => {
		if (pollingInterval) clearInterval(pollingInterval);
	});
</script>

<div class="page-container">
	<div class="card">
		{#if !showParentLogin}
			<!-- Child / Device View -->
			<div class="header">
				<h3>Connect Device</h3>
				<p class="muted-text">Ask a parent to scan this code to log in.</p>
			</div>
			<div class="content">
				{#if qrDataUrl}
					<div class="qr-container">
						<img src={qrDataUrl} alt="Scan to login" class="qr-code" />
					</div>

					{#if handshakeCode}
						<div class="code-display">
							<span class="code-label">Or enter code:</span>
							<span class="code-value">{handshakeCode}</span>
						</div>
					{/if}

					<div class="instructions">
						<p>1. Open <strong>Learn Coding</strong> on parent's phone</p>
						<p>2. Log in and tap <strong>Scan Code</strong></p>
					</div>
				{:else}
					<div class="loading-container">
						<div class="spinner"></div>
					</div>
				{/if}

				<div class="divider">
					<span>Or</span>
				</div>

				<button onclick={() => (showParentLogin = true)} class="link-btn">
					I am a Parent (Log in on this device)
				</button>
			</div>
		{:else}
			<!-- Parent Login View -->
			<div class="header">
				<h3>Parent Login</h3>
				<p class="muted-text">Sign in to manage your family account.</p>
			</div>
			<div class="content">
				<button onclick={goToGoogle} class="btn outline">
					<!-- Google SVG -->
					<svg class="icon" viewBox="0 0 24 24">
						<path
							d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
							fill="#4285F4"
						/>
						<path
							d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
							fill="#34A853"
						/>
						<path
							d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
							fill="#FBBC05"
						/>
						<path
							d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
							fill="#EA4335"
						/>
					</svg>
					Sign in with Google
				</button>
				<button onclick={goToGithub} class="btn outline">
					<Github class="icon" />
					Sign in with GitHub
				</button>

				<div class="divider">
					<span>Or</span>
				</div>

				<button onclick={() => (showParentLogin = false)} class="btn secondary">
					<Smartphone class="icon" />
					Back to Device Connect
				</button>
			</div>
		{/if}

		<div class="footer">
			<button onclick={goBack} class="link-btn">Back to Game</button>
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
		padding: var(--size-6);
		text-align: center;
		display: flex;
		flex-direction: column;
		gap: var(--size-2);
	}

	h3 {
		font-size: var(--font-size-4);
		font-weight: var(--font-weight-7);
		margin: 0;
	}

	.muted-text {
		color: var(--text-2);
		font-size: var(--font-size-1);
		margin: 0;
	}

	.content {
		padding: var(--size-6);
		padding-top: 0;
		display: flex;
		flex-direction: column;
		gap: var(--size-4);
		align-items: center;
	}

	.qr-container {
		background-color: white;
		padding: var(--size-4);
		border-radius: var(--radius-2);
		box-shadow: var(--shadow-1);
	}

	.qr-code {
		width: 12rem;
		height: 12rem;
		display: block;
	}

	.code-display {
		background-color: var(--surface-3);
		padding: var(--size-2) var(--size-4);
		border-radius: var(--radius-2);
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: var(--size-1);
		margin-top: var(--size-2);
		border: 1px solid var(--surface-4);
	}

	.code-label {
		font-size: var(--font-size-0);
		color: var(--text-2);
		text-transform: uppercase;
		letter-spacing: 0.05em;
	}

	.code-value {
		font-family: var(--font-mono);
		font-size: var(--font-size-4);
		font-weight: var(--font-weight-7);
		letter-spacing: 0.1em;
		color: var(--text-1);
	}

	.instructions {
		text-align: center;
		font-size: var(--font-size-1);
		color: var(--text-2);
	}

	.instructions p {
		margin: var(--size-1) 0;
	}

	.loading-container {
		height: 12rem;
		width: 12rem;
		display: flex;
		align-items: center;
		justify-content: center;
		background-color: var(--surface-3);
		border-radius: var(--radius-2);
	}

	.spinner {
		width: var(--size-8);
		height: var(--size-8);
		border: 4px solid var(--surface-4);
		border-top-color: var(--brand);
		border-radius: 50%;
		animation: spin 1s linear infinite;
	}

	@keyframes spin {
		to {
			transform: rotate(360deg);
		}
	}

	.divider {
		width: 100%;
		display: flex;
		align-items: center;
		text-align: center;
		color: var(--text-2);
		font-size: var(--font-size-0);
		text-transform: uppercase;
		letter-spacing: 0.05em;
		margin-block: var(--size-2);
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
		font-weight: var(--font-weight-6);
		cursor: pointer;
		border: none;
		transition: background-color 0.2s;
		height: var(--size-8);
		font-size: var(--font-size-1);
	}

	.btn.outline {
		background-color: var(--surface-1);
		color: var(--text-1);
		border: 1px solid var(--surface-3);
	}

	.btn.outline:hover {
		background-color: var(--surface-3);
	}

	.btn.secondary {
		background-color: var(--surface-3);
		color: var(--text-1);
	}

	.btn.secondary:hover {
		background-color: var(--surface-4);
	}

	.link-btn {
		background: none;
		border: none;
		color: var(--brand);
		text-decoration: underline;
		cursor: pointer;
		font-size: var(--font-size-1);
	}

	.link-btn:hover {
		color: var(--brand-light);
	}

	.icon {
		width: var(--size-5);
		height: var(--size-5);
	}

	.footer {
		padding: var(--size-4);
		text-align: center;
		border-top: 1px solid var(--surface-3);
	}
</style>
