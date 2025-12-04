<script lang="ts">
	import { Github, QrCode } from 'lucide-svelte';
	import { onDestroy } from 'svelte';
	import QRCode from 'qrcode';
	import { base } from '$app/paths';
	import { goto } from '$app/navigation';

	let handshakeCode = $state<string | null>(null);
	let qrDataUrl = $state<string | null>(null);
	let pollingInterval: ReturnType<typeof setInterval>;

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
		if (handshakeCode) return; // Already started

		const res = await fetch('/api/auth/handshake/create', { method: 'POST' });
		const data = await res.json();
		handshakeCode = data.code;

		const url = `${window.location.origin}/auth/handshake?code=${handshakeCode}`;
		qrDataUrl = await QRCode.toDataURL(url, { width: 200, margin: 2 });

		pollingInterval = setInterval(checkStatus, 2000);
	}

	async function checkStatus() {
		if (!handshakeCode) return;
		const res = await fetch(`/api/auth/handshake/status?code=${handshakeCode}`);
		const data = await res.json();

		if (data.status === 'authorized') {
			clearInterval(pollingInterval);
			window.location.href = '/profiles';
		}
	}

	onDestroy(() => {
		if (pollingInterval) clearInterval(pollingInterval);
	});
</script>

<div class="flex min-h-screen items-center justify-center bg-surface-1 p-4">
	<div class="w-full max-w-md rounded-xl border bg-surface-2 text-card-foreground shadow-sm">
		<div class="flex flex-col space-y-1.5 p-6 text-center">
			<h3 class="text-2xl font-bold leading-none tracking-tight">Parent Login</h3>
			<p class="text-sm text-muted-foreground">
				Sign in to save progress and manage profiles for your children.
			</p>
		</div>
		<div class="grid gap-4 p-6 pt-0">
			<button
				onclick={goToGoogle}
				class="inline-flex h-10 w-full items-center justify-center gap-2 whitespace-nowrap rounded-md border border-input bg-background px-4 py-2 text-sm font-medium ring-offset-background transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"
			>
				<svg class="h-5 w-5" viewBox="0 0 24 24">
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
			<button
				onclick={goToGithub}
				class="inline-flex h-10 w-full items-center justify-center gap-2 whitespace-nowrap rounded-md border border-input bg-background px-4 py-2 text-sm font-medium ring-offset-background transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"
			>
				<Github class="h-5 w-5" />
				Sign in with GitHub
			</button>

			<div class="relative">
				<div class="absolute inset-0 flex items-center">
					<span class="w-full border-t"></span>
				</div>
				<div class="relative flex justify-center text-xs uppercase">
					<span class="bg-surface-1 px-2 text-muted-foreground">Or</span>
				</div>
			</div>

			{#if !handshakeCode}
				<button
					onclick={startHandshake}
					class="inline-flex h-10 w-full items-center justify-center gap-2 whitespace-nowrap rounded-md bg-secondary px-4 py-2 text-sm font-medium text-secondary-foreground ring-offset-background transition-colors hover:bg-secondary/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"
				>
					<QrCode class="h-5 w-5" />
					Log in with Parent's Phone
				</button>
			{:else}
				<div class="flex flex-col items-center gap-4 rounded-lg border bg-surface-2 p-4">
					<p class="text-sm font-medium">Scan with Parent's Phone</p>
					{#if qrDataUrl}
						<img src={qrDataUrl} alt="Scan to login" class="rounded-md bg-white p-2" />
					{/if}
					<p class="text-xs text-muted-foreground">Waiting for authorization...</p>
				</div>
			{/if}
		</div>
		<div class="flex flex-col gap-4 p-6 pt-0 text-center text-sm text-muted-foreground">
			<p>
				We use a "Parent-Owned" account model to comply with COPPA and keep your children safe. We
				do not collect personal information from children.
			</p>
			<button onclick={goBack} class="underline hover:text-primary">Back to Game</button>
		</div>
	</div>
</div>
