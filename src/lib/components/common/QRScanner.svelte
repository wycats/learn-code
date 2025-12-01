<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { Html5QrcodeScanner } from 'html5-qrcode';

	interface Props {
		onScan: (data: string) => void;
		onError?: (err: string) => void;
	}

	let { onScan, onError }: Props = $props();

	let scannerId = 'qr-reader';
	let scanner: Html5QrcodeScanner | null = null;

	onMount(() => {
		scanner = new Html5QrcodeScanner(
			scannerId,
			{ fps: 10, qrbox: { width: 250, height: 250 } },
			/* verbose= */ false
		);
		scanner.render(onScan, onError);
	});

	onDestroy(() => {
		scanner?.clear();
	});
</script>

<div id={scannerId}></div>

<style>
	:global(#qr-reader) {
		width: 100%;
		max-width: 500px;
		margin: 0 auto;
		border: none !important;
	}

	:global(#qr-reader__scan_region) {
		background: var(--surface-2);
		border-radius: var(--radius-2);
	}

	:global(#qr-reader__dashboard_section_csr button) {
		background-color: var(--brand);
		color: white;
		border: none;
		padding: var(--size-2) var(--size-3);
		border-radius: var(--radius-2);
		cursor: pointer;
		font-family: var(--font-sans);
		font-weight: bold;
		margin-top: var(--size-3);
	}
</style>
