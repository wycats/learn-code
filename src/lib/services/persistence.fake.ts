import type { PersistenceService } from './persistence';
import type { LevelPack } from '$lib/game/schema';

export class InMemoryPersistenceService implements PersistenceService {
	private packs = new Map<string, LevelPack>();

	async savePack(pack: LevelPack): Promise<void> {
		this.packs.set(pack.id, JSON.parse(JSON.stringify(pack))); // Deep copy to simulate serialization
	}

	async loadPack(id: string): Promise<LevelPack | null> {
		const pack = this.packs.get(id);
		return pack ? JSON.parse(JSON.stringify(pack)) : null;
	}

	async listPacks(): Promise<
		{ id: string; name: string; description?: string; coverImage?: string; difficulty?: string }[]
	> {
		return Array.from(this.packs.values()).map((pack) => ({
			id: pack.id,
			name: pack.name,
			description: pack.description,
			coverImage: pack.coverImage,
			difficulty: pack.difficulty
		}));
	}

	async deletePack(id: string): Promise<void> {
		this.packs.delete(id);
	}

	createDefaultPack(): LevelPack {
		return {
			id: 'default-pack',
			name: 'Default Pack',
			description: 'A default pack for testing.',
			version: '1.0.0',
			difficulty: 'beginner',
			tags: [],
			levels: [],
			characters: [],
			emotions: []
		};
	}
}
