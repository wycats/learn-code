import { json } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { userProgress } from '$lib/server/db/schema';
import { eq, and, inArray, sql } from 'drizzle-orm';
import type { RequestHandler } from './$types';

const STATUS_WEIGHT = {
	locked: 0,
	unlocked: 1,
	completed: 2
};

function getStatusWeight(status: string) {
	return STATUS_WEIGHT[status as keyof typeof STATUS_WEIGHT] ?? 0;
}

export const GET: RequestHandler = async ({ locals }) => {
	if (!locals.user || !locals.profile) {
		return json({ error: 'Unauthorized' }, { status: 401 });
	}

	const progress = await db
		.select()
		.from(userProgress)
		.where(eq(userProgress.profileId, locals.profile.id));

	return json({ progress });
};

export const POST: RequestHandler = async ({ request, locals }) => {
	if (!locals.user || !locals.profile) {
		return json({ error: 'Unauthorized' }, { status: 401 });
	}

	const { updates } = (await request.json()) as {
		updates: { levelId: string; stars: number; status: string }[];
	};

	if (!Array.isArray(updates) || updates.length === 0) {
		return json({ success: true, synced: [] });
	}

	const profileId = locals.profile.id;
	const levelIds = updates.map((u) => u.levelId);

	// Fetch existing progress for these levels
	const existing = await db
		.select()
		.from(userProgress)
		.where(and(eq(userProgress.profileId, profileId), inArray(userProgress.levelId, levelIds)));

	const existingMap = new Map(existing.map((e) => [e.levelId, e]));
	const toUpsert: (typeof userProgress.$inferInsert)[] = [];
	const syncedState: { levelId: string; stars: number; status: string }[] = [];

	for (const update of updates) {
		const current = existingMap.get(update.levelId);
		let finalStars = update.stars;
		let finalStatus = update.status;

		if (current) {
			// High Water Mark Logic
			finalStars = Math.max(current.stars, update.stars);
			if (getStatusWeight(current.status) > getStatusWeight(update.status)) {
				finalStatus = current.status;
			}
		}

		// If we have a change (or it's new), we upsert
		// Actually, we should always upsert if it's new.
		// If it exists, we only upsert if the incoming data is "better" OR if we need to correct the client?
		// Wait, if the server has BETTER data, we don't need to write to DB, but we need to tell the client.
		// If the client has BETTER data, we write to DB.

		const isClientBetter =
			!current ||
			update.stars > current.stars ||
			getStatusWeight(update.status) > getStatusWeight(current.status);

		if (isClientBetter) {
			toUpsert.push({
				profileId,
				levelId: update.levelId,
				stars: finalStars,
				status: finalStatus,
				updatedAt: new Date()
			});
		}

		syncedState.push({
			levelId: update.levelId,
			stars: finalStars,
			status: finalStatus
		});
	}

	if (toUpsert.length > 0) {
		await db
			.insert(userProgress)
			.values(toUpsert)
			.onConflictDoUpdate({
				target: [userProgress.profileId, userProgress.levelId],
				set: {
					stars: sql`EXCLUDED.stars`,
					status: sql`EXCLUDED.status`,
					updatedAt: sql`EXCLUDED.updated_at`
				}
			});
	}

	return json({ success: true, synced: syncedState });
};
