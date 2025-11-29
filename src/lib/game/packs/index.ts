import { BASICS_PACK } from './basics';
import { GAUNTLET_PACK } from './gauntlet';

export const PACKS = [BASICS_PACK, GAUNTLET_PACK];

export function getPack(id: string) {
	return PACKS.find((p) => p.id === id);
}
