<script lang="ts">
	interface Props {
		emotion?: 'idle' | 'thinking' | 'talking' | 'happy' | 'sad';
		size?: number;
	}
	let { emotion = 'idle', size = 64 }: Props = $props();
</script>

<div class="guide" data-emotion={emotion} style:--size="{size}px">
	<svg viewBox="0 0 100 100" width={size} height={size}>
		<!-- Antenna -->
		<g class="antenna">
			<line x1="50" y1="20" x2="50" y2="5" stroke="currentColor" stroke-width="4" />
			<circle cx="50" cy="5" r="6" fill="var(--accent-1)" />
		</g>

		<!-- Head -->
		<rect
			x="20"
			y="20"
			width="60"
			height="50"
			rx="10"
			fill="var(--gray-3)"
			stroke="currentColor"
			stroke-width="4"
		/>

		<!-- Eyes -->
		<g class="eyes">
			{#if emotion === 'happy'}
				<!-- Happy Eyes (Arches) -->
				<path
					d="M 35 45 Q 40 38 45 45"
					stroke="currentColor"
					stroke-width="4"
					fill="none"
					stroke-linecap="round"
				/>
				<path
					d="M 55 45 Q 60 38 65 45"
					stroke="currentColor"
					stroke-width="4"
					fill="none"
					stroke-linecap="round"
				/>
			{:else if emotion === 'sad'}
				<!-- Sad Eyes (Inverted Arches) -->
				<path
					d="M 35 45 Q 40 52 45 45"
					stroke="currentColor"
					stroke-width="4"
					fill="none"
					stroke-linecap="round"
				/>
				<path
					d="M 55 45 Q 60 52 65 45"
					stroke="currentColor"
					stroke-width="4"
					fill="none"
					stroke-linecap="round"
				/>
			{:else if emotion === 'thinking'}
				<!-- Thinking Eyes (One big, one small) -->
				<circle cx="40" cy="45" r="6" fill="currentColor" />
				<circle cx="60" cy="45" r="4" fill="currentColor" />
			{:else}
				<!-- Normal Eyes -->
				<circle cx="40" cy="45" r="5" fill="currentColor" />
				<circle cx="60" cy="45" r="5" fill="currentColor" />
			{/if}
		</g>

		<!-- Mouth -->
		<g class="mouth">
			{#if emotion === 'talking'}
				<rect x="40" y="58" width="20" height="4" rx="2" fill="currentColor">
					<animate attributeName="height" values="4;10;4" dur="0.2s" repeatCount="indefinite" />
					<animate attributeName="y" values="58;55;58" dur="0.2s" repeatCount="indefinite" />
				</rect>
			{:else if emotion === 'happy'}
				<path
					d="M 35 58 Q 50 68 65 58"
					stroke="currentColor"
					stroke-width="4"
					fill="none"
					stroke-linecap="round"
				/>
			{:else if emotion === 'sad'}
				<path
					d="M 35 65 Q 50 55 65 65"
					stroke="currentColor"
					stroke-width="4"
					fill="none"
					stroke-linecap="round"
				/>
			{:else if emotion === 'thinking'}
				<line
					x1="40"
					y1="60"
					x2="60"
					y2="60"
					stroke="currentColor"
					stroke-width="4"
					stroke-linecap="round"
				/>
			{:else}
				<line
					x1="35"
					y1="60"
					x2="65"
					y2="60"
					stroke="currentColor"
					stroke-width="4"
					stroke-linecap="round"
				/>
			{/if}
		</g>
	</svg>
</div>

<style>
	.guide {
		color: var(--text-1);
		display: inline-flex;
		align-items: center;
		justify-content: center;
		transition: transform 0.3s var(--ease-spring-3);
	}

	.antenna {
		transform-origin: 50% 20px;
	}

	[data-emotion='thinking'] .antenna {
		animation: wiggle 1s ease-in-out infinite;
	}

	[data-emotion='happy'] {
		transform: translateY(-5px);
	}

	[data-emotion='sad'] {
		transform: translateY(5px);
	}

	@keyframes wiggle {
		0%,
		100% {
			transform: rotate(0deg);
		}
		25% {
			transform: rotate(-15deg);
		}
		75% {
			transform: rotate(15deg);
		}
	}
</style>
