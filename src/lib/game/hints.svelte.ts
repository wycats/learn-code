import type { GameModel } from './model.svelte';
import { detectAntiPatterns } from './analysis';
import { SvelteSet } from 'svelte/reactivity';

export class HintManager {
	game: GameModel;
	shownHints = new SvelteSet<string>();

	constructor(game: GameModel) {
		this.game = game;
	}

	checkHints() {
		if (!this.game.level.hints) return;

		const now = Date.now();
		const elapsed = (now - this.game.startTime) / 1000;
		const idle = (now - this.game.lastInteractionTime) / 1000;

		// Run analysis once
		const antiPatterns = detectAntiPatterns(this.game.program, this.game.functions);

		for (const hint of this.game.level.hints) {
			if (this.shownHints.has(hint.id)) continue;

			let triggered = false;
			const trigger = hint.trigger;

			switch (trigger.type) {
				case 'time':
					if (elapsed >= trigger.value) triggered = true;
					break;
				case 'attempts':
					if (this.game.failedAttempts >= trigger.value) triggered = true;
					break;
				case 'idle':
					if (idle >= trigger.value) triggered = true;
					break;
				case 'story-step':
					if (this.game.currentStorySegment?.id === trigger.segmentId) triggered = true;
					break;
				case 'analysis':
					if (antiPatterns.includes(trigger.pattern)) triggered = true;
					break;
			}

			if (triggered) {
				this.game.activeHintId = hint.id;
				this.shownHints.add(hint.id);
				return; // Show highest priority (first in list)
			}
		}
	}

	reset() {
		this.shownHints.clear();
	}
}
