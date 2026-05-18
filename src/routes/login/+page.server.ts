import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { getOAuthConfigStatus, getRuntimeConfiguredOAuthProviders } from '$lib/server/oauth-config';

export const load: PageServerLoad = async (event) => {
	if (event.locals.user) {
		return redirect(302, '/profiles');
	}
	return {
		oauth: getOAuthConfigStatus(undefined, event.url.origin),
		runtimeOAuth: getRuntimeConfiguredOAuthProviders(undefined, event.url.origin)
	};
};
