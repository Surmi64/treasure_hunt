import { svg } from '../lib/dom.js';
import { DOOR_VIEWBOX, SUN, doorSvg } from './door.js';

/**
 * Brand marks and flags, drawn inline so they scale, theme, and work offline.
 * The recurring shape is the painted cellar door from resources/door.svg.
 */

/** The door on its own — splash and intro logo. */
export function logoMark(className = '') {
  return doorSvg({ className });
}

/** Wax-seal badge for the finish screen: the door inside a struck ring. */
export function sealMark(className = '') {
  const ring = svg(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 140 140" fill="none"
    class="${className}" role="img" aria-label="">
    <circle cx="70" cy="70" r="68" stroke="currentColor" stroke-width="1" opacity=".3"/>
    <circle cx="70" cy="70" r="61" stroke="currentColor" stroke-width="2.5"/>
    <circle cx="70" cy="70" r="54" stroke="currentColor" stroke-width="1" opacity=".45"
      stroke-dasharray="2 6"/>
  </svg>`);

  // the door is 1:1.8, so its height is what has to fit inside the dashed ring
  const height = 92;
  const width = (height * DOOR_VIEWBOX.w) / DOOR_VIEWBOX.h;
  const door = doorSvg();
  door.setAttribute('width', String(width));
  door.setAttribute('height', String(height));
  door.setAttribute('x', String(70 - width / 2));
  door.setAttribute('y', String(70 - height / 2));
  ring.append(door);

  return ring;
}

/**
 * Station number badge: the door with the number set into its sun, inked in
 * the same colour as the painted lines so it reads as part of the artwork.
 */
export function doorBadge(label, { solved = false } = {}) {
  const number = `<text x="${SUN.x}" y="${SUN.y}" text-anchor="middle" dominant-baseline="central"
    font-family="Inter Variable, system-ui, sans-serif" font-size="56" font-weight="700"
    fill="var(--door-ink, #100c0b)">${label}</text>`;

  return doorSvg({
    className: `doorbadge${solved ? ' doorbadge--solved' : ''}`,
    extra: number,
  });
}

const FLAGS = {
  hu: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 6 4" role="img" aria-hidden="true">
    <rect width="6" height="4" fill="#fff"/>
    <rect width="6" height="1.334" fill="#ce2939"/>
    <rect y="2.666" width="6" height="1.334" fill="#477050"/>
  </svg>`,
  pl: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 6 4" role="img" aria-hidden="true">
    <rect width="6" height="4" fill="#fff"/>
    <rect y="2" width="6" height="2" fill="#dc143c"/>
  </svg>`,
  en: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 60 30" role="img" aria-hidden="true">
    <clipPath id="uj-diag"><path d="M30,15 h30 v15 z v15 h-30 z h-30 v-15 z v-15 h30 z"/></clipPath>
    <path d="M0,0 v30 h60 v-30 z" fill="#00247d"/>
    <path d="M0,0 L60,30 M60,0 L0,30" stroke="#fff" stroke-width="6"/>
    <path d="M0,0 L60,30 M60,0 L0,30" clip-path="url(#uj-diag)" stroke="#cf142b" stroke-width="4"/>
    <path d="M30,0 v30 M0,15 h60" stroke="#fff" stroke-width="10"/>
    <path d="M30,0 v30 M0,15 h60" stroke="#cf142b" stroke-width="6"/>
  </svg>`,
};

export function flag(lang, className = '') {
  const el = svg(FLAGS[lang] ?? FLAGS.hu);
  if (className) el.setAttribute('class', className);
  return el;
}
