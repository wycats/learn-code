import type { LevelPack } from '$lib/game/types';
import { saveHandle, getHandle, removeHandle } from './handle-registry';

// Types for the File System Access API
export interface FileSystemHandle {
	kind: 'file' | 'directory';
	name: string;
	isSameEntry(other: FileSystemHandle): Promise<boolean>;
	queryPermission(descriptor?: {
		mode?: 'read' | 'readwrite';
	}): Promise<'granted' | 'denied' | 'prompt'>;
	requestPermission(descriptor?: {
		mode?: 'read' | 'readwrite';
	}): Promise<'granted' | 'denied' | 'prompt'>;
}

export interface FileSystemFileHandle extends FileSystemHandle {
	kind: 'file';
	getFile(): Promise<File>;
	createWritable(options?: { keepExistingData?: boolean }): Promise<FileSystemWritableFileStream>;
}

export interface FileSystemDirectoryHandle extends FileSystemHandle {
	kind: 'directory';
	getDirectoryHandle(
		name: string,
		options?: { create?: boolean }
	): Promise<FileSystemDirectoryHandle>;
	getFileHandle(name: string, options?: { create?: boolean }): Promise<FileSystemFileHandle>;
	removeEntry(name: string, options?: { recursive?: boolean }): Promise<void>;
	resolve(possibleDescendant: FileSystemHandle): Promise<string[] | null>;
	values(): AsyncIterableIterator<FileSystemHandle>;
}

export interface FileSystemWritableFileStream extends WritableStream {
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
				| FileSystemHandle
				| 'desktop'
				| 'documents'
				| 'downloads'
				| 'music'
				| 'pictures'
				| 'videos';
		}): Promise<FileSystemDirectoryHandle>;
		showOpenFilePicker(options?: {
			multiple?: boolean;
			excludeAcceptAllOption?: boolean;
			types?: Array<{
				description?: string;
				accept: Record<string, string[]>;
			}>;
		}): Promise<FileSystemFileHandle[]>;
		showSaveFilePicker(options?: {
			suggestedName?: string;
			types?: Array<{
				description?: string;
				accept: Record<string, string[]>;
			}>;
		}): Promise<FileSystemFileHandle>;
	}
}

export interface FileSystemService {
	isSupported: boolean;
	openDirectory(): Promise<FileSystemDirectoryHandle | null>;
	savePackToDisk(pack: LevelPack, handle?: FileSystemDirectoryHandle): Promise<void>;
	loadPackFromDisk(folderHandle: FileSystemDirectoryHandle): Promise<LevelPack>;
	listPacksInDirectory(
		root: FileSystemDirectoryHandle
	): Promise<Array<{ handle: FileSystemDirectoryHandle; name: string }>>;
	isPackLinked(packId: string): Promise<boolean>;
	linkPackToDisk(packId: string): Promise<FileSystemDirectoryHandle>;
	syncPackToDisk(packId: string, pack: LevelPack): Promise<void>;
	loadLinkedPack(packId: string): Promise<LevelPack | null>;
	unlinkPack(packId: string): Promise<void>;
	verifyPermission(handle: FileSystemHandle, readWrite: boolean): Promise<boolean>;
}

export class BrowserFileSystemService implements FileSystemService {
	private rootHandle: FileSystemDirectoryHandle | null = null;

	constructor() {}

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
		let root = handle || this.rootHandle;
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
		// Look for pack.json
		try {
			const fileHandle = await folderHandle.getFileHandle('pack.json');
			const file = await fileHandle.getFile();
			const text = await file.text();
			const pack = JSON.parse(text) as LevelPack;
			return pack;
		} catch (err) {
			throw new Error(`Failed to load pack from ${folderHandle.name}: ${(err as Error).message}`);
		}
	}

	// Helper to list all packs in the root directory
	async listPacksInDirectory(
		root: FileSystemDirectoryHandle
	): Promise<Array<{ handle: FileSystemDirectoryHandle; name: string }>> {
		const packs: Array<{ handle: FileSystemDirectoryHandle; name: string }> = [];

		for await (const entry of root.values()) {
			if (entry.kind === 'directory') {
				// Check if it has a pack.json
				try {
					const dirHandle = entry as FileSystemDirectoryHandle;
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
		const handle = await getHandle(packId);
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
		const handle = await getHandle(packId);
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

	async verifyPermission(handle: FileSystemHandle, readWrite: boolean): Promise<boolean> {
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

export const fileSystem = new BrowserFileSystemService();
