<script lang="ts">
	import { toast } from '$lib/stores/toast.svelte';
	import { X, CircleCheck, CircleAlert, Info, TriangleAlert } from 'lucide-svelte';
	import { fly } from 'svelte/transition';
	import { flip } from 'svelte/animate';

	const icons = {
		success: CircleCheck,
		error: CircleAlert,
		info: Info,
		warning: TriangleAlert
	};
</script>

<div class="toast-container">
	{#each toast.toasts as t (t.id)}
		<div
			class="toast {t.type}"
			transition:fly={{ y: 20, duration: 300 }}
			animate:flip={{ duration: 300 }}
		>
			<div class="icon">
				<svelte:component this={icons[t.type]} size={20} />
			</div>
			<div class="message">{t.message}</div>
			<button class="close-btn" onclick={() => toast.remove(t.id)}>
				<X size={16} />
			</button>
		</div>
	{/each}
</div>

<style>
	.toast-container {
		position: fixed;
		bottom: var(--size-4);
		right: var(--size-4);
		display: flex;
		flex-direction: column;
		gap: var(--size-2);
		z-index: 9999;
		pointer-events: none; /* Allow clicking through container */
	}

	.toast {
		pointer-events: auto;
		display: flex;
		align-items: center;
		gap: var(--size-3);
		padding: var(--size-3) var(--size-4);
		background-color: var(--surface-1);
		border: 1px solid var(--surface-3);
		border-radius: var(--radius-2);
		box-shadow: var(--shadow-3);
		min-width: 300px;
		max-width: 400px;
		color: var(--text-1);
	}

	.toast.success {
		border-left: 4px solid var(--green-5);
	}
	.toast.error {
		border-left: 4px solid var(--red-5);
	}
	.toast.info {
		border-left: 4px solid var(--blue-5);
	}
	.toast.warning {
		border-left: 4px solid var(--orange-5);
	}

	.icon {
		display: flex;
		align-items: center;
	}

	.success .icon {
		color: var(--green-5);
	}
	.error .icon {
		color: var(--red-5);
	}
	.info .icon {
		color: var(--blue-5);
	}
	.warning .icon {
		color: var(--orange-5);
	}

	.message {
		flex: 1;
		font-size: var(--font-size-1);
		line-height: 1.4;
	}

	.close-btn {
		background: none;
		border: none;
		color: var(--text-3);
		cursor: pointer;
		min-width: var(--touch-target-min);
		min-height: var(--touch-target-min);
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 0;
		border-radius: var(--radius-1);
	}

	.close-btn:hover {
		background-color: var(--surface-2);
		color: var(--text-1);
	}
</style>
