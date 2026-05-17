import type { GameStatus } from './types';

export type RunControlAction = 'play' | 'resume' | 'stop' | 'replay' | 'try-again' | 'none';

export type RunControlInput = {
	status: GameStatus;
	hasProgram: boolean;
	isExecuting: boolean;
	isPaused: boolean;
};

export type RunControlState = {
	label: 'Play' | 'Stop' | 'Replay' | 'Try Again';
	action: RunControlAction;
	disabled: boolean;
};

export function getRunControlState({
	status,
	hasProgram,
	isExecuting,
	isPaused
}: RunControlInput): RunControlState {
	if (status === 'story' || status === 'goal') {
		return { label: 'Play', action: 'none', disabled: true };
	}

	if (isExecuting && !isPaused) {
		return { label: 'Stop', action: 'stop', disabled: false };
	}

	if (isExecuting && isPaused && status === 'running') {
		return { label: 'Play', action: 'resume', disabled: false };
	}

	if (status === 'won') {
		return { label: 'Replay', action: hasProgram ? 'replay' : 'none', disabled: !hasProgram };
	}

	if (status === 'lost') {
		return { label: 'Try Again', action: hasProgram ? 'try-again' : 'none', disabled: !hasProgram };
	}

	return { label: 'Play', action: hasProgram ? 'play' : 'none', disabled: !hasProgram };
}
