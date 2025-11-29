<script lang="ts">
	import { AVATAR_ICONS } from '$lib/game/icons';

	interface Props {
		value: string;
		size?: number;
		color?: string;
	}

	let { value, size = 24, color = 'currentColor' }: Props = $props();

	let iconComponent = $derived(AVATAR_ICONS[value.toLowerCase() as keyof typeof AVATAR_ICONS]);
</script>

{#if iconComponent}
	{@const Icon = iconComponent}
	<Icon {size} {color} />
{:else}
	<span style:font-size="{size * 0.8}px" style:line-height="1">
		{value}
	</span>
{/if}
