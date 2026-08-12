/**
 * Dev-only visual check: drives headless Chromium over CDP and writes
 * screenshots of every screen. Not part of the build.
 *
 *   npm run preview &
 *   node scripts/shots.mjs [outDir]
 */
import { spawn } from 'node:child_process';
import { mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { setTimeout as sleep } from 'node:timers/promises';

const OUT = process.argv[2] ?? `${process.env.HOME}/kp-shots`;
const BASE = 'http://localhost:4173/';
const PORT = 9222;
const PROFILE = `${process.env.HOME}/.cache/kp-chrome`;

mkdirSync(OUT, { recursive: true });
// start from a clean profile so a precached service worker from the previous
// run cannot serve stale assets
rmSync(PROFILE, { recursive: true, force: true });

const chrome = spawn(
  'chromium',
  [
    '--headless=new',
    '--disable-gpu',
    '--hide-scrollbars',
    `--remote-debugging-port=${PORT}`,
    '--window-size=390,844',
    `--user-data-dir=${PROFILE}`,
    'about:blank',
  ],
  { stdio: 'ignore' }
);

process.on('exit', () => chrome.kill());

async function targets() {
  for (let i = 0; i < 40; i++) {
    try {
      const res = await fetch(`http://127.0.0.1:${PORT}/json/list`);
      const list = await res.json();
      const page = list.find((t) => t.type === 'page');
      if (page) return page;
    } catch {
      /* not up yet */
    }
    await sleep(250);
  }
  throw new Error('Chromium did not expose a debugging target.');
}

const page = await targets();
const ws = new WebSocket(page.webSocketDebuggerUrl);
await new Promise((r) => ws.addEventListener('open', r, { once: true }));

let nextId = 1;
const pending = new Map();
ws.addEventListener('message', (event) => {
  const msg = JSON.parse(event.data);
  if (msg.id && pending.has(msg.id)) {
    pending.get(msg.id)(msg.result);
    pending.delete(msg.id);
  }
});

function send(method, params = {}) {
  const id = nextId++;
  ws.send(JSON.stringify({ id, method, params }));
  return new Promise((resolve) => pending.set(id, resolve));
}

await send('Page.enable');
await send('Runtime.enable');
await send('Emulation.setDeviceMetricsOverride', {
  width: 390,
  height: 844,
  deviceScaleFactor: 2,
  mobile: true,
});

async function evaluate(expression) {
  const res = await send('Runtime.evaluate', { expression, awaitPromise: true });
  if (res?.exceptionDetails) {
    console.error('  ! page error:', res.exceptionDetails.text, res.exceptionDetails.exception?.description ?? '');
  }
  return res?.result?.value;
}

async function shot(name, { full = false } = {}) {
  await sleep(700);
  const res = await send('Page.captureScreenshot', {
    format: 'png',
    captureBeyondViewport: full,
  });
  writeFileSync(`${OUT}/${name}.png`, Buffer.from(res.data, 'base64'));
  console.log(`  → ${OUT}/${name}.png`);
}

async function go(hash) {
  await evaluate(`location.hash = ${JSON.stringify(hash)}`);
  await sleep(400);
}

/** Page.navigate to a hash on the same page is same-document — force a reload
 *  so the app re-reads localStorage. */
async function hardNavigate(url) {
  await send('Page.navigate', { url });
  await sleep(300);
  await send('Page.reload', { ignoreCache: false });
}

console.log('language screen');
await send('Page.navigate', { url: BASE });
await sleep(1500);
// snap-confined Chromium ignores our --user-data-dir wipe, so clear by hand
await evaluate(`(async () => {
  localStorage.clear();
  for (const r of await navigator.serviceWorker.getRegistrations()) await r.unregister();
  for (const k of await caches.keys()) await caches.delete(k);
})()`);
await send('Page.navigate', { url: BASE });
await send('Page.reload', { ignoreCache: true });
await sleep(1800);
await shot('01-language');

console.log('intro (hu)');
await evaluate(`document.querySelectorAll('.lang__btn')[0].click()`);
await sleep(600);
await shot('02-intro-hu');

console.log('station 1');
await go('#/s/1');
await shot('03-station');

console.log('station 1 — wrong answer twice');
await evaluate(`(() => {
  const i = document.getElementById('answer');
  i.value = '1600';
  i.dispatchEvent(new Event('input', { bubbles: true }));
  document.querySelector('.station__form').requestSubmit();
})()`);
await sleep(500);
await evaluate(`(() => {
  const i = document.getElementById('answer');
  i.value = '1700';
  i.dispatchEvent(new Event('input', { bubbles: true }));
  document.querySelector('.station__form').requestSubmit();
})()`);
await sleep(600);
await shot('04-station-wrong');

console.log('station 1 — hint');
await evaluate(`[...document.querySelectorAll('button')].find(b => b.textContent.includes('Segítség'))?.click()`);
await shot('05-station-hint');

console.log('station 1 — correct');
await evaluate(`(() => {
  const i = document.getElementById('answer');
  i.value = '1748';
  i.dispatchEvent(new Event('input', { bubbles: true }));
  document.querySelector('.station__form').requestSubmit();
})()`);
await sleep(1400);
await shot('06-station-correct', { full: true });

console.log('map');
await go('#/map');
await shot('07-map');

/**
 * Rewrites saved progress and boots the app fresh on top of it.
 * The reload matters: the running app holds state in memory and rewrites
 * localStorage on every navigation, so it would clobber the patch.
 */
async function bootWith(patch, hash) {
  await evaluate(`(() => {
    const raw = JSON.parse(localStorage.getItem('koporosi-hunt-v1')) ?? {};
    Object.assign(raw, ${JSON.stringify(patch)});
    localStorage.setItem('koporosi-hunt-v1', JSON.stringify(raw));
  })()`);
  await send('Page.reload');
  await sleep(1600);
  await go(hash);
}

console.log('finish');
await bootWith({ lang: 'hu', solved: Array(7).fill(true), code: 'KW12F' }, '#/done');
await shot('08-finish', { full: true });

console.log('english station');
await bootWith({ lang: 'en', solved: Array(7).fill(false) }, '#/s/1');
await shot('09-station-en');

console.log('polish intro');
await bootWith({ lang: 'pl', solved: Array(7).fill(false) }, '#/intro');
await shot('10-intro-pl', { full: true });

const errors = await evaluate(`JSON.stringify(window.__errors ?? [])`);
console.log('page errors:', errors);

ws.close();
chrome.kill();
