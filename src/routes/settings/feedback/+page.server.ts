import { redirect } from '@sveltejs/kit';
import { desc } from 'drizzle-orm';
import { db } from '$lib/server/db';
import { feedback } from '$lib/server/db/schema';
import { groupReportsByDay, toFeedbackInboxReport } from '$lib/server/feedback-inbox';
import type { PageServerLoad } from './$types';

const FEEDBACK_INBOX_LIMIT = 50;

export const load: PageServerLoad = async (event) => {
	if (!event.locals.user) {
		return redirect(302, '/login');
	}

	const reports = await db
		.select()
		.from(feedback)
		.orderBy(desc(feedback.createdAt))
		.limit(FEEDBACK_INBOX_LIMIT);

	const serializedReports = reports.map(toFeedbackInboxReport);

	return {
		reports: serializedReports,
		groups: groupReportsByDay(serializedReports)
	};
};
