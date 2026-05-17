import { z } from 'zod';

const redirectPathSchema = z
	.string()
	.trim()
	.refine((value) => value.startsWith('/'), 'Redirect must be a local path')
	.refine((value) => !value.startsWith('//'), 'Redirect must not be protocol-relative')
	.refine((value) => !value.includes('\\'), 'Redirect must not contain backslashes');

export function sanitizeRedirectPath(value: string | null | undefined, fallback = '/') {
	const result = redirectPathSchema.safeParse(value ?? fallback);
	return result.success ? result.data : fallback;
}

export function safeSlug(value: string, fallback: string) {
	const slug = value
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, '-')
		.replace(/^-|-$/g, '')
		.slice(0, 80);

	return slug || fallback;
}
