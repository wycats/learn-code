import { BrowserFileSystemService } from './browser';
import { InMemoryFileSystemService } from './memory';

export * from './types';
export * from './browser';
export * from './memory';

export const fileSystem =
	typeof window !== 'undefined' ? new BrowserFileSystemService() : new InMemoryFileSystemService();
