<script lang="ts">
	import type { TileDefinition, TileType } from '$lib/game/schema';
	import { AVATAR_ICONS } from '$lib/game/icons';
	import {
		X,
		Check,
		Footprints,
		BrickWall,
		Skull,
		Snowflake,
		Waves,
		Ban,
		Smile
	} from 'lucide-svelte';
	import Cell from '$lib/components/game/Cell.svelte';

	interface Props {
		tile?: TileDefinition;
		onSave: (tile: TileDefinition) => void;
		onClose: () => void;
	}

	let { tile, onSave, onClose }: Props = $props();

	let dialog: HTMLDialogElement;

	let name = $state(tile?.name || 'New Tile');
	let type = $state<TileType>(tile?.type || 'floor');
	let color = $state(tile?.visuals.color || 'var(--surface-2)');
	let pattern = $state(tile?.visuals.pattern || '');
	let decal = $state(tile?.visuals.decal || '');

	$effect(() => {
		dialog?.showModal();
	});

	const COLORS = [
		{ label: 'Gray', value: 'var(--surface-2)' },
		{ label: 'Stone', value: 'var(--stone-3)' },
		{ label: 'Red', value: 'var(--red-3)' },
		{ label: 'Orange', value: 'var(--orange-3)' },
		{ label: 'Yellow', value: 'var(--yellow-2)' },
		{ label: 'Green', value: 'var(--green-3)' },
		{ label: 'Teal', value: 'var(--teal-3)' },
		{ label: 'Blue', value: 'var(--blue-3)' },
		{ label: 'Indigo', value: 'var(--indigo-3)' },
		{ label: 'Violet', value: 'var(--violet-3)' },
		{ label: 'Pink', value: 'var(--pink-3)' }
	];

	const TYPES: {
		value: TileType;
		label: string;
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		icon: any;
		description: string;
	}[] = [
		{ value: 'floor', label: 'Floor', icon: Footprints, description: 'Safe to walk on' },
		{ value: 'wall', label: 'Wall', icon: BrickWall, description: 'Blocks movement' },
		{ value: 'hazard', label: 'Hazard', icon: Skull, description: 'Fatal to touch' },
		{ value: 'ice', label: 'Ice', icon: Snowflake, description: 'Causes sliding' },
		{ value: 'water', label: 'Water', icon: Waves, description: 'Requires swimming' }
	];

	const DECALS = Object.keys(AVATAR_ICONS);

	function handleSave() {
		const newTile: TileDefinition = {
			id: tile?.id || crypto.randomUUID(),
			name,
			type,
			visuals: {
				color,
				pattern: pattern || undefined,
				decal: decal || undefined
			}
		};
		onSave(newTile);
	}

	function handleBackdropClick(e: MouseEvent) {
		if (e.target === dialog) {
			onClose();
		}
	}
</script>

<dialog bind:this={dialog} class="modal" onclose={onClose} onclick={handleBackdropClick}>
	<div class="modal-header">
		<h2>{tile ? 'Edit Tile' : 'New Tile'}</h2>
		<button class="close-btn" onclick={onClose} aria-label="Close">
			<X size={24} />
		</button>
	</div>

	<div class="modal-body">
		<!-- Top Section: Preview & Name -->
		<div class="top-section">
			<div class="preview-wrapper">
				<div class="preview-stage">
					<Cell
						type="grass"
						customTile={{
							id: 'preview',
							name,
							type,
							visuals: { color, pattern, decal }
						}}
					/>
				</div>

				<!-- Decal Satellite Trigger -->
				<div class="satellite-container top-right">
					<button class="satellite-trigger" popovertarget="decal-popover" title="Change Icon">
						{#if decal && decal in AVATAR_ICONS}
							{@const Icon = AVATAR_ICONS[decal as keyof typeof AVATAR_ICONS]}
							<Icon size={14} />
						{:else}
							<Smile size={14} />
						{/if}
					</button>
					<div id="decal-popover" popover="auto" class="popover decal-popover">
						<div class="decal-grid">
							<button
								class="decal-option none"
								class:active={decal === ''}
								onclick={(e) => {
									decal = '';
									(e.currentTarget.closest('[popover]') as HTMLElement)?.hidePopover();
								}}
								title="No Decal"
							>
								<Ban size={20} />
							</button>
							{#each DECALS as d (d)}
								{@const Icon = AVATAR_ICONS[d as keyof typeof AVATAR_ICONS]}
								<button
									class="decal-option"
									class:active={decal === d}
									onclick={(e) => {
										decal = d;
										(e.currentTarget.closest('[popover]') as HTMLElement)?.hidePopover();
									}}
									title={d}
								>
									<Icon size={20} />
								</button>
							{/each}
						</div>
					</div>
				</div>

				<!-- Color Satellite Trigger -->
				<div class="satellite-container bottom-right">
					<button
						class="satellite-trigger color-trigger"
						popovertarget="color-popover"
						style:background-color={color}
						title="Change Color"
					>
					</button>
					<div id="color-popover" popover="auto" class="popover color-popover">
						<div class="color-grid">
							{#each COLORS as c (c.value)}
								<button
									class="color-option"
									class:active={color === c.value}
									style:background-color={c.value}
									onclick={(e) => {
										color = c.value;
										(e.currentTarget.closest('[popover]') as HTMLElement)?.hidePopover();
									}}
									title={c.label}
								>
									{#if color === c.value}
										<Check size={14} color="rgba(0,0,0,0.5)" />
									{/if}
								</button>
							{/each}
						</div>
					</div>
				</div>
			</div>

			<div class="name-editor">
				<label for="tile-name-input" class="sr-only">Tile Name</label>
				<input
					id="tile-name-input"
					type="text"
					bind:value={name}
					placeholder="Tile Name"
					autocomplete="off"
					class="inline-name-input"
				/>
				<div class="type-badge">
					{TYPES.find((t) => t.value === type)?.label}
				</div>
			</div>
		</div>

		<!-- Middle Section: Behavior -->
		<div class="section">
			<div class="section-header">Behavior</div>
			<div class="behavior-grid">
				{#each TYPES as t (t.value)}
					<button
						class="behavior-card"
						class:active={type === t.value}
						onclick={() => (type = t.value)}
					>
						<div class="behavior-icon">
							<t.icon size={24} />
						</div>
						<div class="behavior-details">
							<span class="behavior-label">{t.label}</span>
						</div>
					</button>
				{/each}
			</div>
		</div>
	</div>

	<div class="modal-footer">
		<button class="btn secondary" onclick={onClose}>Cancel</button>
		<button class="btn primary" onclick={handleSave}>
			<Check size={18} /> Save Tile
		</button>
	</div>
</dialog>

<style>
	.modal {
		background-color: var(--surface-1);
		border-radius: var(--radius-4);
		box-shadow: var(--shadow-6);
		width: 100%;
		max-width: 600px;
		display: flex;
		flex-direction: column;
		overflow: visible;
		border: 1px solid var(--surface-3);
		max-height: 90vh;
		padding: 0;
		color: var(--text-1);
	}

	.modal::backdrop {
		background-color: rgba(0, 0, 0, 0.4);
		backdrop-filter: blur(8px);
	}

	.modal-header {
		padding: var(--size-4);
		border-bottom: 1px solid var(--surface-2);
		display: flex;
		justify-content: space-between;
		align-items: center;
		background-color: var(--surface-1);
		border-radius: var(--radius-4) var(--radius-4) 0 0;
	}

	.modal-header h2 {
		font-size: var(--font-size-3);
		font-weight: 800;
		margin: 0;
		color: var(--text-1);
		letter-spacing: -0.02em;
	}

	.close-btn {
		background: var(--surface-2);
		border: none;
		cursor: pointer;
		color: var(--text-2);
		padding: var(--size-2);
		border-radius: var(--radius-round);
		transition: all 0.2s;
		display: grid;
		place-items: center;
	}

	.close-btn:hover {
		background-color: var(--surface-3);
		color: var(--text-1);
		transform: rotate(90deg);
	}

	.modal-body {
		padding: var(--size-5);
		display: flex;
		flex-direction: column;
		gap: var(--size-5);
		overflow-y: visible; /* Allow popovers to overflow */
		min-height: 300px;
	}

	/* Top Section */
	.top-section {
		display: flex;
		align-items: center;
		gap: var(--size-5);
	}

	.preview-wrapper {
		position: relative;
		width: 100px;
		height: 100px;
		flex-shrink: 0;
	}

	.preview-stage {
		width: 100%;
		height: 100%;
		border-radius: var(--radius-3);
		overflow: hidden;
		box-shadow: var(--shadow-3);
		border: 4px solid var(--surface-1);
		outline: 2px solid var(--surface-3);
	}

	/* Satellite Triggers */
	.satellite-container {
		position: absolute;
		z-index: 10;
	}

	.satellite-container.top-right {
		top: -6px;
		right: -6px;
	}

	.satellite-container.bottom-right {
		bottom: -6px;
		right: -6px;
	}

	.satellite-trigger {
		width: 28px;
		height: 28px;
		border-radius: 50%;
		background-color: var(--surface-1);
		border: 2px solid var(--surface-1);
		box-shadow: var(--shadow-2);
		cursor: pointer;
		display: grid;
		place-items: center;
		color: var(--text-2);
		padding: 0;
		transition: all 0.2s;
	}

	.satellite-trigger:hover {
		transform: scale(1.1);
		color: var(--brand);
	}

	.satellite-trigger.color-trigger {
		border: 2px solid var(--surface-1);
	}

	.satellite-trigger.color-trigger:hover {
		border-color: var(--surface-1);
		transform: scale(1.1);
	}

	.name-editor {
		flex: 1;
		display: flex;
		flex-direction: column;
		gap: var(--size-1);
	}

	.inline-name-input {
		font-size: var(--font-size-5);
		font-weight: 800;
		color: var(--text-1);
		background: transparent;
		border: 2px solid transparent;
		border-radius: var(--radius-2);
		padding: var(--size-1) var(--size-2);
		margin-left: calc(var(--size-2) * -1);
		width: 100%;
		transition: all 0.2s;
	}

	.inline-name-input:hover {
		border-color: var(--surface-3);
		background-color: var(--surface-2);
	}

	.inline-name-input:focus {
		border-color: var(--brand);
		background-color: var(--surface-1);
		outline: none;
	}

	.type-badge {
		font-size: var(--font-size-0);
		color: var(--text-2);
		text-transform: uppercase;
		letter-spacing: 0.05em;
		font-weight: 600;
		background-color: var(--surface-2);
		padding: 2px 8px;
		border-radius: var(--radius-pill);
		align-self: flex-start;
	}

	/* Sections */
	.section {
		display: flex;
		flex-direction: column;
		gap: var(--size-3);
	}

	.section-header {
		font-size: var(--font-size-0);
		font-weight: 700;
		text-transform: uppercase;
		letter-spacing: 0.05em;
		color: var(--text-3);
	}

	/* Behavior Grid */
	.behavior-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
		gap: var(--size-2);
	}

	.behavior-card {
		display: flex;
		flex-direction: column;
		align-items: center;
		text-align: center;
		padding: var(--size-3);
		background-color: var(--surface-1);
		border: 2px solid var(--surface-3);
		border-radius: var(--radius-3);
		cursor: pointer;
		transition: all 0.2s;
		gap: var(--size-2);
	}

	.behavior-card:hover {
		border-color: var(--text-2);
		transform: translateY(-2px);
	}

	.behavior-card.active {
		border-color: var(--brand);
		background-color: var(--brand-light);
		box-shadow: var(--shadow-2);
	}

	.behavior-icon {
		color: var(--text-2);
	}

	.behavior-card.active .behavior-icon {
		color: var(--brand);
	}

	.behavior-label {
		font-weight: 700;
		font-size: var(--font-size-0);
		color: var(--text-1);
	}

	/* Popovers */
	.popover {
		margin: 0;
		inset: auto; /* Reset default centering */
		position: fixed; /* Or absolute if we want to position manually, but popover API handles top layer */
		/* We need to position it near the trigger. 
		   Since we don't have anchor positioning fully supported yet without polyfill or latest Chrome,
		   we can use a simple trick: put the popover inside the container but use fixed positioning?
		   Actually, standard popover behavior is to center in viewport if not anchored.
		   Wait, the previous implementation used absolute positioning relative to the container.
		   With popover API, the element is promoted to the top layer.
		   We can use CSS Anchor Positioning if available, or just simple JS positioning if needed.
		   However, for now, let's try to keep it simple.
		   If we use `position: absolute` on a popover, it is relative to the viewport unless we use anchor.
		   
		   Let's stick to the previous absolute positioning logic but with `popover` attribute?
		   No, `popover` elements are top-layer, so `position: absolute` is relative to the initial containing block (viewport).
		   
		   To position it correctly without anchor positioning, we might need a tiny bit of JS or just accept centering for now?
		   The user asked for "popover for popovers", implying the native API.
		   Native popovers without anchor positioning are hard to place next to buttons.
		   
		   BUT, `StoryConfigModal` used `position: fixed` and `top: 50%; left: 50%; transform: translate(-50%, -50%);` for its popovers (centering them).
		   The user's screenshot shows the popover *next* to the button.
		   
		   Let's try to use `anchor-name` and `position-anchor` if we can, or fallback to a centered approach if not.
		   Actually, looking at `StoryConfigModal.svelte` again:
		   It has `.icon-popover:popover-open { display: block; top: 50%; left: 50%; ... }`
		   So it centers them.
		   
		   The user's screenshot shows it attached.
		   I will try to use a simple JS positioning trick in the `onclick` or just center it for now to be safe and compliant with the "native popover" request, 
		   OR I can use `position: absolute` and calculate coordinates.
		   
		   Actually, I'll use a simple trick:
		   I'll leave the popover styling as `position: absolute` but I need to know *where* to put it.
		   Since `popover` promotes to top layer, I can't easily position it relative to the button without JS or Anchor.
		   
		   Let's use a small action or just inline JS to set `top/left` when opening?
		   The `togglePopover` logic was replaced by declarative `popovertarget`.
		   
		   I will use `anchor-name` CSS properties, assuming the user's environment might support it (Chrome/Edge do).
		   If not, I'll add a fallback to center it.
		*/
		background-color: var(--surface-1);
		border: 1px solid var(--surface-3);
		border-radius: var(--radius-3);
		box-shadow: var(--shadow-4);
		padding: var(--size-3);
		min-width: 240px;

		/* Anchor positioning attempt */
		position-anchor: --trigger;
		top: anchor(bottom);
		left: anchor(left);
	}

	/* We need to define anchor names on triggers. 
	   Since we have two triggers, we need unique names.
	*/

	.satellite-trigger[popovertarget='decal-popover'] {
		anchor-name: --decal-trigger;
	}

	.decal-popover {
		position-anchor: --decal-trigger;
		top: anchor(bottom);
		left: anchor(center);
		transform: translateX(-50%);
		margin-top: 8px;
	}

	.satellite-trigger[popovertarget='color-popover'] {
		anchor-name: --color-trigger;
	}

	.color-popover {
		position-anchor: --color-trigger;
		top: anchor(bottom);
		left: anchor(center);
		transform: translateX(-50%);
		margin-top: 8px;
	}

	/* Fallback for browsers without anchor positioning: Center on screen */
	@supports not (anchor-name: --foo) {
		.popover:popover-open {
			top: 50%;
			left: 50%;
			transform: translate(-50%, -50%);
		}
	}

	.color-grid {
		display: grid;
		grid-template-columns: repeat(5, 1fr);
		gap: var(--size-2);
	}

	.color-option {
		width: 36px;
		height: 36px;
		border-radius: 50%;
		border: 2px solid rgba(0, 0, 0, 0.1);
		cursor: pointer;
		display: grid;
		place-items: center;
		padding: 0;
		transition: transform 0.1s;
	}

	.color-option:hover {
		transform: scale(1.1);
	}

	.color-option.active {
		border-color: var(--text-1);
		transform: scale(1.1);
	}

	.decal-grid {
		display: grid;
		grid-template-columns: repeat(5, 1fr);
		gap: var(--size-2);
		max-height: 200px;
		overflow-y: auto;
	}

	.decal-option {
		width: 36px;
		height: 36px;
		border-radius: var(--radius-2);
		background-color: var(--surface-2);
		border: 1px solid transparent;
		cursor: pointer;
		display: grid;
		place-items: center;
		color: var(--text-2);
		transition: all 0.1s;
		padding: 0;
	}

	.decal-option:hover {
		background-color: var(--surface-3);
		color: var(--text-1);
	}

	.decal-option.active {
		background-color: var(--brand-light);
		color: var(--brand);
		border-color: var(--brand);
	}

	.decal-option.none {
		color: var(--red-5);
	}

	/* Footer */
	.modal-footer {
		padding: var(--size-4);
		border-top: 1px solid var(--surface-2);
		display: flex;
		justify-content: flex-end;
		gap: var(--size-3);
		background-color: var(--surface-1);
		border-radius: 0 0 var(--radius-4) var(--radius-4);
	}

	.btn {
		padding: var(--size-2) var(--size-4);
		border-radius: var(--radius-2);
		font-weight: 700;
		font-size: var(--font-size-1);
		cursor: pointer;
		border: none;
		display: flex;
		align-items: center;
		gap: var(--size-2);
		transition: all 0.2s;
	}

	.btn.secondary {
		background-color: transparent;
		color: var(--text-2);
		border: 2px solid var(--surface-3);
	}

	.btn.secondary:hover {
		background-color: var(--surface-2);
		color: var(--text-1);
		border-color: var(--text-2);
	}

	.btn.primary {
		background-color: var(--brand);
		color: white;
		box-shadow: var(--shadow-3);
	}

	.btn.primary:hover {
		background-color: var(--brand-hover);
		transform: translateY(-1px);
		box-shadow: var(--shadow-4);
	}

	.btn.primary:active {
		transform: translateY(1px);
		box-shadow: var(--shadow-1);
	}
</style>
