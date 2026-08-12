# A Pincesor Kincse — Kőporosi Pincesor

Webes kincsvadászat mobilra. Nincs telepítés, nincs regisztráció, nem gyűjt
semmilyen adatot, és offline is működik, ha a pincesoron elfogy a térerő.

- 7 állomás, mindegyiknél előbb egy rövid történet, utána a feladat
- két sáv: gyerekeknek (6–15) és felnőtteknek (16-tól), külön szöveggel és
  külön kinézettel
- magyar / angol / lengyel, a nyitóképernyőn választható
- a kérdések között szabadon lehet lépkedni, a haladás a telefonon marad
- akárhányszor újrajátszható
- a végén egy kód, amit a pincénkben mutatnak meg

## Fejlesztés

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # -> dist/
npm run preview    # a buildelt változat kipróbálása
```

## Amit szerkesztened kell

Két fájl, mindkettő a `content/` mappában. Nem kell hozzájuk JS-t írni,
mentés után a `npm run dev` magától újratölt.

### `content/stations.json` — a hét feladvány

Minden állomásnak **két sávja** van: `kids` és `adults`. Mindkettőnek saját
szövege és saját válasza van, mindhárom nyelven — a gyerek sáv nem a felnőtt
egyszerűsített változata, hanem külön megírandó.

Állomás szintjén (sávfüggetlen):

| mező | mit jelent |
|---|---|
| `map` | a pont helye a térképen, 0–100 közötti `x`/`y` **százalék** |
| `image` | opcionális fotó fájlneve a `public/photos/` mappából, pl. `"p1.webp"` |

Sávon belül (`tracks.kids`, `tracks.adults`):

| mező | mit jelent |
|---|---|
| `answers` | elfogadott válaszok listája. Több is lehet: `["1748", "ezerhétszáznegyvennyolc"]` |
| `input` | `"number"` = numerikus billentyűzet ugrik fel, `"text"` = normál |
| `image` | opcionális, felülírja az állomás fotóját ebben a sávban |
| `hu` / `en` / `pl` | `title`, `story`, `question`, `hint`, `reveal` |

A `story` jelenik meg **elsőként**, még a kérdés előtt — ez az, amitől
megismerik a helyet, ne spórolj vele. A feladat egy koppintásra van tőle, és
átugorható: nem akadály, csak sorrend. A `hint` két hibás tipp után jelenik
meg. A `reveal` a helyes válasz utáni jutalomsor.

**A válaszok ellenőrzése toleráns.** Ékezet, kis/nagybetű, szóköz és
írásjel nem számít: `Rákóczi-pince.` == `rakoczi pince`. Ezt a
`shared/normalize.js` intézi.

**A nyers válaszok nem kerülnek bele a kiszállított kódba.** Build közben
(`plugins/content.js`) SHA-256 hash lesz belőlük, tehát ha valaki
megnézi a JS-t, `"a3f9…"`-et lát `1748` helyett.

### `content/ui.json` — a felület szövegei

Gombfeliratok, a nyitóoldal szövege, a záróképernyő. A `{n}` és `{total}`
helyére a program számokat helyettesít.

## Fotók

Tedd őket a `public/photos/` mappába, és írd be a fájlnevet az adott
állomás `image` mezőjébe.

Fontos: **optimalizáld őket.** A parkolóban álló látogató 3 másodperc
alatt akarja látni a nyitóoldalt. Cél: WebP, max 1200 px széles, 150 KB alatt.

```bash
magick eredeti.jpg -resize 1200x -quality 78 public/photos/p1.webp
```

## Kiadás

A `dist/` egy teljesen statikus mappa — nincs szerver, nincs adatbázis.

**Cloudflare Pages** (ingyenes, ajánlott):
1. push GitHubra
2. Cloudflare Pages → Connect to Git → ez a repo
3. Build command: `npm run build`, Build output: `dist`
4. Custom domain, pl. `kincs.koporosipincesor.hu`

Ugyanígy megy Netlify-jal vagy Vercellel. GitHub Pages esetén a
`vite.config.js`-ben a `base`-t át kell írni `'/treasure_hunt/'`-ra.

## Offline működés

A `vite-plugin-pwa` service workert generál, ami az első betöltéskor
letölti az egész játékot (kb. 340 KB, nagyrészt betűtípus). Utána
térerő nélkül is működik, és „Hozzáadás a kezdőképernyőhöz"-zel
alkalmazásként is kirakható.

Fontos: **HTTPS kell hozzá.** Sima `http://` alatt a service worker és a
válaszellenőrzéshez használt `crypto.subtle` sem indul el (utóbbira van
tartalék megoldás, előbbire nincs).

## Belépési pont

A látogatók QR-kódról érkeznek. A plakátra a rövid URL és egy nagy QR
kód kell, három zászlóval — a nyelvet úgyis a nyitóképernyőn választják.

## Karbantartó parancsok

```bash
npm run icons              # favicon + PWA ikonok újragenerálása (Chromium kell hozzá)
node scripts/shots.mjs     # képernyőképek minden nézetről (fejlesztéshez)
```

## A két sáv

A nyelv után a látogató kiválasztja, kinek szól a játék. Ez egyszerre
állítja a feladatok nehézségét és a teljes kinézetet:

| | gyerekeknek | felnőtteknek |
|---|---|---|
| kor | 6–15 | 16-tól |
| téma | világos pergamen, narancs akcentus | sötét pince, arany akcentus |
| betűméret | valamivel nagyobb, kerekebb formák | alap |

A választáskor a kártya kiírja a korhatárt és azt is, hogy mi tér el —
a látogatónak nem kell találgatnia.

Technikailag egyetlen attribútumon múlik: `<html data-track="kids|adults">`.
A `src/styles/themes.css` mindkét sávhoz teljes színkészletet ad, a
`tokens.css` pedig csak a közös geometriát (térköz, forma, animáció), így a
két téma szerkezetileg nem tud elcsúszni egymástól. **Ha új színt vezetsz be,
a `themes.css`-ben tedd, mindkét sávra** — beégetett hexa érték a
komponensekben az egyik témán biztosan rosszul fog kinézni.

A sáv a nyelvhez hasonlóan a telefonon marad (`localStorage`), nem küldjük
sehová. Bármikor váltható a nyitóoldal chipjéről, és a haladás megmarad.

## Az ajtóminta

A napkorongos pincesor-motívum a te rajzod: a forrás a
`resources/door.svg` (Inkscape/AI export). Ezt **nem szerkesztjük kézzel** —
a `scripts/clean-door.mjs` állítja elő belőle a `src/ui/door.svg`-t:

- kidobja a beágyazott ICC színprofilt (ez a fájl 1 MB-jából ~1 MB)
- kidobja az Inkscape szerkesztői metaadatait
- a nyomdai sárgát `currentColor`-ra cseréli, így CSS-ből vezérelhető
- a nyomdai feketét a pince-háttérre cseréli, így a vonalak *rések* lesznek
  a panelben, nem ráfestett tinta

Eredmény: 1066 KB → 21 KB, és a megoldott állomás jelvénye egyetlen
`color:` váltással zöld lesz.

Ha valaha újrarajzolod a rajzot, cseréld a `resources/door.svg`-t és futtasd:

```bash
node scripts/clean-door.mjs
npm run icons
```

A szkript hibával leáll, ha a kimenet nem érvényes XML — ez egyszer már
megfogott egy bennmaradt `<sodipodi:namedview>` elemet, ami miatt a böngésző
a rajz helyett XML-hibaoldalt renderelt.

A napkorong helye (`SUN` a `src/ui/door.js`-ben) a rajzból van kimérve —
ide kerül az állomás sorszáma. Ha a rajz változik, ezt is igazítani kell.


## Felépítés

```
content/          amit szerkesztesz: kérdések és felületi szövegek
resources/        a nyers ajtó-rajz (Inkscape export), forrásként megőrizve
plugins/          Vite plugin: a válaszokból build közben hash lesz
shared/           a válasz-normalizálás, közös a buildben és a böngészőben
src/lib/          állapot, i18n, válaszellenőrzés, DOM helper
src/screens/      nyelvválasztó, intro, állomás, térkép, záróképernyő
src/styles/       design tokenek és stílusok
src/ui/           ikonok, jelvények, zászlók, lépésjelző, dialógus
public/photos/    ide jönnek a fotók
```

Se React, se build-varázslat: sima ES modulok és CSS. A teljes JS 31 KB
(12 KB gzip).
