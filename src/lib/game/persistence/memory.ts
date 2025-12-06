import type { LevelPack } from '../types';
import type { PersistenceService, PackMetadata } from './types';

export class InMemoryPersistence implements PersistenceService {
	private packs = new Map<string, LevelPack>();

	async savePack(pack: LevelPack): Promise<void> {
		this.packs.set(pack.id, JSON.parse(JSON.stringify(pack))); // Deep copy to simulate serialization
	}

	async loadPack(id: string): Promise<LevelPack | null> {
		const pack = this.packs.get(id);
		return pack ? JSON.parse(JSON.stringify(pack)) : null;
	}

	async listPacks(): Promise<PackMetadata[]> {
		return Array.from(this.packs.values()).map((p) => ({
			id: p.id,
			name: p.name,
			description: p.description,
			coverImage: p.coverImage,
			difficulty: p.difficulty
		}));
	}

	async deletePack(id: string): Promise<void> {
		this.packs.delete(id);
	}
}
