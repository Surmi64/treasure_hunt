import { svg } from '../lib/dom.js';
import { doorPanel } from './doorpattern.js';

/**
 * Brand marks and flags, drawn inline so they scale, theme, and work offline.
 * The recurring shape is the cellar door: a round arch on a stone base.
 */

/** The painted cellar door itself — the splash and intro logo. */
export function logoMark(className = '') {
  return svg(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 200" fill="none"
    class="${className}" role="img" aria-label="">
    ${doorPanel({ w: 120, h: 200, sunY: 0.34, sunR: 0.2, rays: 36, hatch: 0.085, stroke: 1.1 })}
  </svg>`);
}

/** Wax-seal badge for the finish screen: the same door inside a struck ring. */
export function sealMark(className = '') {
  return svg(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 140 140" fill="none"
    class="${className}" role="img" aria-label="">
    <circle cx="70" cy="70" r="68" stroke="currentColor" stroke-width="1" opacity=".3"/>
    <circle cx="70" cy="70" r="61" stroke="currentColor" stroke-width="2.5"/>
    <circle cx="70" cy="70" r="54" stroke="currentColor" stroke-width="1" opacity=".45"
      stroke-dasharray="2 6"/>
    <g transform="translate(46 32)">
      ${doorPanel({ w: 48, h: 78, sunY: 0.34, sunR: 0.22, rays: 28, hatch: 0.11, stroke: 0.8 })}
    </g>
  </svg>`);
}

/**
 * Station number badge: the door with the number sitting inside the sun disc,
 * so the pattern reads even at 68px without fighting the digit.
 */
export function doorBadge(label, { solved = false } = {}) {
  const w = 68;
  const h = 86;
  return svg(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" fill="none"
    class="doorbadge${solved ? ' doorbadge--solved' : ''}" aria-hidden="true">
    ${doorPanel({ w, h, sunY: 0.38, sunR: 0.29, rays: 24, hatch: 0.1, stroke: 0.9 })}
    <text x="${w / 2}" y="${h * 0.38}" text-anchor="middle" dominant-baseline="central"
      font-family="Inter Variable, system-ui, sans-serif" font-size="17" font-weight="650"
      fill="currentColor">${label}</text>
  </svg>`);
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
