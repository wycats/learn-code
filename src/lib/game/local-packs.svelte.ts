import type { LevelPack } from './types';

class LocalPacksStore {
	packs = $state<LevelPack[]>([]);

	addPack(pack: LevelPack) {
		// Remove existing if same ID to avoid duplicates
		this.packs = this.packs.filter((p) => p.id !== pack.id);
		this.packs.push(pack);
	}

	getPack(id: string) {
		return this.packs.find((p) => p.id === id);
	}

	clear() {
		this.packs = [];
	}
}

export const localPacksStore = new LocalPacksStore();
