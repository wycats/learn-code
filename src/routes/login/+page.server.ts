import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { getOAuthConfigStatus } from '$lib/server/oauth-config';

export const load: PageServerLoad = async (event) => {
	if (event.locals.user) {
		return redirect(302, '/profiles');
	}
	return {
		oauth: getOAuthConfigStatus()
	};
};
