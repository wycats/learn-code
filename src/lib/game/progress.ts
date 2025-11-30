import { z } from 'zod';
import { getPack } from './packs';

export const LevelResultSchema = z.object({
	completed: z.boolean(),
	stars: z.number().min(0).max(3),
	blockCount: z.number().optional(),
	timestamp: z.number()
});
export type LevelResult = z.infer<typeof LevelResultSchema>;

export const PackProgressSchema = z.object({
	levels: z.record(z.string(), LevelResultSchema),
	unlocked: z.boolean().default(false)
});
export type PackProgress = z.infer<typeof PackProgressSchema>;

export const UserProgressSchema = z.object({
	packs: z.record(z.string(), PackProgressSchema)
});
export type UserProgress = z.infer<typeof UserProgressSchema>;

const STORAGE_KEY = 'wonderblocks_progress';

export class ProgressService {
	static load(): UserProgress {
		if (typeof localStorage === 'undefined') return { packs: {} };

		const stored = localStorage.getItem(STORAGE_KEY);
		if (!stored) return { packs: {} };

		try {
			return UserProgressSchema.parse(JSON.parse(stored));
		} catch (e) {
			console.error('Failed to parse progress:', e);
			return { packs: {} };
		}
	}

	static save(progress: UserProgress) {
		if (typeof localStorage === 'undefined') return;
		localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
	}

	static completeLevel(packId: string, levelId: string, stars: number, blockCount?: number) {
		const progress = this.load();

		if (!progress.packs[packId]) {
			progress.packs[packId] = { levels: {}, unlocked: true };
		}

		const existing = progress.packs[packId].levels[levelId];

		const result: LevelResult = {
			completed: true,
			stars,
			blockCount,
			timestamp: Date.now()
		};

		// Only overwrite if better or new
		if (existing && existing.completed) {
			if (stars > existing.stars) {
				progress.packs[packId].levels[levelId] = result;
			} else if (
				stars === existing.stars &&
				(blockCount || 0) < (existing.blockCount || Infinity)
			) {
				progress.packs[packId].levels[levelId] = result;
			}
		} else {
			progress.packs[packId].levels[levelId] = result;
		}

		this.save(progress);
	}

	static isLevelUnlocked(progress: UserProgress, packId: string, levelIndex: number): boolean {
		if (levelIndex === 0) return true;

		const pack = getPack(packId);
		if (!pack) return false;

		const prevLevel = pack.levels[levelIndex - 1];
		if (!prevLevel) return false;

		const prevResult = progress.packs[packId]?.levels[prevLevel.id];
		return !!prevResult?.completed;
	}
}
