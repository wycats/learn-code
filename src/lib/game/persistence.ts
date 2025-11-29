import { LevelPackSchema, type LevelPack } from './schema';

const ROOT_DIR = 'level-packs';

async function getRoot() {
	const root = await navigator.storage.getDirectory();
	return await root.getDirectoryHandle(ROOT_DIR, { create: true });
}

export async function savePack(pack: LevelPack): Promise<void> {
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

export async function loadPack(id: string): Promise<LevelPack | null> {
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

export async function listPacks(): Promise<{ id: string; name: string; description?: string }[]> {
	try {
		const root = await getRoot();
		const packs: { id: string; name: string; description?: string }[] = [];

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
							description: json.description
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

export async function deletePack(id: string): Promise<void> {
	try {
		const root = await getRoot();
		await root.removeEntry(`${id}.json`);
	} catch (e) {
		console.error(`Failed to delete pack ${id}:`, e);
		throw e;
	}
}

export function createDefaultPack(): LevelPack {
	return {
		id: crypto.randomUUID(),
		name: 'My First Adventure',
		description: 'A collection of custom levels.',
		version: '1.0.0',
		levels: [],
		characters: [
			{ id: 'Zoey', name: 'Zoey', color: 'var(--pink-3)', avatar: 'Z' },
			{ id: 'Jonas', name: 'Jonas', color: 'var(--blue-3)', avatar: 'J' },
			{ id: 'Guide', name: 'Guide', color: 'var(--teal-3)', avatar: 'Bot' },
			{ id: 'System', name: 'System', color: 'var(--surface-3)', avatar: 'S' }
		],
		emotions: [
			{ id: 'neutral', name: 'Neutral', icon: '😐' },
			{ id: 'happy', name: 'Happy', icon: '😊' },
			{ id: 'concerned', name: 'Concerned', icon: '😟' },
			{ id: 'excited', name: 'Excited', icon: '🤩' },
			{ id: 'thinking', name: 'Thinking', icon: '🤔' },
			{ id: 'celebrating', name: 'Celebrating', icon: '🥳' }
		]
	};
}
