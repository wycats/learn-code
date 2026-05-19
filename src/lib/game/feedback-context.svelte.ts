import type { GameModel } from './model.svelte';
import type { Block } from './types';
import type { StackInterpreter } from './mimic';
import type { FeedbackContext, FeedbackRouteContext } from '$lib/services/feedback-schema';

type FeedbackContextOptions = {
	game: GameModel;
	route: FeedbackRouteContext;
	interpreter?: StackInterpreter | null;
	url?: string;
	navigatorInfo?: Pick<Navigator, 'onLine' | 'userAgent' | 'language'>;
	viewport?: { width: number; height: number };
};

export function createFeedbackContext({
	game,
	route,
	interpreter,
	url,
	navigatorInfo,
	viewport
}: FeedbackContextOptions): FeedbackContext {
	return {
		route: {
			...route,
			url: route.url ?? url
		},
		level: structuredClone($state.snapshot(game.level)),
		program: snapshotBlocks(game.program),
		functions: snapshotFunctions(game.functions),
		game: {
			status: game.status,
			activeBlockId: game.activeBlockId,
			editingContext: game.editingContext,
			characterPosition: { ...game.characterPosition },
			characterOrientation: game.characterOrientation,
			lives: game.lives,
			maxLives: game.maxLives,
			heldItem: game.heldItem ? { ...game.heldItem } : null,
			vehicle: game.vehicle ? { ...game.vehicle } : null,
			collectedItems: Array.from(game.collectedItems),
			executionState: Array.from(game.executionState),
			loopProgress: Array.from(game.loopProgress),
			failedAttempts: game.failedAttempts,
			lastEvent: game.lastEvent ? { ...game.lastEvent } : null,
			storyIndex: game.storyIndex,
			activeHintId: game.activeHintId
		},
		...(interpreter ? { interpreter: snapshotInterpreter(interpreter) } : {}),
		browser: {
			online: navigatorInfo?.onLine ?? true,
			...(navigatorInfo?.userAgent ? { userAgent: navigatorInfo.userAgent } : {}),
			...(navigatorInfo?.language ? { language: navigatorInfo.language } : {}),
			...(viewport ? { viewport } : {})
		}
	};
}

function snapshotBlocks(blocks: Block[]): Block[] {
	return structuredClone($state.snapshot(blocks));
}

function snapshotFunctions(functions: Record<string, Block[]>): Record<string, Block[]> {
	return structuredClone($state.snapshot(functions));
}

function snapshotInterpreter(interpreter: StackInterpreter): FeedbackContext['interpreter'] {
	return {
		phase: interpreter.phase,
		stackDepth: interpreter.stack.length,
		stack: interpreter.stack.map((frame) => ({
			index: frame.index,
			...(frame.loopCounter !== undefined ? { loopCounter: frame.loopCounter } : {}),
			...(frame.loopMax !== undefined && Number.isFinite(frame.loopMax)
				? { loopMax: frame.loopMax }
				: {}),
			...(frame.blockId ? { blockId: frame.blockId } : {}),
			context: frame.context ?? null,
			blockIds: frame.blocks.map((block) => block.id)
		}))
	};
}
