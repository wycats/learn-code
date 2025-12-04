<script lang="ts">
	import { enhance } from '$app/forms';
	import { base } from '$app/paths';
	import { goto } from '$app/navigation';
	import { Check, X } from 'lucide-svelte';

	let { data, form } = $props();
	const homeUrl = `${base}/`;

	function goHome() {
		// eslint-disable-next-line svelte/no-navigation-without-resolve
		goto(homeUrl);
	}
</script>

<div class="flex min-h-screen items-center justify-center bg-surface-1 p-4">
	<div class="w-full max-w-md rounded-xl border bg-surface-2 text-card-foreground shadow-sm">
		<div class="flex flex-col space-y-1.5 p-6 text-center">
			<h3 class="text-2xl font-bold leading-none tracking-tight">Authorize Device?</h3>
			<p class="text-sm text-muted-foreground">
				Do you want to log in to this device as <strong
					>{data.user?.name || data.user?.email}</strong
				>?
			</p>
		</div>

		{#if data.error}
			<div class="p-6 pt-0">
				<div class="rounded-md bg-destructive/10 p-4 text-destructive">
					{data.error}
				</div>
			</div>
			<div class="flex items-center p-6 pt-0">
				<button
					onclick={goHome}
					class="inline-flex h-10 w-full items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium ring-offset-background transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"
					>Return Home</button
				>
			</div>
		{:else if form?.success}
			<div class="p-6 pt-0">
				<div class="flex flex-col items-center gap-4 py-8 text-green-600">
					<div class="rounded-full bg-green-100 p-4">
						<Check class="h-8 w-8" />
					</div>
					<p class="text-lg font-medium">Device Authorized!</p>
					<p class="text-sm text-muted-foreground">You can close this window.</p>
				</div>
			</div>
			<div class="flex items-center p-6 pt-0">
				<button
					onclick={goHome}
					class="inline-flex h-10 w-full items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium ring-offset-background transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"
					>Return Home</button
				>
			</div>
		{:else}
			<div class="flex justify-center p-6 pt-0 py-8">
				<div class="text-6xl">📱 ↔️ 📱</div>
			</div>
			<div class="flex items-center gap-4 p-6 pt-0">
				<form action="?/reject" method="POST" use:enhance class="flex-1">
					<input type="hidden" name="code" value={data.code} />
					<button
						type="submit"
						class="inline-flex h-10 w-full items-center justify-center gap-2 rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-destructive ring-offset-background transition-colors hover:bg-destructive/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"
					>
						<X class="h-4 w-4" />
						Reject
					</button>
				</form>
				<form action="?/authorize" method="POST" use:enhance class="flex-1">
					<input type="hidden" name="code" value={data.code} />
					<button
						type="submit"
						class="inline-flex h-10 w-full items-center justify-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground ring-offset-background transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"
					>
						<Check class="h-4 w-4" />
						Authorize
					</button>
				</form>
			</div>
		{/if}
	</div>
</div>
