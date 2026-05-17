import type { LevelPack } from '$lib/game/types';
import { saveHandle, getHandle, removeHandle } from '../handle-registry';
import type { FileSystemService, FileSystemDirectoryHandle, FileSystemHandle } from './types';

// Browser-specific types
interface BrowserFileSystemHandle extends FileSystemHandle {
	isSameEntry(other: BrowserFileSystemHandle): Promise<boolean>;
	queryPermission(descriptor?: {
		mode?: 'read' | 'readwrite';
	}): Promise<'granted' | 'denied' | 'prompt'>;
	requestPermission(descriptor?: {
		mode?: 'read' | 'readwrite';
	}): Promise<'granted' | 'denied' | 'prompt'>;
}

interface BrowserFileSystemFileHandle extends BrowserFileSystemHandle {
	kind: 'file';
	getFile(): Promise<File>;
	createWritable(options?: { keepExistingData?: boolean }): Promise<FileSystemWritableFileStream>;
}

interface BrowserFileSystemDirectoryHandle extends BrowserFileSystemHandle {
	kind: 'directory';
	getDirectoryHandle(
		name: string,
		options?: { create?: boolean }
	): Promise<BrowserFileSystemDirectoryHandle>;
	getFileHandle(name: string, options?: { create?: boolean }): Promise<BrowserFileSystemFileHandle>;
	removeEntry(name: string, options?: { recursive?: boolean }): Promise<void>;
	resolve(possibleDescendant: BrowserFileSystemHandle): Promise<string[] | null>;
	values(): AsyncIterableIterator<BrowserFileSystemHandle>;
}

interface FileSystemWritableFileStream extends WritableStream {
	write(data: string | BufferSource | Blob): Promise<void>;
	seek(position: number): Promise<void>;
	truncate(size: number): Promise<void>;
	close(): Promise<void>;
}

declare global {
	interface Window {
		showDirectoryPicker(options?: {
			id?: string;
			mode?: 'read' | 'readwrite';
			startIn?:
				| BrowserFileSystemHandle
				| 'desktop'
				| 'documents'
				| 'downloads'
				| 'music'
				| 'pictures'
				| 'videos';
		}): Promise<BrowserFileSystemDirectoryHandle>;
	}
}

export class BrowserFileSystemService implements FileSystemService {
	private rootHandle: BrowserFileSystemDirectoryHandle | null = null;

	get isSupported(): boolean {
		return typeof window !== 'undefined' && 'showDirectoryPicker' in window;
	}

	async openDirectory(): Promise<FileSystemDirectoryHandle | null> {
		if (!this.isSupported) {
			throw new Error('File System Access API is not supported in this browser.');
		}

		try {
			this.rootHandle = await window.showDirectoryPicker({
				id: 'learn-coding-levels',
				mode: 'readwrite'
			});
			return this.rootHandle;
		} catch (err) {
			if ((err as Error).name === 'AbortError') {
				return null; // User cancelled
			}
			throw err;
		}
	}

	async savePackToDisk(pack: LevelPack, handle?: FileSystemDirectoryHandle): Promise<void> {
		let root = (handle as BrowserFileSystemDirectoryHandle) || this.rootHandle;
		if (!root) {
			// Prompt user to pick a location if we don't have one
			try {
				root = await window.showDirectoryPicker({
					id: 'learn-coding-levels',
					mode: 'readwrite'
				});
				this.rootHandle = root;
			} catch (err) {
				if ((err as Error).name === 'AbortError') return; // User cancelled
				throw err;
			}
		}

		// Create a folder for the pack (sanitized name)
		const folderName = this.sanitizeFileName(pack.name);
		const packFolder = await root.getDirectoryHandle(folderName, { create: true });

		// Save pack.json
		const packFile = await packFolder.getFileHandle('pack.json', { create: true });
		const writable = await packFile.createWritable();
		await writable.write(JSON.stringify(pack, null, 2));
		await writable.close();
	}

	async loadPackFromDisk(folderHandle: FileSystemDirectoryHandle): Promise<LevelPack> {
		const handle = folderHandle as BrowserFileSystemDirectoryHandle;
		// Look for pack.json
		try {
			const fileHandle = await handle.getFileHandle('pack.json');
			const file = await fileHandle.getFile();
			const text = await file.text();
			const pack = JSON.parse(text) as LevelPack;
			return pack;
		} catch (err) {
			throw new Error(`Failed to load pack from ${handle.name}: ${(err as Error).message}`);
		}
	}

	async listPacksInDirectory(
		root: FileSystemDirectoryHandle
	): Promise<Array<{ handle: FileSystemDirectoryHandle; name: string }>> {
		const rootHandle = root as BrowserFileSystemDirectoryHandle;
		const packs: Array<{ handle: FileSystemDirectoryHandle; name: string }> = [];

		for await (const entry of rootHandle.values()) {
			if (entry.kind === 'directory') {
				// Check if it has a pack.json
				try {
					const dirHandle = entry as BrowserFileSystemDirectoryHandle;
					await dirHandle.getFileHandle('pack.json');
					packs.push({ handle: dirHandle, name: entry.name });
				} catch {
					// Not a pack folder, ignore
				}
			}
		}

		return packs;
	}

	async isPackLinked(packId: string): Promise<boolean> {
		const handle = await getHandle(packId);
		return !!handle;
	}

	async linkPackToDisk(packId: string): Promise<FileSystemDirectoryHandle> {
		if (!this.isSupported) {
			throw new Error('File System Access API is not supported.');
		}

		// Ask user to pick a directory. This should be the PACK directory.
		const handle = await window.showDirectoryPicker({
			id: 'learn-coding-levels',
			mode: 'readwrite'
		});

		// Save the handle
		await saveHandle(packId, handle);
		return handle;
	}

	async syncPackToDisk(packId: string, pack: LevelPack): Promise<void> {
		const handle = (await getHandle(packId)) as BrowserFileSystemDirectoryHandle | undefined;
		if (!handle) {
			return; // Not linked
		}

		// Verify permission
		if ((await this.verifyPermission(handle, true)) === false) {
			throw new Error('Permission denied to access linked folder.');
		}

		// Save pack.json directly in this folder
		const packFile = await handle.getFileHandle('pack.json', { create: true });
		const writable = await packFile.createWritable();
		await writable.write(JSON.stringify(pack, null, 2));
		await writable.close();
	}

	async loadLinkedPack(packId: string): Promise<LevelPack | null> {
		const handle = (await getHandle(packId)) as BrowserFileSystemDirectoryHandle | undefined;
		if (!handle) {
			return null;
		}

		// Verify permission
		if ((await this.verifyPermission(handle, false)) === false) {
			throw new Error('Permission denied to access linked folder.');
		}

		return this.loadPackFromDisk(handle);
	}

	async unlinkPack(packId: string): Promise<void> {
		await removeHandle(packId);
	}

	async verifyPermission(handle: BrowserFileSystemHandle, readWrite: boolean): Promise<boolean> {
		const options = { mode: readWrite ? 'readwrite' : 'read' } as const;

		// Check if permission was already granted
		if ((await handle.queryPermission(options)) === 'granted') {
			return true;
		}

		// Request permission
		if ((await handle.requestPermission(options)) === 'granted') {
			return true;
		}

		return false;
	}

	private sanitizeFileName(name: string): string {
		return name.replace(/[^a-z0-9\-_ ]/gi, '').trim();
	}
}
