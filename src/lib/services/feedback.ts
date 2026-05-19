import {
	FeedbackPayloadSchema,
	FeedbackSubmitInputSchema,
	type FeedbackPayload,
	type FeedbackSubmitInput
} from './feedback-schema';

const STORAGE_KEY = 'pending_feedback';
const QUEUE_VERSION = 1;
const MAX_QUEUE_ITEMS = 25;

export type FeedbackSubmitResult = {
	status: 'sent' | 'queued';
	item: FeedbackPayload;
};

type QueuedFeedbackItem = FeedbackPayload & {
	queueVersion: number;
	retryCount: number;
	queuedAt: number;
};

export class FeedbackService {
	private static instance: FeedbackService;

	private constructor() {
		if (typeof window !== 'undefined') {
			window.addEventListener('online', () => void this.flushQueue());
			void this.flushQueue();
		}
	}

	static createForTesting(): FeedbackService {
		return new FeedbackService();
	}

	static getInstance(): FeedbackService {
		if (!FeedbackService.instance) {
			FeedbackService.instance = new FeedbackService();
		}
		return FeedbackService.instance;
	}

	async submit(input: FeedbackSubmitInput): Promise<FeedbackSubmitResult> {
		const parsed = FeedbackSubmitInputSchema.parse(input);
		const item: FeedbackPayload = {
			id: crypto.randomUUID(),
			createdAt: Date.now(),
			...parsed
		};

		if (this.isOnline()) {
			try {
				await this.sendToServer(item);
				return { status: 'sent', item };
			} catch (e) {
				console.warn('Feedback submission failed, queuing...', e);
			}
		}

		this.enqueue(item);
		await this.registerBackgroundSync();
		return { status: 'queued', item };
	}

	getPendingCount() {
		return this.getQueue().length;
	}

	private enqueue(item: FeedbackPayload, retryCount = 0) {
		const queue = this.getQueue();
		const queuedItem: QueuedFeedbackItem = {
			...item,
			queueVersion: QUEUE_VERSION,
			retryCount,
			queuedAt: Date.now()
		};

		queue.push(queuedItem);
		const trimmed = queue.slice(-MAX_QUEUE_ITEMS);
		this.setQueue(trimmed);
	}

	private getQueue(): QueuedFeedbackItem[] {
		if (typeof localStorage === 'undefined') return [];

		try {
			const stored = localStorage.getItem(STORAGE_KEY);
			if (!stored) return [];
			const raw = JSON.parse(stored);
			if (!Array.isArray(raw)) return [];

			return raw.flatMap((item) => {
				const parsed = FeedbackPayloadSchema.safeParse(item);
				if (!parsed.success) return [];
				return [
					{
						...parsed.data,
						queueVersion: Number(item.queueVersion) || QUEUE_VERSION,
						retryCount: Number(item.retryCount) || 0,
						queuedAt: Number(item.queuedAt) || parsed.data.createdAt
					}
				];
			});
		} catch {
			return [];
		}
	}

	private setQueue(queue: QueuedFeedbackItem[]) {
		if (typeof localStorage === 'undefined') return;
		localStorage.setItem(STORAGE_KEY, JSON.stringify(queue));
	}

	async flushQueue() {
		if (!this.isOnline()) return;

		const queue = this.getQueue();
		if (queue.length === 0) return;

		const remaining: QueuedFeedbackItem[] = [];

		for (const item of queue) {
			try {
				await this.sendToServer(item);
			} catch (e) {
				if (e instanceof FeedbackRequestError && e.status >= 400 && e.status < 500) {
					console.warn('Dropping invalid feedback item', item.id, e);
					continue;
				}

				remaining.push({ ...item, retryCount: item.retryCount + 1 });
			}
		}

		this.setQueue(remaining);
	}

	private async sendToServer(item: FeedbackPayload) {
		const payload = FeedbackPayloadSchema.parse(item);
		const res = await fetch('/api/feedback', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(payload)
		});

		if (!res.ok) {
			throw new FeedbackRequestError(res.status);
		}
	}

	private isOnline() {
		return typeof navigator === 'undefined' ? true : navigator.onLine;
	}

	private async registerBackgroundSync() {
		if (typeof navigator === 'undefined') return;
		if (!('serviceWorker' in navigator) || !('SyncManager' in window)) return;

		try {
			const registration = await navigator.serviceWorker.ready;
			// @ts-expect-error - SyncManager is not in all TS definitions yet
			await registration.sync.register('sync-feedback');
		} catch (e) {
			console.log('Background sync registration failed', e);
		}
	}
}

class FeedbackRequestError extends Error {
	constructor(readonly status: number) {
		super(`Server responded with ${status}`);
	}
}

export const feedbackService = FeedbackService.getInstance();
