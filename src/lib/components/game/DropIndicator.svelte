<script lang="ts">
	interface Props {
		edge: 'top' | 'bottom' | 'inside';
		gap?: string;
	}

	let { edge, gap = 'var(--size-2)' }: Props = $props();
</script>

<div
	class="indicator"
	class:top={edge === 'top'}
	class:bottom={edge === 'bottom'}
	style:--gap={gap}
>
	<div class="line"></div>
</div>

<style>
	.indicator {
		position: absolute;
		left: 0;
		right: 0;
		pointer-events: none;
		z-index: 10;
	}

	.top {
		top: calc(var(--gap) * -0.5 - 2px);
	}

	.bottom {
		bottom: calc(var(--gap) * -0.5 - 2px);
	}

	.line {
		height: 4px;
		background-color: var(--blue-5);
		border-radius: var(--radius-round);
		box-shadow: var(--shadow-2);
	}
</style>
