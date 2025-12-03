import type { LevelPack } from '$lib/game/types';

// We need to define the handle types abstractly or use the browser ones if available.
// For simplicity in the interface, we'll use `any` for handles or a generic wrapper,
// but since the browser implementation relies on specific types, let's define a minimal handle interface.

export interface FileSystemHandle {
	kind: 'file' | 'directory';
	name: string;
}

export interface FileSystemDirectoryHandle extends FileSystemHandle {
	kind: 'directory';
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
}
