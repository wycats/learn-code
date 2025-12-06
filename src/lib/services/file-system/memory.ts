import type { LevelPack } from '$lib/game/types';
import type { FileSystemService, FileSystemDirectoryHandle } from './types';

export class InMemoryFileSystemService implements FileSystemService {
	isSupported = true;
	private linkedPacks = new Map<string, FileSystemDirectoryHandle>();
	private disk = new Map<string, LevelPack>(); // Simulates the disk content

	async openDirectory(): Promise<FileSystemDirectoryHandle | null> {
		return { kind: 'directory', name: 'root' };
	}

	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	async savePackToDisk(pack: LevelPack, _handle?: FileSystemDirectoryHandle): Promise<void> {
		// In memory, we just store it in our "disk" map keyed by pack ID for simplicity
		// or we could simulate a file structure, but for tests, storing the pack is usually enough.
		this.disk.set(pack.id, JSON.parse(JSON.stringify(pack)));
	}

	async loadPackFromDisk(folderHandle: FileSystemDirectoryHandle): Promise<LevelPack> {
		// In a real FS, we'd look up by folder name, but here we cheat and assume we can find it.
		// For testing, we might need a way to seed this.
		// Let's assume the folder name is the pack ID for this simple fake.
		const pack = this.disk.get(folderHandle.name);
		if (!pack) throw new Error(`Pack not found in fake disk: ${folderHandle.name}`);
		return JSON.parse(JSON.stringify(pack));
	}

	async listPacksInDirectory(
		// eslint-disable-next-line @typescript-eslint/no-unused-vars
		_root: unknown
	): Promise<Array<{ handle: FileSystemDirectoryHandle; name: string }>> {
		return Array.from(this.disk.values()).map((pack) => ({
			handle: { kind: 'directory', name: pack.id },
			name: pack.name
		}));
	}

	async isPackLinked(packId: string): Promise<boolean> {
		return this.linkedPacks.has(packId);
	}

	async linkPackToDisk(packId: string): Promise<FileSystemDirectoryHandle> {
		const handle: FileSystemDirectoryHandle = { kind: 'directory', name: packId };
		this.linkedPacks.set(packId, handle);
		return handle;
	}

	async syncPackToDisk(packId: string, pack: LevelPack): Promise<void> {
		if (!this.linkedPacks.has(packId)) return;
		this.disk.set(packId, JSON.parse(JSON.stringify(pack)));
	}

	async loadLinkedPack(packId: string): Promise<LevelPack | null> {
		if (!this.linkedPacks.has(packId)) return null;
		const pack = this.disk.get(packId);
		return pack ? JSON.parse(JSON.stringify(pack)) : null;
	}

	async unlinkPack(packId: string): Promise<void> {
		this.linkedPacks.delete(packId);
	}
}
