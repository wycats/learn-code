<script lang="ts">
	import { base } from '$app/paths';
	import { ArrowLeft, Inbox } from 'lucide-svelte';
	import type { PageData } from './$types';

	let { data } = $props<{ data: PageData }>();
	type FeedbackReport = PageData['reports'][number];

	const reportsWithContext = $derived(
		data.reports.filter((report: FeedbackReport) => report.context.status === 'valid').length
	);
	const reportsNeedingFallback = $derived(data.reports.length - reportsWithContext);

	function formatTime(iso: string) {
		return new Date(iso).toLocaleTimeString(undefined, {
			hour: 'numeric',
			minute: '2-digit'
		});
	}

	function valueOrDash(value: string | number | null | undefined) {
		return value === null || value === undefined || value === '' ? '—' : value;
	}

	function countWithUnit(value: number | null | undefined, singularUnit: string) {
		if (typeof value !== 'number') return '—';
		return `${value} ${value === 1 ? singularUnit : `${singularUnit}s`}`;
	}

	function contextStatusLabel(status: PageData['reports'][number]['context']['status']) {
		if (status === 'valid') return 'Context parsed';
		if (status === 'empty') return 'Legacy empty context';
		if (status === 'invalid-json') return 'Malformed JSON';
		return 'Unexpected context shape';
	}

	function displayUrl(report: PageData['reports'][number]) {
		return report.url ?? report.context.route?.url ?? null;
	}
</script>

<div class="page-container">
	<header class="page-header">
		<!-- eslint-disable-next-line svelte/no-navigation-without-resolve -->
		<a href="{base}/settings" class="back-link">
			<ArrowLeft size={16} />
			Settings
		</a>
		<div class="header-content">
			<div class="header-icon">
				<Inbox size={24} />
			</div>
			<div>
				<h1>Feedback Inbox</h1>
				<p class="subtitle">
					Review recent issue reports with enough gameplay context to reproduce them.
				</p>
			</div>
		</div>
	</header>

	<section class="inbox-summary" aria-label="Feedback inbox summary">
		<div>
			<span>Total reports</span>
			<strong>{data.reports.length}</strong>
		</div>
		<div>
			<span>With context</span>
			<strong>{reportsWithContext}</strong>
		</div>
		<div>
			<span>Needs fallback</span>
			<strong>{reportsNeedingFallback}</strong>
		</div>
	</section>

	{#if data.reports.length === 0}
		<section class="empty-state" aria-live="polite">
			<h2>No feedback yet</h2>
			<p>New reports will appear here after players submit them.</p>
		</section>
	{:else}
		<section class="report-list" aria-label="Recent feedback reports">
			{#each data.groups as group (group.label)}
				<div class="report-group">
					<h2 class="group-heading">{group.label}</h2>
					{#each group.reports as report (report.id)}
						<article class="report-card">
							<header class="report-header">
								<div class="report-title-block">
									<p class="eyebrow">{formatTime(report.createdAtIso)}</p>
									<h3>{report.title ?? 'Unknown level'}</h3>
									<p class="message-preview">{report.messagePreview}</p>
								</div>
								<div class="report-header-aside">
									<span
										class:context-warning={report.context.status !== 'valid'}
										class="context-badge"
									>
										{contextStatusLabel(report.context.status)}
									</span>
									<span class="location-pill">{report.primaryLocation ?? 'Unknown source'}</span>
								</div>
							</header>

							<div class="quick-summary" aria-label="Feedback summary">
								<div>
									<span>Status</span>
									<strong>{valueOrDash(report.context.game?.status)}</strong>
								</div>
								<div>
									<span>Program</span>
									<strong>{countWithUnit(report.context.programCount, 'block')}</strong>
								</div>
								<div>
									<span>Contact</span>
									<strong>{valueOrDash(report.email)}</strong>
								</div>
								<div>
									<span>Route</span>
									<strong>{valueOrDash(displayUrl(report))}</strong>
								</div>
							</div>

							<details class="report-details">
								<summary>Message and captured context</summary>

								<section class="detail-section">
									<h3>Full message</h3>
									<p class="message-body">{report.message}</p>
								</section>

								<section class="detail-section">
									<h3>Level summary</h3>
									<div class="summary-grid">
										<div>
											<span>Level name</span>
											<strong>{valueOrDash(report.context.level?.name)}</strong>
										</div>
										<div>
											<span>Level id</span>
											<strong>{valueOrDash(report.context.level?.id ?? report.levelId)}</strong>
										</div>
										<div>
											<span>Game status</span>
											<strong>{valueOrDash(report.context.game?.status)}</strong>
										</div>
										<div>
											<span>Failed attempts</span>
											<strong>{valueOrDash(report.context.game?.failedAttempts)}</strong>
										</div>
										<div>
											<span>Active block</span>
											<strong>{valueOrDash(report.context.game?.activeBlockId)}</strong>
										</div>
										<div>
											<span>Program blocks</span>
											<strong>{valueOrDash(report.context.programCount)}</strong>
										</div>
										<div>
											<span>Functions</span>
											<strong>{valueOrDash(report.context.functionsCount)}</strong>
										</div>
									</div>
								</section>

								<section class="detail-section">
									<h3>Browser metadata</h3>
									<div class="summary-grid">
										<div>
											<span>Online</span>
											<strong
												>{report.context.browser
													? String(report.context.browser.online)
													: '—'}</strong
											>
										</div>
										<div>
											<span>Language</span>
											<strong>{valueOrDash(report.context.browser?.language)}</strong>
										</div>
										<div>
											<span>Viewport</span>
											<strong>{valueOrDash(report.context.browser?.viewport)}</strong>
										</div>
										<div class="wide-field">
											<span>User agent</span>
											<strong>{valueOrDash(report.context.browser?.userAgent)}</strong>
										</div>
									</div>
								</section>

								<section class="detail-section">
									<h3>Interpreter</h3>
									{#if report.context.interpreter}
										<div class="summary-grid">
											<div>
												<span>Phase</span>
												<strong>{valueOrDash(report.context.interpreter.phase)}</strong>
											</div>
											<div>
												<span>Stack depth</span>
												<strong>{report.context.interpreter.stackDepth}</strong>
											</div>
											<div>
												<span>Current block</span>
												<strong>{valueOrDash(report.context.interpreter.currentBlockId)}</strong>
											</div>
											<div>
												<span>Current frame size</span>
												<strong>{valueOrDash(report.context.interpreter.currentFrameSize)}</strong>
											</div>
											<div class="wide-field">
												<span>Current context</span>
												<strong>{valueOrDash(report.context.interpreter.currentContext)}</strong>
											</div>
										</div>
									{:else}
										<p class="muted">No interpreter snapshot was captured.</p>
									{/if}
								</section>

								{#if report.context.error}
									<section class="detail-section warning-panel">
										<h3>Context parse note</h3>
										<p>{report.context.error}</p>
									</section>
								{/if}

								<details class="raw-context">
									<summary>Raw JSON/context text</summary>
									<pre>{report.context.raw}</pre>
								</details>
							</details>
						</article>
					{/each}
				</div>
			{/each}
		</section>
	{/if}
</div>

<style>
	.page-container {
		max-width: var(--size-lg);
		margin-inline: auto;
		padding: var(--size-6);
		display: flex;
		flex-direction: column;
		gap: var(--size-6);
	}

	.page-header {
		display: flex;
		flex-direction: column;
		gap: var(--size-4);
		border-bottom: 1px solid var(--surface-2);
		padding-bottom: var(--size-6);
	}

	.back-link {
		display: inline-flex;
		align-items: center;
		gap: var(--size-2);
		color: var(--text-2);
		font-weight: var(--font-weight-6);
		text-decoration: none;
	}

	.back-link:hover {
		color: var(--brand);
	}

	.header-content {
		display: flex;
		align-items: center;
		gap: var(--size-3);
	}

	.header-icon {
		display: flex;
		align-items: center;
		justify-content: center;
		width: var(--size-9);
		height: var(--size-9);
		border-radius: var(--radius-3);
		background: var(--surface-2);
		color: var(--brand);
	}

	h1,
	h2,
	h3,
	p {
		margin: 0;
	}

	h1 {
		font-size: var(--font-size-5);
		font-weight: var(--font-weight-7);
	}

	.subtitle,
	.muted {
		color: var(--text-2);
	}

	.empty-state {
		padding: var(--size-8);
		border: 1px dashed var(--surface-3);
		border-radius: var(--radius-3);
		text-align: center;
	}

	.inbox-summary {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(10rem, 1fr));
		gap: var(--size-3);
	}

	.inbox-summary > div {
		display: flex;
		flex-direction: column;
		gap: var(--size-1);
		padding: var(--size-4);
		border: 1px solid var(--surface-3);
		border-radius: var(--radius-3);
		background: var(--surface-1);
		box-shadow: var(--shadow-1);
	}

	.inbox-summary span {
		color: var(--text-2);
		font-size: var(--font-size-0);
		font-weight: var(--font-weight-6);
	}

	.inbox-summary strong {
		font-family: var(--font-heading);
		font-size: var(--font-size-5);
		line-height: 1;
	}

	.report-list {
		display: flex;
		flex-direction: column;
		gap: var(--size-6);
	}

	.report-group {
		display: flex;
		flex-direction: column;
		gap: var(--size-3);
	}

	.group-heading {
		color: var(--text-2);
		font-size: var(--font-size-1);
		font-weight: var(--font-weight-7);
		letter-spacing: 0.04em;
		text-transform: uppercase;
	}

	.report-card {
		display: flex;
		flex-direction: column;
		gap: var(--size-4);
		padding: var(--size-5);
		border: 1px solid var(--surface-3);
		border-radius: var(--radius-3);
		background: var(--surface-1);
		box-shadow: var(--shadow-1);
	}

	.report-header {
		display: flex;
		align-items: flex-start;
		justify-content: space-between;
		gap: var(--size-3);
	}

	.report-title-block {
		display: grid;
		gap: var(--size-1);
	}

	.report-header-aside {
		display: flex;
		align-items: flex-end;
		flex-direction: column;
		gap: var(--size-2);
		text-align: right;
	}

	.eyebrow {
		color: var(--text-2);
		font-size: var(--font-size-0);
		font-weight: var(--font-weight-6);
		letter-spacing: 0.02em;
		text-transform: uppercase;
	}

	.report-header h3 {
		font-size: var(--font-size-3);
		font-weight: var(--font-weight-7);
		line-height: var(--font-lineheight-2);
	}

	.message-preview {
		color: var(--text-2);
		font-size: var(--font-size-1);
		line-height: var(--font-lineheight-3);
	}

	.context-badge {
		white-space: nowrap;
		border-radius: var(--radius-round);
		background: var(--green-1);
		color: var(--green-9);
		font-size: var(--font-size-0);
		font-weight: var(--font-weight-7);
		padding: var(--size-1) var(--size-3);
	}

	.context-warning {
		background: var(--yellow-1);
		color: var(--yellow-9);
	}

	.location-pill {
		max-width: min(28rem, 100%);
		overflow-wrap: anywhere;
		border-radius: var(--radius-round);
		background: var(--surface-2);
		color: var(--text-2);
		font-size: var(--font-size-0);
		font-weight: var(--font-weight-7);
		padding: var(--size-1) var(--size-3);
	}

	.quick-summary,
	.summary-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
		gap: var(--size-3);
	}

	.quick-summary > div,
	.summary-grid > div {
		min-width: 0;
		display: flex;
		flex-direction: column;
		gap: var(--size-1);
		padding: var(--size-3);
		border-radius: var(--radius-2);
		background: var(--surface-2);
	}

	.quick-summary span,
	.summary-grid span {
		color: var(--text-2);
		font-size: var(--font-size-0);
		font-weight: var(--font-weight-6);
	}

	.quick-summary strong,
	.summary-grid strong {
		min-width: 0;
		color: var(--text-1);
		font-size: var(--font-size-1);
		font-weight: var(--font-weight-6);
		overflow-wrap: anywhere;
	}

	.wide-field {
		grid-column: 1 / -1;
	}

	.report-details,
	.raw-context {
		border-top: 1px solid var(--surface-2);
		padding-top: var(--size-3);
	}

	summary {
		cursor: pointer;
		font-weight: var(--font-weight-7);
	}

	.report-details[open],
	.raw-context[open] {
		display: flex;
		flex-direction: column;
		gap: var(--size-4);
	}

	.detail-section {
		display: flex;
		flex-direction: column;
		gap: var(--size-3);
	}

	.detail-section h3 {
		font-size: var(--font-size-2);
		font-weight: var(--font-weight-7);
	}

	.message-body {
		white-space: pre-wrap;
		line-height: var(--font-lineheight-3);
	}

	.warning-panel {
		padding: var(--size-3);
		border-radius: var(--radius-2);
		background: var(--yellow-1);
		color: var(--yellow-9);
	}

	.raw-context pre {
		max-height: 28rem;
		overflow: auto;
		padding: var(--size-4);
		border-radius: var(--radius-2);
		background: var(--surface-2);
		color: var(--text-1);
		font-size: var(--font-size-0);
		white-space: pre-wrap;
	}

	@media (max-width: 700px) {
		.page-container {
			padding: var(--size-4);
		}

		.report-header {
			flex-direction: column;
		}

		.report-header-aside {
			align-items: flex-start;
			text-align: left;
		}

		.context-badge {
			white-space: normal;
		}
	}
</style>
