import { z } from 'zod';

export const FeedbackSchema = z.object({
	message: z.string().min(1),
	email: z.string().email().optional().or(z.literal('')),
	timestamp: z.number(),
	id: z.string()
});

type FeedbackItem = z.infer<typeof FeedbackSchema>;

const STORAGE_KEY = 'pending_feedback';

export class FeedbackService {
	private static instance: FeedbackService;

	private constructor() {
		if (typeof window !== 'undefined') {
			window.addEventListener('online', () => this.flushQueue());
			// Try to flush on load too
			this.flushQueue();
		}
	}

	static getInstance(): FeedbackService {
		if (!FeedbackService.instance) {
			FeedbackService.instance = new FeedbackService();
		}
		return FeedbackService.instance;
	}

	async submit(message: string, email?: string) {
		const item: FeedbackItem = {
			id: crypto.randomUUID(),
			message,
			email,
			timestamp: Date.now()
		};

		if (navigator.onLine) {
			try {
				await this.sendToServer(item);
				return;
			} catch (e) {
				console.warn('Feedback submission failed, queuing...', e);
			}
		}

		// Queue it
		this.enqueue(item);

		// Register Background Sync if available
		if ('serviceWorker' in navigator && 'SyncManager' in window) {
			const registration = await navigator.serviceWorker.ready;
			try {
				// @ts-expect-error - SyncManager is not in all TS definitions yet
				await registration.sync.register('sync-feedback');
			} catch (e) {
				console.log('Background sync registration failed', e);
			}
		}
	}

	private enqueue(item: FeedbackItem) {
		const queue = this.getQueue();
		queue.push(item);
		localStorage.setItem(STORAGE_KEY, JSON.stringify(queue));
	}

	private getQueue(): FeedbackItem[] {
		try {
			const stored = localStorage.getItem(STORAGE_KEY);
			return stored ? JSON.parse(stored) : [];
		} catch {
			return [];
		}
	}

	async flushQueue() {
		if (!navigator.onLine) return;

		const queue = this.getQueue();
		if (queue.length === 0) return;

		console.log(`Flushing ${queue.length} feedback items...`);

		const remaining: FeedbackItem[] = [];

		for (const item of queue) {
			try {
				await this.sendToServer(item);
			} catch (e) {
				console.error('Failed to sync feedback item', item.id, e);
				// If it's a server error (5xx), keep it. If 4xx, maybe drop it?
				// For now, we keep it to be safe, but we should have a retry limit in a real app.
				remaining.push(item);
			}
		}

		localStorage.setItem(STORAGE_KEY, JSON.stringify(remaining));
	}

	private async sendToServer(item: FeedbackItem) {
		const res = await fetch('/api/feedback', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(item)
		});

		if (!res.ok) {
			throw new Error(`Server responded with ${res.status}`);
		}
	}
}

export const feedbackService = FeedbackService.getInstance();
