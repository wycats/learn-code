<script lang="ts">
	import { syncStatus } from '$lib/services/cloud-sync';
	import { RefreshCw, CloudOff } from 'lucide-svelte';
	import { fade } from 'svelte/transition';

	let statusText = $derived($syncStatus);
	let statusLabel = $derived(`Sync Status: ${statusText}`);
</script>

{#if $syncStatus !== 'idle'}
	<div class="sync-status" title={statusLabel} role="status" aria-label={statusLabel}>
		<span class="visually-hidden">{statusLabel}</span>
		{#if $syncStatus === 'syncing'}
			<div transition:fade={{ duration: 200 }} class="spin-wrapper">
				<RefreshCw size={16} />
			</div>
		{:else if $syncStatus === 'error' || $syncStatus === 'offline'}
			<div transition:fade={{ duration: 200 }}>
				<CloudOff size={16} color="var(--red-5)" />
			</div>
		{/if}
	</div>
{/if}

<style>
	.sync-status {
		display: flex;
		align-items: center;
		justify-content: center;
		width: var(--touch-target-min);
		height: var(--touch-target-min);
		border: 1px solid var(--surface-3);
		border-radius: var(--radius-2);
		background-color: var(--surface-2);
		color: var(--text-2);
	}

	.visually-hidden {
		position: absolute;
		width: 1px;
		height: 1px;
		padding: 0;
		margin: -1px;
		overflow: hidden;
		clip: rect(0, 0, 0, 0);
		white-space: nowrap;
		border: 0;
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
