import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { normalizeAnswer } from '../shared/normalize.js';

const VIRTUAL_ID = 'virtual:content';
const RESOLVED_ID = '\0' + VIRTUAL_ID;

const LANGS = ['hu', 'en', 'pl'];
const TRACKS = ['kids', 'adults'];

function sha256(value) {
  return createHash('sha256').update(value, 'utf8').digest('hex');
}

function readJson(root, name) {
  const path = resolve(root, 'content', name);
  return { path, data: JSON.parse(readFileSync(path, 'utf8')) };
}

/**
 * Turns content/*.json into a virtual ES module.
 *
 * The point of doing this at build time rather than shipping the JSON: the
 * plaintext answers are replaced by SHA-256 hashes, so a curious visitor
 * poking at the bundle finds `"a1b2c3..."` instead of `1748`.
 */
export function contentPlugin() {
  let root = process.cwd();
  let watched = [];

  return {
    name: 'koporosi-content',

    configResolved(config) {
      root = config.root;
    },

    resolveId(id) {
      return id === VIRTUAL_ID ? RESOLVED_ID : null;
    },

    load(id) {
      if (id !== RESOLVED_ID) return null;

      const ui = readJson(root, 'ui.json');
      const stations = readJson(root, 'stations.json');
      watched = [ui.path, stations.path];

      const built = stations.data.stations.map((station, index) => {
        const tracks = {};

        for (const track of TRACKS) {
          const source = station.tracks?.[track];
          if (!source) {
            this.error(`Station "${station.id}" is missing the "${track}" track.`);
          }
          if (!Array.isArray(source.answers) || source.answers.length === 0) {
            this.error(`Station "${station.id}" (${track}) has no answers.`);
          }

          const hashes = source.answers.map((answer) => {
            const normalized = normalizeAnswer(answer);
            if (!normalized) {
              this.error(
                `Station "${station.id}" (${track}): answer ${JSON.stringify(answer)} ` +
                  'is empty after normalisation.'
              );
            }
            return sha256(normalized);
          });

          const text = {};
          for (const lang of LANGS) {
            if (!source[lang]) {
              this.error(`Station "${station.id}" (${track}) is missing the "${lang}" block.`);
            }
            text[lang] = source[lang];
          }

          tracks[track] = {
            input: source.input === 'number' ? 'number' : 'text',
            // a track may override the shared photo
            image: source.image ?? station.image ?? null,
            hashes,
            text,
          };
        }

        return {
          id: station.id,
          index,
          map: station.map ?? { x: 50, y: 50 },
          tracks,
        };
      });

      const ustrings = {};
      for (const lang of LANGS) {
        if (!ui.data[lang]) this.error(`ui.json is missing the "${lang}" block.`);
        ustrings[lang] = ui.data[lang];
      }

      // language-independent settings; every one of these drops its link from
      // the finish screen when left empty, so listing the defaults here is what
      // guarantees the screen never renders an href of undefined
      const site = { mapsUrl: '', githubUrl: '', linkedinUrl: '', ...(ui.data.site ?? {}) };

      return `export const LANGS = ${JSON.stringify(LANGS)};
export const TRACKS = ${JSON.stringify(TRACKS)};
export const site = ${JSON.stringify(site)};
export const ui = ${JSON.stringify(ustrings)};
export const stations = ${JSON.stringify(built)};
`;
    },

    // let `vite dev` hot-reload when the content files are edited
    configureServer(server) {
      const onChange = (file) => {
        if (!watched.includes(file)) return;
        const mod = server.moduleGraph.getModuleById(RESOLVED_ID);
        if (mod) server.moduleGraph.invalidateModule(mod);
        server.ws.send({ type: 'full-reload' });
      };
      server.watcher.add(resolve(root, 'content'));
      server.watcher.on('change', onChange);
    },
  };
}
