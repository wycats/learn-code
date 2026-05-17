// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { BrowserFileSystemService } from './file-system';
import * as handleRegistry from './handle-registry';
import type { LevelPack } from '$lib/game/types';
import type { FileSystemDirectoryHandle } from './file-system';

// Mock handle-registry
vi.mock('./handle-registry', () => ({
	saveHandle: vi.fn(),
	getHandle: vi.fn(),
	removeHandle: vi.fn()
}));

// Mock File System Access API classes
class MockFileSystemHandle {
	constructor(
		public name: string,
		public kind: 'file' | 'directory'
	) {}

	async isSameEntry(other: MockFileSystemHandle) {
		return this === other;
	}
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	async queryPermission(_descriptor?: { mode?: 'read' | 'readwrite' }) {
		return 'granted' as const;
	}
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	async requestPermission(_descriptor?: { mode?: 'read' | 'readwrite' }) {
		return 'granted' as const;
	}
}

class MockFileSystemFileHandle extends MockFileSystemHandle {
	public content: string = '';

	constructor(name: string, content: string = '') {
		super(name, 'file');
		this.content = content;
	}

	async getFile() {
		return {
			text: async () => this.content
		} as File;
	}

	async createWritable() {
		const writable = {
			content: '',
			write: async (data: string) => {
				writable.content += data;
			},
			close: async () => {},
			seek: async () => {},
			truncate: async () => {}
		};

		// When closed, update the file content
		const originalClose = writable.close.bind(writable);
		writable.close = async () => {
			await originalClose();
			this.content = writable.content;
		};
		return writable;
	}
}

class MockFileSystemDirectoryHandle extends MockFileSystemHandle {
	public entries: Map<string, MockFileSystemDirectoryHandle | MockFileSystemFileHandle> = new Map();

	constructor(name: string) {
		super(name, 'directory');
	}

	async getDirectoryHandle(name: string, options?: { create?: boolean }) {
		if (this.entries.has(name)) {
			const entry = this.entries.get(name);
			if (entry?.kind === 'directory') return entry as MockFileSystemDirectoryHandle;
			throw new Error('Type mismatch');
		}
		if (options?.create) {
			const newDir = new MockFileSystemDirectoryHandle(name);
			this.entries.set(name, newDir);
			return newDir;
		}
		throw new Error('NotFoundError');
	}

	async getFileHandle(name: string, options?: { create?: boolean }) {
		if (this.entries.has(name)) {
			const entry = this.entries.get(name);
			if (entry?.kind === 'file') return entry as MockFileSystemFileHandle;
			throw new Error('Type mismatch');
		}
		if (options?.create) {
			const newFile = new MockFileSystemFileHandle(name);
			this.entries.set(name, newFile);
			return newFile;
		}
		throw new Error('NotFoundError');
	}

	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	async removeEntry(name: string, _options?: { recursive?: boolean }) {
		this.entries.delete(name);
	}

	async *values() {
		for (const entry of this.entries.values()) {
			yield entry;
		}
	}

	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	async resolve(_possibleDescendant: MockFileSystemHandle) {
		return [];
	}
}

describe('FileSystemService', () => {
	let fileSystem: BrowserFileSystemService;
	let mockRoot: MockFileSystemDirectoryHandle;

	beforeEach(() => {
		vi.clearAllMocks();

		mockRoot = new MockFileSystemDirectoryHandle('root');

		// Mock window.showDirectoryPicker
		vi.stubGlobal('window', {
			showDirectoryPicker: vi.fn().mockResolvedValue(mockRoot),
			showSaveFilePicker: vi.fn()
		});

		fileSystem = new BrowserFileSystemService();
	});

	it('should check if supported', () => {
		expect(fileSystem.isSupported).toBe(true);
	});

	it('should open directory', async () => {
		const handle = await fileSystem.openDirectory();
		expect(window.showDirectoryPicker).toHaveBeenCalled();
		expect(handle).toBe(mockRoot);
	});

	it('should handle user cancellation in openDirectory', async () => {
		const abortError = new Error('User cancelled');
		abortError.name = 'AbortError';
		window.showDirectoryPicker = vi.fn().mockRejectedValue(abortError);

		const handle = await fileSystem.openDirectory();
		expect(handle).toBeNull();
	});

	it('should save pack to disk', async () => {
		const pack = { id: 'p1', name: 'My Pack', levels: [] } as unknown as LevelPack;

		// First call will prompt for directory
		await fileSystem.savePackToDisk(pack);

		expect(window.showDirectoryPicker).toHaveBeenCalled();

		// Check if folder and file were created
		const packFolder = await mockRoot.getDirectoryHandle('My Pack');
		expect(packFolder).toBeDefined();

		const packFile = await packFolder.getFileHandle('pack.json');
		expect(packFile).toBeDefined();
		expect(packFile.content).toContain('"name": "My Pack"');
	});

	it('should load pack from disk', async () => {
		const packData = { id: 'p1', name: 'Loaded Pack', levels: [] };
		const packFolder = await mockRoot.getDirectoryHandle('Loaded Pack', { create: true });
		const packFile = await packFolder.getFileHandle('pack.json', { create: true });
		packFile.content = JSON.stringify(packData);

		const loadedPack = await fileSystem.loadPackFromDisk(
			packFolder as unknown as FileSystemDirectoryHandle
		);
		expect(loadedPack).toEqual(packData);
	});

	it('should list packs in directory', async () => {
		// Create a valid pack folder
		const pack1 = await mockRoot.getDirectoryHandle('Pack 1', { create: true });
		await pack1.getFileHandle('pack.json', { create: true });

		// Create another valid pack folder
		const pack2 = await mockRoot.getDirectoryHandle('Pack 2', { create: true });
		await pack2.getFileHandle('pack.json', { create: true });

		// Create a non-pack folder
		await mockRoot.getDirectoryHandle('Not a Pack', { create: true });

		// Create a file in root
		await mockRoot.getFileHandle('somefile.txt', { create: true });

		const packs = await fileSystem.listPacksInDirectory(
			mockRoot as unknown as FileSystemDirectoryHandle
		);
		expect(packs).toHaveLength(2);
		expect(packs.map((p) => p.name)).toContain('Pack 1');
		expect(packs.map((p) => p.name)).toContain('Pack 2');
	});

	it('should link pack to disk', async () => {
		const packId = 'p1';
		const handle = await fileSystem.linkPackToDisk(packId);

		expect(window.showDirectoryPicker).toHaveBeenCalled();
		expect(handleRegistry.saveHandle).toHaveBeenCalledWith(packId, mockRoot);
		expect(handle).toBe(mockRoot);
	});

	it('should sync pack to disk (linked)', async () => {
		const packId = 'p1';
		const pack = { id: packId, name: 'Synced Pack', levels: [] } as unknown as LevelPack;

		// Mock getHandle to return our mock root
		vi.mocked(handleRegistry.getHandle).mockResolvedValue(
			mockRoot as unknown as FileSystemDirectoryHandle
		);

		await fileSystem.syncPackToDisk(packId, pack);

		const packFile = await mockRoot.getFileHandle('pack.json');
		expect(packFile.content).toContain('"name": "Synced Pack"');
	});

	it('should not sync if not linked', async () => {
		vi.mocked(handleRegistry.getHandle).mockResolvedValue(undefined);
		await fileSystem.syncPackToDisk('p1', {} as unknown as LevelPack);
		expect(handleRegistry.getHandle).toHaveBeenCalledWith('p1');
	});

	it('should load linked pack', async () => {
		const packId = 'p1';
		const packData = { id: packId, name: 'Linked Pack', levels: [] };

		const packFile = await mockRoot.getFileHandle('pack.json', { create: true });
		packFile.content = JSON.stringify(packData);

		vi.mocked(handleRegistry.getHandle).mockResolvedValue(
			mockRoot as unknown as FileSystemDirectoryHandle
		);

		const loadedPack = await fileSystem.loadLinkedPack(packId);
		expect(loadedPack).toEqual(packData);
	});

	it('should unlink pack', async () => {
		await fileSystem.unlinkPack('p1');
		expect(handleRegistry.removeHandle).toHaveBeenCalledWith('p1');
	});
});
