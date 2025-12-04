<script lang="ts">
	import { enhance } from '$app/forms';
	import { Plus, Trash2, Settings } from 'lucide-svelte';

	let { data } = $props();

	let showCreateDialog = $state(false);
	let selectedAvatar = $state('robot');
	let selectedColor = $state('blue');
	let dialogRef: HTMLDialogElement;

	const avatars = ['robot', 'cat', 'dog', 'alien', 'wizard'];
	const colors = ['blue', 'red', 'green', 'yellow', 'purple'];

	function onSudoRequired() {
		// Redirect to login for re-auth
		window.location.href = '/login/google?redirectTo=/profiles';
	}

	$effect(() => {
		if (showCreateDialog) {
			dialogRef?.showModal();
		} else {
			dialogRef?.close();
		}
	});
</script>

<div class="flex min-h-screen flex-col items-center bg-surface-1 p-4">
	<header class="mb-8 flex w-full max-w-4xl items-center justify-between">
		<h1 class="text-3xl font-bold">Who is playing?</h1>
		<div class="flex gap-2">
			{#if !data.isSudo}
				<button
					onclick={onSudoRequired}
					class="inline-flex items-center justify-center gap-2 rounded-md border border-input bg-background px-4 py-2 text-sm font-medium ring-offset-background transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"
				>
					<Settings class="h-4 w-4" />
					Parent Mode
				</button>
			{:else}
				<div
					class="flex items-center gap-2 rounded-full bg-green-100 px-3 py-1 text-sm text-green-800"
				>
					<Settings class="h-4 w-4" />
					Parent Mode Active
				</div>
			{/if}
		</div>
	</header>

	<div class="grid w-full max-w-4xl grid-cols-2 gap-6 sm:grid-cols-3 md:grid-cols-4">
		{#each data.profiles as profile (profile.id)}
			<div
				class="group relative flex w-full flex-col items-center gap-4 rounded-xl border-2 border-transparent bg-surface-2 p-6 transition-all hover:scale-105 hover:border-primary hover:shadow-lg"
			>
				<form action="?/select" method="POST" use:enhance class="contents">
					<input type="hidden" name="profileId" value={profile.id} />
					<button
						type="submit"
						class="absolute inset-0 h-full w-full cursor-pointer opacity-0"
						aria-label="Select {profile.nickname}"
					></button>
				</form>

				<div
					class="pointer-events-none relative h-24 w-24 overflow-hidden rounded-full bg-{profile.color}-100 p-2"
				>
					<!-- Placeholder for actual avatar component -->
					<div class="flex h-full w-full items-center justify-center text-4xl">
						{#if profile.avatar === 'robot'}🤖
						{:else if profile.avatar === 'cat'}🐱
						{:else if profile.avatar === 'dog'}🐶
						{:else if profile.avatar === 'alien'}👽
						{:else if profile.avatar === 'wizard'}🧙‍♂️
						{:else}👤{/if}
					</div>
				</div>
				<span class="pointer-events-none text-xl font-bold">{profile.nickname}</span>

				{#if data.isSudo}
					<div
						class="absolute right-2 top-2 z-10 opacity-0 transition-opacity group-hover:opacity-100"
					>
						<form action="?/delete" method="POST" use:enhance>
							<input type="hidden" name="profileId" value={profile.id} />
							<button
								class="inline-flex h-8 w-8 items-center justify-center rounded-md text-sm font-medium text-destructive ring-offset-background transition-colors hover:bg-destructive/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"
							>
								<Trash2 class="h-4 w-4" />
							</button>
						</form>
					</div>
				{/if}
			</div>
		{/each}

		<!-- Add Profile Button -->
		<button
			onclick={() => (showCreateDialog = true)}
			class="flex h-full w-full flex-col items-center justify-center gap-4 rounded-xl border-2 border-dashed border-muted-foreground/20 bg-transparent p-6 transition-all hover:border-primary hover:bg-surface-2"
		>
			<div class="flex h-24 w-24 items-center justify-center rounded-full bg-surface-2">
				<Plus class="h-10 w-10 text-muted-foreground" />
			</div>
			<span class="text-xl font-medium text-muted-foreground">Add Profile</span>
		</button>

		<dialog
			bind:this={dialogRef}
			class="w-full max-w-lg rounded-lg border bg-background p-6 shadow-lg backdrop:bg-black/50"
			onclose={() => (showCreateDialog = false)}
		>
			<div class="flex flex-col space-y-1.5 text-center sm:text-left">
				<h2 class="text-lg font-semibold leading-none tracking-tight">Create New Profile</h2>
			</div>
			<form
				action="?/create"
				method="POST"
				use:enhance={() => {
					return async ({ result }) => {
						if (result.type === 'success') {
							showCreateDialog = false;
						}
					};
				}}
			>
				<div class="grid gap-4 py-4">
					<div class="grid gap-2">
						<label
							for="nickname"
							class="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
							>Nickname</label
						>
						<input
							id="nickname"
							name="nickname"
							placeholder="e.g. Zoey"
							required
							class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
						/>
					</div>
					<div class="grid gap-2">
						<label
							class="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
							>Avatar</label
						>
						<div class="flex gap-2">
							{#each avatars as avatar (avatar)}
								<button
									type="button"
									class="flex h-10 w-10 items-center justify-center rounded-full border-2 transition-all {selectedAvatar ===
									avatar
										? 'border-primary bg-primary/10'
										: 'border-transparent hover:bg-surface-2'}"
									onclick={() => (selectedAvatar = avatar)}
								>
									{#if avatar === 'robot'}🤖
									{:else if avatar === 'cat'}🐱
									{:else if avatar === 'dog'}🐶
									{:else if avatar === 'alien'}👽
									{:else if avatar === 'wizard'}🧙‍♂️
									{/if}
								</button>
							{/each}
							<input type="hidden" name="avatar" value={selectedAvatar} />
						</div>
					</div>
					<div class="grid gap-2">
						<label
							class="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
							>Color</label
						>
						<div class="flex gap-2">
							{#each colors as color (color)}
								<button
									type="button"
									class="h-8 w-8 rounded-full border-2 transition-all {selectedColor === color
										? 'scale-110 border-black'
										: 'border-transparent'}"
									style="background-color: var(--{color}-5)"
									onclick={() => (selectedColor = color)}
								></button>
							{/each}
							<input type="hidden" name="color" value={selectedColor} />
						</div>
					</div>
				</div>
				<div class="flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2">
					<button
						type="button"
						onclick={() => (showCreateDialog = false)}
						class="mt-2 inline-flex h-10 items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium ring-offset-background transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 sm:mt-0"
					>
						Cancel
					</button>
					<button
						type="submit"
						class="inline-flex h-10 items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground ring-offset-background transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"
						>Create Profile</button
					>
				</div>
			</form>
		</dialog>
	</div>
</div>
