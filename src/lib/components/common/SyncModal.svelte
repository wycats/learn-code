<script lang="ts">
	import { ProgressService, type UserProgress } from '$lib/game/progress';
	import { SyncService } from '$lib/services/sync';
	import P2PModal from '$lib/components/builder/P2PModal.svelte';

	interface Props {
		onClose: () => void;
	}

	let { onClose }: Props = $props();

	let localProgress = $state(ProgressService.load());

	function handleReceive(remoteData: unknown) {
		// Validate that remoteData looks like UserProgress
		// In a real app, we'd use Zod parse, but here we can trust SyncService to handle some malformed data or wrap in try/catch
		try {
			const remoteProgress = remoteData as UserProgress;
			const current = ProgressService.load();
			const merged = SyncService.mergeProgress(current, remoteProgress);
			ProgressService.save(merged);
			// Force reload or notify user?
			// For now, just saving is enough, the app reloads progress on mount usually.
			// Ideally we'd have a reactive store for progress.
			window.location.reload(); // Simple way to ensure UI updates
		} catch (e) {
			console.error('Failed to sync progress:', e);
			// alert('Failed to sync progress. Data might be corrupted.');
		}
	}
</script>

{#if localProgress}
	<P2PModal data={localProgress} onReceive={handleReceive} {onClose} />
{/if}
