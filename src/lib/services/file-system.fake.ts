import type { LevelPack } from '$lib/game/types';
import type {
	FileSystemService,
	FileSystemDirectoryHandle,
	FileSystemFileHandle,
	FileSystemHandle,
	FileSystemWritableFileStream
} from './file-system';

class FakeFileSystemHandle implements FileSystemHandle {
	constructor(
		public name: string,
		public kind: 'file' | 'directory'
	) {}

	async isSameEntry(other: FileSystemHandle): Promise<boolean> {
		return this === other;
	}

	async queryPermission(): Promise<'granted' | 'denied' | 'prompt'> {
		return 'granted';
	}

	async requestPermission(): Promise<'granted' | 'denied' | 'prompt'> {
		return 'granted';
	}
}

class FakeFileSystemFileHandle extends FakeFileSystemHandle implements FileSystemFileHandle {
	readonly kind = 'file';
	private content: string = '';

	constructor(name: string, content: string = '') {
		super(name, 'file');
		this.content = content;
	}

	async getFile(): Promise<File> {
		return new File([this.content], this.name, { type: 'application/json' });
	}

	async createWritable(): Promise<FileSystemWritableFileStream> {
		return new FakeFileSystemWritableFileStream((data) => {
			this.content = data;
		});
	}
}

class FakeFileSystemWritableFileStream implements FileSystemWritableFileStream {
	locked: boolean = false;

	constructor(private onWrite: (data: string) => void) {}

	async write(data: string | BufferSource | Blob): Promise<void> {
		if (typeof data === 'string') {
			this.onWrite(data);
		} else if (data instanceof Blob) {
			this.onWrite(await data.text());
		} else {
			// BufferSource
			const decoder = new TextDecoder();
			this.onWrite(decoder.decode(data));
		}
	}

	async seek(): Promise<void> {}
	async truncate(): Promise<void> {}
	async close(): Promise<void> {}
	async abort(): Promise<void> {}
	getWriter(): WritableStreamDefaultWriter<unknown> {
		throw new Error('Method not implemented.');
	}
}

class FakeFileSystemDirectoryHandle
	extends FakeFileSystemHandle
	implements FileSystemDirectoryHandle
{
	readonly kind = 'directory';
	private entries: Map<string, FileSystemHandle> = new Map();

	constructor(name: string) {
		super(name, 'directory');
	}

	async getDirectoryHandle(
		name: string,
		options?: { create?: boolean }
	): Promise<FileSystemDirectoryHandle> {
		if (this.entries.has(name)) {
			const entry = this.entries.get(name);
			if (entry?.kind === 'directory') {
				return entry as FileSystemDirectoryHandle;
			}
			throw new Error('Type mismatch');
		}

		if (options?.create) {
			const newDir = new FakeFileSystemDirectoryHandle(name);
			this.entries.set(name, newDir);
			return newDir;
		}

		throw new Error('Directory not found');
	}

	async getFileHandle(name: string, options?: { create?: boolean }): Promise<FileSystemFileHandle> {
		if (this.entries.has(name)) {
			const entry = this.entries.get(name);
			if (entry?.kind === 'file') {
				return entry as FileSystemFileHandle;
			}
			throw new Error('Type mismatch');
		}

		if (options?.create) {
			const newFile = new FakeFileSystemFileHandle(name);
			this.entries.set(name, newFile);
			return newFile;
		}

		throw new Error('File not found');
	}

	async removeEntry(name: string): Promise<void> {
		this.entries.delete(name);
	}

	async resolve(possibleDescendant: FileSystemHandle): Promise<string[] | null> {
		if (possibleDescendant === this) return [];
		// Simple implementation: only checks direct children
		for (const [name, entry] of this.entries) {
			if (entry === possibleDescendant) return [name];
		}
		return null;
	}

	async *values(): AsyncIterableIterator<FileSystemHandle> {
		for (const entry of this.entries.values()) {
			yield entry;
		}
	}

	// Helper for testing
	addEntry(entry: FileSystemHandle) {
		this.entries.set(entry.name, entry);
	}
}

export class InMemoryFileSystemService implements FileSystemService {
	isSupported: boolean = true;
	private root: FakeFileSystemDirectoryHandle;
	private linkedPacks: Map<string, FileSystemDirectoryHandle> = new Map();

	constructor() {
		this.root = new FakeFileSystemDirectoryHandle('root');
	}

	async openDirectory(): Promise<FileSystemDirectoryHandle | null> {
		return this.root;
	}

	async savePackToDisk(pack: LevelPack, handle?: FileSystemDirectoryHandle): Promise<void> {
		const root = handle || this.root;
		const folderName = pack.name.replace(/[^a-z0-9\-_ ]/gi, '').trim();
		const packFolder = await root.getDirectoryHandle(folderName, { create: true });
		const packFile = await packFolder.getFileHandle('pack.json', { create: true });
		const writable = await packFile.createWritable();
		await writable.write(JSON.stringify(pack, null, 2));
		await writable.close();
	}

	async loadPackFromDisk(folderHandle: FileSystemDirectoryHandle): Promise<LevelPack> {
		const fileHandle = await folderHandle.getFileHandle('pack.json');
		const file = await fileHandle.getFile();
		const text = await file.text();
		return JSON.parse(text) as LevelPack;
	}

	async listPacksInDirectory(
		root: FileSystemDirectoryHandle
	): Promise<Array<{ handle: FileSystemDirectoryHandle; name: string }>> {
		const packs: Array<{ handle: FileSystemDirectoryHandle; name: string }> = [];
		for await (const entry of root.values()) {
			if (entry.kind === 'directory') {
				try {
					const dirHandle = entry as FileSystemDirectoryHandle;
					await dirHandle.getFileHandle('pack.json');
					packs.push({ handle: dirHandle, name: entry.name });
				} catch {
					// Ignore
				}
			}
		}
		return packs;
	}

	async isPackLinked(packId: string): Promise<boolean> {
		return this.linkedPacks.has(packId);
	}

	async linkPackToDisk(packId: string): Promise<FileSystemDirectoryHandle> {
		// In a real scenario, this opens a picker. In fake, we just create a folder in root.
		const folderName = `linked-${packId}`;
		const handle = await this.root.getDirectoryHandle(folderName, { create: true });
		this.linkedPacks.set(packId, handle);
		return handle;
	}

	async syncPackToDisk(packId: string, pack: LevelPack): Promise<void> {
		const handle = this.linkedPacks.get(packId);
		if (!handle) return;

		const packFile = await handle.getFileHandle('pack.json', { create: true });
		const writable = await packFile.createWritable();
		await writable.write(JSON.stringify(pack, null, 2));
		await writable.close();
	}

	async loadLinkedPack(packId: string): Promise<LevelPack | null> {
		const handle = this.linkedPacks.get(packId);
		if (!handle) return null;
		return this.loadPackFromDisk(handle);
	}

	async unlinkPack(packId: string): Promise<void> {
		this.linkedPacks.delete(packId);
	}

	async verifyPermission(): Promise<boolean> {
		return true;
	}
}
