import { json } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { feedback } from '$lib/server/db/schema';
import { FeedbackPayloadSchema } from '$lib/services/feedback-schema';
import type { RequestHandler } from './$types';

const MAX_FEEDBACK_BYTES = 200_000;

export const POST: RequestHandler = async ({ request, locals }) => {
	const raw = await request.text();
	if (raw.length > MAX_FEEDBACK_BYTES) {
		return json({ error: 'Feedback payload is too large' }, { status: 413 });
	}

	let body: unknown;
	try {
		body = JSON.parse(raw);
	} catch {
		return json({ error: 'Invalid feedback payload' }, { status: 400 });
	}

	const parsed = FeedbackPayloadSchema.safeParse(body);
	if (!parsed.success) {
		return json({ error: 'Invalid feedback payload' }, { status: 400 });
	}

	const item = parsed.data;

	await db
		.insert(feedback)
		.values({
			id: item.id,
			message: item.message,
			email: item.email || null,
			url: item.context.route.url ?? null,
			packId: item.context.route.packId ?? null,
			levelId: item.context.route.levelId ?? item.context.level.id,
			context: JSON.stringify(item.context),
			userId: locals.user?.id ?? null,
			profileId: locals.profile?.id ?? null,
			createdAt: new Date(item.createdAt)
		})
		.onConflictDoNothing();

	return json({ success: true });
};
