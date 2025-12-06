import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { GitHubService } from '$lib/server/github';
import { decryptToken } from '$lib/server/crypto';
import type { LevelPack } from '$lib/game/schema';

export const POST: RequestHandler = async ({ request, locals }) => {
	if (!locals.session || !locals.session.githubAccessToken) {
		throw error(401, 'Not connected to GitHub');
	}

	const pack = (await request.json()) as LevelPack;

	// Decrypt token
	const token = decryptToken(locals.session.githubAccessToken);
	if (!token) {
		throw error(500, 'Failed to decrypt token');
	}

	const github = new GitHubService(token);
	const user = await github.getUser();

	// Repo name: kibi-pack-{sanitized_name}
	const sanitizedName = pack.name
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, '-')
		.replace(/^-|-$/g, '');
	const repoName = `kibi-pack-${sanitizedName}`;

	// Check if repo exists
	let repo = await github.getRepo(user.login, repoName);
	if (!repo) {
		repo = await github.createRepo(repoName, `Kibi Level Pack: ${pack.name}`);
	}

	// Prepare files
	const files = [];

	// 1. pack.json (Contains EVERYTHING for easy import)
	files.push({
		path: 'pack.json',
		content: JSON.stringify(pack, null, 2)
	});

	// 2. Levels (For human readability and diffs)
	// We put them in a src/levels folder to look like a real project
	for (const [index, level] of pack.levels.entries()) {
		// Prefix with index to keep order
		const prefix = String(index + 1).padStart(2, '0');
		const levelFilename = `${prefix}-${level.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}.json`;
		files.push({
			path: `src/levels/${levelFilename}`,
			content: JSON.stringify(level, null, 2)
		});
	}

	// 3. README.md
	// TODO: Use the actual deployed URL in production
	const appUrl = 'https://kibi.app'; // or http://localhost:5173 for dev
	const importUrl = `${appUrl}/import?url=${encodeURIComponent(repo.html_url)}`;
	const badgeUrl = `https://img.shields.io/badge/Open%20in-Kibi-blue?style=for-the-badge&logo=code-blocks`;

	const readme = `# ${pack.name}

[![Open in Kibi](${badgeUrl})](${importUrl})

${pack.description || 'A Kibi Level Pack.'}

## Levels
${pack.levels.map((l) => `- ${l.name}`).join('\n')}

Created with [Kibi](${appUrl})
`;
	files.push({
		path: 'README.md',
		content: readme
	});

	// Commit
	await github.pushFiles(user.login, repoName, files, `Update pack: ${pack.name}`);

	return json({ success: true, repoUrl: repo.html_url });
};
