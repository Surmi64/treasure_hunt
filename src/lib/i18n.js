import { ui } from 'virtual:content';
import { state, trackOf } from './store.js';

/** UI string lookup with {placeholder} interpolation. */
export function t(key, vars) {
  const dict = ui[state.lang] ?? ui.hu;
  let out = dict[key] ?? ui.hu[key] ?? key;
  if (vars) {
    for (const [name, value] of Object.entries(vars)) {
      out = out.replaceAll(`{${name}}`, String(value));
    }
  }
  return out;
}

/** Station text for the active language *and* the active track. */
export function st(station, key) {
  const lang = state.lang ?? 'hu';
  const text = trackOf(station).text;
  return text[lang]?.[key] ?? text.hu?.[key] ?? '';
}
