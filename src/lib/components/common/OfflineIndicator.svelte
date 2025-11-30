<script lang="ts">
	import { onMount } from 'svelte';
	import { WifiOff } from 'lucide-svelte';
	import { fade, fly } from 'svelte/transition';

	let isOnline = $state(true);

	onMount(() => {
		isOnline = navigator.onLine;

		const updateOnlineStatus = () => {
			isOnline = navigator.onLine;
		};

		window.addEventListener('online', updateOnlineStatus);
		window.addEventListener('offline', updateOnlineStatus);

		return () => {
			window.removeEventListener('online', updateOnlineStatus);
			window.removeEventListener('offline', updateOnlineStatus);
		};
	});
</script>

{#if !isOnline}
	<div
		class="offline-indicator"
		in:fly={{ y: 20, duration: 300 }}
		out:fade={{ duration: 200 }}
		role="status"
		aria-live="polite"
	>
		<WifiOff size={16} />
		<span>Offline Mode</span>
	</div>
{/if}

<style>
	.offline-indicator {
		position: fixed;
		bottom: 20px;
		left: 50%;
		transform: translateX(-50%);
		background-color: var(--surface-1);
		color: var(--text-1);
		border: 1px solid var(--surface-3);
		padding: 8px 16px;
		border-radius: var(--radius-full);
		display: flex;
		align-items: center;
		gap: 8px;
		font-size: var(--font-size-0);
		font-weight: var(--font-weight-5);
		box-shadow: var(--shadow-3);
		z-index: 1000;
		pointer-events: none; /* Let clicks pass through */
	}
</style>
