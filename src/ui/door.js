import doorSource from './door.svg?raw';

export { DOOR_VIEWBOX } from './door.meta.js';

/**
 * The painted cellar door, straight from the artwork in resources/door.svg
 * (cleaned up by scripts/clean-door.mjs). Inlined into the bundle rather than
 * fetched, so it is there on first paint and offline.
 *
 * The panel is `currentColor`, so CSS drives it: gold normally, green once a
 * station is solved. The lines are the page background, so they read as gaps
 * cut out of the panel — the way the door is actually painted.
 */

/**
 * Sun centre and radius, measured off the artwork, in the artwork's own user
 * units. Independent of the viewBox, so refitting the frame does not move it.
 */
export const SUN = { x: 94.5, y: 170, r: 41 };

let instance = 0;

/**
 * @param {object} [options]
 * @param {string} [options.className]
 * @param {string} [options.extra] markup appended inside the <svg>
 */
export function doorSvg({ className = '', extra = '' } = {}) {
  // the artwork uses clip paths; ids must not collide when two doors are on
  // the page at once
  const prefix = `d${instance++}`;
  const source = doorSource
    .replace(/id="(clipPath|path)([\w-]*)"/g, `id="${prefix}-$1$2"`)
    .replace(/url\(#(clipPath[\w-]*)\)/g, `url(#${prefix}-$1)`);

  const withExtra = extra ? source.replace('</svg>', `${extra}</svg>`) : source;

  const doc = new DOMParser().parseFromString(withExtra, 'image/svg+xml');
  const el = document.importNode(doc.documentElement, true);
  if (className) el.setAttribute('class', className);
  el.setAttribute('aria-hidden', 'true');
  el.setAttribute('focusable', 'false');
  return el;
}
