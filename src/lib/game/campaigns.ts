import { LevelPackSchema, type LevelPack } from './schema';
import { getPack } from './packs';
import { savePack, loadPack, listPacks, deletePack, createDefaultPack } from './persistence';

export class CampaignService {
	static async loadAll(): Promise<LevelPack[]> {
		const metadataList = await listPacks();
		const packs: LevelPack[] = [];
		for (const meta of metadataList) {
			const pack = await loadPack(meta.id);
			if (pack) packs.push(pack);
		}
		return packs;
	}

	static async get(id: string): Promise<LevelPack | null> {
		return await loadPack(id);
	}

	static async create(data: Partial<LevelPack>): Promise<LevelPack> {
		const defaultPack = createDefaultPack();

		const newPack: LevelPack = {
			...defaultPack,
			...data,
			id: crypto.randomUUID(),
			isCustom: true,
			created: Date.now(),
			updated: Date.now(),
			author: 'You'
		};

		// Validate
		const validated = LevelPackSchema.parse(newPack);

		await savePack(validated);
		return validated;
	}

	static async update(id: string, data: Partial<LevelPack>): Promise<LevelPack | null> {
		const existing = await loadPack(id);
		if (!existing) return null;

		const updatedPack = {
			...existing,
			...data,
			updated: Date.now()
		};

		// Validate
		const validated = LevelPackSchema.parse(updatedPack);

		await savePack(validated);
		return validated;
	}

	static async delete(id: string): Promise<void> {
		await deletePack(id);
	}

	static async clone(sourcePackId: string): Promise<LevelPack | null> {
		const sourcePack = getPack(sourcePackId);
		if (!sourcePack) return null;

		// Deep clone
		const clonedPack: LevelPack = structuredClone(sourcePack);

		// Update metadata
		clonedPack.id = crypto.randomUUID();
		clonedPack.name = `${sourcePack.name} (Copy)`;
		clonedPack.isCustom = true;
		clonedPack.sourcePackId = sourcePackId;
		clonedPack.created = Date.now();
		clonedPack.updated = Date.now();
		clonedPack.author = 'You';

		await savePack(clonedPack);
		return clonedPack;
	}
}
