<script lang="ts">
	import { CHANGELOG } from '$lib/data/changelog';
	import { ArrowLeft, Calendar } from 'lucide-svelte';
	import { base } from '$app/paths';

	// Group by year/month if needed, but simple list is fine for now.
</script>

<div class="page-container">
	<header class="page-header">
		<!-- eslint-disable-next-line svelte/no-navigation-without-resolve -->
		<a href="{base}/settings" class="back-link">
			<ArrowLeft size={20} />
			Back to Settings
		</a>
		<div class="header-content">
			<h1>Changelog</h1>
			<p class="subtitle">See what's new in Kibi</p>
		</div>
	</header>

	<div class="timeline">
		{#each CHANGELOG as entry (entry.version)}
			<article class="changelog-card" class:major={entry.type === 'major'}>
				<div class="card-header">
					<div class="meta">
						<span class="version-badge" class:major={entry.type === 'major'}>
							{entry.version}
						</span>
						<span class="date">
							<Calendar size={14} />
							{entry.date}
						</span>
					</div>
					<h2>{entry.title}</h2>
				</div>

				<div class="card-body">
					<p class="summary">{entry.summary}</p>

					{#if entry.features.length > 0}
						<div class="features-list">
							{#each entry.features as feature (feature)}
								<div class="feature-item">
									<span class="bullet">•</span>
									<span>{feature}</span>
								</div>
							{/each}
						</div>
					{/if}
				</div>
			</article>
		{/each}
	</div>
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
		flex-direction: column;
		gap: var(--size-4);
		border-bottom: 1px solid var(--surface-2);
		padding-bottom: var(--size-6);
	}

	.back-link {
		display: flex;
		align-items: center;
		gap: var(--size-2);
		color: var(--text-2);
		text-decoration: none;
		font-weight: var(--font-weight-6);
		font-size: var(--font-size-1);
		transition: color 0.2s;
		align-self: flex-start;
	}

	.back-link:hover {
		color: var(--text-1);
	}

	h1 {
		font-size: var(--font-size-6);
		font-weight: var(--font-weight-8);
		margin: 0;
		background: linear-gradient(to right, var(--brand), var(--brand-light));
		-webkit-background-clip: text;
		-webkit-text-fill-color: transparent;
	}

	.subtitle {
		color: var(--text-2);
		margin: 0;
		font-size: var(--font-size-3);
	}

	.timeline {
		display: flex;
		flex-direction: column;
		gap: var(--size-6);
		position: relative;
	}

	.timeline::before {
		content: '';
		position: absolute;
		top: 0;
		bottom: 0;
		left: 19px; /* Align with badges */
		width: 2px;
		background-color: var(--surface-2);
		z-index: 0;
	}

	.changelog-card {
		background-color: var(--surface-1);
		border: 1px solid var(--surface-2);
		border-radius: var(--radius-3);
		padding: var(--size-5);
		position: relative;
		z-index: 1;
		margin-left: var(--size-8);
		box-shadow: var(--shadow-1);
		transition: transform 0.2s;
	}

	.changelog-card:hover {
		transform: translateY(-2px);
		box-shadow: var(--shadow-3);
		border-color: var(--surface-3);
	}

	.changelog-card.major {
		border-color: var(--brand);
		background-color: light-dark(var(--surface-1), var(--surface-2));
	}

	/* Connector dot */
	.changelog-card::before {
		content: '';
		position: absolute;
		left: calc(var(--size-8) * -1 + 12px);
		top: var(--size-6);
		width: 16px;
		height: 16px;
		border-radius: 50%;
		background-color: var(--surface-3);
		border: 4px solid var(--surface-1);
		box-shadow: 0 0 0 2px var(--surface-2);
	}

	.changelog-card.major::before {
		background-color: var(--brand);
		box-shadow: 0 0 0 2px var(--brand-light);
	}

	.card-header {
		display: flex;
		flex-direction: column;
		gap: var(--size-2);
		margin-bottom: var(--size-4);
	}

	.meta {
		display: flex;
		align-items: center;
		gap: var(--size-3);
	}

	.version-badge {
		font-size: var(--font-size-0);
		font-weight: var(--font-weight-7);
		padding: 2px 8px;
		border-radius: var(--radius-pill);
		background-color: var(--surface-3);
		color: var(--text-1);
		text-transform: uppercase;
		letter-spacing: 0.05em;
	}

	.version-badge.major {
		background-color: var(--brand);
		color: white;
	}

	.date {
		display: flex;
		align-items: center;
		gap: var(--size-1);
		font-size: var(--font-size-0);
		color: var(--text-2);
	}

	h2 {
		font-size: var(--font-size-4);
		font-weight: var(--font-weight-7);
		margin: 0;
		color: var(--text-1);
	}

	.summary {
		font-size: var(--font-size-2);
		color: var(--text-2);
		margin: 0 0 var(--size-4) 0;
		line-height: 1.5;
	}

	.features-list {
		display: flex;
		flex-direction: column;
		gap: var(--size-2);
		background-color: var(--surface-2);
		padding: var(--size-4);
		border-radius: var(--radius-2);
	}

	.feature-item {
		display: flex;
		gap: var(--size-2);
		align-items: flex-start;
		font-size: var(--font-size-1);
		color: var(--text-1);
		line-height: 1.4;
	}

	.bullet {
		color: var(--brand);
		font-weight: bold;
	}
</style>
