import { ui } from 'virtual:content';
import { state } from './store.js';

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

/** Station text in the active language. */
export function st(station, key) {
  const lang = state.lang ?? 'hu';
  return station.text[lang]?.[key] ?? station.text.hu?.[key] ?? '';
}
