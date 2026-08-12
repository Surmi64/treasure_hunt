import { svg } from '../lib/dom.js';

/**
 * Brand marks and flags, drawn inline so they scale, theme, and work offline.
 * The recurring shape is the cellar door: a round arch on a stone base.
 */

export function logoMark(className = '') {
  return svg(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 96 120" fill="none"
    class="${className}" role="img" aria-label="">
    <path d="M8 118V50a40 40 0 0 1 80 0v68" stroke="currentColor" stroke-width="2.5" opacity=".55"/>
    <path d="M20 118V50a28 28 0 0 1 56 0v68" stroke="currentColor" stroke-width="1.5" opacity=".35"/>
    <path d="M48 118V50" stroke="currentColor" stroke-width="1.2" opacity=".25"/>
    <path d="M48 22v14" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/>
    <path d="M48 4 54 16 48 22 42 16Z" fill="currentColor"/>
    <circle cx="48" cy="74" r="13" stroke="currentColor" stroke-width="2"/>
    <path d="M48 61v26M35 74h26" stroke="currentColor" stroke-width="1" opacity=".5"/>
  </svg>`);
}

/** Wax-seal style badge for the finish screen. */
export function sealMark(className = '') {
  return svg(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120" fill="none"
    class="${className}" role="img" aria-label="">
    <circle cx="60" cy="60" r="52" stroke="currentColor" stroke-width="1" opacity=".3"/>
    <circle cx="60" cy="60" r="45" stroke="currentColor" stroke-width="2.5"/>
    <circle cx="60" cy="60" r="38" stroke="currentColor" stroke-width="1" opacity=".45" stroke-dasharray="2 6"/>
    <path d="M40 96V58a20 20 0 0 1 40 0v38" stroke="currentColor" stroke-width="2.5"/>
    <path d="M60 44v14" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
    <path d="M60 30 66 41 60 47 54 41Z" fill="currentColor"/>
    <path d="M52 74h16M60 66v16" stroke="currentColor" stroke-width="1.4" opacity=".6"/>
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
