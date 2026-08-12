/**
 * Turns the Inkscape export in resources/door.svg into src/ui/door.svg.
 *
 *   node scripts/clean-door.mjs
 *
 * The geometry is copied verbatim — paths, transforms and clip paths are left
 * exactly as drawn. Only the packaging changes:
 *
 *   - the embedded ICC profile goes (it is ~1 MB of the 1.06 MB file)
 *   - Inkscape/sodipodi namespaces and editor metadata go
 *   - the painted yellow becomes `currentColor`, so CSS drives the panel and
 *     the solved badge turns green with a single property
 *   - the printed black becomes the cellar background, so the lines read as
 *     gaps cut out of the panel rather than as ink on top of it
 *
 * Re-run this if the artwork is ever redrawn.
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const SRC = resolve(root, 'resources/door.svg');
const OUT = resolve(root, 'src/ui/door.svg');

const PANEL = '#feed54'; // the printed yellow
const INK = '#010101'; // the printed black

// the export is CMYK and carries a stray byte or two; latin1 keeps it lossless
let svg = readFileSync(SRC, 'latin1');

svg = svg
  // the ICC profile and the editor's own bookkeeping
  .replace(/<color-profile[\s\S]*?\/>/g, '')
  .replace(/<metadata[\s\S]*?<\/metadata>/g, '')
  .replace(/<!--[\s\S]*?-->/g, '')
  .replace(/<\?xml[^>]*\?>/g, '')
  // editor-only *elements*, not just attributes: leaving <sodipodi:namedview>
  // behind after dropping its namespace makes the whole file unparseable
  .replace(/<(inkscape|sodipodi):([\w-]+)[\s\S]*?<\/\1:\2>/g, '')
  .replace(/<(?:inkscape|sodipodi):[\w-]+[^>]*\/>/g, '')
  .replace(/\s(?:inkscape|sodipodi):[\w-]+="[^"]*"/g, '')
  .replace(/\sxmlns:(?:inkscape|sodipodi|xlink|svg)="[^"]*"/g, '')
  .replace(/\sid="(?:svg|defs|layer)[\w-]*"/g, '')
  // recolour
  .replaceAll(`fill:${PANEL}`, 'fill:currentColor')
  .replaceAll(`stroke:${INK}`, 'stroke:var(--door-ink, #100c0b)')
  // the outer <svg> gets its size from CSS, not from the print dimensions
  .replace(/\swidth="[^"]*"/, '')
  .replace(/\sheight="[^"]*"/, '')
  // collapse the attribute-per-line formatting
  .replace(/\s*\n\s*/g, ' ')
  .replace(/\s{2,}/g, ' ')
  .replace(/> </g, '><')
  .trim();

const viewBox = svg.match(/viewBox="([^"]+)"/)?.[1];
if (!viewBox) throw new Error('No viewBox survived the cleanup — check the source.');

/* Fail loudly rather than shipping a file the browser will refuse to parse.
   A namespace prefix left behind after its xmlns declaration was stripped is
   an "unbound prefix" error, and the app renders Chromium's parser-error page
   instead of the door. */
const declared = new Set(
  [...svg.matchAll(/xmlns:([\w-]+)="/g)].map((m) => m[1]).concat(['xml'])
);
const used = new Set(
  [...svg.matchAll(/<\/?([\w-]+):/g)].map((m) => m[1]).concat(
    [...svg.matchAll(/\s([\w-]+):[\w-]+="/g)].map((m) => m[1])
  )
);
const unbound = [...used].filter((p) => !declared.has(p) && p !== 'xmlns');
if (unbound.length) {
  throw new Error(`Unbound namespace prefixes left in the output: ${unbound.join(', ')}`);
}

writeFileSync(OUT, `${svg}\n`, 'utf8');

console.log(`wrote src/ui/door.svg  (viewBox ${viewBox})`);
console.log(`  ${(readFileSync(SRC).length / 1024).toFixed(0)} KB -> ${(svg.length / 1024).toFixed(1)} KB`);
