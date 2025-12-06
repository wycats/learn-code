import { browser } from '$app/environment';

type Theme = 'light' | 'dark' | 'system';

class ThemeStore {
	current = $state<Theme>('system');

	constructor() {
		if (browser) {
			const stored = localStorage.getItem('theme') as Theme;
			if (stored && ['light', 'dark', 'system'].includes(stored)) {
				this.current = stored;
			}
			this.apply();
		}
	}

	set(theme: Theme) {
		this.current = theme;
		if (browser) {
			localStorage.setItem('theme', theme);
			this.apply();
		}
	}

	toggle() {
		const systemIsDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

		if (this.current === 'system') {
			this.set(systemIsDark ? 'light' : 'dark');
		} else if (this.current === 'light') {
			this.set(systemIsDark ? 'dark' : 'system');
		} else {
			this.set(systemIsDark ? 'system' : 'light');
		}
	}

	apply() {
		if (!browser) return;
		const root = document.documentElement;

		if (this.current === 'system') {
			root.removeAttribute('data-theme');
		} else {
			root.setAttribute('data-theme', this.current);
		}
	}
}

export const theme = new ThemeStore();
