import { db } from '$lib/server/db';
import * as table from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';
import { generateSessionToken, createSession } from '$lib/server/auth';

export async function createHandshakeCode() {
	const id = crypto.randomUUID();
	const expiresAt = new Date(Date.now() + 1000 * 60 * 10); // 10 minutes

	await db.insert(table.deviceAuth).values({
		id,
		status: 'pending',
		expiresAt
	});

	return id;
}

export async function getHandshakeStatus(id: string) {
	const [record] = await db.select().from(table.deviceAuth).where(eq(table.deviceAuth.id, id));

	if (!record) return { status: 'invalid' };

	if (Date.now() > record.expiresAt.getTime()) {
		return { status: 'expired' };
	}

	if (record.status === 'authorized' && record.userId) {
		// Generate a new session for this user
		const sessionToken = generateSessionToken();
		const session = await createSession(sessionToken, record.userId);

		// Clean up the handshake record so it can't be reused
		await db.delete(table.deviceAuth).where(eq(table.deviceAuth.id, id));

		return {
			status: 'authorized',
			token: sessionToken,
			expiresAt: session.expiresAt
		};
	}

	return { status: record.status };
}

export async function approveHandshake(id: string, userId: string) {
	const [record] = await db.select().from(table.deviceAuth).where(eq(table.deviceAuth.id, id));

	if (!record) return { success: false, error: 'Invalid code' };
	if (Date.now() > record.expiresAt.getTime()) return { success: false, error: 'Expired code' };

	await db
		.update(table.deviceAuth)
		.set({
			status: 'authorized',
			userId
		})
		.where(eq(table.deviceAuth.id, id));

	return { success: true };
}

export async function rejectHandshake(id: string) {
	await db
		.update(table.deviceAuth)
		.set({
			status: 'rejected'
		})
		.where(eq(table.deviceAuth.id, id));
}
