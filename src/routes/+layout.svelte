<script lang="ts">
	import '../app.css';
	import favicon from '$lib/assets/favicon.svg';
	import ToastContainer from '$lib/components/common/ToastContainer.svelte';
	import OfflineIndicator from '$lib/components/common/OfflineIndicator.svelte';
	import { swManager } from '$lib/services/sw-manager';

	// Ensure SW manager is initialized
	$effect(() => {
		// Accessing the property to ensure it's not tree-shaken,
		// though the import side-effect might be enough.
		// The singleton pattern in the file handles init.
		console.log('SW Manager active');
	});

	let { children } = $props();
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

<ToastContainer />
<OfflineIndicator />
{@render children()}
