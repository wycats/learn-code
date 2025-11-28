export class SoundManager {
	private ctx: AudioContext | null = null;
	private enabled = true;

	constructor() {
		if (typeof window !== 'undefined') {
			// Initialize on first user interaction usually, but we can set up the context
			// We'll lazily create it on first play to avoid autoplay policies
		}
	}

	private getContext() {
		if (!this.enabled) return null;
		if (typeof window === 'undefined') return null;

		if (!this.ctx) {
			this.ctx = new window.AudioContext();
		}
		if (this.ctx.state === 'suspended') {
			this.ctx.resume();
		}
		return this.ctx;
	}

	play(type: 'step' | 'turn' | 'win' | 'fail' | 'click' | 'delete' | 'pickup' | 'drop') {
		const ctx = this.getContext();
		if (!ctx) return;

		const osc = ctx.createOscillator();
		const gain = ctx.createGain();

		osc.connect(gain);
		gain.connect(ctx.destination);

		const now = ctx.currentTime;

		switch (type) {
			case 'step':
				// Short high blip
				osc.type = 'sine';
				osc.frequency.setValueAtTime(440, now);
				osc.frequency.exponentialRampToValueAtTime(880, now + 0.1);
				gain.gain.setValueAtTime(0.1, now);
				gain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
				osc.start(now);
				osc.stop(now + 0.1);
				break;

			case 'turn':
				// Lower swoosh
				osc.type = 'triangle';
				osc.frequency.setValueAtTime(300, now);
				osc.frequency.linearRampToValueAtTime(200, now + 0.1);
				gain.gain.setValueAtTime(0.1, now);
				gain.gain.linearRampToValueAtTime(0.01, now + 0.1);
				osc.start(now);
				osc.stop(now + 0.1);
				break;

			case 'win':
				// Major arpeggio
				this.playNote(523.25, 0, 0.1); // C5
				this.playNote(659.25, 0.1, 0.1); // E5
				this.playNote(783.99, 0.2, 0.2); // G5
				this.playNote(1046.5, 0.4, 0.4); // C6
				break;

			case 'fail':
				// Discordant low
				osc.type = 'sawtooth';
				osc.frequency.setValueAtTime(150, now);
				osc.frequency.linearRampToValueAtTime(100, now + 0.3);
				gain.gain.setValueAtTime(0.2, now);
				gain.gain.linearRampToValueAtTime(0.01, now + 0.3);
				osc.start(now);
				osc.stop(now + 0.3);
				break;

			case 'click':
				// Very short tick
				osc.type = 'square';
				osc.frequency.setValueAtTime(800, now);
				gain.gain.setValueAtTime(0.05, now);
				gain.gain.exponentialRampToValueAtTime(0.01, now + 0.03);
				osc.start(now);
				osc.stop(now + 0.03);
				break;

			case 'pickup':
				// Rising pitch
				osc.type = 'sine';
				osc.frequency.setValueAtTime(400, now);
				osc.frequency.linearRampToValueAtTime(600, now + 0.1);
				gain.gain.setValueAtTime(0.1, now);
				gain.gain.linearRampToValueAtTime(0.01, now + 0.1);
				osc.start(now);
				osc.stop(now + 0.1);
				break;

			case 'drop':
				// Falling pitch
				osc.type = 'sine';
				osc.frequency.setValueAtTime(600, now);
				osc.frequency.linearRampToValueAtTime(400, now + 0.1);
				gain.gain.setValueAtTime(0.1, now);
				gain.gain.linearRampToValueAtTime(0.01, now + 0.1);
				osc.start(now);
				osc.stop(now + 0.1);
				break;

			case 'delete':
				// Crumple noise (approximated with rapid frequency modulation)
				osc.type = 'sawtooth';
				osc.frequency.setValueAtTime(200, now);
				osc.frequency.linearRampToValueAtTime(50, now + 0.15);
				gain.gain.setValueAtTime(0.1, now);
				gain.gain.linearRampToValueAtTime(0.01, now + 0.15);
				osc.start(now);
				osc.stop(now + 0.15);
				break;
		}
	}

	private playNote(freq: number, startTime: number, duration: number) {
		const ctx = this.getContext();
		if (!ctx) return;

		const osc = ctx.createOscillator();
		const gain = ctx.createGain();

		osc.connect(gain);
		gain.connect(ctx.destination);

		const now = ctx.currentTime;
		osc.type = 'sine';
		osc.frequency.setValueAtTime(freq, now + startTime);

		gain.gain.setValueAtTime(0, now + startTime);
		gain.gain.linearRampToValueAtTime(0.1, now + startTime + 0.01);
		gain.gain.exponentialRampToValueAtTime(0.01, now + startTime + duration);

		osc.start(now + startTime);
		osc.stop(now + startTime + duration);
	}

	toggle(enabled: boolean) {
		this.enabled = enabled;
	}
}

export const soundManager = new SoundManager();
