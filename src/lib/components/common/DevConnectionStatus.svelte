<script lang="ts">
	import { WifiOff } from 'lucide-svelte';

	let isConnected = $state(true);
	let isDev = import.meta.env.DEV;

	$effect(() => {
		if (!isDev) return;

		if (import.meta.hot) {
			import.meta.hot.on('vite:ws:disconnect', () => {
				isConnected = false;
			});

			import.meta.hot.on('vite:ws:connect', () => {
				isConnected = true;
			});
		}
	});
</script>

{#if isDev && !isConnected}
	<div class="dev-status" title="Dev Server Disconnected">
		<WifiOff size={16} />
		<span class="label">Dev Server Offline</span>
	</div>
{/if}

<style>
	.dev-status {
		display: flex;
		align-items: center;
		gap: var(--size-2);
		padding: var(--size-1) var(--size-3);
		background-color: var(--red-7);
		color: white;
		border-radius: var(--radius-pill);
		font-size: var(--font-size-0);
		font-weight: bold;
		box-shadow: var(--shadow-2);
		border: 1px solid var(--red-8);
		white-space: nowrap;
	}

	.label {
		display: none;
	}

	@media (min-width: 600px) {
		.label {
			display: inline;
		}
	}
</style>
