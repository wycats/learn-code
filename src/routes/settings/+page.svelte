<script lang="ts">
	import { enhance } from '$app/forms';
	import { Trash2, LogOut, Smartphone, Info, LogIn } from 'lucide-svelte';
	import type { PageData } from './$types';
	import { base } from '$app/paths';

	let { data } = $props<{ data: PageData }>();
</script>

<div class="page-container">
	<header class="page-header">
		<div class="header-content">
			<h1>Settings</h1>
			<p class="subtitle">Manage your account and devices</p>
		</div>
		{#if data.user}
			<form method="POST" action="?/logout" use:enhance>
				<button class="logout-btn">
					<LogOut size={16} />
					Sign Out
				</button>
			</form>
		{:else}
			<!-- eslint-disable-next-line svelte/no-navigation-without-resolve -->
			<a href="{base}/login" class="login-btn">
				<LogIn size={16} />
				Sign In
			</a>
		{/if}
	</header>

	{#if data.user}
		<section class="section">
			<h2>Profiles</h2>
			<div class="profiles-grid">
				{#each data.profiles as profile (profile.id)}
					<div class="profile-card">
						<div class="profile-info">
							<div
								class="avatar"
								style="background-color: {profile.color}20; border-color: {profile.color}"
							>
								{#if profile.avatar === 'robot'}🤖
								{:else if profile.avatar === 'cat'}🐱
								{:else if profile.avatar === 'dog'}🐶
								{:else}��{/if}
							</div>
							<span class="profile-name">{profile.nickname}</span>
						</div>
						<form method="POST" action="?/deleteProfile" use:enhance>
							<input type="hidden" name="profileId" value={profile.id} />
							<button class="delete-btn" aria-label="Delete profile">
								<Trash2 size={16} />
							</button>
						</form>
					</div>
				{/each}
			</div>
		</section>

		<section class="section">
			<h2>Connected Devices</h2>
			<div class="devices-list">
				{#each data.devices as device (device.id)}
					<div class="device-card">
						<div class="device-info">
							<div class="device-icon">
								<Smartphone size={20} />
							</div>
							<div>
								<p class="device-name">Device connected via QR</p>
								<p class="device-date">
									Authorized on {new Date(device.createdAt).toLocaleDateString()}
								</p>
							</div>
						</div>
						<form method="POST" action="?/revokeDevice" use:enhance>
							<input type="hidden" name="deviceId" value={device.id} />
							<button class="revoke-btn">Revoke</button>
						</form>
					</div>
				{/each}
				{#if data.devices.length === 0}
					<p class="empty-state">No other devices connected.</p>
				{/if}
			</div>
		</section>
	{/if}

	<section class="section">
		<h2>About</h2>
		<!-- eslint-disable-next-line svelte/no-navigation-without-resolve -->
		<a href="{base}/changelog" class="about-link">
			<div class="about-icon">
				<Info size={20} />
			</div>
			<div class="about-content">
				<span class="about-title">Changelog</span>
				<span class="about-desc">See what's new in Kibi</span>
			</div>
		</a>
	</section>
</div>

<style>
	.page-container {
		max-width: var(--size-md);
		margin-inline: auto;
		padding: var(--size-6);
		display: flex;
		flex-direction: column;
		gap: var(--size-8);
	}

	.page-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		border-bottom: 1px solid var(--surface-2);
		padding-bottom: var(--size-6);
	}

	h1 {
		font-size: var(--font-size-5);
		font-weight: var(--font-weight-7);
		margin: 0;
	}

	.subtitle {
		color: var(--text-2);
		margin: 0;
	}

	.logout-btn {
		display: flex;
		align-items: center;
		gap: var(--size-2);
		padding: var(--size-2) var(--size-4);
		border-radius: var(--radius-2);
		background-color: var(--surface-2);
		color: var(--text-1);
		border: none;
		cursor: pointer;
		font-weight: var(--font-weight-6);
		transition: background-color 0.2s;
	}

	.logout-btn:hover {
		background-color: var(--surface-3);
	}

	.login-btn {
		display: flex;
		align-items: center;
		gap: var(--size-2);
		padding: var(--size-2) var(--size-4);
		border-radius: var(--radius-2);
		background-color: var(--brand);
		color: white;
		text-decoration: none;
		font-weight: var(--font-weight-6);
		transition: background-color 0.2s;
	}

	.login-btn:hover {
		background-color: var(--brand-hover);
	}

	.section {
		display: flex;
		flex-direction: column;
		gap: var(--size-4);
	}

	h2 {
		font-size: var(--font-size-3);
		font-weight: var(--font-weight-6);
		margin: 0;
	}

	.profiles-grid {
		display: grid;
		gap: var(--size-4);
		grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
	}

	.profile-card {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: var(--size-4);
		background-color: var(--surface-2);
		border-radius: var(--radius-3);
		border: 1px solid var(--surface-3);
	}

	.profile-info {
		display: flex;
		align-items: center;
		gap: var(--size-3);
	}

	.avatar {
		width: var(--size-8);
		height: var(--size-8);
		border-radius: var(--radius-round);
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: var(--font-size-4);
		border-width: 2px;
		border-style: solid;
	}

	.profile-name {
		font-weight: var(--font-weight-6);
	}

	.delete-btn {
		background: none;
		border: none;
		color: var(--text-2);
		cursor: pointer;
		padding: var(--size-2);
		border-radius: var(--radius-round);
		transition:
			color 0.2s,
			background-color 0.2s;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.delete-btn:hover {
		color: var(--red-6);
		background-color: var(--red-1);
	}

	.devices-list {
		display: flex;
		flex-direction: column;
		gap: var(--size-2);
	}

	.device-card {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: var(--size-4);
		border: 1px solid var(--surface-2);
		border-radius: var(--radius-3);
	}

	.device-info {
		display: flex;
		align-items: center;
		gap: var(--size-3);
	}

	.device-icon {
		padding: var(--size-2);
		background-color: var(--surface-2);
		border-radius: var(--radius-round);
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.device-name {
		font-weight: var(--font-weight-6);
		margin: 0;
	}

	.device-date {
		font-size: var(--font-size-0);
		color: var(--text-2);
		margin: 0;
	}

	.revoke-btn {
		background: none;
		border: none;
		color: var(--red-6);
		font-size: var(--font-size-1);
		cursor: pointer;
		padding: var(--size-2);
	}

	.revoke-btn:hover {
		text-decoration: underline;
	}

	.empty-state {
		color: var(--text-2);
		font-style: italic;
		font-size: var(--font-size-1);
	}

	.about-link {
		display: flex;
		align-items: center;
		gap: var(--size-3);
		padding: var(--size-4);
		background-color: var(--surface-2);
		border-radius: var(--radius-3);
		border: 1px solid var(--surface-3);
		text-decoration: none;
		color: var(--text-1);
		transition:
			transform 0.2s,
			box-shadow 0.2s;
	}

	.about-link:hover {
		transform: translateY(-2px);
		box-shadow: var(--shadow-2);
		border-color: var(--brand);
	}

	.about-icon {
		padding: var(--size-2);
		background-color: var(--surface-1);
		border-radius: var(--radius-round);
		color: var(--brand);
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.about-content {
		display: flex;
		flex-direction: column;
	}

	.about-title {
		font-weight: var(--font-weight-6);
	}

	.about-desc {
		font-size: var(--font-size-0);
		color: var(--text-2);
	}
</style>
