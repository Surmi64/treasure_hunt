import { reset } from './store.js';

/** Wipe progress and drop the player back at the first station. */
export function resetAndRestart(navigate) {
  reset();
  navigate('#/s/1');
}
