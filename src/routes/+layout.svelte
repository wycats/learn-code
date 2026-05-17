<script lang="ts">
	import '../app.css';
	// Fonts
	import '@fontsource-variable/inter';
	import '@fontsource-variable/outfit';
	import '@fontsource-variable/jetbrains-mono';

	import favicon from '$lib/assets/favicon.svg';
	import ToastContainer from '$lib/components/common/ToastContainer.svelte';
	import OfflineIndicator from '$lib/components/common/OfflineIndicator.svelte';
	import { swManager } from '$lib/services/sw-manager';
	import { CloudSyncService } from '$lib/services/cloud-sync';
	import type { LayoutData } from './$types';
	import type { Snippet } from 'svelte';

	let { children, data } = $props<{ children: Snippet; data: LayoutData }>();

	// Ensure SW manager is initialized
	$effect(() => {
		// Accessing the property to ensure it's not tree-shaken,
		// though the import side-effect might be enough.
		// The singleton pattern in the file handles init.
		console.log('SW Manager active', swManager);
		if (data.user) {
			CloudSyncService.pull();
		}
	});
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

<ToastContainer />
<OfflineIndicator />
{@render children()}
