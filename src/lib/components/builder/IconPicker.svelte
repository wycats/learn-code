<script lang="ts">
	import { AVATAR_ICONS } from '$lib/game/icons';
	import { Search } from 'lucide-svelte';

	interface Props {
		value?: string;
		onChange: (icon: string) => void;
	}

	let { value = 'star', onChange }: Props = $props();

	let isOpen = $state(false);
	let searchQuery = $state('');
	let pickerElement: HTMLElement;

	const filteredIcons = $derived(
		Object.keys(AVATAR_ICONS).filter((name) =>
			name.toLowerCase().includes(searchQuery.toLowerCase())
		)
	);

	const CurrentIcon = $derived(
		AVATAR_ICONS[value as keyof typeof AVATAR_ICONS] || AVATAR_ICONS.star
	);

	function selectIcon(name: string) {
		onChange(name);
		isOpen = false;
	}

	function handleKeydown(e: KeyboardEvent) {
		if (e.key === 'Escape') isOpen = false;
	}

	function handleClickOutside(event: MouseEvent) {
		if (isOpen && pickerElement && !pickerElement.contains(event.target as Node)) {
			isOpen = false;
		}
	}

	function focusOnMount(node: HTMLElement) {
		node.focus();
	}
</script>

<svelte:window onkeydown={handleKeydown} onclick={handleClickOutside} />

<div class="icon-picker" bind:this={pickerElement}>
	<button class="trigger" onclick={() => (isOpen = !isOpen)} aria-label="Select Icon">
		<CurrentIcon size={24} />
	</button>

	{#if isOpen}
		<div class="popover">
			<div class="search-bar">
				<Search size={16} class="search-icon" />
				<input
					type="text"
					placeholder="Search icons..."
					bind:value={searchQuery}
					use:focusOnMount
				/>
			</div>
			<div class="grid">
				{#each filteredIcons as iconName (iconName)}
					{@const Icon = AVATAR_ICONS[iconName as keyof typeof AVATAR_ICONS]}
					<button
						class="icon-btn"
						class:selected={value === iconName}
						onclick={() => selectIcon(iconName)}
						title={iconName}
					>
						<Icon size={20} />
					</button>
				{/each}
			</div>
		</div>
	{/if}
</div>

<style>
	.icon-picker {
		position: relative;
		display: inline-block;
	}

	.trigger {
		width: 44px;
		height: 44px;
		border-radius: var(--radius-2);
		border: 1px solid var(--surface-3);
		background: var(--surface-1);
		color: var(--text-1);
		display: grid;
		place-items: center;
		cursor: pointer;
		transition: all 0.2s var(--ease-3);
	}

	.trigger:hover {
		border-color: var(--brand);
		color: var(--brand);
	}

	.popover {
		position: absolute;
		top: 100%;
		left: 0;
		margin-top: var(--size-2);
		width: 280px;
		background: var(--surface-1);
		border: 1px solid var(--surface-3);
		border-radius: var(--radius-3);
		box-shadow: var(--shadow-4);
		z-index: 100;
		display: flex;
		flex-direction: column;
		overflow: hidden;
	}

	.search-bar {
		padding: var(--size-2);
		border-bottom: 1px solid var(--surface-2);
		display: flex;
		align-items: center;
		gap: var(--size-2);
		color: var(--text-3);
	}

	.search-bar input {
		border: none;
		background: none;
		width: 100%;
		font-size: var(--font-size-1);
		color: var(--text-1);
		outline: none;
	}

	.grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(44px, 1fr));
		gap: var(--size-1);
		padding: var(--size-2);
		max-height: 200px;
		overflow-y: auto;
	}

	.icon-btn {
		width: 44px;
		height: 44px;
		border-radius: var(--radius-2);
		border: none;
		background: none;
		color: var(--text-2);
		display: grid;
		place-items: center;
		cursor: pointer;
		transition: all 0.1s;
	}

	.icon-btn:hover {
		background: var(--surface-2);
		color: var(--text-1);
	}

	.icon-btn.selected {
		background: var(--brand-dim);
		color: var(--brand);
	}
</style>
