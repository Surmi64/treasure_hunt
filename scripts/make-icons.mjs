/**
 * Renders the favicon and the PWA icons from src/ui/door.svg — the same
 * artwork the app draws — so the tab icon and the splash logo cannot drift.
 *
 *   npm run icons
 *
 * Rasterises with headless Chromium rather than ImageMagick: without a
 * librsvg delegate, ImageMagick's built-in SVG renderer silently drops
 * stroked paths, which is most of this artwork.
 *
 * Only has to be re-run when the artwork changes; the output is committed.
 */
import { execFileSync } from 'node:child_process';
import { mkdirSync, readFileSync, writeFileSync, rmSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const outDir = resolve(root, 'public/icons');
mkdirSync(outDir, { recursive: true });

const BG = '#100c0b';
const GOLD = '#c9a24c';

const door = readFileSync(resolve(root, 'src/ui/door.svg'), 'utf8')
  .replaceAll('currentColor', GOLD)
  .replace(/var\(--door-ink,\s*#100c0b\)/g, BG);

/** The door is 1:1.8, so it is the height that has to fit the square. */
function page(size, inset) {
  return `<!doctype html><meta charset="utf-8">
    <style>
      html,body{margin:0;padding:0;background:${BG}}
      body{width:${size}px;height:${size}px;display:grid;place-items:center}
      svg{height:${size * (1 - inset)}px;width:auto;display:block}
    </style>${door}`;
}

const variants = [
  { name: 'icon-192.png', size: 192, inset: 0.12 },
  { name: 'icon-512.png', size: 512, inset: 0.12 },
  // maskable icons get cropped to a circle by Android, so pull the mark in
  { name: 'icon-maskable-512.png', size: 512, inset: 0.34 },
];

const browser = (() => {
  for (const candidate of ['chromium', 'chromium-browser', 'google-chrome']) {
    try {
      execFileSync(candidate, ['--version'], { stdio: 'ignore' });
      return candidate;
    } catch {
      /* try the next one */
    }
  }
  throw new Error('No Chromium/Chrome on PATH — needed to rasterise the icons.');
})();

/**
 * Snap-packaged Chromium cannot read or write outside $HOME, so the scratch
 * files live next to the output rather than in /tmp.
 */
function rasterise(markup, size, outPath) {
  const tmp = resolve(outDir, '.icon-tmp.html');
  writeFileSync(tmp, markup);
  execFileSync(browser, [
    '--headless',
    '--disable-gpu',
    '--hide-scrollbars',
    `--window-size=${size},${size}`,
    `--screenshot=${outPath}`,
    '--virtual-time-budget=2000',
    tmp,
  ], { stdio: 'ignore' });
  rmSync(tmp);
}

for (const { name, size, inset } of variants) {
  rasterise(page(size, inset), size, resolve(outDir, name));
  console.log(`wrote public/icons/${name}`);
}

/**
 * The favicon is a separate, simplified drawing. Browsers render it
 * at 16px, where rays and hatching collapse into a smudge; only the silhouette
 * survives. So: the arch, the sun, and eight stubby rays.
 */
const favicon = (() => {
  const cx = 256;
  const cy = 224;
  const rays = Array.from({ length: 8 }, (_, i) => {
    const a = (i / 8) * Math.PI * 2 - Math.PI / 2;
    const x1 = (cx + Math.cos(a) * 96).toFixed(0);
    const y1 = (cy + Math.sin(a) * 96).toFixed(0);
    const x2 = (cx + Math.cos(a) * 150).toFixed(0);
    const y2 = (cy + Math.sin(a) * 150).toFixed(0);
    return `<path d="M${x1} ${y1} L${x2} ${y2}"/>`;
  }).join('');

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
  <rect width="512" height="512" rx="104" fill="${BG}"/>
  <g stroke="${GOLD}" stroke-width="30" fill="none" stroke-linecap="round">
    <path d="M96 448V216a160 160 0 0 1 320 0v232"/>
    ${rays}
  </g>
  <circle cx="${cx}" cy="${cy}" r="66" fill="${GOLD}"/>
</svg>`;
})();

writeFileSync(resolve(root, 'public/favicon.svg'), `${favicon}\n`);
console.log('wrote public/favicon.svg');
