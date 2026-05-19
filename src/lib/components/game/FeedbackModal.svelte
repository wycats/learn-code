<script lang="ts">
	import { X } from 'lucide-svelte';
	import type { FeedbackContext } from '$lib/services/feedback-schema';
	import { feedbackService, type FeedbackSubmitResult } from '$lib/services/feedback';
	import { toast } from '$lib/stores/toast.svelte';

	interface Props {
		context: FeedbackContext;
		onClose: () => void;
	}

	let { context, onClose }: Props = $props();
	let message = $state('');
	let email = $state('');
	let isSubmitting = $state(false);
	let error = $state<string | null>(null);

	const trimmedMessage = $derived(message.trim());
	const canSubmit = $derived(trimmedMessage.length > 0 && !isSubmitting);
	const levelName = $derived(context.level.name);
	const routeLabel = $derived.by(() => {
		if (context.route.packId && context.route.levelId) {
			return `${context.route.packId} / ${context.route.levelId}`;
		}
		return context.route.source === 'shared' ? 'Shared level' : 'Current level';
	});

	async function handleSubmit() {
		if (!canSubmit) return;

		isSubmitting = true;
		error = null;

		try {
			const result = await feedbackService.submit({
				message: trimmedMessage,
				email: email.trim(),
				context
			});
			announceResult(result);
			onClose();
		} catch (e) {
			console.error(e);
			error = 'Could not save feedback. Please try again.';
		} finally {
			isSubmitting = false;
		}
	}

	function announceResult(result: FeedbackSubmitResult) {
		if (result.status === 'sent') {
			toast.success('Feedback sent. Thank you!');
		} else {
			toast.info('Feedback saved and will send when you are back online.');
		}
	}
</script>

<div class="feedback-backdrop" role="presentation" onclick={onClose}></div>
<div class="feedback-modal" role="dialog" aria-modal="true" aria-labelledby="feedback-title">
	<header>
		<div>
			<p class="eyebrow">Feedback</p>
			<h2 id="feedback-title">Report an issue</h2>
		</div>
		<button class="icon-button" type="button" onclick={onClose} aria-label="Close feedback">
			<X size={20} />
		</button>
	</header>

	<p class="summary">
		Tell us what happened. This report will attach your current level, blocks, and runtime state so
		we can reproduce it. Screenshots are not included yet.
	</p>

	<div class="context-card" aria-label="Attached context">
		<strong>{levelName}</strong>
		<span>{routeLabel}</span>
		<span>Status: {context.game.status}</span>
	</div>

	<label class="field">
		<span>What went wrong?</span>
		<textarea
			bind:value={message}
			data-testid="feedback-message"
			maxlength="5000"
			rows="6"
			placeholder="Describe what you expected and what happened instead."
		></textarea>
	</label>

	<label class="field">
		<span>Email (optional)</span>
		<input
			bind:value={email}
			data-testid="feedback-email"
			type="email"
			placeholder="you@example.com"
		/>
	</label>

	{#if error}
		<p class="error" role="alert">{error}</p>
	{/if}

	<footer>
		<button class="secondary" type="button" onclick={onClose}>Cancel</button>
		<button
			class="primary"
			type="button"
			onclick={handleSubmit}
			disabled={!canSubmit}
			data-testid="feedback-submit"
		>
			{isSubmitting ? 'Saving…' : 'Send Feedback'}
		</button>
	</footer>
</div>

<style>
	.feedback-backdrop {
		position: fixed;
		inset: 0;
		z-index: 190;
		background: rgba(0, 0, 0, 0.45);
		backdrop-filter: blur(3px);
	}

	.feedback-modal {
		position: fixed;
		top: 50%;
		left: 50%;
		z-index: 200;
		width: min(92vw, 34rem);
		max-height: min(88vh, 48rem);
		overflow: auto;
		transform: translate(-50%, -50%);
		display: grid;
		gap: var(--size-4);
		padding: var(--size-5);
		border-radius: var(--radius-3);
		border: 1px solid var(--surface-3);
		background: var(--surface-1);
		color: var(--text-1);
		box-shadow: var(--shadow-5);
	}

	header,
	footer {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: var(--size-3);
	}

	h2 {
		margin: 0;
		font-family: var(--font-heading);
		font-size: var(--font-size-4);
	}

	.eyebrow {
		margin: 0 0 var(--size-1);
		font-size: var(--font-size-0);
		font-weight: 800;
		letter-spacing: 0.08em;
		text-transform: uppercase;
		color: var(--brand);
	}

	.summary {
		margin: 0;
		color: var(--text-2);
		line-height: 1.5;
	}

	.context-card {
		display: grid;
		gap: var(--size-1);
		padding: var(--size-3);
		border-radius: var(--radius-2);
		background: var(--surface-2);
		border: 1px solid var(--surface-3);
		font-size: var(--font-size-0);
		color: var(--text-2);
	}

	.context-card strong {
		font-size: var(--font-size-1);
		color: var(--text-1);
	}

	.field {
		display: grid;
		gap: var(--size-2);
		font-weight: 700;
	}

	textarea,
	input {
		width: 100%;
		border: 1px solid var(--surface-3);
		border-radius: var(--radius-2);
		background: var(--surface-2);
		color: var(--text-1);
		font: inherit;
		padding: var(--size-3);
	}

	textarea {
		resize: vertical;
	}

	.error {
		margin: 0;
		color: var(--red-6);
		font-weight: 700;
	}

	.icon-button,
	.secondary,
	.primary {
		min-height: var(--touch-target-min);
		border-radius: var(--radius-pill);
		font-weight: 800;
		cursor: pointer;
	}

	.icon-button {
		width: var(--touch-target-min);
		border: 1px solid var(--surface-3);
		background: transparent;
		color: var(--text-1);
		display: grid;
		place-items: center;
	}

	.secondary,
	.primary {
		padding: 0 var(--size-4);
	}

	.secondary {
		border: 1px solid var(--surface-3);
		background: transparent;
		color: var(--text-1);
	}

	.primary {
		border: none;
		background: var(--brand);
		color: white;
	}

	.primary:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}

	@media (max-width: 520px) {
		.feedback-modal {
			width: 100vw;
			height: 100vh;
			max-height: none;
			border-radius: 0;
		}

		footer {
			align-items: stretch;
			flex-direction: column-reverse;
		}
	}
</style>
