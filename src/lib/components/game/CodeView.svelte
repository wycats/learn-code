<script lang="ts">
	import { Play, RotateCcw, Square, StepBack, StepForward, X } from 'lucide-svelte';
	import CodeViewBoard from './CodeViewBoard.svelte';
	import type { GameModel } from '$lib/game/model.svelte';
	import { formatProgramCodeWithMap, type CodeLineRange } from '$lib/game/codegen';
	import { interactionManager } from '$lib/interactions';
	import type { RunControlState } from '$lib/game/run-control';

	interface HighlightToken {
		content: string;
		color?: string;
		fontStyle?: number;
	}

	interface HighlightedCode {
		tokens: HighlightToken[][];
		fg?: string;
		bg?: string;
	}

	interface CodeLineMetadata {
		blockIds: string[];
		isActive: boolean;
		isSelected: boolean;
	}

	interface CodeViewControls {
		runControl: RunControlState;
		onRunControl: () => void | Promise<void>;
		onStepBack: () => void;
		onStepForward: () => void | Promise<void>;
		onReset: () => void;
		canStepBack: boolean;
		canStepForward: boolean;
		canReset: boolean;
	}

	interface Props {
		game: GameModel;
		dialogId?: string;
		controls?: CodeViewControls;
	}

	let { game, dialogId = 'code-view-dialog', controls }: Props = $props();
	let shouldHighlight = $state(false);

	const formattedCode = $derived(
		formatProgramCodeWithMap({
			program: game.program,
			functions: game.functions,
			heldItemName: 'heldItem'
		})
	);
	const generatedCode = $derived(formattedCode.code);
	const codeLines = $derived(generatedCode.split('\n'));
	const selectedBlockIds = $derived.by(() => new Set(interactionManager.selection));
	const codeLineMetadata = $derived.by(() =>
		buildLineMetadata(formattedCode.blockLineRanges, game.activeBlockId, selectedBlockIds)
	);
	const highlightedCode = $derived(shouldHighlight ? highlight(generatedCode) : null);

	function buildLineMetadata(
		blockLineRanges: ReadonlyMap<string, CodeLineRange>,
		activeBlockId: string | null,
		selectedIds: ReadonlySet<string>
	): CodeLineMetadata[] {
		const metadata = Array.from({ length: codeLines.length }, () => ({
			blockIds: [] as string[],
			isActive: false,
			isSelected: false
		}));

		for (const [blockId, range] of blockLineRanges) {
			for (let lineNumber = range.startLine; lineNumber <= range.endLine; lineNumber++) {
				const line = metadata[lineNumber - 1];
				if (!line) continue;

				line.blockIds.push(blockId);
				line.isActive ||= activeBlockId === blockId;
				line.isSelected ||= selectedIds.has(blockId);
			}
		}

		return metadata;
	}

	function lineMetadata(lineIndex: number): CodeLineMetadata {
		return (
			codeLineMetadata[lineIndex] ?? {
				blockIds: [],
				isActive: false,
				isSelected: false
			}
		);
	}

	function lineBlockIds(lineIndex: number): string | undefined {
		const ids = lineMetadata(lineIndex).blockIds;
		return ids.length > 0 ? ids.join(' ') : undefined;
	}

	async function highlight(code: string): Promise<HighlightedCode> {
		const { codeToTokens } = await import('shiki');
		return codeToTokens(code, {
			lang: 'ts',
			theme: 'github-dark'
		});
	}

	function handleBackdropClick(event: MouseEvent) {
		const dialog = event.currentTarget as HTMLDialogElement;

		if (event.target === dialog) {
			dialog.close();
		}
	}

	function watchDialogOpen(dialog: HTMLDialogElement) {
		shouldHighlight ||= dialog.open;

		const observer = new MutationObserver(() => {
			shouldHighlight ||= dialog.open;
		});
		observer.observe(dialog, { attributes: true, attributeFilter: ['open'] });

		return {
			destroy() {
				observer.disconnect();
			}
		};
	}

	function tokenColor(token: HighlightToken, highlighted: HighlightedCode): string {
		return token.color ?? highlighted.fg ?? '#e1e4e8';
	}

	function tokenFontStyle(token: HighlightToken): string | null {
		return token.fontStyle && token.fontStyle & 1 ? 'italic' : null;
	}

	function tokenFontWeight(token: HighlightToken): string | null {
		return token.fontStyle && token.fontStyle & 2 ? '700' : null;
	}
</script>

<dialog
	id={dialogId}
	class="code-view-dialog"
	data-testid="code-view"
	aria-labelledby="code-view-title"
	aria-describedby="code-view-description"
	onclick={handleBackdropClick}
	use:watchDialogOpen
>
	<div class="code-view-shell">
		<div class="code-view-header">
			<div class="title-group">
				<span class="eyebrow">Syntax Bridge</span>
				<h2 id="code-view-title">Code View</h2>
				<p id="code-view-description">
					Read-only Kibi code for the whole program. Blocks stay in charge; this shows the shape
					they are building.
				</p>
			</div>

			<button
				class="close-button"
				command="close"
				commandfor={dialogId}
				aria-label="Close Code View"
			>
				<X size={22} />
			</button>
		</div>

		{#if controls}
			<div class="code-controls" role="toolbar" aria-label="Code View playback controls">
				<button
					class="code-control-button primary"
					class:stop={controls.runControl.action === 'stop'}
					onclick={controls.onRunControl}
					disabled={controls.runControl.disabled}
					aria-label="Code View execution control"
				>
					{#if controls.runControl.action === 'stop'}
						<Square size={16} fill="currentColor" />
					{:else}
						<Play size={16} fill="currentColor" />
					{/if}
					<span>{controls.runControl.label}</span>
				</button>

				<button
					class="code-control-button"
					onclick={controls.onStepBack}
					disabled={!controls.canStepBack}
					aria-label="Code View previous instruction"
				>
					<StepBack size={16} />
					<span>Back</span>
				</button>

				<button
					class="code-control-button"
					onclick={controls.onStepForward}
					disabled={!controls.canStepForward}
					aria-label="Code View next instruction"
				>
					<StepForward size={16} />
					<span>Step</span>
				</button>

				<button
					class="code-control-button"
					onclick={controls.onReset}
					disabled={!controls.canReset}
					aria-label="Code View restart run"
				>
					<RotateCcw size={16} />
					<span>Reset</span>
				</button>
			</div>
		{/if}

		<div class="code-view-body">
			<div class="code-frame">
				{#if highlightedCode}
					{#await highlightedCode}
						<pre><code class="highlighted-code"
								>{#each codeLines as line, lineIndex (lineIndex)}{@const metadata =
										lineMetadata(lineIndex)}<span
										class="code-line"
										class:active-code-line={metadata.isActive}
										class:selected-code-line={metadata.isSelected}
										data-testid="code-line"
										data-block-ids={lineBlockIds(lineIndex)}>{line}</span
									>{/each}</code
							></pre>
					{:then highlighted}
						<pre style:background-color={highlighted.bg} style:color={highlighted.fg}><code
								class="highlighted-code"
								>{#each highlighted.tokens as line, lineIndex (lineIndex)}{@const metadata =
										lineMetadata(lineIndex)}<span
										class="code-line"
										class:active-code-line={metadata.isActive}
										class:selected-code-line={metadata.isSelected}
										data-testid="code-line"
										data-block-ids={lineBlockIds(lineIndex)}
										>{#each line as token, tokenIndex (tokenIndex)}<span
												style:color={tokenColor(token, highlighted)}
												style:font-style={tokenFontStyle(token)}
												style:font-weight={tokenFontWeight(token)}>{token.content}</span
											>{/each}</span
									>{/each}</code
							></pre>
					{:catch}
						<pre><code class="highlighted-code"
								>{#each codeLines as line, lineIndex (lineIndex)}{@const metadata =
										lineMetadata(lineIndex)}<span
										class="code-line"
										class:active-code-line={metadata.isActive}
										class:selected-code-line={metadata.isSelected}
										data-testid="code-line"
										data-block-ids={lineBlockIds(lineIndex)}>{line}</span
									>{/each}</code
							></pre>
					{/await}
				{:else}
					<pre><code class="highlighted-code"
							>{#each codeLines as line, lineIndex (lineIndex)}{@const metadata =
									lineMetadata(lineIndex)}<span
									class="code-line"
									class:active-code-line={metadata.isActive}
									class:selected-code-line={metadata.isSelected}
									data-testid="code-line"
									data-block-ids={lineBlockIds(lineIndex)}>{line}</span
								>{/each}</code
						></pre>
				{/if}
			</div>

			<div class="board-preview-slot">
				<CodeViewBoard {game} />
			</div>
		</div>
	</div>
</dialog>

<style>
	.code-view-dialog {
		width: min(1180px, calc(100vw - 2rem));
		height: min(720px, calc(100dvh - 2rem));
		max-width: none;
		max-height: none;
		margin: auto;
		padding: 0;
		border: 1px solid color-mix(in srgb, var(--brand), var(--surface-3) 65%);
		border-radius: var(--radius-4);
		background: light-dark(var(--surface-1), var(--gray-10));
		color: var(--text-1);
		box-shadow: var(--shadow-6);
		overflow: hidden;
	}

	.code-view-dialog::backdrop {
		background: color-mix(in srgb, black, transparent 22%);
		backdrop-filter: blur(6px);
	}

	.code-view-shell {
		display: grid;
		grid-template-rows: auto auto minmax(0, 1fr);
		height: 100%;
		min-height: 0;
		background:
			radial-gradient(
				circle at top left,
				color-mix(in srgb, var(--brand), transparent 78%),
				transparent 28rem
			),
			linear-gradient(
				180deg,
				color-mix(in srgb, var(--surface-2), transparent 5%),
				var(--surface-1)
			);
	}

	.code-view-header {
		display: flex;
		align-items: flex-start;
		justify-content: space-between;
		gap: var(--size-4);
		padding: clamp(var(--size-4), 4vw, var(--size-6)) clamp(var(--size-4), 5vw, var(--size-7))
			var(--size-4);
		border-bottom: 1px solid color-mix(in srgb, var(--surface-3), transparent 18%);
	}

	.title-group {
		display: grid;
		gap: var(--size-2);
		max-width: 46rem;
	}

	.eyebrow {
		font-size: var(--font-size-00);
		font-weight: 900;
		letter-spacing: 0.12em;
		text-transform: uppercase;
		color: var(--brand);
	}

	h2 {
		margin: 0;
		font-family: var(--font-heading);
		font-size: clamp(var(--font-size-4), 4vw, var(--font-size-6));
		line-height: 0.95;
		color: var(--text-1);
	}

	p {
		max-width: 56ch;
		margin: 0;
		font-size: var(--font-size-1);
		font-weight: 650;
		line-height: 1.45;
		color: var(--text-2);
	}

	.close-button {
		flex: 0 0 auto;
		display: grid;
		place-items: center;
		width: var(--touch-target-min);
		height: var(--touch-target-min);
		border: 1px solid var(--surface-3);
		border-radius: var(--radius-round);
		background: color-mix(in srgb, var(--surface-1), transparent 12%);
		color: var(--text-1);
		cursor: pointer;
	}

	.close-button:hover {
		background: var(--surface-3);
	}

	.code-controls {
		display: flex;
		align-items: center;
		gap: var(--size-2);
		padding: var(--size-3) clamp(var(--size-4), 5vw, var(--size-7));
		overflow-x: auto;
		border-bottom: 1px solid color-mix(in srgb, var(--surface-3), transparent 28%);
		background: color-mix(in srgb, var(--surface-1), transparent 14%);
	}

	.code-control-button {
		flex: 0 0 auto;
		display: inline-flex;
		align-items: center;
		justify-content: center;
		gap: var(--size-2);
		min-height: var(--touch-target-min);
		padding: 0 var(--size-3);
		border: 1px solid color-mix(in srgb, var(--surface-3), transparent 8%);
		border-radius: var(--radius-round);
		background: color-mix(in srgb, var(--surface-2), transparent 18%);
		color: var(--text-1);
		font-weight: 850;
		cursor: pointer;
	}

	.code-control-button.primary {
		border-color: color-mix(in srgb, var(--brand), transparent 30%);
		background: var(--brand);
		color: white;
	}

	.code-control-button.primary.stop {
		border-color: color-mix(in srgb, var(--red-6), transparent 20%);
		background: var(--red-6);
	}

	.code-control-button:disabled {
		cursor: not-allowed;
		opacity: 0.45;
	}

	.code-control-button.primary:disabled {
		border-color: color-mix(in srgb, var(--surface-3), transparent 8%);
		background: color-mix(in srgb, var(--surface-2), transparent 18%);
		color: var(--text-2);
	}

	.code-view-body {
		display: grid;
		grid-template-columns: minmax(0, 1fr) minmax(12rem, 16rem);
		gap: var(--size-4);
		min-height: 0;
		margin: clamp(var(--size-4), 4vw, var(--size-6)) clamp(var(--size-4), 5vw, var(--size-7))
			clamp(var(--size-4), 5vw, var(--size-7));
	}

	.code-frame {
		min-height: 0;
		overflow: auto;
		border: 1px solid color-mix(in srgb, var(--brand), var(--surface-3) 70%);
		border-radius: var(--radius-4);
		background: #0d1117;
		box-shadow:
			inset 0 1px 0 rgba(255, 255, 255, 0.06),
			0 18px 48px rgba(0, 0, 0, 0.18);
	}

	.board-preview-slot {
		min-width: 0;
		min-height: 0;
	}

	.code-frame :global(pre),
	pre {
		min-width: max-content;
		min-height: 100%;
		margin: 0;
		padding: clamp(var(--size-4), 4vw, var(--size-6));
		background: transparent !important;
	}

	.code-frame :global(code),
	code {
		font-family: var(--font-mono);
		font-size: clamp(var(--font-size-0), 1.6vw, var(--font-size-2));
		font-variant-ligatures: none;
		line-height: 1.75;
		tab-size: 2;
		white-space: pre;
	}

	.highlighted-code {
		display: block;
		white-space: normal;
	}

	.code-line {
		display: block;
		min-height: 1.75em;
		margin-inline: calc(var(--size-2) * -1);
		padding-inline: var(--size-2);
		border-left: 3px solid transparent;
		border-radius: var(--radius-2);
		white-space: pre;
	}

	.code-line.selected-code-line {
		border-left-color: color-mix(in srgb, var(--brand), white 18%);
		background: color-mix(in srgb, var(--brand), transparent 82%);
	}

	.code-line.active-code-line {
		border-left-color: var(--accent);
		background: color-mix(in srgb, var(--accent), transparent 78%);
		box-shadow: inset 0 0 0 1px color-mix(in srgb, var(--accent), transparent 62%);
	}

	.code-line.active-code-line.selected-code-line {
		border-left-color: color-mix(in srgb, var(--accent), white 16%);
	}

	pre code {
		color: var(--gray-1);
	}

	@media (max-width: 860px) {
		.code-view-body {
			grid-template-columns: minmax(0, 1fr);
		}

		.board-preview-slot {
			display: none;
		}
	}

	@media (max-width: 768px) {
		.code-view-dialog {
			width: 100vw;
			height: 100dvh;
			border-radius: 0;
		}

		.code-view-header {
			padding: var(--size-4);
		}

		.code-view-body {
			margin: var(--size-4);
		}
	}
</style>
