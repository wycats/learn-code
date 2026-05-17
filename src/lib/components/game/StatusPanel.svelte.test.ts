import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';
import StatusPanel from './StatusPanel.svelte';
import type { GameModel } from '$lib/game/model.svelte';

const baseGame = {
	status: 'planning',
	level: { solutionPar: 4 }
} as GameModel;

describe('StatusPanel', () => {
	it('renders a distinct lost state', () => {
		const { getByText } = render(StatusPanel, {
			game: { ...baseGame, status: 'lost' } as GameModel
		});

		expect(getByText('Try Again')).toBeInTheDocument();
		expect(getByText(/The run stopped before the goal/)).toBeInTheDocument();
		expect(getByText(/Reset to edit/)).toBeInTheDocument();
	});
});
