import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
	FileSystemService,
	type FileSystemDirectoryHandle,
	type FileSystemFileHandle,
	type FileSystemWritableFileStream
} from './file-system';
import * as handleRegistry from './handle-registry';
import type { LevelPack } from '$lib/game/types';

// Mock handle-registry
vi.mock('./handle-registry', () => ({
	saveHandle: vi.fn(),
	getHandle: vi.fn(),
	removeHandle: vi.fn()
}));

describe('FileSystemService', () => {
	let service: FileSystemService;
	let mockRootHandle: FileSystemDirectoryHandle;
	let mockFileHandle: FileSystemFileHandle;
	let mockWritable: FileSystemWritableFileStream;

	beforeEach(() => {
		vi.clearAllMocks();
		service = new FileSystemService();

		// Mock File System Access API objects
		mockWritable = {
			write: vi.fn(),
			close: vi.fn(),
			seek: vi.fn(),
			truncate: vi.fn(),
			locked: false,
			abort: vi.fn(),
			getWriter: vi.fn()
		} as unknown as FileSystemWritableFileStream;

		mockFileHandle = {
			kind: 'file',
			name: 'pack.json',
			getFile: vi.fn().mockResolvedValue(new File(['{"id":"test"}'], 'pack.json')),
			createWritable: vi.fn().mockResolvedValue(mockWritable),
			isSameEntry: vi.fn().mockResolvedValue(false),
			queryPermission: vi.fn().mockResolvedValue('granted'),
			requestPermission: vi.fn().mockResolvedValue('granted')
		} as unknown as FileSystemFileHandle;

		mockRootHandle = {
			kind: 'directory',
			name: 'test-folder',
			getDirectoryHandle: vi.fn(), // Will be mocked dynamically if needed
			getFileHandle: vi.fn().mockResolvedValue(mockFileHandle),
			removeEntry: vi.fn(),
			resolve: vi.fn(),
			values: vi.fn(),
			isSameEntry: vi.fn().mockResolvedValue(false),
			queryPermission: vi.fn().mockResolvedValue('granted'),
			requestPermission: vi.fn().mockResolvedValue('granted')
		} as unknown as FileSystemDirectoryHandle;

		// Mock window.showDirectoryPicker
		vi.stubGlobal('window', {
			showDirectoryPicker: vi.fn().mockResolvedValue(mockRootHandle),
			showSaveFilePicker: vi.fn()
		});
	});

	it('should link pack to disk', async () => {
		const packId = 'pack-123';

		await service.linkPackToDisk(packId);

		expect(window.showDirectoryPicker).toHaveBeenCalled();
		expect(handleRegistry.saveHandle).toHaveBeenCalledWith(packId, mockRootHandle);
	});

	it('should sync pack to disk', async () => {
		const packId = 'pack-123';
		const packData = { id: packId, name: 'Test Pack', levels: [] } as unknown as LevelPack;

		// Mock getHandle to return our mock handle
		vi.mocked(handleRegistry.getHandle).mockResolvedValue(mockRootHandle);

		await service.syncPackToDisk(packId, packData);

		expect(handleRegistry.getHandle).toHaveBeenCalledWith(packId);
		expect(mockRootHandle.getFileHandle).toHaveBeenCalledWith('pack.json', { create: true });
		expect(mockFileHandle.createWritable).toHaveBeenCalled();
		expect(mockWritable.write).toHaveBeenCalledWith(JSON.stringify(packData, null, 2));
		expect(mockWritable.close).toHaveBeenCalled();
	});

	it('should load linked pack from disk', async () => {
		const packId = 'pack-123';

		// Mock getHandle to return our mock handle
		vi.mocked(handleRegistry.getHandle).mockResolvedValue(mockRootHandle);

		const result = await service.loadLinkedPack(packId);

		expect(handleRegistry.getHandle).toHaveBeenCalledWith(packId);
		expect(mockRootHandle.getFileHandle).toHaveBeenCalledWith('pack.json');
		expect(mockFileHandle.getFile).toHaveBeenCalled();
		expect(result).toEqual({ id: 'test' });
	});

	it('should handle permission denial during sync', async () => {
		const packId = 'pack-123';
		const packData = { id: packId, name: 'Test Pack', levels: [] } as unknown as LevelPack;

		// Mock permission denied
		const deniedHandle = {
			...mockRootHandle,
			queryPermission: vi.fn().mockResolvedValue('denied'),
			requestPermission: vi.fn().mockResolvedValue('denied')
		} as unknown as FileSystemDirectoryHandle;
		vi.mocked(handleRegistry.getHandle).mockResolvedValue(deniedHandle);

		await expect(service.syncPackToDisk(packId, packData)).rejects.toThrow('Permission denied');
	});

	it('should handle missing handle (not linked)', async () => {
		const packId = 'pack-123';
		vi.mocked(handleRegistry.getHandle).mockResolvedValue(undefined);

		await service.syncPackToDisk(packId, {} as unknown as LevelPack);

		// Should just return without error
		expect(mockRootHandle.getFileHandle).not.toHaveBeenCalled();
	});
});
