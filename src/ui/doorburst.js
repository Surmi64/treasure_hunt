import { h } from '../lib/dom.js';
import { DOOR_VIEWBOX, doorSvg } from './door.js';
import { hajnalhozoMark } from './brand.js';

/**
 * The payoff for the seventh answer: the cellar door swings open outward,
 * the camera goes through it, and the Hajnalhozó mark is what is behind.
 *
 * The two wings are the one door artwork drawn twice, each clipped to its own
 * half by an overflow:hidden wrapper — so the leaf edges line up exactly and
 * the halves can never drift apart when the artwork is redrawn.
 *
 * Everything is CSS keyframes with fixed delays; this module only mounts the
 * markup, waits, and cleans up. Tapping skips straight to the end, and
 * prefers-reduced-motion skips the whole thing.
 */

/** When the mark has settled and the overlay is just holding. Must match the
 *  tail of the timeline in components.css. */
const TOTAL_MS = 2900;

/** How long the fade-out takes once dismiss() is called. */
const LEAVE_MS = 350;

/**
 * One wing: the full artwork at the frame's full width, shown through a
 * half-width window. CSS pins the art to the window's outer edge, so the left
 * wing shows the left half of the door and the right wing the right half.
 */
function wing(side) {
  return h(`div.doorburst__wing.doorburst__wing--${side}`, doorSvg({ className: 'doorburst__art' }));
}

/**
 * Plays the animation over the whole screen.
 *
 * The overlay does NOT take itself down. It resolves while still fully opaque
 * and waits to be dismissed, so the caller can put the next screen underneath
 * first — otherwise the fade-out uncovers the station the visitor just left and
 * it flashes back into view for a moment before the route changes.
 *
 * @returns {{ finished: Promise<void>, dismiss: () => void }}
 *   `finished` resolves once the mark has settled (or on a tap to skip);
 *   `dismiss` fades the overlay out and removes it.
 */
export function playDoorOpening() {
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduced) return { finished: Promise.resolve(), dismiss: () => {} };

  const overlay = h(
    'div.doorburst',
    { role: 'presentation', style: `--door-ratio: ${DOOR_VIEWBOX.w / DOOR_VIEWBOX.h}` },
    h(
      'div.doorburst__stage',
      h(
        'div.doorburst__frame',
        // what is behind the door, revealed as the wings swing away
        h('div.doorburst__opening'),
        wing('l'),
        wing('r')
      )
    ),
    h('div.doorburst__logo', hajnalhozoMark('doorburst__logo-mark'))
  );

  document.body.append(overlay);

  let settled = false;
  let timer;

  const finished = new Promise((resolve) => {
    const finish = () => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      overlay.removeEventListener('pointerdown', finish);
      window.removeEventListener('keydown', finish);
      resolve();
    };

    timer = setTimeout(finish, TOTAL_MS);
    // impatience is a feature, not a bug — any tap or key ends it
    overlay.addEventListener('pointerdown', finish);
    window.addEventListener('keydown', finish);
  });

  let dismissed = false;
  function dismiss() {
    if (dismissed) return;
    dismissed = true;
    // the fade also buys the time the router needs: changing the hash renders
    // the next screen in a later task, and by the time this is transparent it
    // is already on the page
    overlay.classList.add('doorburst--leaving');
    setTimeout(() => overlay.remove(), LEAVE_MS);
  }

  return { finished, dismiss };
}
