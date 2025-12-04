<script lang="ts">
	import { goto } from '$app/navigation';
	import { base } from '$app/paths';
	import { Code, ArrowRight, Hammer, ScanLine, RefreshCw } from 'lucide-svelte';
	import ThemeToggle from '$lib/components/common/ThemeToggle.svelte';
	import SyncModal from '$lib/components/common/SyncModal.svelte';

	let showSync = $state(false);

	function handleStart() {
		// eslint-disable-next-line svelte/no-navigation-without-resolve
		goto(`${base}/library`);
	}

	function handleCreate() {
		// eslint-disable-next-line svelte/no-navigation-without-resolve
		goto(`${base}/builder/packs`);
	}

	function handleScan() {
		// eslint-disable-next-line svelte/no-navigation-without-resolve
		goto(`${base}/play`);
	}
</script>

{#if showSync}
	<SyncModal onClose={() => (showSync = false)} />
{/if}

<div class="landing-container">
	<div class="top-bar">
		<ThemeToggle />
	</div>
	<div class="hero">
		<div class="logo-icon">
			<Code size={64} strokeWidth={2} />
		</div>
		<h1>Code Climber</h1>
		<p class="tagline">Master the logic of code, one block at a time.</p>

		<div class="actions">
			<button class="cta-button primary" onclick={handleStart}>
				<span>Start Coding</span>
				<ArrowRight size={20} />
			</button>

			<button class="cta-button secondary" onclick={handleCreate}>
				<span>Builder Mode</span>
				<Hammer size={20} />
			</button>

			<div class="secondary-actions">
				<button class="cta-button tertiary" onclick={handleScan}>
					<span>Scan Level</span>
					<ScanLine size={20} />
				</button>

				<button class="cta-button tertiary" onclick={() => (showSync = true)}>
					<span>Sync Devices</span>
					<RefreshCw size={20} />
				</button>
			</div>
		</div>

		<a href="mailto:feedback@wonderblocks.app?subject=Code Climber Feedback" class="feedback-link">
			Send Feedback
		</a>
	</div>
</div>

<style>
	.landing-container {
		height: 100vh;
		display: grid;
		place-items: center;
		background-color: var(--surface-1);
		background-image: radial-gradient(circle at center, var(--surface-2) 0%, transparent 70%);
		position: relative;
	}

	.top-bar {
		position: absolute;
		top: var(--size-3);
		right: var(--size-3);
		z-index: 10;
	}

	.hero {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: var(--size-6);
		text-align: center;
		padding: var(--size-6);
		width: 100%;
		max-width: 400px;
	}

	.logo-icon {
		color: var(--brand);
		background-color: var(--surface-2);
		padding: var(--size-4);
		border-radius: var(--radius-round);
		box-shadow: var(--shadow-3);
		border: 1px solid var(--surface-3);
	}

	h1 {
		font-size: var(--font-size-7);
		font-weight: 900;
		margin: 0;
		background: linear-gradient(to right, var(--brand), var(--brand-light));
		-webkit-background-clip: text;
		-webkit-text-fill-color: transparent;
	}

	.tagline {
		font-size: var(--font-size-4);
		color: var(--text-2);
		margin: 0;
		max-width: 25ch;
	}

	.actions {
		display: flex;
		flex-direction: column;
		gap: var(--size-3);
		width: 100%;
		margin-top: var(--size-4);
	}

	.secondary-actions {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: var(--size-3);
	}

	.cta-button {
		border: none;
		padding: var(--size-3) var(--size-6);
		border-radius: var(--radius-pill);
		font-size: var(--font-size-3);
		font-weight: 700;
		cursor: pointer;
		display: flex;
		align-items: center;
		justify-content: center;
		gap: var(--size-2);
		transition:
			transform 0.2s var(--ease-3),
			box-shadow 0.2s var(--ease-3);
		box-shadow: var(--shadow-3);
		width: 100%;
	}

	.cta-button:hover {
		transform: translateY(-2px);
		box-shadow: var(--shadow-4);
	}

	.cta-button:active {
		transform: translateY(0);
	}

	.cta-button.primary {
		background-color: var(--brand);
		color: white;
	}

	.cta-button.primary:hover {
		background-color: var(--brand-light);
	}

	.cta-button.secondary {
		background-color: var(--surface-3);
		color: var(--text-1);
	}

	.cta-button.secondary:hover {
		background-color: var(--surface-4);
	}

	.cta-button.tertiary {
		background-color: transparent;
		color: var(--text-2);
		box-shadow: none;
		border: 1px solid var(--surface-3);
		padding: var(--size-3);
		font-size: var(--font-size-1);
	}

	.cta-button.tertiary:hover {
		background-color: var(--surface-2);
		color: var(--text-1);
	}

	.feedback-link {
		color: var(--text-3);
		font-size: var(--font-size-1);
		text-decoration: none;
		opacity: 0.7;
		transition: opacity 0.2s;
	}

	.feedback-link:hover {
		opacity: 1;
		text-decoration: underline;
	}
</style>
