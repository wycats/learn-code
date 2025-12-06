import { error } from '@sveltejs/kit';

interface GitHubUser {
	login: string;
	id: number;
	email?: string;
	name?: string;
}

interface File {
	path: string;
	content: string;
}

export class GitHubService {
	private baseUrl = 'https://api.github.com';

	constructor(private token: string) {}

	private async request(endpoint: string, options: RequestInit = {}) {
		const url = `${this.baseUrl}${endpoint}`;
		const headers = {
			Authorization: `Bearer ${this.token}`,
			Accept: 'application/vnd.github.v3+json',
			'Content-Type': 'application/json',
			...options.headers
		};

		const response = await fetch(url, { ...options, headers });

		if (!response.ok) {
			const body = await response.json().catch(() => ({}));
			console.error(`GitHub API Error [${endpoint}]:`, body);
			throw error(response.status, body.message || 'GitHub API Error');
		}

		return response.json();
	}

	async getUser(): Promise<GitHubUser> {
		return this.request('/user');
	}

	async getRepo(owner: string, repo: string) {
		try {
			return await this.request(`/repos/${owner}/${repo}`);
		} catch (e: unknown) {
			if (
				typeof e === 'object' &&
				e !== null &&
				'status' in e &&
				(e as { status: number }).status === 404
			)
				return null;
			throw e;
		}
	}

	async createRepo(name: string, description?: string) {
		return this.request('/user/repos', {
			method: 'POST',
			body: JSON.stringify({
				name,
				description,
				private: false, // Public by default for now
				auto_init: true // Initialize with README so we have a main branch
			})
		});
	}

	async pushFiles(owner: string, repo: string, files: File[], message: string, branch = 'main') {
		// 1. Get the reference to the head of the branch
		let ref;
		try {
			ref = await this.request(`/repos/${owner}/${repo}/git/ref/heads/${branch}`);
		} catch {
			// If branch doesn't exist, maybe repo is empty?
			// If auto_init was true, it should exist.
			throw new Error(`Branch ${branch} not found`);
		}

		const latestCommitSha = ref.object.sha;

		// 2. Get the commit to get the tree
		const latestCommit = await this.request(
			`/repos/${owner}/${repo}/git/commits/${latestCommitSha}`
		);
		const baseTreeSha = latestCommit.tree.sha;

		// 3. Create a new tree
		// We can send content directly for text files
		const tree = files.map((file) => ({
			path: file.path,
			mode: '100644', // blob (file)
			type: 'blob',
			content: file.content
		}));

		const newTree = await this.request(`/repos/${owner}/${repo}/git/trees`, {
			method: 'POST',
			body: JSON.stringify({
				base_tree: baseTreeSha,
				tree
			})
		});

		// 4. Create a new commit
		const newCommit = await this.request(`/repos/${owner}/${repo}/git/commits`, {
			method: 'POST',
			body: JSON.stringify({
				message,
				tree: newTree.sha,
				parents: [latestCommitSha]
			})
		});

		// 5. Update the reference
		await this.request(`/repos/${owner}/${repo}/git/refs/heads/${branch}`, {
			method: 'PATCH',
			body: JSON.stringify({
				sha: newCommit.sha
			})
		});

		return newCommit;
	}
}
