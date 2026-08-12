import { reset } from './store.js';

/**
 * The overview map is finished but has nothing to say yet — the station dots
 * are placeholder coordinates, so it would only mislead. Kept whole rather
 * than deleted: src/screens/map.js and its route still work, they are simply
 * not reachable. Flip this to true to bring back the topbar button and the
 * #/map route in one move.
 */
export const MAP_ENABLED = false;

/** Wipe progress and drop the player back at the first station. */
export function resetAndRestart(navigate) {
  reset();
  navigate('#/s/1');
}
