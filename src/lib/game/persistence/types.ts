import type { LevelPack } from '../types';

export interface PersistenceService {
	savePack(pack: LevelPack): Promise<void>;
	loadPack(id: string): Promise<LevelPack | null>;
	listPacks(): Promise<PackMetadata[]>;
	deletePack(id: string): Promise<void>;
}

export interface PackMetadata {
	id: string;
	name: string;
	description?: string;
	coverImage?: string;
	difficulty?: string;
}
