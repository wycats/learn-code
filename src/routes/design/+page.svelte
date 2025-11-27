<script lang="ts">
	import { Stack, Cluster, Grid, Box, Center, Switch } from '$lib';
</script>

<div class="design-system">
	<Center maxWidth="65ch">
		<Stack gap="var(--size-8)">
			<header>
				<h1>Design System</h1>
				<p class="text-2">Kitchen Sink & Style Guide</p>
			</header>

			<section>
				<h2>Typography</h2>
				<Stack gap="var(--size-3)">
					<h1>Heading 1</h1>
					<h2>Heading 2</h2>
					<h3>Heading 3</h3>
					<p>Body text (text-1). The quick brown fox jumps over the lazy dog.</p>
					<p class="text-2">
						Secondary text (text-2). The quick brown fox jumps over the lazy dog.
					</p>
					<p class="text-3">Muted text (text-3). The quick brown fox jumps over the lazy dog.</p>
				</Stack>
			</section>

			<section>
				<h2>Colors</h2>
				<Stack gap="var(--size-5)">
					<article>
						<h3>Surfaces</h3>
						<Grid minItemWidth="100px">
							<Box background="var(--surface-1)">Surface 1</Box>
							<Box background="var(--surface-2)">Surface 2</Box>
							<Box background="var(--surface-3)">Surface 3</Box>
							<Box background="var(--surface-4)">Surface 4</Box>
						</Grid>
					</article>

					<article>
						<h3>Functional</h3>
						<Grid minItemWidth="100px">
							<Box background="var(--color-action)" color="white">Action</Box>
							<Box background="var(--color-movement)" color="white">Movement</Box>
							<Box background="var(--color-logic)" color="white">Logic</Box>
							<Box background="var(--color-loop)" color="black">Loop</Box>
						</Grid>
					</article>

					<article>
						<h3>Status</h3>
						<Grid minItemWidth="100px">
							<Box background="var(--success)" color="white">Success</Box>
							<Box background="var(--warning)" color="black">Warning</Box>
							<Box background="var(--error)" color="white">Error</Box>
							<Box background="var(--info)" color="white">Info</Box>
						</Grid>
					</article>
				</Stack>
			</section>

			<section>
				<h2>Layout Primitives</h2>
				<Stack gap="var(--size-5)">
					<article>
						<h3>Stack</h3>
						<Box border="1px dashed var(--gray-5)">
							<Stack gap="var(--size-3)">
								<div class="demo-box">Item 1</div>
								<div class="demo-box">Item 2</div>
								<div class="demo-box">Item 3</div>
							</Stack>
						</Box>
					</article>

					<article>
						<h3>Cluster</h3>
						<Box border="1px dashed var(--gray-5)">
							<Cluster gap="var(--size-3)">
								<div class="demo-box">Item 1</div>
								<div class="demo-box">Item 2</div>
								<div class="demo-box">Item 3</div>
								<div class="demo-box">Item 4</div>
								<div class="demo-box">Item 5</div>
							</Cluster>
						</Box>
					</article>

					<article>
						<h3>Grid</h3>
						<Box border="1px dashed var(--gray-5)">
							<Grid minItemWidth="100px">
								<div class="demo-box">Item 1</div>
								<div class="demo-box">Item 2</div>
								<div class="demo-box">Item 3</div>
							</Grid>
						</Box>
					</article>

					<article>
						<h3>Switch</h3>
						<p class="text-2">Resize window to see it switch from Stack to Cluster.</p>
						<Box border="1px dashed var(--gray-5)">
							<Switch threshold="sm">
								<div class="demo-box">Item 1</div>
								<div class="demo-box">Item 2</div>
								<div class="demo-box">Item 3</div>
							</Switch>
						</Box>
					</article>
				</Stack>
			</section>

			<section>
				<h2>Touch Targets</h2>
				<Cluster>
					<button class="touch-target demo-btn">Button 1</button>
					<button class="touch-target demo-btn">Button 2</button>
				</Cluster>
			</section>
		</Stack>
	</Center>
</div>

<style>
	.design-system {
		padding-block: var(--size-5);
	}

	.demo-box {
		background: var(--surface-2);
		padding: var(--size-3);
		border-radius: var(--radius-2);
		border: 1px solid var(--surface-3);
	}

	.demo-btn {
		background: var(--brand);
		color: white;
		border: none;
		border-radius: var(--radius-2);
		padding-inline: var(--size-3);
	}
</style>
