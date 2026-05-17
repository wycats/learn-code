import { describe, expect, it } from 'vitest';
import { getRunControlState } from './run-control';
import type { GameStatus } from './types';

function state(overrides: Partial<Parameters<typeof getRunControlState>[0]> = {}) {
	return getRunControlState({
		status: 'planning',
		hasProgram: true,
		isExecuting: false,
		isPaused: false,
		...overrides
	});
}

describe('getRunControlState', () => {
	it.each(['story', 'goal'] satisfies GameStatus[])(
		'disables the primary run control in %s',
		(status) => {
			expect(state({ status })).toEqual({
				label: 'Play',
				action: 'none',
				disabled: true
			});
		}
	);

	it('disables Play in planning when the program is empty', () => {
		expect(state({ status: 'planning', hasProgram: false })).toEqual({
			label: 'Play',
			action: 'none',
			disabled: true
		});
	});

	it('plays in planning when the program has blocks', () => {
		expect(state({ status: 'planning', hasProgram: true })).toEqual({
			label: 'Play',
			action: 'play',
			disabled: false
		});
	});

	it('stops while execution is actively running', () => {
		expect(state({ status: 'running', isExecuting: true, isPaused: false })).toEqual({
			label: 'Stop',
			action: 'stop',
			disabled: false
		});
	});

	it.each(['story', 'goal'] satisfies GameStatus[])(
		'keeps Stop available in %s if another control changes status during active execution',
		(status) => {
			expect(state({ status, isExecuting: true, isPaused: false })).toEqual({
				label: 'Stop',
				action: 'stop',
				disabled: false
			});
		}
	);

	it('resumes while execution is paused in running state', () => {
		expect(state({ status: 'running', isExecuting: true, isPaused: true })).toEqual({
			label: 'Play',
			action: 'resume',
			disabled: false
		});
	});

	it('replays immediately from won when a program exists', () => {
		expect(state({ status: 'won', hasProgram: true })).toEqual({
			label: 'Replay',
			action: 'replay',
			disabled: false
		});
	});

	it('tries again immediately from lost when a program exists', () => {
		expect(state({ status: 'lost', hasProgram: true })).toEqual({
			label: 'Try Again',
			action: 'try-again',
			disabled: false
		});
	});

	it.each(['won', 'lost'] satisfies GameStatus[])(
		'disables terminal controls in %s without a program',
		(status) => {
			expect(state({ status, hasProgram: false }).disabled).toBe(true);
			expect(state({ status, hasProgram: false }).action).toBe('none');
		}
	);
});
