import { pgTable, text, timestamp, pgEnum } from 'drizzle-orm/pg-core';

export const user = pgTable('users', {
	id: text('id').primaryKey(),
	email: text('email').notNull().unique(),
	name: text('name'),
	googleId: text('google_id').unique(),
	githubId: text('github_id').unique(),
	createdAt: timestamp('created_at', { withTimezone: true, mode: 'date' }).notNull().defaultNow(),
	updatedAt: timestamp('updated_at', { withTimezone: true, mode: 'date' }).notNull().defaultNow()
});

export const profile = pgTable('profiles', {
	id: text('id').primaryKey(),
	userId: text('user_id')
		.notNull()
		.references(() => user.id, { onDelete: 'cascade' }),
	nickname: text('nickname').notNull(),
	avatar: text('avatar').notNull(), // e.g. 'robot', 'cat'
	color: text('color').notNull(), // e.g. 'blue', 'red'
	createdAt: timestamp('created_at', { withTimezone: true, mode: 'date' }).notNull().defaultNow()
});

export const session = pgTable('sessions', {
	id: text('id').primaryKey(),
	userId: text('user_id')
		.notNull()
		.references(() => user.id, { onDelete: 'cascade' }),
	expiresAt: timestamp('expires_at', { withTimezone: true, mode: 'date' }).notNull(),
	sudoExpiresAt: timestamp('sudo_expires_at', { withTimezone: true, mode: 'date' })
});

export const deviceAuthStatusEnum = pgEnum('device_auth_status', [
	'pending',
	'authorized',
	'expired',
	'rejected'
]);

export const deviceAuth = pgTable('device_auth', {
	id: text('id').primaryKey(), // The unique code displayed in QR
	status: deviceAuthStatusEnum('status').notNull().default('pending'),
	userId: text('user_id').references(() => user.id, { onDelete: 'cascade' }), // Null until authorized
	sessionId: text('session_id').references(() => session.id, { onDelete: 'set null' }), // The session created for the device
	createdAt: timestamp('created_at', { withTimezone: true, mode: 'date' }).notNull().defaultNow(),
	expiresAt: timestamp('expires_at', { withTimezone: true, mode: 'date' }).notNull()
});

export const feedback = pgTable('feedback', {
	id: text('id').primaryKey(),
	message: text('message').notNull(),
	email: text('email'),
	createdAt: timestamp('created_at', { withTimezone: true, mode: 'date' }).notNull().defaultNow()
});

export type Session = typeof session.$inferSelect;
export type User = typeof user.$inferSelect;
export type Profile = typeof profile.$inferSelect;
export type DeviceAuth = typeof deviceAuth.$inferSelect;
export type Feedback = typeof feedback.$inferSelect;
