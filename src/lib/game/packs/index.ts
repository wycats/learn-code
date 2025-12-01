import { BASICS_PACK } from './basics';
import { GAUNTLET_PACK } from './gauntlet';
import { HARD_PACK } from './hard';

export const PACKS = [BASICS_PACK, GAUNTLET_PACK, HARD_PACK];

export function getPack(id: string) {
	return PACKS.find((p) => p.id === id);
}
