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
			const ref = (treeOrBlob === 'blob' || treeOrBlob === 'tree') && branch ? branch : 'main';
			const filePath = getGitHubPackPath(treeOrBlob, pathParts);
			return `https://raw.githubusercontent.com/${owner}/${repo}/${ref}/${filePath}`;
		}
	}

	return url;
}

function getGitHubPackPath(treeOrBlob: string | undefined, pathParts: string[]) {
	const path = pathParts.filter(Boolean).join('/');

	if (treeOrBlob === 'blob') {
		return path || 'pack.json';
	}

	if (treeOrBlob === 'tree') {
		return path ? `${path}/pack.json` : 'pack.json';
	}

	return 'pack.json';
}

export async function fetchPackFromUrl(url: string): Promise<LevelPack> {
	const response = await fetch(getRawPackUrl(url));
	if (!response.ok) {
		throw new Error('Failed to fetch pack.json');
	}

	return parseImportedPack(await response.json());
}
