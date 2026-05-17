import { LevelPackSchema, type LevelPack } from '$lib/game/schema';
import { migrateLevelPack } from '$lib/game/migrations';

export function parseImportedPack(data: unknown): LevelPack {
	return LevelPackSchema.parse(migrateLevelPack(data));
}

export async function readPackFromFile(file: File): Promise<LevelPack> {
	const text = await file.text();
	return parseImportedPack(JSON.parse(text));
}

export function getRawPackUrl(url: string): string {
	const parsed = new URL(url);

	if (parsed.hostname === 'github.com') {
		const [, owner, repo, treeOrBlob, branch, ...pathParts] = parsed.pathname.split('/');
		if (owner && repo) {
			const filePath = pathParts.length > 0 ? pathParts.join('/') : 'pack.json';
			const ref = treeOrBlob === 'blob' && branch ? branch : 'main';
			return `https://raw.githubusercontent.com/${owner}/${repo}/${ref}/${filePath}`;
		}
	}

	return url;
}

export async function fetchPackFromUrl(url: string): Promise<LevelPack> {
	const response = await fetch(getRawPackUrl(url));
	if (!response.ok) {
		throw new Error('Failed to fetch pack.json');
	}

	return parseImportedPack(await response.json());
}
