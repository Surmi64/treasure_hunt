/**
 * The cellar-door sunburst.
 *
 * Painted-door motif found on the row: a sun disc, straight rays fanning out
 * to the arch, and two hatched hillsides meeting in a ridge below it. The
 * reference is black lines on yellow; here it is gold lines on cellar dark,
 * which keeps the geometry and inverts the value so it sits in the theme.
 *
 * Everything is generated rather than hand-drawn so one shape serves the
 * splash logo, the finish seal and the little station badge at any size.
 */

let uid = 0;

/**
 * @param {object} options
 * @param {number} options.w      panel width in user units
 * @param {number} options.h      panel height
 * @param {number} [options.sunY] sun centre as a fraction of height
 * @param {number} [options.sunR] sun radius as a fraction of width
 * @param {number} [options.rays] number of rays around the full circle
 * @param {number} [options.hatch] gap between hillside hatch lines
 * @param {number} [options.stroke] line width
 * @param {boolean} [options.frame] draw the arch outline
 * @param {string} [options.color] line colour. Defaults to `currentColor` so
 *   CSS drives it in the app; pass a literal hex for standalone files, since
 *   `currentColor` resolves to black in favicons and in ImageMagick.
 */
export function doorPanel({
  w,
  h,
  sunY = 0.36,
  sunR = 0.2,
  rays = 32,
  hatch = 0.09,
  stroke = 1,
  frame = true,
  color = 'currentColor',
} = {}) {
  const id = `door${uid++}`;
  const R = w / 2; // arch radius — the arch springs at y = R
  const cx = w / 2;
  const cy = h * sunY;
  const sun = w * sunR;
  const gap = w * hatch;

  // arch outline: straight sides, semicircular head
  const archPath = `M0 ${h} V${R} A${R} ${R} 0 0 1 ${w} ${R} V${h} Z`;

  // ridge line: a shallow Λ under the sun, apex on the centre line
  const apexY = cy + sun + (h - cy - sun) * 0.28;
  const leftY = h * 0.86;
  const rightY = h * 0.78;
  const ridge = `M0 ${leftY} L${cx} ${apexY} L${w} ${rightY}`;

  const skyClip = `M0 0 H${w} V${rightY} L${cx} ${apexY} L0 ${leftY} Z`;
  const leftClip = `M0 ${leftY} L${cx} ${apexY} L${cx} ${h} L0 ${h} Z`;
  const rightClip = `M${cx} ${apexY} L${w} ${rightY} L${w} ${h} L${cx} ${h} Z`;

  return `
  <defs>
    <clipPath id="${id}-arch"><path d="${archPath}"/></clipPath>
    <clipPath id="${id}-sky"><path d="${skyClip}"/></clipPath>
    <clipPath id="${id}-left"><path d="${leftClip}"/></clipPath>
    <clipPath id="${id}-right"><path d="${rightClip}"/></clipPath>
    <linearGradient id="${id}-fill" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#2a1d16"/>
      <stop offset="1" stop-color="#150f0d"/>
    </linearGradient>
  </defs>

  <g clip-path="url(#${id}-arch)">
    <path d="${archPath}" fill="url(#${id}-fill)"/>

    <g stroke="${color}" stroke-width="${stroke}" fill="none" stroke-linecap="butt">
      <g clip-path="url(#${id}-sky)" opacity=".85">
        ${rayLines(cx, cy, sun, Math.hypot(w, h), rays)}
      </g>
      <g clip-path="url(#${id}-left)" opacity=".7">
        ${hatchLines({ x: 0, y: leftY }, { x: cx, y: apexY }, w, h, gap)}
      </g>
      <g clip-path="url(#${id}-right)" opacity=".7">
        ${hatchLines({ x: cx, y: apexY }, { x: w, y: rightY }, w, h, gap)}
      </g>
      <path d="${ridge}" stroke-width="${stroke * 1.6}"/>
    </g>

    <circle cx="${cx}" cy="${cy}" r="${sun}" fill="url(#${id}-fill)"
      stroke="${color}" stroke-width="${stroke * 1.6}"/>
  </g>

  ${frame ? `<path d="${archPath}" fill="none" stroke="${color}" stroke-width="${stroke * 2}"/>` : ''}`;
}

/** Straight rays from the edge of the sun out past the panel bounds. */
function rayLines(cx, cy, from, to, count) {
  let out = '';
  for (let i = 0; i < count; i++) {
    const a = (i / count) * Math.PI * 2 - Math.PI / 2;
    const x1 = cx + Math.cos(a) * from;
    const y1 = cy + Math.sin(a) * from;
    const x2 = cx + Math.cos(a) * to;
    const y2 = cy + Math.sin(a) * to;
    out += `<path d="M${x1.toFixed(1)} ${y1.toFixed(1)} L${x2.toFixed(1)} ${y2.toFixed(1)}"/>`;
  }
  return out;
}

/**
 * Hatch a hillside with lines running parallel to its own ridge arm — the
 * thing that makes the reference read as a slope rather than as a chevron.
 * Lines are stepped along the ridge normal and clipped by the caller.
 */
function hatchLines(a, b, w, h, gap) {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const len = Math.hypot(dx, dy) || 1;
  const ux = dx / len;
  const uy = dy / len;
  // unit normal, pointing downhill into the panel
  const nx = -uy;
  const ny = ux;

  const reach = w + h;
  const steps = Math.ceil(reach / gap);
  let out = '';

  for (let k = -steps; k <= steps; k++) {
    const ox = a.x + nx * k * gap;
    const oy = a.y + ny * k * gap;
    const x1 = (ox - ux * reach).toFixed(1);
    const y1 = (oy - uy * reach).toFixed(1);
    const x2 = (ox + ux * reach).toFixed(1);
    const y2 = (oy + uy * reach).toFixed(1);
    out += `<path d="M${x1} ${y1} L${x2} ${y2}"/>`;
  }
  return out;
}
