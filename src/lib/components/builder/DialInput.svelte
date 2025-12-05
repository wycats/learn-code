<script lang="ts">
	interface Props {
		value: number;
		min?: number;
		max?: number;
		step?: number;
		label?: string;
		onChange: (newValue: number) => void;
	}

	let { value, min = 0, max = 100, step = 1, label, onChange }: Props = $props();

	let isDragging = $state(false);
	let startY = 0;
	let startValue = 0;
	let sensitivity = 5; // Pixels per step

	function handlePointerDown(e: PointerEvent) {
		isDragging = true;
		startY = e.clientY;
		startValue = value;
		(e.target as HTMLElement).setPointerCapture(e.pointerId);
		document.body.style.cursor = 'ns-resize';
	}

	function handlePointerMove(e: PointerEvent) {
		if (!isDragging) return;

		const deltaY = startY - e.clientY; // Up is positive
		const steps = Math.floor(deltaY / sensitivity);

		let newValue = startValue + steps * step;

		// Clamp
		if (min !== undefined) newValue = Math.max(min, newValue);
		if (max !== undefined) newValue = Math.min(max, newValue);

		if (newValue !== value) {
			onChange(newValue);
		}
	}

	function handlePointerUp(e: PointerEvent) {
		isDragging = false;
		(e.target as HTMLElement).releasePointerCapture(e.pointerId);
		document.body.style.cursor = '';
	}
</script>

<div
	class="dial-container"
	class:dragging={isDragging}
	onpointerdown={handlePointerDown}
	onpointermove={handlePointerMove}
	onpointerup={handlePointerUp}
	onpointercancel={handlePointerUp}
	role="slider"
	aria-valuenow={value}
	aria-valuemin={min}
	aria-valuemax={max}
	aria-label={label || 'Value Dial'}
	tabindex="0"
>
	<div class="value">{value}</div>
	{#if label}
		<div class="label">{label}</div>
	{/if}
	<div class="indicator">
		<div class="arrow up">▲</div>
		<div class="arrow down">▼</div>
	</div>
</div>

<style>
	.dial-container {
		background-color: var(--surface-2);
		border: 2px solid var(--surface-3);
		border-radius: var(--radius-2);
		padding: var(--size-2);
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		cursor: ns-resize;
		user-select: none;
		touch-action: none;
		transition: all 0.2s;
		position: relative;
		min-width: 60px;
	}

	.dial-container:hover {
		border-color: var(--text-2);
		background-color: var(--surface-3);
	}

	.dial-container.dragging {
		border-color: var(--brand);
		background-color: var(--brand-light);
		transform: scale(1.05);
		box-shadow: var(--shadow-2);
	}

	.value {
		font-size: var(--font-size-4);
		font-weight: 800;
		color: var(--text-1);
		line-height: 1;
	}

	.label {
		font-size: var(--font-size-00);
		color: var(--text-2);
		text-transform: uppercase;
		margin-top: 4px;
	}

	.indicator {
		position: absolute;
		right: 4px;
		top: 50%;
		transform: translateY(-50%);
		display: flex;
		flex-direction: column;
		gap: 2px;
		opacity: 0;
		transition: opacity 0.2s;
	}

	.dial-container:hover .indicator,
	.dial-container.dragging .indicator {
		opacity: 0.5;
	}

	.arrow {
		font-size: 8px;
		color: var(--text-2);
	}
</style>
