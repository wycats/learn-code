import lz from 'lz-string';
import QRCode from 'qrcode';
import type { LevelDefinition } from '$lib/game/schema';

export class ShareService {
	/**
	 * Compresses a level definition into a URL-safe string.
	 */
	static compressLevel(level: LevelDefinition): string {
		const json = JSON.stringify(level);
		return lz.compressToEncodedURIComponent(json);
	}

	/**
	 * Decompresses a level definition from a URL-safe string.
	 */
	static decompressLevel(compressed: string): LevelDefinition | null {
		try {
			const json = lz.decompressFromEncodedURIComponent(compressed);
			if (!json) return null;
			return JSON.parse(json);
		} catch (e) {
			console.error('Failed to decompress level:', e);
			return null;
		}
	}

	/**
	 * Generates a QR code Data URL from a string (e.g., a URL).
	 */
	static async generateQRCode(data: string): Promise<string> {
		try {
			return await QRCode.toDataURL(data, {
				errorCorrectionLevel: 'M',
				margin: 2,
				scale: 8,
				color: {
					dark: '#000000',
					light: '#ffffff'
				}
			});
		} catch (e) {
			console.error('Failed to generate QR code:', e);
			throw e;
		}
	}

	/**
	 * Generates a shareable URL for a level.
	 */
	static getShareUrl(level: LevelDefinition): string {
		const compressed = this.compressLevel(level);
		const origin = window.location.origin;
		return `${origin}/play?level=${compressed}`;
	}
}
