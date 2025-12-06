<script lang="ts">
	/* eslint-disable svelte/no-navigation-without-resolve */
	import { enhance } from '$app/forms';
	import { Plus } from 'lucide-svelte';
	import type { PageData } from './$types';

	let { data } = $props<{ data: PageData }>();
	let showAddForm = $state(false);
</script>

<div class="page-container">
	<div class="content-wrapper">
		<h1>Who is playing?</h1>

		{#if !showAddForm}
			<div class="profiles-grid">
				{#each data.profiles as profile (profile.id)}
					<form method="POST" action="?/selectProfile" use:enhance>
						<input type="hidden" name="profileId" value={profile.id} />
						<button type="submit" class="profile-card">
							<div
								class="avatar"
								style="background-color: {profile.color}20; border-color: {profile.color}"
							>
								<span class="avatar-emoji">
									{#if profile.avatar === 'robot'}🤖
									{:else if profile.avatar === 'cat'}🐱
									{:else if profile.avatar === 'dog'}🐶
									{:else}👤{/if}
								</span>
							</div>
							<span class="nickname">{profile.nickname}</span>
						</button>
					</form>
				{/each}

				<button onclick={() => (showAddForm = true)} class="profile-card add-profile">
					<div class="avatar add-avatar">
						<Plus size={48} />
					</div>
					<span class="nickname">Add Profile</span>
				</button>
			</div>

			<div class="footer-actions">
				<a href="/auth/handshake/scan" class="btn outline">
					<svg
						xmlns="http://www.w3.org/2000/svg"
						width="20"
						height="20"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						stroke-width="2"
						stroke-linecap="round"
						stroke-linejoin="round"
					>
						<rect width="5" height="5" x="3" y="3" rx="1" />
						<rect width="5" height="5" x="16" y="3" rx="1" />
						<rect width="5" height="5" x="3" y="16" rx="1" />
						<path d="M21 16h-3a2 2 0 0 0-2 2v3" />
						<path d="M21 21v.01" />
						<path d="M12 7v3a2 2 0 0 1-2 2H7" />
						<path d="M3 12h.01" />
						<path d="M12 3h.01" />
						<path d="M12 16v.01" />
						<path d="M16 12h1" />
						<path d="M21 12v.01" />
						<path d="M12 21v-1" />
					</svg>
					Scan Device Code
				</a>
			</div>
		{:else}
			<div class="form-card">
				<h2>New Profile</h2>
				<form method="POST" action="?/createProfile" use:enhance>
					<div class="form-group">
						<label for="nickname">Nickname</label>
						<input type="text" name="nickname" id="nickname" required placeholder="e.g. Zoey" />
					</div>

					<div class="form-group">
						<label>Avatar</label>
						<div class="radio-group">
							{#each ['robot', 'cat', 'dog', 'person'] as avatar (avatar)}
								<label class="radio-label">
									<input type="radio" name="avatar" value={avatar} required />
									<div class="radio-tile">
										<span class="emoji">
											{#if avatar === 'robot'}🤖
											{:else if avatar === 'cat'}🐱
											{:else if avatar === 'dog'}��
											{:else}👤{/if}
										</span>
									</div>
								</label>
							{/each}
						</div>
					</div>

					<div class="form-group">
						<label>Color</label>
						<div class="radio-group">
							{#each ['#ef4444', '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6'] as color (color)}
								<label class="radio-label">
									<input type="radio" name="color" value={color} required />
									<div class="color-tile" style="background-color: {color}"></div>
								</label>
							{/each}
						</div>
					</div>

					<div class="form-actions">
						<button type="button" class="btn secondary" onclick={() => (showAddForm = false)}>
							Cancel
						</button>
						<button type="submit" class="btn primary">Create Profile</button>
					</div>
				</form>
			</div>
		{/if}
	</div>
</div>

<style>
	.page-container {
		min-height: 100vh;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		background-color: var(--surface-1);
		padding: var(--size-4);
	}

	.content-wrapper {
		width: 100%;
		max-width: 1024px;
		text-align: center;
		display: flex;
		flex-direction: column;
		gap: var(--size-8);
	}

	h1 {
		font-size: var(--font-size-7);
		font-weight: 900;
		margin: 0;
	}

	.profiles-grid {
		display: flex;
		flex-wrap: wrap;
		justify-content: center;
		gap: var(--size-8);
	}

	.profile-card {
		background: none;
		border: none;
		cursor: pointer;
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: var(--size-4);
		transition: transform 0.2s var(--ease-3);
	}

	.profile-card:hover {
		transform: scale(1.05);
	}

	.avatar {
		width: var(--size-13);
		height: var(--size-13);
		border-radius: var(--radius-round);
		display: flex;
		align-items: center;
		justify-content: center;
		border: 4px solid transparent;
		background-color: var(--surface-2);
		box-shadow: var(--shadow-3);
		transition: border-color 0.2s;
	}

	.profile-card:hover .avatar {
		border-color: var(--brand);
	}

	.avatar-emoji {
		font-size: var(--font-size-8);
	}

	.nickname {
		font-size: var(--font-size-4);
		font-weight: 600;
		color: var(--text-1);
	}

	.add-profile .nickname {
		color: var(--text-3);
	}

	.add-avatar {
		border: 4px dashed var(--surface-3);
		background-color: var(--surface-2);
		color: var(--text-3);
	}

	.add-profile:hover .add-avatar {
		border-color: var(--brand);
		background-color: var(--surface-3);
	}

	/* Form Styles */
	.form-card {
		background-color: var(--surface-2);
		padding: var(--size-6);
		border-radius: var(--radius-3);
		box-shadow: var(--shadow-2);
		max-width: 480px;
		margin: 0 auto;
		text-align: left;
		width: 100%;
	}

	h2 {
		margin-bottom: var(--size-4);
		font-size: var(--font-size-5);
	}

	.form-group {
		margin-bottom: var(--size-4);
	}

	label {
		display: block;
		font-size: var(--font-size-1);
		font-weight: 600;
		margin-bottom: var(--size-2);
	}

	input[type='text'] {
		width: 100%;
		padding: var(--size-2) var(--size-3);
		border-radius: var(--radius-2);
		border: 1px solid var(--surface-3);
		background-color: var(--surface-1);
		color: var(--text-1);
		font-size: var(--font-size-2);
	}

	.radio-group {
		display: flex;
		gap: var(--size-3);
	}

	.radio-label {
		cursor: pointer;
	}

	.radio-label input {
		position: absolute;
		opacity: 0;
		width: 0;
		height: 0;
	}

	.radio-tile {
		width: var(--size-9);
		height: var(--size-9);
		border-radius: var(--radius-round);
		display: flex;
		align-items: center;
		justify-content: center;
		border: 2px solid transparent;
		background-color: var(--surface-1);
	}

	.radio-label input:checked + .radio-tile {
		border-color: var(--brand);
		background-color: var(--brand-surface);
	}

	.emoji {
		font-size: var(--font-size-5);
	}

	.color-tile {
		width: var(--size-7);
		height: var(--size-7);
		border-radius: var(--radius-round);
		border: 2px solid transparent;
	}

	.radio-label input:checked + .color-tile {
		border-color: var(--text-1);
		transform: scale(1.1);
	}

	.form-actions {
		display: flex;
		gap: var(--size-3);
		margin-top: var(--size-6);
	}

	.btn {
		flex: 1;
		padding: var(--size-2) var(--size-4);
		border-radius: var(--radius-2);
		font-weight: 600;
		cursor: pointer;
		border: none;
		font-size: var(--font-size-2);
	}

	.btn.primary {
		background-color: var(--brand);
		color: white;
	}

	.btn.secondary {
		background-color: var(--surface-3);
		color: var(--text-1);
	}

	.footer-actions {
		margin-top: var(--size-8);
		display: flex;
		justify-content: center;
	}

	.btn.outline {
		background-color: transparent;
		border: 1px solid var(--surface-3);
		color: var(--text-2);
		display: flex;
		align-items: center;
		gap: var(--size-2);
		text-decoration: none;
		padding: var(--size-2) var(--size-4);
		border-radius: var(--radius-2);
		font-weight: 600;
		transition: all 0.2s;
	}

	.btn.outline:hover {
		border-color: var(--text-2);
		color: var(--text-1);
		background-color: var(--surface-2);
	}
</style>
