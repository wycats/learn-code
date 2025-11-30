import { json } from '@sveltejs/kit';
import { env } from '$env/dynamic/private';

export function GET() {
	// In a real app, this might come from a database or a feature flag service (LaunchDarkly, etc.)
	// For now, we'll use an environment variable.
	const killSw = env.KILL_SW === 'true';
	
	return json({
		killSw,
		version: process.env.npm_package_version || '0.0.0'
	});
}
