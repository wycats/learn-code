import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	// If logged in but no profile selected, force profile selection
	if (locals.user && !locals.profile) {
		throw redirect(302, '/profiles');
	}

	return {
		user: locals.user,
		profile: locals.profile
	};
};
