<script lang="ts">
	import { syncStatus } from '$lib/services/cloud-sync';
	import { RefreshCw, CloudOff } from 'lucide-svelte';
	import { fade } from 'svelte/transition';
</script>

<div class="sync-status" title="Sync Status: {$syncStatus}">
	{#if $syncStatus === 'syncing'}
		<div transition:fade={{ duration: 200 }} class="spin-wrapper">
			<RefreshCw size={16} />
		</div>
	{:else if $syncStatus === 'error' || $syncStatus === 'offline'}
		<div transition:fade={{ duration: 200 }}>
			<CloudOff size={16} color="var(--red-5)" />
		</div>
	{:else}
		<!-- Idle state: Show nothing to reduce visual noise -->
	{/if}
</div>

<style>
	.sync-status {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 24px;
		height: 24px;
	}

	.spin-wrapper {
		animation: spin 1s linear infinite;
		color: var(--brand);
		display: flex;
	}

	@keyframes spin {
		from {
			transform: rotate(0deg);
		}
		to {
			transform: rotate(360deg);
		}
	}
</style>
