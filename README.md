# The Treasure of the Cellars — Kőporos Cellars, Hercegkút

A web treasure hunt for phones. Nothing to install, no sign-up, no data
collected, and it keeps working offline when the signal runs out among the
cellars.

- 7 stations, each with a short story first and the riddle after it
- two tracks: kids (6–15) and adults (16+), with separate text and a separate
  look
- Hungarian / English / Polish, chosen on the opening screen
- you can move freely between the riddles; progress stays on the phone
- replayable as often as you like
- a code at the end, to be shown at our cellar

## Development

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # -> dist/  (for release: no test mode)
npm run build:test # -> dist/  (with test mode, see below)
npm run preview    # try out the built version
```

### Test mode

So that walking the whole game does not require knowing seven answers by
heart, there is a back door — `src/lib/cheat.js`:

| input | what it does |
| --- | --- |
| `szezám tárulj` in the answer field | marks that station correct |
| `#/cheat` | solves all seven, jumps to the finish screen |
| `#/cheat/4` | solves the first three, stops on station 4's riddle |
| `#/cheat/door` | plays the door-opening animation on its own |
| `#/reset` | wipes progress, back to the language picker |

In test mode a red `TEST` marker sits in the bottom-left corner, so a test
build can never go live unnoticed.

It is on during `npm run dev` and `npm run build:test`. With a plain
`npm run build` the `__CHEAT__` compile-time constant becomes `false`, the
minifier drops the code and the code word with it — the public bundle does not
contain it. Turn this into a runtime flag and the code word ships to visitors.

## What you need to edit

Two files, both in `content/`. No JavaScript required; `npm run dev` reloads by
itself when you save.

### `content/stations.json` — the seven riddles

Every station has **two tracks**: `kids` and `adults`. Each has its own text and
its own answer, in all three languages — the kids track is not a simplified
version of the adults one, it is written separately.

The current content comes from **hercegkutipincek.com** (`/koporosi-pincesor`
and `/gomboshegyi-pincesor`). The arc is deliberate: arrival and the village
first (stations 1–3), then the cellar row itself (4–7).

Stations 1 and 2 are **identical** in both tracks — those are meant to be read
together by a family. Station 1 is an anagram of the village name and needs
nothing on site, so the game can be started in the car park.

Stations are navigable in any order, so no station's story or question may name
another station's answer. There is no automated check for this; grep before you
add a story.

Every station carries a `_verify` field. The program does not use it; it is a
reminder of what has to be checked on location before this goes live. Once you
have walked the row, feel free to delete it.

At station level (track-independent):

| field | what it means |
|---|---|
| `map` | position of the dot on the map, `x`/`y` as a **percentage** from 0–100 |
| `image` | optional photo filename from `public/photos/`, e.g. `"p1.webp"` |

Within a track (`tracks.kids`, `tracks.adults`):

| field | what it means |
|---|---|
| `answers` | list of accepted answers. There can be several: `["1825", "eighteen twenty five"]` |
| `input` | `"number"` = numeric keypad pops up, `"text"` = normal keyboard |
| `image` | optional, overrides the station photo for this track |
| `hu` / `en` / `pl` | `title`, `story`, `question`, `hint`, `reveal` |

A `question` may contain line breaks; they survive to the page
(`white-space: pre-line`), which is how station 1 puts its jumbled letters on
their own line.

The `story` comes **first**, before the question — it is what makes visitors
learn the place, so do not skimp on it. The riddle is one tap away and can be
skipped: it is a sequence, not a gate. The `hint` appears after two wrong
guesses. The `reveal` is the payoff line after a correct answer.

**Answer checking is forgiving.** Accents, case, spaces and punctuation do not
matter: `Rákóczi-pince.` == `rakoczi pince`. `shared/normalize.js` handles it.

**The `answers` field does not reach the shipped code.** At build time
(`plugins/content.js`) it becomes a SHA-256 hash, so anyone looking at the JS
sees `"a3f9…"` instead of `1825`.

⚠️ **That does not mean the answers cannot be read out.** The `reveal` strings
ship as plain text, and they typically repeat the answer ("Exactly:
Trautsondorf") — in the current content every one of them does. Open the JS file and
you get every solution in order. For a static PWA there is no real fix: there
is no server to withhold the text until the answer is right. So the hash guards
against an idle glance, not against someone who is looking. If that bothers
you, the literal answer has to come out of the `reveal` strings — but the
satisfaction of being confirmed goes with it.

### `content/ui.json` — the interface strings

Button labels, the intro screen, the finish screen. The program substitutes
numbers for `{n}` and `{total}`.

The `site` block holds the language-independent links. Any of them left empty
simply drops that link from the finish screen, so a fork with no cellar of its
own still renders correctly:

| key | where it shows |
|---|---|
| `mapsUrl` | the Google Maps link to our own cellar |
| `githubUrl` | GitHub mark in the credits row at the bottom |
| `linkedinUrl` | LinkedIn mark in the credits row at the bottom |

The two brand marks are drawn in the same stroke family as the rest of the
icons rather than as their official filled logos — a filled glyph next to these
reads as a foreign object dropped onto the page.

When it is set, the link stays **behind a tap**: the finish screen first points
at the mark above the text and invites the visitor to spot it along the row,
and only an "I cannot find it" button reveals the pin. Looking for the mark is
the last little hunt, and handing over the map immediately removes it.

In English and Polish the word "row" is deliberately left out of the name:
`Kőporos Cellars` and `Piwnice Kőporos`.

## Photos

Put them in `public/photos/` and write the filename into that station's `image`
field.

Important: **optimise them.** A visitor standing in the car park wants to see
the intro screen within 3 seconds. Target: WebP, 1200 px wide at most, under
150 KB.

```bash
magick original.jpg -resize 1200x -quality 78 public/photos/p1.webp
```

## Release

`dist/` is a completely static folder — no server, no database.

**Cloudflare Pages** (free, recommended):
1. push to GitHub
2. Cloudflare Pages → Connect to Git → this repo
3. Build command: `npm run build`, Build output: `dist`
4. custom domain, e.g. `kincs.koporosipincesor.hu`

Netlify and Vercel work the same way. For GitHub Pages, `base` in
`vite.config.js` has to be changed to `'/treasure_hunt/'`.

## Working offline

`vite-plugin-pwa` generates a service worker that downloads the whole game on
first load (about 340 KB, mostly fonts). After that it works without a signal,
and "Add to Home Screen" turns it into an app.

Important: **it needs HTTPS.** Over plain `http://` neither the service worker
nor `crypto.subtle`, used for answer checking, will start (there is a fallback
for the latter, none for the former).

## Entry point

Visitors arrive from a QR code. The poster needs the short URL and one large QR
code, with three flags on it — the language is picked on the opening screen
anyway.

## Maintenance commands

```bash
npm run icons              # regenerate favicon + PWA icons (needs Chromium)
node scripts/shots.mjs     # screenshots of every view (for development)
```

## Starting the game

The game opens on the language picker. Tapping a flag only **selects** it — a
separate button starts the game, so the first tap is never also a commitment
and a mis-tap costs nothing.

The language is applied to the store the moment it is picked, not when the
button is pressed. That is deliberate: it lets the button label itself switch
into the chosen language, which is the clearest confirmation that the tap
registered.

After that comes the track picker, then the intro.

## The overview map

`src/screens/map.js` and the `#/map` route are complete and working, but **not
reachable**: the station dots are placeholder coordinates, so the map would
only mislead. `MAP_ENABLED` in `src/lib/flow.js` is the single switch — flip it
to `true` and both the topbar button and the route come back.

Nothing was deleted, so re-enabling is one line once the real coordinates are
measured. The `map`, `mapTitle` and `mapLegend` strings stay in `ui.json` for
the same reason.

## The two tracks

After the language, the visitor picks who the game is for. That one choice sets
both the difficulty of the riddles and the entire look:

| | kids | adults |
|---|---|---|
| age | 6–15 | 16+ |
| theme | light parchment, orange accent | dark cellar, gold accent |
| type size | slightly larger, rounder shapes | base |

The card states the age range and what actually differs, so the visitor does
not have to guess.

Technically it hangs on a single attribute: `<html data-track="kids|adults">`.
`src/styles/themes.css` gives both tracks a complete colour set, while
`tokens.css` holds only the shared geometry (spacing, shape, motion), so the two
themes cannot drift apart structurally. **If you introduce a new colour, do it
in `themes.css`, for both tracks** — a hardcoded hex value in a component is
guaranteed to look wrong on one of the themes.

Like the language, the track stays on the phone (`localStorage`) and is never
sent anywhere. It can be switched from the chip on the intro screen at any
time, and progress survives.

## The kids background

On the kids track the whole app sits on a sheet of aged parchment with a faint
treasure map drawn on it: coastline, a route in dashes, an X and a compass
rose. The markup is in `index.html` inside `.ambience`, the styling in
`base.css`.

It is kept deliberately faint (`opacity: 0.1`). Text sits directly on it on
most screens, so it has to stay a texture rather than a picture — anything
stronger starts competing to be read. The adults track does not get it: it is
`display: none` outside `[data-track='kids']`.

## The door artwork

The sun-disc cellar motif is your own drawing: the source is
`resources/door.svg` (an Inkscape/AI export). We **never edit it by hand** —
`scripts/clean-door.mjs` produces `src/ui/door.svg` from it:

- drops the embedded ICC colour profile (about 1 MB of the file's 1 MB)
- drops Inkscape's editor metadata
- swaps the print yellow for `currentColor`, so CSS can drive it
- swaps the print black for the cellar background, so the lines become *gaps*
  in the panel rather than ink painted on it

Result: 1066 KB → 21 KB, and a solved station's badge turns green with a single
`color:` change.

If you ever redraw the artwork, replace `resources/door.svg` and run:

```bash
node scripts/clean-door.mjs
npm run icons
```

The script fails hard if the output is not valid XML — that has already caught
a leftover `<sodipodi:namedview>` element, which made the browser render an XML
error page instead of the drawing.

The position of the sun disc (`SUN` in `src/ui/door.js`) is measured off the
artwork — the station number goes there. If the drawing changes, this has to be
adjusted too.

## The finish animation

After the seventh correct answer the door swings open, the camera goes through
it, and the Hajnalhozó mark is what lies behind. `src/ui/doorburst.js` plus the
`.doorburst` block at the end of `components.css`. `#/cheat/door` plays it on
its own.

The two wings are **the same door artwork twice**, each shown through a
half-width `overflow: hidden` window — so the two halves always line up exactly,
and redrawing the door cannot make them drift apart.

The mark is currently a **placeholder**: two letters (`HH`) in a ring, in
`src/ui/brand.js`. When the real logo exists, only that one SVG needs replacing
— `doorburst.js` never asks for letters, it asks for "the mark".

Two things not to break in it:

- the **sign** of the wings' `rotateY` decides whether the door opens outward or
  inward; the current one (left negative, right positive) opens outward
- the swing **stops at 70 degrees**. Past 90 the wing turns its blank back to
  the camera and disappears (`backface-visibility: hidden`), and around 84 it is
  already down to a 10-pixel sliver

The overlay does **not** take itself down. `playDoorOpening()` returns
`{ finished, dismiss }`: it resolves while still fully opaque and waits, so the
caller routes to the finish screen first and dismisses second. Get that order
wrong and the fade-out uncovers the station the visitor just left, which flashes
back into view for a moment before the route changes.

The timing is documented in a comment in `components.css`; if you change it,
move `TOTAL_MS` in `doorburst.js` with it. Under `prefers-reduced-motion` the
whole thing is skipped, and a tap anywhere skips it.

## Layout

```
content/          what you edit: riddles and interface strings
resources/        the raw door drawing (Inkscape export), kept as the source
plugins/          Vite plugin: answers become hashes at build time
shared/           answer normalisation, shared by the build and the browser
src/lib/          state, i18n, answer checking, DOM helper
src/screens/      language picker, intro, station, map, finish screen
src/styles/       design tokens and styles
src/ui/           icons, badges, flags, step indicator, dialog
public/photos/    photos go here
```

No React, no build magic: plain ES modules and CSS.
