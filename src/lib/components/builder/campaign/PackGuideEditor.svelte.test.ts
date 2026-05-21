import { describe, expect, it, vi } from 'vitest';
import { render } from 'vitest-browser-svelte';
import { page } from 'vitest/browser';
import PackGuideEditor from './PackGuideEditor.svelte';
import type { LevelPack } from '$lib/game/schema';

const BASE_PACK: LevelPack = {
	id: 'pack-1',
	name: 'Jonas Pack',
	difficulty: 'beginner',
	tags: [],
	version: '1.0.0',
	levels: []
};

describe('PackGuideEditor', () => {
	it('renders the Jonas prompts and compiles typed notes into guide pages', async () => {
		const onChange = vi.fn();
		render(PackGuideEditor, { pack: BASE_PACK, onChange });

		await expect
			.element(page.getByRole('heading', { name: 'How this pack works' }))
			.toBeInTheDocument();
		await expect.element(page.getByText('Special rules')).toBeInTheDocument();
		await expect.element(page.getByText('Tricky part')).toBeInTheDocument();
		await expect.element(page.getByText('Designer tip')).toBeInTheDocument();
		await expect.element(page.getByText('What I want players to notice')).toBeInTheDocument();

		expect(onChange).not.toHaveBeenCalled();

		await page
			.getByPlaceholder('Example: Lava is safe only when you ride the boat.')
			.fill('Lava moves.');

		expect(onChange).toHaveBeenLastCalledWith({
			chapters: [
				{
					id: 'how-this-pack-works',
					title: 'How This Pack Works',
					pages: [
						{
							id: 'special-rules',
							title: 'Special Rules',
							content: [{ type: 'voice', speaker: 'Jonas', content: 'Lava moves.' }]
						}
					]
				}
			]
		});
		await expect.element(page.getByText('Lava moves.')).toBeInTheDocument();
	});

	it('hydrates textareas from an existing managed guide chapter', async () => {
		render(PackGuideEditor, {
			pack: {
				...BASE_PACK,
				guide: {
					chapters: [
						{
							id: 'how-this-pack-works',
							title: 'How This Pack Works',
							pages: [
								{
									id: 'designer-tip',
									title: 'Designer Tip',
									content: [{ type: 'voice', speaker: 'Jonas', content: 'Count the turns.' }]
								}
							]
						}
					]
				}
			},
			onChange: vi.fn()
		});

		await expect
			.element(page.getByPlaceholder('Example: Try building the repeat first, then add the turns.'))
			.toHaveValue('Count the turns.');
		await expect.element(page.getByText('Count the turns.')).toBeInTheDocument();
	});
});
