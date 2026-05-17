import { z } from 'zod';
import validator from 'validator';

export const GoogleUserInfoSchema = z.object({
	sub: z.string().min(1),
	email: z.string().email(),
	email_verified: z.boolean(),
	name: z.string().optional()
});

export const GitHubUserSchema = z.object({
	id: z.number(),
	login: z.string().min(1),
	email: z.string().email().nullable().optional(),
	name: z.string().nullable().optional()
});

export const GitHubEmailSchema = z.object({
	email: z.string().email(),
	primary: z.boolean(),
	verified: z.boolean(),
	visibility: z.string().nullable()
});

export type GitHubEmail = z.infer<typeof GitHubEmailSchema>;

export function normalizeVerifiedEmail(email: string) {
	return validator.normalizeEmail(email) || email;
}

export function selectVerifiedGitHubEmail(
	profileEmail: string | null | undefined,
	emails: GitHubEmail[]
) {
	const verifiedProfileEmail = profileEmail
		? validator.normalizeEmail(profileEmail) || profileEmail
		: null;

	if (
		verifiedProfileEmail &&
		emails.some((email) => email.email === verifiedProfileEmail && email.verified)
	) {
		return verifiedProfileEmail;
	}

	const verifiedPrimary = emails.find((email) => email.primary && email.verified);
	if (verifiedPrimary) return normalizeVerifiedEmail(verifiedPrimary.email);

	const verified = emails.find((email) => email.verified);
	return verified ? normalizeVerifiedEmail(verified.email) : null;
}
