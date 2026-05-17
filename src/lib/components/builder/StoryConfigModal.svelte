<script lang="ts">
	import type { BuilderModel } from '$lib/game/builder-model.svelte';
	import { Plus, Trash2, X, Smile, Edit2, RotateCcw } from 'lucide-svelte';
	import Avatar from '$lib/components/game/Avatar.svelte';
	import { isAvatarIcon, AVATAR_ICONS } from '$lib/game/icons';
	import { SYSTEM_CHARACTERS, SYSTEM_EMOTIONS } from '$lib/game/constants';
	import type { Character, Emotion } from '$lib/game/types';

	interface Props {
		builder: BuilderModel;
		isOpen: boolean;
		onClose: () => void;
		initialTab?: 'characters' | 'emotions';
	}

	let { builder, isOpen, onClose, initialTab = 'characters' }: Props = $props();
	let dialog: HTMLDialogElement;
	let activeTab = $state(initialTab);

	$effect(() => {
		if (isOpen) {
			activeTab = initialTab;
			dialog?.showModal();
		} else {
			dialog?.close();
		}
	});

	function handleBackdropClick(e: MouseEvent) {
		if (e.target === dialog) {
			onClose();
		}
	}

	// Ensure lists exist
	function ensureLists() {
		if (!builder.pack.characters) builder.pack.characters = [];
		if (!builder.pack.emotions) builder.pack.emotions = [];
		if (!builder.level.characters) builder.level.characters = [];
		if (!builder.level.emotions) builder.level.emotions = [];
	}

	$effect(() => {
		if (isOpen) ensureLists();
	});

	function overrideSystemCharacter(char: Character) {
		ensureLists();
		// Clone to pack
		builder.pack.characters = [...(builder.pack.characters || []), { ...char }];
	}

	function overrideSystemEmotion(emo: Emotion) {
		ensureLists();
		// Clone to pack
		builder.pack.emotions = [...(builder.pack.emotions || []), { ...emo }];
	}

	function addCharacter(scope: 'pack' | 'level') {
		ensureLists();
		const id = crypto.randomUUID();
		const newChar = { id, name: 'New Character', color: 'var(--surface-3)', avatar: '?' };
		if (scope === 'pack') {
			builder.pack.characters = [...(builder.pack.characters || []), newChar];
		} else {
			builder.level.characters = [...(builder.level.characters || []), newChar];
		}
	}

	function removeCharacter(scope: 'pack' | 'level', index: number) {
		if (scope === 'pack') {
			if (!builder.pack.characters) return;
			const newChars = [...builder.pack.characters];
			newChars.splice(index, 1);
			builder.pack.characters = newChars;
		} else {
			if (!builder.level.characters) return;
			const newChars = [...builder.level.characters];
			newChars.splice(index, 1);
			builder.level.characters = newChars;
		}
	}

	function addEmotion(scope: 'pack' | 'level') {
		ensureLists();
		const id = crypto.randomUUID();
		const newEmo = { id, name: 'New Emotion', icon: '😐' };
		if (scope === 'pack') {
			builder.pack.emotions = [...(builder.pack.emotions || []), newEmo];
		} else {
			builder.level.emotions = [...(builder.level.emotions || []), newEmo];
		}
	}

	function removeEmotion(scope: 'pack' | 'level', index: number) {
		if (scope === 'pack') {
			if (!builder.pack.emotions) return;
			const newEmos = [...builder.pack.emotions];
			newEmos.splice(index, 1);
			builder.pack.emotions = newEmos;
		} else {
			if (!builder.level.emotions) return;
			const newEmos = [...builder.level.emotions];
			newEmos.splice(index, 1);
			builder.level.emotions = newEmos;
		}
	}

	const colors = [
		'var(--red-3)',
		'var(--orange-3)',
		'var(--yellow-3)',
		'var(--green-3)',
		'var(--teal-3)',
		'var(--blue-3)',
		'var(--indigo-3)',
		'var(--violet-3)',
		'var(--pink-3)',
		'var(--surface-3)'
	];

	const COMMON_EMOJIS = [
		'😐',
		'🙂',
		'😊',
		'😃',
		'😄',
		'😆',
		'🤣',
		'😇',
		'😉',
		'😌',
		'😍',
		'🥰',
		'😎',
		'🤩',
		'🥳',
		'😒',
		'😞',
		'😔',
		'😟',
		'😕',
		'🙁',
		'☹️',
		'😣',
		'😖',
		'😫',
		'😩',
		'🥺',
		'😢',
		'😭',
		'😤',
		'😠',
		'😡',
		'🤬',
		'🤯',
		'😳',
		'😱',
		'😨',
		'😰',
		'😥',
		'😓',
		'🤔',
		'🤨',
		'🧐',
		'🤓',
		'😏',
		'🙄',
		'😬',
		'😶',
		'😑',
		'😴',
		'😵',
		'🤢',
		'😷',
		'😈',
		'👻',
		'💀',
		'👽',
		'🤖',
		'👋',
		'👍',
		'👎',
		'👏',
		'🙏',
		'❤️',
		'✨',
		'💡',
		'❓',
		'❗️'
	];
</script>

<dialog
	id="config-dialog"
	bind:this={dialog}
	onclose={onClose}
	onclick={handleBackdropClick}
	class="config-modal"
>
	<div class="modal-header">
		<h2>Story Configuration</h2>
		<button class="close-btn" command="close" commandfor="config-dialog" aria-label="Close">
			<X size={20} />
		</button>
	</div>

	<div class="tabs">
		<button
			class="tab-btn"
			class:active={activeTab === 'characters'}
			onclick={() => (activeTab = 'characters')}
		>
			Characters
		</button>
		<button
			class="tab-btn"
			class:active={activeTab === 'emotions'}
			onclick={() => (activeTab = 'emotions')}
		>
			Emotions
		</button>
	</div>

	<div class="modal-content">
		{#if activeTab === 'characters'}
			<div class="list-container">
				<h3>System Defaults</h3>
				{#each SYSTEM_CHARACTERS.filter((sys) => !builder.pack.characters?.some((p) => p.id === sys.id)) as char (char.id)}
					<div class="config-item compact readonly">
						<div class="avatar-wrapper">
							<div class="avatar-circle" style:background-color={char.color}>
								{#if isAvatarIcon(char.avatar ?? '')}
									<div class="bot-icon-preview">
										<Avatar value={char.avatar ?? '?'} size={20} />
									</div>
								{/if}
								<div class="avatar-text" class:is-icon={isAvatarIcon(char.avatar ?? '')}>
									{char.avatar}
								</div>
							</div>
						</div>
						<div class="name-display">{char.name}</div>
						<button
							class="icon-btn"
							onclick={() => overrideSystemCharacter(char)}
							title="Customize in Pack"
						>
							<Edit2 size={16} />
						</button>
					</div>
				{:else}
					<div class="empty-message">All system characters customized in pack</div>
				{/each}

				<h3 style="margin-top: var(--size-4)">Pack Specific</h3>
				{#each builder.pack.characters || [] as char, i (char.id)}
					<div class="config-item compact">
						<div class="avatar-wrapper">
							<div class="avatar-circle" style:background-color={char.color}>
								{#if isAvatarIcon(char.avatar ?? '')}
									<div class="bot-icon-preview">
										<Avatar value={char.avatar ?? '?'} size={20} />
									</div>
								{/if}
								<input
									class="avatar-input"
									class:is-icon={isAvatarIcon(char.avatar ?? '')}
									bind:value={char.avatar}
									maxlength="15"
									onclick={(e) => e.currentTarget.select()}
									aria-label="Avatar text for {char.name}"
								/>
							</div>
							<button
								class="icon-trigger"
								popovertarget="icon-popover-pack-{i}"
								aria-label="Choose icon for {char.name}"
							>
								<Smile size={10} />
							</button>

							<div id="icon-popover-pack-{i}" popover="auto" class="icon-popover">
								<div class="icon-grid">
									{#each Object.entries(AVATAR_ICONS) as [name, Icon] (name)}
										<button
											class="icon-option"
											class:selected={char.avatar === name}
											onclick={(e) => {
												char.avatar = name;
												const popover = e.currentTarget.closest('[popover]') as HTMLElement | null;
												popover?.hidePopover();
											}}
											title={name}
										>
											<Icon size={20} />
										</button>
									{/each}
								</div>
							</div>

							<button
								class="color-trigger"
								popovertarget="color-popover-pack-{i}"
								style:background-color={char.color}
								aria-label="Change color for {char.name}"
							></button>

							<div id="color-popover-pack-{i}" popover="auto" class="color-popover">
								{#each colors as color (color)}
									<button
										class="color-swatch"
										style:background-color={color}
										class:selected={char.color === color}
										onclick={(e) => {
											char.color = color;
											const popover = e.currentTarget.closest('[popover]') as HTMLElement | null;
											popover?.hidePopover();
										}}
										aria-label="Select color {color}"
									></button>
								{/each}
							</div>
						</div>

						<input
							class="name-input"
							bind:value={char.name}
							placeholder="Character Name"
							aria-label="Character Name"
						/>

						<button
							class="delete-btn"
							onclick={() => removeCharacter('pack', i)}
							title={SYSTEM_CHARACTERS.some((s) => s.id === char.id)
								? 'Revert to System Default'
								: 'Remove Character'}
						>
							{#if SYSTEM_CHARACTERS.some((s) => s.id === char.id)}
								<RotateCcw size={18} />
							{:else}
								<Trash2 size={18} />
							{/if}
						</button>
					</div>
				{/each}
				<button class="add-btn" onclick={() => addCharacter('pack')}>
					<Plus size={18} /> Add Pack Character
				</button>

				<h3 style="margin-top: var(--size-4)">Level Specific</h3>
				{#each builder.level.characters || [] as char, i (char.id)}
					<div class="config-item compact">
						<div class="avatar-wrapper">
							<div class="avatar-circle" style:background-color={char.color}>
								{#if isAvatarIcon(char.avatar ?? '')}
									<div class="bot-icon-preview">
										<Avatar value={char.avatar ?? '?'} size={20} />
									</div>
								{/if}
								<input
									class="avatar-input"
									class:is-icon={isAvatarIcon(char.avatar ?? '')}
									bind:value={char.avatar}
									maxlength="15"
									onclick={(e) => e.currentTarget.select()}
									aria-label="Avatar text for {char.name}"
								/>
							</div>
							<button
								class="icon-trigger"
								popovertarget="icon-popover-level-{i}"
								aria-label="Choose icon for {char.name}"
							>
								<Smile size={10} />
							</button>

							<div id="icon-popover-level-{i}" popover="auto" class="icon-popover">
								<div class="icon-grid">
									{#each Object.entries(AVATAR_ICONS) as [name, Icon] (name)}
										<button
											class="icon-option"
											class:selected={char.avatar === name}
											onclick={(e) => {
												char.avatar = name;
												const popover = e.currentTarget.closest('[popover]') as HTMLElement | null;
												popover?.hidePopover();
											}}
											title={name}
										>
											<Icon size={20} />
										</button>
									{/each}
								</div>
							</div>

							<button
								class="color-trigger"
								popovertarget="color-popover-level-{i}"
								style:background-color={char.color}
								aria-label="Change color for {char.name}"
							></button>

							<div id="color-popover-level-{i}" popover="auto" class="color-popover">
								{#each colors as color (color)}
									<button
										class="color-swatch"
										style:background-color={color}
										class:selected={char.color === color}
										onclick={(e) => {
											char.color = color;
											const popover = e.currentTarget.closest('[popover]') as HTMLElement | null;
											popover?.hidePopover();
										}}
										aria-label="Select color {color}"
									></button>
								{/each}
							</div>
						</div>

						<input
							class="name-input"
							bind:value={char.name}
							placeholder="Character Name"
							aria-label="Character Name"
						/>

						<button
							class="delete-btn"
							onclick={() => removeCharacter('level', i)}
							title="Remove Character"
						>
							<Trash2 size={18} />
						</button>
					</div>
				{/each}
				<button class="add-btn" onclick={() => addCharacter('level')}>
					<Plus size={18} /> Add Level Character
				</button>
			</div>
		{:else}
			<div class="list-container">
				<h3>System Defaults</h3>
				{#each SYSTEM_EMOTIONS.filter((sys) => !builder.pack.emotions?.some((p) => p.id === sys.id)) as emo (emo.id)}
					<div class="config-item compact readonly">
						<div class="emoji-wrapper">
							<div class="emoji-display">{emo.icon}</div>
						</div>
						<div class="name-display">{emo.name}</div>
						<div class="id-display">{emo.id}</div>
						<button
							class="icon-btn"
							onclick={() => overrideSystemEmotion(emo)}
							title="Customize in Pack"
						>
							<Edit2 size={16} />
						</button>
					</div>
				{:else}
					<div class="empty-message">All system emotions customized in pack</div>
				{/each}

				<h3 style="margin-top: var(--size-4)">Pack Specific</h3>
				{#each builder.pack.emotions || [] as emo, i (emo.id)}
					<div class="config-item compact">
						<div class="emoji-wrapper">
							<input
								class="emoji-input"
								bind:value={emo.icon}
								maxlength="2"
								aria-label="Emoji for {emo.name}"
							/>
							<button
								class="icon-trigger"
								popovertarget="emoji-popover-pack-{i}"
								aria-label="Choose emoji for {emo.name}"
							>
								<Smile size={10} />
							</button>

							<div id="emoji-popover-pack-{i}" popover="auto" class="icon-popover">
								<div class="icon-grid">
									{#each COMMON_EMOJIS as emoji (emoji)}
										<button
											class="icon-option emoji-option"
											class:selected={emo.icon === emoji}
											onclick={(e) => {
												emo.icon = emoji;
												const popover = e.currentTarget.closest('[popover]') as HTMLElement | null;
												popover?.hidePopover();
											}}
											title={emoji}
										>
											{emoji}
										</button>
									{/each}
								</div>
							</div>
						</div>

						<input
							class="name-input"
							bind:value={emo.name}
							placeholder="Emotion Name"
							aria-label="Emotion Name"
						/>

						<input class="id-input" bind:value={emo.id} placeholder="ID" aria-label="Emotion ID" />

						<button
							class="delete-btn"
							onclick={() => removeEmotion('pack', i)}
							title={SYSTEM_EMOTIONS.some((s) => s.id === emo.id)
								? 'Revert to System Default'
								: 'Remove Emotion'}
						>
							{#if SYSTEM_EMOTIONS.some((s) => s.id === emo.id)}
								<RotateCcw size={18} />
							{:else}
								<Trash2 size={18} />
							{/if}
						</button>
					</div>
				{/each}
				<button class="add-btn" onclick={() => addEmotion('pack')}>
					<Plus size={18} /> Add Pack Emotion
				</button>

				<h3 style="margin-top: var(--size-4)">Level Specific</h3>
				{#each builder.level.emotions || [] as emo, i (emo.id)}
					<div class="config-item compact">
						<div class="emoji-wrapper">
							<input
								class="emoji-input"
								bind:value={emo.icon}
								maxlength="2"
								aria-label="Emoji for {emo.name}"
							/>
							<button
								class="icon-trigger"
								popovertarget="emoji-popover-level-{i}"
								aria-label="Choose emoji for {emo.name}"
							>
								<Smile size={10} />
							</button>

							<div id="emoji-popover-level-{i}" popover="auto" class="icon-popover">
								<div class="icon-grid">
									{#each COMMON_EMOJIS as emoji (emoji)}
										<button
											class="icon-option emoji-option"
											class:selected={emo.icon === emoji}
											onclick={(e) => {
												emo.icon = emoji;
												const popover = e.currentTarget.closest('[popover]') as HTMLElement | null;
												popover?.hidePopover();
											}}
											title={emoji}
										>
											{emoji}
										</button>
									{/each}
								</div>
							</div>
						</div>

						<input
							class="name-input"
							bind:value={emo.name}
							placeholder="Emotion Name"
							aria-label="Emotion Name"
						/>

						<input class="id-input" bind:value={emo.id} placeholder="ID" aria-label="Emotion ID" />

						<button
							class="delete-btn"
							onclick={() => removeEmotion('level', i)}
							title="Remove Emotion"
						>
							<Trash2 size={18} />
						</button>
					</div>
				{/each}
				<button class="add-btn" onclick={() => addEmotion('level')}>
					<Plus size={18} /> Add Level Emotion
				</button>
			</div>
		{/if}
	</div>
</dialog>

<style>
	.config-modal {
		border: none;
		border-radius: var(--radius-3);
		padding: 0;
		width: 500px;
		max-width: 90vw;
		background-color: var(--surface-1);
		box-shadow: var(--shadow-5);
		color: var(--text-1);
	}

	/* ... existing styles ... */

	.config-item.compact {
		display: flex;
		align-items: center;
		gap: var(--size-2);
		min-height: var(--touch-target-min);
		padding: 0 var(--size-2);
		background-color: var(--surface-2);
		border-radius: var(--radius-round);
		border: 1px solid transparent;
		transition: border-color 0.2s;
	}

	.config-item.compact:focus-within {
		border-color: var(--brand);
		background-color: var(--surface-1);
	}

	.avatar-wrapper {
		position: relative;
		width: 36px;
		height: 36px;
		flex-shrink: 0;
	}

	.avatar-circle {
		width: 100%;
		height: 100%;
		border-radius: 50%;
		display: grid;
		place-items: center;
		border: 2px solid white;
		box-shadow: var(--shadow-1);
		overflow: hidden;
		position: relative;
	}

	.bot-icon-preview {
		position: absolute;
		inset: 0;
		display: grid;
		place-items: center;
		pointer-events: none;
		color: var(--text-2);
	}

	.avatar-text {
		width: 100%;
		height: 100%;
		display: grid;
		place-items: center;
		font-weight: bold;
		color: var(--text-2);
		font-size: var(--font-size-1);
		position: relative;
		z-index: 1;
	}

	.avatar-text.is-icon {
		color: transparent;
	}

	.avatar-input {
		width: 100%;
		height: 100%;
		background: transparent;
		border: none;
		text-align: center;
		font-weight: bold;
		color: var(--text-2);
		font-size: var(--font-size-1);
		padding: 0;
		position: relative;
		z-index: 1;
	}

	.avatar-input.is-icon {
		color: transparent;
	}

	.avatar-input:focus {
		outline: none;
	}

	.icon-trigger {
		position: absolute;
		top: -4px;
		right: -4px;
		width: 24px;
		height: 24px;
		border-radius: 50%;
		border: 2px solid white;
		cursor: pointer;
		padding: 0;
		box-shadow: var(--shadow-1);
		background-color: white;
		color: var(--text-2);
		display: grid;
		place-items: center;
		z-index: 2;
	}

	.icon-trigger::after {
		content: '';
		position: absolute;
		inset: -10px;
		border-radius: 50%;
	}

	.icon-trigger:hover {
		background-color: white;
		color: var(--brand);
		border-color: var(--brand);
	}

	.color-trigger {
		position: absolute;
		bottom: -4px;
		right: -4px;
		width: 24px;
		height: 24px;
		border-radius: 50%;
		border: 2px solid white;
		cursor: pointer;
		padding: 0;
		box-shadow: var(--shadow-1);
	}

	.color-trigger::after {
		content: '';
		position: absolute;
		inset: -10px;
		border-radius: 50%;
	}

	.color-popover {
		/* Reset UA styles */
		margin: 0;
		inset: auto;

		position: fixed;
		/* We can't use anchor positioning easily inside overflow hidden or without unique anchors per item easily in pure CSS without ID generation, 
		   but popover API handles basic positioning if we don't use anchor. 
		   Actually, standard popover centers on screen or needs manual positioning. 
		   Let's use a simple fixed position strategy or just let it be a simple popover that we might need to position with JS if we want it attached.
		   Wait, standard popover="auto" centers in the viewport if not positioned.
		   We want it near the trigger. 
		   Since we are inside a dialog, we can use anchor positioning if we give unique IDs.
		   But for now, let's just make it a small grid that appears centered or use a simple trick.
		   Actually, let's use anchor positioning with inline styles for anchor-name.
		*/
		padding: var(--size-2);
		background: var(--surface-1);
		border: 1px solid var(--surface-3);
		border-radius: var(--radius-2);
		box-shadow: var(--shadow-4);
		display: none;
		grid-template-columns: repeat(5, 1fr);
		gap: var(--size-1);
	}

	.color-popover:popover-open {
		display: grid;
		/* Center on screen for now as fallback, or use anchor if supported */
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
	}

	.icon-popover {
		margin: 0;
		inset: auto;
		position: fixed;
		padding: var(--size-3);
		background: var(--surface-1);
		border: 1px solid var(--surface-3);
		border-radius: var(--radius-3);
		box-shadow: var(--shadow-5);
		display: none;
		width: 320px;
		max-height: 400px;
		overflow-y: auto;
	}

	.icon-popover:popover-open {
		display: block;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
	}

	.icon-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(40px, 1fr));
		gap: var(--size-2);
	}

	.icon-option {
		width: 44px;
		height: 44px;
		border-radius: var(--radius-2);
		border: 1px solid var(--surface-3);
		background: var(--surface-1);
		color: var(--text-2);
		cursor: pointer;
		display: grid;
		place-items: center;
		padding: 0;
		transition: all 0.1s;
	}

	.icon-option:hover {
		background-color: var(--surface-2);
		border-color: var(--text-2);
		color: var(--text-1);
	}

	.icon-option.selected {
		background-color: var(--brand);
		color: white;
		border-color: var(--brand);
	}

	.name-input {
		flex: 1;
		background: transparent;
		border: 1px solid transparent;
		padding: var(--size-1) var(--size-2);
		font-size: var(--font-size-1);
		font-weight: 500;
		border-radius: var(--radius-1);
		color: var(--text-1);
	}

	.name-input:hover,
	.name-input:focus {
		background-color: var(--surface-1);
		border-color: var(--surface-3);
	}

	.emoji-wrapper {
		position: relative;
		width: 36px;
		height: 36px;
		display: grid;
		place-items: center;
		background-color: var(--surface-1);
		border-radius: 50%;
		border: 1px solid var(--surface-3);
	}

	.emoji-display {
		width: 100%;
		height: 100%;
		display: grid;
		place-items: center;
		font-size: 20px;
	}

	.emoji-input {
		width: 100%;
		height: 100%;
		background: transparent;
		border: none;
		text-align: center;
		font-size: 20px;
		padding: 0;
	}

	.emoji-option {
		font-size: 20px;
	}

	.id-input {
		width: 80px;
		font-size: var(--font-size-00);
		color: var(--text-3);
		background: transparent;
		border: 1px solid transparent;
		text-align: right;
	}

	.id-input:focus {
		border-color: var(--surface-3);
		background: var(--surface-1);
	}

	.config-modal::backdrop {
		background-color: rgba(0, 0, 0, 0.5);
		backdrop-filter: blur(2px);
	}

	.modal-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: var(--size-3) var(--size-4);
		border-bottom: 1px solid var(--surface-3);
	}

	h2 {
		margin: 0;
		font-size: var(--font-size-3);
	}

	.close-btn {
		background: none;
		border: none;
		cursor: pointer;
		color: var(--text-2);
		min-width: var(--touch-target-min);
		min-height: var(--touch-target-min);
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 0;
		border-radius: var(--radius-round);
	}

	.close-btn:hover {
		background-color: var(--surface-2);
		color: var(--text-1);
	}

	.tabs {
		display: flex;
		border-bottom: 1px solid var(--surface-3);
		padding: 0 var(--size-4);
		gap: var(--size-4);
	}

	.tab-btn {
		background: none;
		border: none;
		min-height: var(--touch-target-min);
		display: flex;
		align-items: center;
		padding: 0;
		cursor: pointer;
		color: var(--text-2);
		font-weight: 500;
		border-bottom: 2px solid transparent;
	}

	.tab-btn.active {
		color: var(--brand);
		border-bottom-color: var(--brand);
	}

	.modal-content {
		padding: var(--size-4);
		max-height: 60vh;
		overflow-y: auto;
	}

	.list-container {
		display: flex;
		flex-direction: column;
		gap: var(--size-2);
	}

	h3 {
		margin: 0;
		font-size: var(--font-size-0);
		text-transform: uppercase;
		letter-spacing: 0.05em;
		color: var(--text-3);
		font-weight: 700;
		margin-bottom: var(--size-1);
	}

	input {
		padding: var(--size-2);
		border: 1px solid var(--surface-3);
		border-radius: var(--radius-1);
		background-color: var(--surface-1);
		color: var(--text-1);
	}

	.color-swatch {
		width: var(--touch-target-min);
		height: var(--touch-target-min);
		border-radius: var(--radius-round);
		border: 2px solid transparent;
		cursor: pointer;
		padding: 0;
	}

	.color-swatch.selected {
		border-color: var(--text-1);
		transform: scale(1.1);
	}

	.delete-btn {
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

	.delete-btn:hover {
		background-color: var(--red-1);
		color: var(--red-7);
	}

	.add-btn {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: var(--size-2);
		min-height: var(--touch-target-min);
		padding: 0 var(--size-2);
		background: none;
		border: 1px dashed var(--surface-3);
		border-radius: var(--radius-2);
		color: var(--text-2);
		cursor: pointer;
		font-weight: 500;
	}

	.add-btn:hover {
		background-color: var(--surface-2);
		color: var(--text-1);
		border-color: var(--text-2);
	}

	.name-display {
		flex: 1;
		padding: var(--size-1) var(--size-2);
		font-size: var(--font-size-1);
		font-weight: 500;
		color: var(--text-2);
		display: flex;
		align-items: center;
	}

	.id-display {
		width: 80px;
		font-size: var(--font-size-00);
		color: var(--text-3);
		text-align: right;
		padding: var(--size-1) var(--size-2);
	}

	.icon-btn {
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

	.icon-btn:hover {
		background-color: var(--surface-3);
		color: var(--text-1);
	}

	.empty-message {
		padding: var(--size-2);
		color: var(--text-3);
		font-style: italic;
		font-size: var(--font-size-1);
		text-align: center;
	}
</style>
