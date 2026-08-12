import { stations } from 'virtual:content';
import { h, svg } from '../lib/dom.js';
import { t } from '../lib/i18n.js';
import { firstUnsolved, state } from '../lib/store.js';
import { icon } from '../ui/icons.js';

const W = 400;
const H = 300;

/* The road: one cubic bezier from the car park up along the hillside. */
const ROAD = [
  { x: 18, y: 268 },
  { x: 150, y: 258 },
  { x: 235, y: 110 },
  { x: 388, y: 52 },
];

const CELLAR_COUNT = 82;

function bezier(p, t) {
  const u = 1 - t;
  const a = u * u * u;
  const b = 3 * u * u * t;
  const c = 3 * u * t * t;
  const d = t * t * t;
  return {
    x: a * p[0].x + b * p[1].x + c * p[2].x + d * p[3].x,
    y: a * p[0].y + b * p[1].y + c * p[2].y + d * p[3].y,
  };
}

function tangent(p, t) {
  const u = 1 - t;
  const x =
    3 * u * u * (p[1].x - p[0].x) + 6 * u * t * (p[2].x - p[1].x) + 3 * t * t * (p[3].x - p[2].x);
  const y =
    3 * u * u * (p[1].y - p[0].y) + 6 * u * t * (p[2].y - p[1].y) + 3 * t * t * (p[3].y - p[2].y);
  const len = Math.hypot(x, y) || 1;
  return { x: x / len, y: y / len };
}

/** A tiny arched cellar door, rotated to sit square on the hillside. */
function cellarGlyph(t) {
  const point = bezier(ROAD, t);
  const tan = tangent(ROAD, t);
  // normal pointing up-hill (left of travel direction)
  const nx = tan.y;
  const ny = -tan.x;
  const offset = 11;
  const cx = point.x + nx * offset;
  const cy = point.y + ny * offset;
  const angle = (Math.atan2(ny, nx) * 180) / Math.PI + 90;
  return `<g transform="translate(${cx.toFixed(1)} ${cy.toFixed(1)}) rotate(${angle.toFixed(1)})">
    <path d="M-2.6 3 V-0.4 a2.6 2.6 0 0 1 5.2 0 V3 Z" fill="rgba(232,205,139,.16)"
      stroke="rgba(232,205,139,.3)" stroke-width=".5"/>
  </g>`;
}

function roadPath() {
  const [a, b, c, d] = ROAD;
  return `M${a.x} ${a.y} C${b.x} ${b.y} ${c.x} ${c.y} ${d.x} ${d.y}`;
}

export function mapScreen(navigate) {
  const nextIndex = firstUnsolved();

  const cellars = Array.from({ length: CELLAR_COUNT }, (_, i) =>
    cellarGlyph(i / (CELLAR_COUNT - 1))
  ).join('');

  const pins = stations
    .map((station, index) => {
      const cx = (station.map.x / 100) * W;
      const cy = (station.map.y / 100) * H;
      const solved = state.solved[index];
      const isNext = index === nextIndex && !solved;
      const fill = solved ? '#7fae6a' : isNext ? '#e8cd8b' : 'rgba(201,162,76,.35)';
      const stroke = solved ? '#7fae6a' : '#c9a24c';

      return `<g>
        ${isNext ? `<circle class="pin__halo" cx="${cx}" cy="${cy}" r="9" fill="#e8cd8b"/>` : ''}
        <circle cx="${cx}" cy="${cy}" r="9" fill="${fill}" stroke="${stroke}" stroke-width="1.5"/>
        <text x="${cx}" y="${cy + 3.6}" text-anchor="middle"
          font-family="Inter Variable, system-ui, sans-serif" font-size="10" font-weight="600"
          fill="${solved || isNext ? '#12100c' : '#e8cd8b'}">${index + 1}</text>
      </g>`;
    })
    .join('');

  const map = svg(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}"
    class="mapview__svg" role="img" aria-label="${t('mapTitle')}">
    <defs>
      <linearGradient id="hill" x1="0" y1="1" x2="0.3" y2="0">
        <stop offset="0" stop-color="#241a16" stop-opacity=".9"/>
        <stop offset="1" stop-color="#100c0b" stop-opacity="0"/>
      </linearGradient>
    </defs>
    <path d="M0 300 L0 200 C 120 190 200 60 400 20 L400 300 Z" fill="url(#hill)"/>
    <path d="${roadPath()}" stroke="rgba(232,205,139,.22)" stroke-width="9"
      stroke-linecap="round" fill="none"/>
    <path d="${roadPath()}" stroke="rgba(232,205,139,.35)" stroke-width="1"
      stroke-dasharray="4 7" stroke-linecap="round" fill="none"/>
    ${cellars}
    ${pins}
  </svg>`);

  return h(
    'section.view.mapview',
    h(
      'header.topbar',
      h(
        'button.iconbtn',
        { type: 'button', 'aria-label': t('close'), onclick: () => history.back() },
        icon('arrowLeft')
      ),
      h('span.topbar__title', t('mapTitle')),
      h('span', { style: 'width:44px' })
    ),

    h('div.mapview__frame', map),
    h('p.muted', { style: 'margin-top: var(--s4)' }, t('mapLegend')),

    h(
      'button.btn.btn--secondary.btn--block',
      {
        type: 'button',
        style: 'margin-top: var(--s5)',
        onclick: () => navigate(`#/s/${state.current + 1}`),
      },
      t('backToStation')
    )
  );
}
