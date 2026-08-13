/* global __CHEAT__ */
import { stations } from 'virtual:content';
import { normalizeAnswer } from '../../shared/normalize.js';
import { markSolved, reset } from './store.js';
import { playDoorOpening } from '../ui/doorburst.js';

/**
 * A way to walk the whole game without knowing seven answers, so the row can
 * be re-tested after every content change.
 *
 * `__CHEAT__` is a compile-time constant (see vite.config.js). In a release
 * build it is `false`, every guard below folds to a dead branch, and the
 * minifier removes this module's payload — including CODE. Do not turn any of
 * these checks into a runtime flag, or the code word ships to visitors.
 *
 * Two ways in:
 *   · type the code word into any station's answer field — it counts as correct
 *   · the URLs below
 *
 *     #/cheat       solve all seven, jump to the finish screen
 *     #/cheat/4     solve the first three, land on station 4's riddle
 *     #/cheat/door  replay the door-opening animation on its own
 *     #/reset       wipe progress and start over from the language picker
 */

const CODE = 'szezamtarulj';

export const cheatEnabled = __CHEAT__;

/** True when the visitor typed the master answer instead of a real one. */
export function isCheatCode(input) {
  return __CHEAT__ && normalizeAnswer(input) === CODE;
}

/**
 * Handles #/cheat and #/reset.
 *
 * @param {string} hash location.hash
 * @returns {string|null} the hash to redirect to, or null if this is not ours
 */
export function cheatRedirect(hash) {
  if (!__CHEAT__) return null;

  const [head, arg] = hash.replace(/^#\/?/, '').split('/');

  if (head === 'reset') {
    reset();
    return '#/lang';
  }
  if (head !== 'cheat') return null;

  if (arg === 'door') {
    // the finish screen renders underneath while the overlay plays over it,
    // which is exactly what the seventh answer produces
    solveFirst(stations.length);
    const door = playDoorOpening();
    door.finished.then(door.dismiss);
    return '#/done';
  }

  const n = Number.parseInt(arg, 10);
  if (Number.isNaN(n)) {
    solveFirst(stations.length);
    return '#/done';
  }

  const target = Math.max(1, Math.min(stations.length, n));
  solveFirst(target - 1);
  return `#/s/${target}/q`;
}

/**
 * Leaves exactly the first `count` stations solved — the ones after it are
 * cleared too, so #/cheat/2 means the same thing whether or not the run was
 * already finished.
 */
function solveFirst(count) {
  reset(); // keeps the chosen language and track
  for (let i = 0; i < count; i++) markSolved(i);
}
