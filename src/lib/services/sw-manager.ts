import { dev } from '$app/environment';

export class ServiceWorkerManager {
	private static instance: ServiceWorkerManager;

	private constructor() {
		if (typeof window !== 'undefined') {
			this.init();
		}
	}

	static getInstance(): ServiceWorkerManager {
		if (!ServiceWorkerManager.instance) {
			ServiceWorkerManager.instance = new ServiceWorkerManager();
		}
		return ServiceWorkerManager.instance;
	}

	private async init() {
		// 1. Check for Kill Switch (Server-side)
		try {
			const res = await fetch('/api/system/status');
			if (res.ok) {
				const status = await res.json();
				if (status.killSw) {
					await this.kill();
					return;
				}
			}
		} catch (e) {
			console.warn('Failed to check system status', e);
		}

		// 2. Check for Kill Switch (Client-side override)
		if (this.shouldKill()) {
			await this.kill();
			return;
		}

		// 3. Register SW (only in production or if forced)
		if (!dev && 'serviceWorker' in navigator) {
			try {
				const registration = await navigator.serviceWorker.register('/service-worker.js');
				console.log('SW registered:', registration);

				// Handle updates
				registration.addEventListener('updatefound', () => {
					const newWorker = registration.installing;
					if (newWorker) {
						newWorker.addEventListener('statechange', () => {
							if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
								// New content is available; please refresh.
								console.log('New content available, please refresh.');
								// Optional: Show a toast to the user
							}
						});
					}
				});

				// Periodic update check (every hour)
				setInterval(
					() => {
						registration.update();
					},
					60 * 60 * 1000
				);
			} catch (error) {
				console.error('SW registration failed:', error);
			}
		}
	}

	private shouldKill(): boolean {
		if (typeof window === 'undefined') return false;
		const urlParams = new URLSearchParams(window.location.search);
		return urlParams.has('kill-sw') || localStorage.getItem('SW_KILL_SWITCH') === 'true';
	}

	async kill() {
		if (typeof window === 'undefined' || !('serviceWorker' in navigator)) return;

		console.warn('🚨 KILL SWITCH ACTIVATED: Unregistering Service Worker...');

		const registrations = await navigator.serviceWorker.getRegistrations();
		for (const registration of registrations) {
			await registration.unregister();
		}

		// Clear caches
		if ('caches' in window) {
			const keys = await caches.keys();
			for (const key of keys) {
				await caches.delete(key);
			}
		}

		// Clear flag if it was a URL param, but keep if it was localStorage (persistent kill)
		const urlParams = new URLSearchParams(window.location.search);
		if (urlParams.has('kill-sw')) {
			// Remove param from URL without reload (yet)
			const newUrl = window.location.pathname;
			window.history.replaceState({}, '', newUrl);
		}

		console.log('SW Killed. Reloading...');
		window.location.reload();
	}
}

export const swManager = ServiceWorkerManager.getInstance();
