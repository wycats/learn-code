import { PACKS } from '../src/lib/game/packs/index.ts';

console.log('Validating packs...');
try {
	console.log(`Found ${PACKS.length} packs.`);
	PACKS.forEach((pack) => {
		console.log(`Pack ${pack.id} is valid.`);
	});
	console.log('All packs valid.');
} catch (e) {
	console.error('Validation failed:', e);
	process.exit(1);
}
