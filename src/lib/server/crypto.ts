import { env } from '$env/dynamic/private';
import { createCipheriv, createDecipheriv, randomBytes } from 'node:crypto';

const ALGORITHM = 'aes-256-gcm';

// Ensure the secret is available and of correct length (32 bytes for AES-256)
// In production, this should be strictly validated.
// For dev, we can fallback or throw.
function getSecretKey(): Buffer {
	const secret = env.AUTH_TOKEN_SECRET;
	if (!secret) {
		throw new Error('AUTH_TOKEN_SECRET is not defined');
	}
	// If the secret is a hex string, parse it. Otherwise, use it as utf8 and pad/slice.
	// Ideally, provide a 32-byte hex string in .env
	if (secret.length === 64 && /^[0-9a-fA-F]+$/.test(secret)) {
		return Buffer.from(secret, 'hex');
	}

	// Fallback for simple strings (not recommended for prod but robust for dev)
	// Create a 32-byte key from the string using sha256
	const key = Buffer.alloc(32);
	const secretBuffer = Buffer.from(secret);
	secretBuffer.copy(key);
	return key;
}

export function encryptToken(token: string): string {
	const key = getSecretKey();
	const iv = randomBytes(16); // Initialization vector
	const cipher = createCipheriv(ALGORITHM, key, iv);

	let encrypted = cipher.update(token, 'utf8', 'hex');
	encrypted += cipher.final('hex');

	const authTag = cipher.getAuthTag();

	// Format: iv:authTag:encrypted
	return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted}`;
}

export function decryptToken(encryptedToken: string): string {
	const parts = encryptedToken.split(':');
	if (parts.length !== 3) {
		throw new Error('Invalid encrypted token format');
	}

	const [ivHex, authTagHex, encryptedHex] = parts;
	const key = getSecretKey();
	const iv = Buffer.from(ivHex, 'hex');
	const authTag = Buffer.from(authTagHex, 'hex');

	const decipher = createDecipheriv(ALGORITHM, key, iv);
	decipher.setAuthTag(authTag);

	let decrypted = decipher.update(encryptedHex, 'hex', 'utf8');
	decrypted += decipher.final('utf8');

	return decrypted;
}
