import type { LevelPack } from '../types';
import { BrowserPersistence } from './browser';
import { InMemoryPersistence } from './memory';

export * from './types';
export * from './browser';
export * from './memory';

// Default instance
export const persistence =
	typeof window !== 'undefined' ? new BrowserPersistence() : new InMemoryPersistence();

// Helper function (factory)
export function createDefaultPack(): LevelPack {
	return {
		id: crypto.randomUUID(),
		name: 'My First Adventure',
		description: 'A collection of custom levels.',
		version: '1.0.0',
		difficulty: 'beginner',
		tags: [],
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
