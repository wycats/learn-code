<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		children: Snippet;
		gap?: string;
		threshold?: 'xs' | 'sm' | 'md' | 'lg';
		align?: 'start' | 'center' | 'end' | 'stretch';
		justify?: 'start' | 'center' | 'end' | 'space-between';
	}

	let {
		children,
		gap = 'var(--size-3)',
		threshold = 'sm',
		align = 'stretch',
		justify = 'start'
	}: Props = $props();
</script>

<div class="switch-root">
	<div
		class="switch-content {threshold}"
		style:--gap={gap}
		style:--align={align}
		style:--justify={justify}
	>
		{@render children()}
	</div>
</div>

<style>
	.switch-root {
		container-type: inline-size;
		width: 100%;
	}

	.switch-content {
		display: flex;
		flex-direction: column;
		gap: var(--gap);
	}

	/* When horizontal, apply alignment */
	/* Note: When vertical (stack), 'align' usually means align-items (cross axis), 
	   but in row (cluster), 'align' is also align-items. 
	   'justify' is main axis. In column, justify is vertical. In row, justify is horizontal.
	   Usually we want consistent alignment.
	*/

	@container (min-width: 20rem) {
		.switch-content.xs {
			flex-direction: row;
			align-items: var(--align);
			justify-content: var(--justify);
		}
	}
	@container (min-width: 30rem) {
		.switch-content.sm {
			flex-direction: row;
			align-items: var(--align);
			justify-content: var(--justify);
		}
	}
	@container (min-width: 45rem) {
		.switch-content.md {
			flex-direction: row;
			align-items: var(--align);
			justify-content: var(--justify);
		}
	}
	@container (min-width: 60rem) {
		.switch-content.lg {
			flex-direction: row;
			align-items: var(--align);
			justify-content: var(--justify);
		}
	}
</style>
