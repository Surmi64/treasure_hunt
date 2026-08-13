import { svg } from '../lib/dom.js';

/* Lucide-style stroke icons, one family, 24px grid, 1.75 stroke. */
const PATHS = {
  arrowLeft: '<path d="M19 12H5"/><path d="m12 19-7-7 7-7"/>',
  arrowRight: '<path d="M5 12h14"/><path d="m12 5 7 7-7 7"/>',
  check: '<path d="M20 6 9 17l-5-5"/>',
  x: '<path d="M18 6 6 18"/><path d="m6 6 12 12"/>',
  map: '<path d="M14.1 4.1 21 2v16l-6.9 2.1"/><path d="M9.9 6 3 4v16l6.9 2.1"/><path d="M9.9 6l4.2-1.9"/><path d="M9.9 22.1V6"/><path d="M14.1 20.1V4.1"/>',
  lamp: '<path d="M9 18h6"/><path d="M10 22h4"/><path d="M12 2a7 7 0 0 0-4 12.7V18h8v-3.3A7 7 0 0 0 12 2Z"/>',
  alert: '<circle cx="12" cy="12" r="9"/><path d="M12 8v5"/><path d="M12 16.5h.01"/>',
  clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
  flag: '<path d="M4 22V4a4 4 0 0 1 8 0 4 4 0 0 0 8 0v10a4 4 0 0 1-8 0 4 4 0 0 0-8 0"/>',
  gift: '<rect x="3" y="8" width="18" height="4" rx="1"/><path d="M12 8v13"/><path d="M19 12v7a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-7"/><path d="M7.5 8a2.5 2.5 0 1 1 0-5C10 3 12 5.5 12 8"/><path d="M16.5 8a2.5 2.5 0 1 0 0-5C14 3 12 5.5 12 8"/>',
  rotate: '<path d="M3 12a9 9 0 1 0 3-6.7L3 8"/><path d="M3 3v5h5"/>',
  download: '<path d="M12 3v12"/><path d="m7 10 5 5 5-5"/><path d="M20 17v2a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-2"/>',
  // the two brand marks, in the same stroke family as the rest rather than
  // their official filled logos — a filled glyph next to these would read as
  // a foreign object dropped onto the page
  github:
    '<path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.4 5.4 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4"/><path d="M9 18c-4.51 2-5-2-7-2"/>',
  linkedin:
    '<path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-4 0v7h-4v-7a6 6 0 0 1 6-6z"/><rect width="4" height="12" x="2" y="9"/><circle cx="4" cy="4" r="2"/>',
};

export function icon(name, className = '') {
  const body = PATHS[name];
  if (!body) throw new Error(`Unknown icon: ${name}`);
  return svg(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"
    class="${className}" aria-hidden="true" focusable="false">${body}</svg>`);
}
