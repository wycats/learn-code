import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ locals }) => {
	return {
		user: locals.user,
		session: locals.session
			? {
					id: locals.session.id,
					expiresAt: locals.session.expiresAt,
					sudoExpiresAt: locals.session.sudoExpiresAt,
					hasGithubAccessToken: Boolean(locals.session.githubAccessToken)
				}
			: null
	};
};
