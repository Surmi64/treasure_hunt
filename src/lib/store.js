import { stations } from 'virtual:content';

const KEY = 'koporosi-hunt-v1';

/**
 * All state lives in localStorage on the visitor's own phone. Nothing is
 * sent anywhere — there is no server to send it to.
 */
const listeners = new Set();

function emptyState() {
  return {
    lang: null,
    track: null,
    current: 0,
    solved: stations.map(() => false),
    attempts: stations.map(() => 0),
    hinted: stations.map(() => false),
    startedAt: null,
  };
}

function load() {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return emptyState();
    const saved = JSON.parse(raw);
    const base = emptyState();
    // guard against a stale save from an older content version
    if (!Array.isArray(saved.solved) || saved.solved.length !== stations.length) {
      return { ...base, lang: saved.lang ?? null, track: saved.track ?? null };
    }
    return { ...base, ...saved };
  } catch {
    return emptyState();
  }
}

export const state = load();

function persist() {
  try {
    localStorage.setItem(KEY, JSON.stringify(state));
  } catch {
    /* private mode or a full quota: the game still works, just not resumable */
  }
}

export function subscribe(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

function commit() {
  persist();
  for (const fn of listeners) fn(state);
}

export function setLang(lang) {
  state.lang = lang;
  document.documentElement.lang = lang;
  commit();
}

/**
 * 'kids' or 'adults'. Drives both the wording of every riddle and the theme,
 * via a data attribute the stylesheet keys off.
 */
export function setTrack(track) {
  state.track = track;
  applyTrack();
  commit();
}

export function applyTrack() {
  const track = state.track ?? 'adults';
  document.documentElement.dataset.track = track;
  // the browser paints its own chrome from this, so it has to follow the theme
  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) {
    meta.setAttribute(
      'content',
      getComputedStyle(document.documentElement).getPropertyValue('--bg').trim() || '#100c0b'
    );
  }
}

/** The active track's half of a station. */
export function trackOf(station) {
  return station.tracks[state.track ?? 'adults'];
}

export function goTo(index) {
  state.current = Math.max(0, Math.min(stations.length - 1, index));
  commit();
}

export function markSolved(index) {
  state.solved[index] = true;
  if (!state.startedAt) state.startedAt = Date.now();
  // the code is no longer shown anywhere — the finish screen dropped it because
  // nothing was ever done with it. Kept generating it would be dead work.
  commit();
}

export function addAttempt(index) {
  state.attempts[index] = (state.attempts[index] ?? 0) + 1;
  commit();
}

export function showHint(index) {
  state.hinted[index] = true;
  commit();
}

export function isComplete() {
  return state.solved.every(Boolean);
}

export function solvedCount() {
  return state.solved.filter(Boolean).length;
}

export function hasProgress() {
  return solvedCount() > 0;
}

/** First unsolved station, or the last one if everything is done. */
export function firstUnsolved() {
  const i = state.solved.findIndex((s) => !s);
  return i === -1 ? stations.length - 1 : i;
}

export function reset() {
  Object.assign(state, emptyState(), { lang: state.lang, track: state.track });
  commit();
}
