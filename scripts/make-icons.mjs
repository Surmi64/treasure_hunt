/**
 * Renders the PWA icons from inline SVG using ImageMagick.
 *   npm run icons
 *
 * Needs `magick` (ImageMagick 7) or `convert` (v6) on PATH. Only has to be
 * re-run when the mark changes, the generated PNGs are committed.
 */
import { execFileSync } from 'node:child_process';
import { mkdirSync, writeFileSync, rmSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const outDir = resolve(root, 'public/icons');
mkdirSync(outDir, { recursive: true });

const mark = (scale) => `
  <g transform="translate(256 256) scale(${scale}) translate(-256 -256)"
     stroke="#c9a24c" fill="none" stroke-width="20" stroke-linecap="round">
    <path d="M110 430V246a146 146 0 0 1 292 0v184"/>
    <path d="M256 130v56"/>
  </g>
  <g transform="translate(256 256) scale(${scale}) translate(-256 -256)">
    <path d="M256 54 292 118 256 154 220 118Z" fill="#e8cd8b"/>
    <circle cx="256" cy="310" r="54" stroke="#e8cd8b" stroke-width="14" fill="none"/>
    <path d="M256 256v108M202 310h108" stroke="#c9a24c" stroke-width="7" opacity=".6"/>
  </g>`;

const variants = [
  { name: 'icon-192.png', size: 192, radius: 0, scale: 1 },
  { name: 'icon-512.png', size: 512, radius: 0, scale: 1 },
  // maskable icons get cropped to a circle by Android, so shrink the mark
  { name: 'icon-maskable-512.png', size: 512, radius: 0, scale: 0.72 },
];

const binary = (() => {
  for (const candidate of ['magick', 'convert']) {
    try {
      execFileSync(candidate, ['-version'], { stdio: 'ignore' });
      return candidate;
    } catch {
      /* try the next one */
    }
  }
  throw new Error('ImageMagick not found — install `imagemagick` and re-run.');
})();

for (const { name, size, scale } of variants) {
  const source = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="${size}" height="${size}">
    <rect width="512" height="512" fill="#100c0b"/>
    ${mark(scale)}
  </svg>`;

  const tmp = resolve(outDir, `.${name}.svg`);
  writeFileSync(tmp, source);
  execFileSync(binary, [
    '-background', 'none',
    '-density', '384',
    tmp,
    '-resize', `${size}x${size}`,
    resolve(outDir, name),
  ]);
  rmSync(tmp);
  console.log(`wrote public/icons/${name}`);
}
