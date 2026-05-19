import type { Feedback } from '$lib/server/db/schema';
import { FeedbackContextSchema, type FeedbackContext } from '$lib/services/feedback-schema';

type ContextParseStatus = 'valid' | 'empty' | 'invalid-json' | 'invalid-shape';

export type FeedbackContextSummary = {
	status: ContextParseStatus;
	error: string | null;
	raw: string;
	route: {
		source: string;
		packId: string | null;
		levelId: string | null;
		url: string | null;
	} | null;
	level: {
		id: string;
		name: string;
	} | null;
	game: {
		status: string;
		failedAttempts: number;
		activeBlockId: string | null;
	} | null;
	programCount: number | null;
	functionsCount: number | null;
	browser: {
		online: boolean;
		userAgent: string | null;
		language: string | null;
		viewport: string | null;
	} | null;
	interpreter: {
		phase: string | null;
		stackDepth: number;
		currentBlockId: string | null;
		currentContext: string | null;
		currentFrameSize: number | null;
	} | null;
};

export type FeedbackInboxReport = {
	id: string;
	createdAtIso: string;
	message: string;
	messagePreview: string;
	email: string | null;
	url: string | null;
	packId: string | null;
	levelId: string | null;
	userId: string | null;
	profileId: string | null;
	context: FeedbackContextSummary;
	title: string | null;
	primaryLocation: string | null;
};

export type FeedbackInboxGroup = {
	label: string;
	reports: FeedbackInboxReport[];
};

export function toFeedbackInboxReport(row: Feedback): FeedbackInboxReport {
	const context = summarizeFeedbackContext(row.context);
	const packId = row.packId ?? context.route?.packId ?? null;
	const levelId = row.levelId ?? context.route?.levelId ?? context.level?.id ?? null;
	const title = context.level?.name ?? levelId;

	return {
		id: row.id,
		createdAtIso: row.createdAt.toISOString(),
		message: row.message,
		messagePreview: previewMessage(row.message),
		email: row.email,
		url: row.url,
		packId,
		levelId,
		userId: row.userId,
		profileId: row.profileId,
		context,
		title,
		primaryLocation: [packId, levelId].filter(Boolean).join(' / ') || context.route?.source || null
	};
}

export function groupReportsByDay(reports: FeedbackInboxReport[]): FeedbackInboxGroup[] {
	const groups = new Map<string, FeedbackInboxReport[]>();

	for (const report of reports) {
		const label = new Date(report.createdAtIso).toLocaleDateString(undefined, {
			month: 'short',
			day: 'numeric',
			year: 'numeric'
		});
		groups.set(label, [...(groups.get(label) ?? []), report]);
	}

	return Array.from(groups, ([label, groupedReports]) => ({ label, reports: groupedReports }));
}

export function summarizeFeedbackContext(
	rawContext: string | null | undefined
): FeedbackContextSummary {
	const raw = rawContext && rawContext.trim().length > 0 ? rawContext : '{}';

	let jsonValue: unknown;
	try {
		jsonValue = JSON.parse(raw);
	} catch (error) {
		return emptyContextSummary({
			status: 'invalid-json',
			error: getErrorMessage(error),
			raw
		});
	}

	const formattedRaw = formatJson(jsonValue);
	const parsed = FeedbackContextSchema.safeParse(jsonValue);

	if (!parsed.success) {
		return emptyContextSummary({
			status: isEmptyRecord(jsonValue) ? 'empty' : 'invalid-shape',
			error:
				parsed.error.issues[0]?.message ?? 'Context did not match the expected feedback schema.',
			raw: formattedRaw
		});
	}

	return summarizeValidContext(parsed.data, formattedRaw);
}

function summarizeValidContext(context: FeedbackContext, raw: string): FeedbackContextSummary {
	const topFrame = context.interpreter?.stack.at(-1) ?? null;

	return {
		status: 'valid',
		error: null,
		raw,
		route: {
			source: context.route.source,
			packId: context.route.packId ?? null,
			levelId: context.route.levelId ?? null,
			url: context.route.url ?? null
		},
		level: {
			id: context.level.id,
			name: context.level.name
		},
		game: {
			status: context.game.status,
			failedAttempts: context.game.failedAttempts,
			activeBlockId: context.game.activeBlockId
		},
		programCount: context.program.length,
		functionsCount: Object.keys(context.functions).length,
		browser: {
			online: context.browser.online,
			userAgent: context.browser.userAgent ?? null,
			language: context.browser.language ?? null,
			viewport: context.browser.viewport
				? `${context.browser.viewport.width} × ${context.browser.viewport.height}`
				: null
		},
		interpreter: context.interpreter
			? {
					phase: context.interpreter.phase ?? null,
					stackDepth: context.interpreter.stackDepth,
					currentBlockId: topFrame?.blockId ?? null,
					currentContext: topFrame?.context ?? null,
					currentFrameSize: topFrame?.blockIds.length ?? null
				}
			: null
	};
}

function emptyContextSummary({
	status,
	error,
	raw
}: Pick<FeedbackContextSummary, 'status' | 'error' | 'raw'>): FeedbackContextSummary {
	return {
		status,
		error,
		raw,
		route: null,
		level: null,
		game: null,
		programCount: null,
		functionsCount: null,
		browser: null,
		interpreter: null
	};
}

function previewMessage(message: string) {
	const compact = message.replace(/\s+/g, ' ').trim();
	return compact.length > 140 ? `${compact.slice(0, 137)}…` : compact;
}

function formatJson(value: unknown) {
	try {
		return JSON.stringify(value, null, 2);
	} catch {
		return String(value);
	}
}

function isEmptyRecord(value: unknown) {
	return (
		typeof value === 'object' &&
		value !== null &&
		!Array.isArray(value) &&
		Object.keys(value).length === 0
	);
}

function getErrorMessage(error: unknown) {
	return error instanceof Error ? error.message : 'Unable to parse feedback context JSON.';
}
