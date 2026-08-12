import { svg } from '../lib/dom.js';

/**
 * The Hajnalhozó mark, revealed behind the door on the finish animation.
 *
 * PLACEHOLDER: two letters in a struck ring, drawn in the game's own display
 * face so it sits in the same world as the rest of the artwork. Replace the
 * <svg> below with the real logo when it exists — this is the only place it
 * is drawn, and doorburst.js only ever asks for "the mark", never for letters.
 */
export function hajnalhozoMark(className = '') {
  return svg(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200"
    class="${className}" role="img" aria-label="Hajnalhozó">
    <circle cx="100" cy="100" r="94" fill="none" stroke="currentColor"
      stroke-width="1.5" opacity=".35"/>
    <circle cx="100" cy="100" r="84" fill="none" stroke="currentColor" stroke-width="3"/>
    <text x="100" y="104" text-anchor="middle" dominant-baseline="central"
      font-family="Cormorant Garamond Variable, Cormorant Garamond, Georgia, serif"
      font-size="86" font-weight="600" letter-spacing="2" fill="currentColor">HH</text>
  </svg>`);
}
