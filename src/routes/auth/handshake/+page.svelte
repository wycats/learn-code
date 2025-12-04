<script lang="ts">
	import { enhance } from '$app/forms';
	import { Check, X } from 'lucide-svelte';
	import type { PageData, ActionData } from './$types';

	let { data, form } = $props<{ data: PageData; form: ActionData }>();
</script>

<div class="page-container">
	<div class="card">
		{#if form?.success}
			<div class="status-content">
				<div class="icon-circle success">
					<Check size={24} />
				</div>
				<h3>Device Authorized!</h3>
				<p class="muted-text">
					You can now close this window. The other device will update automatically.
				</p>
			</div>
		{:else if form?.rejected}
			<div class="status-content">
				<div class="icon-circle error">
					<X size={24} />
				</div>
				<h3>Request Rejected</h3>
				<p class="muted-text">You have denied access to this device.</p>
			</div>
		{:else if data.error}
			<div class="status-content">
				<div class="icon-circle error">
					<X size={24} />
				</div>
				<h3>Error</h3>
				<p class="muted-text">{data.error}</p>
			</div>
		{:else}
			<div class="header">
				<h3>Authorize Device?</h3>
				<p class="muted-text">Do you want to allow this device to access your account?</p>
			</div>
			<div class="content">
				<div class="code-display">
					<p class="code-label">Device Code</p>
					<p class="code-value">{data.code}</p>
				</div>

				<form method="POST" action="?/authorize" use:enhance class="action-form">
					<input type="hidden" name="code" value={data.code} />
					<button type="submit" class="btn primary">
						<Check size={20} />
						Authorize
					</button>
				</form>

				<form method="POST" action="?/reject" use:enhance class="action-form">
					<input type="hidden" name="code" value={data.code} />
					<button type="submit" class="btn secondary">
						<X size={20} />
						Reject
					</button>
				</form>
			</div>
		{/if}
	</div>
</div>

<style>
	.page-container {
		min-height: 100vh;
		display: flex;
		align-items: center;
		justify-content: center;
		background-color: var(--surface-1);
		padding: var(--size-4);
	}

	.card {
		width: 100%;
		max-width: var(--size-sm);
		background-color: var(--surface-2);
		border-radius: var(--radius-3);
		border: 1px solid var(--surface-3);
		box-shadow: var(--shadow-2);
		overflow: hidden;
	}

	.status-content {
		display: flex;
		flex-direction: column;
		align-items: center;
		padding: var(--size-6);
		text-align: center;
		gap: var(--size-4);
	}

	.icon-circle {
		width: var(--size-8);
		height: var(--size-8);
		border-radius: var(--radius-round);
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.icon-circle.success {
		background-color: var(--green-1);
		color: var(--green-7);
	}

	.icon-circle.error {
		background-color: var(--red-1);
		color: var(--red-7);
	}

	h3 {
		font-size: var(--font-size-4);
		font-weight: var(--font-weight-7);
		margin: 0;
	}

	.muted-text {
		color: var(--text-2);
		font-size: var(--font-size-1);
		margin: 0;
	}

	.header {
		padding: var(--size-6);
		text-align: center;
		display: flex;
		flex-direction: column;
		gap: var(--size-2);
	}

	.content {
		padding: var(--size-6);
		padding-top: 0;
		display: flex;
		flex-direction: column;
		gap: var(--size-4);
		align-items: center;
	}

	.code-display {
		background-color: var(--surface-3);
		padding: var(--size-4);
		border-radius: var(--radius-2);
		text-align: center;
		width: 100%;
		border: 1px solid var(--surface-4);
	}

	.code-label {
		font-family: var(--font-mono);
		font-size: var(--font-size-0);
		color: var(--text-2);
		margin: 0;
		text-transform: uppercase;
		letter-spacing: 0.05em;
	}

	.code-value {
		font-size: var(--font-size-4);
		font-weight: var(--font-weight-7);
		margin: 0;
		letter-spacing: 0.1em;
	}

	.action-form {
		width: 100%;
	}

	.btn {
		width: 100%;
		display: flex;
		align-items: center;
		justify-content: center;
		gap: var(--size-2);
		padding: var(--size-2) var(--size-4);
		border-radius: var(--radius-2);
		font-weight: var(--font-weight-6);
		cursor: pointer;
		border: none;
		transition: background-color 0.2s;
		height: var(--size-8);
	}

	.btn.primary {
		background-color: var(--brand);
		color: white;
	}

	.btn.primary:hover {
		background-color: var(--brand-light);
	}

	.btn.secondary {
		background-color: var(--surface-1);
		color: var(--text-1);
		border: 1px solid var(--surface-3);
	}

	.btn.secondary:hover {
		background-color: var(--surface-3);
	}
</style>
