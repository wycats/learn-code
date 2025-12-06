import type { LevelPack } from '../types';
import { LevelPackSchema } from '../schema';
import type { PersistenceService, PackMetadata } from './types';

const ROOT_DIR = 'level-packs';

async function getRoot() {
	const root = await navigator.storage.getDirectory();
	return await root.getDirectoryHandle(ROOT_DIR, { create: true });
}

export class BrowserPersistence implements PersistenceService {
	async savePack(pack: LevelPack): Promise<void> {
		try {
			const root = await getRoot();
			const fileHandle = await root.getFileHandle(`${pack.id}.json`, { create: true });
			const writable = await fileHandle.createWritable();
			await writable.write(JSON.stringify(pack, null, 2));
			await writable.close();
		} catch (e) {
			console.error('Failed to save pack:', e);
			throw e;
		}
	}

	async loadPack(id: string): Promise<LevelPack | null> {
		try {
			const root = await getRoot();
			const fileHandle = await root.getFileHandle(`${id}.json`);
			const file = await fileHandle.getFile();
			const text = await file.text();
			const json = JSON.parse(text);
			return LevelPackSchema.parse(json);
		} catch (e) {
			console.error(`Failed to load pack ${id}:`, e);
			return null;
		}
	}

	async listPacks(): Promise<PackMetadata[]> {
		try {
			const root = await getRoot();
			const packs: PackMetadata[] = [];

			// @ts-expect-error - FileSystemDirectoryHandle is async iterable in modern browsers
			for await (const [name, handle] of root.entries()) {
				if (handle.kind === 'file' && name.endsWith('.json')) {
					try {
						const file = await handle.getFile();
						const text = await file.text();
						const json = JSON.parse(text);
						// Light validation just to get metadata
						if (json.id && json.name) {
							packs.push({
								id: json.id,
								name: json.name,
								description: json.description,
								coverImage: json.coverImage,
								difficulty: json.difficulty
							});
						}
					} catch (e) {
						console.warn(`Skipping invalid pack file ${name}`, e);
					}
				}
			}
			return packs;
		} catch (e) {
			console.error('Failed to list packs:', e);
			return [];
		}
	}

	async deletePack(id: string): Promise<void> {
		try {
			const root = await getRoot();
			await root.removeEntry(`${id}.json`);
		} catch (e) {
			console.error(`Failed to delete pack ${id}:`, e);
			throw e;
		}
	}
}
