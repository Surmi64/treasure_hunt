import { ui } from 'virtual:content';
import { h } from '../lib/dom.js';
import { state } from '../lib/store.js';
import { flag } from './marks.js';

/**
 * Discreet "change language" control. Shows the flag currently in use, so a
 * visitor who tapped the wrong one on the splash can see and fix it.
 */
export function langButton(navigate) {
  const lang = state.lang ?? 'hu';
  return h(
    'button.langchip',
    {
      type: 'button',
      'aria-label': `${ui[lang].langName} — ${ui[lang].chooseLanguage}`,
      onclick: () => navigate('#/lang'),
    },
    h('span.langchip__flag', flag(lang)),
    h('span', ui[lang].langName)
  );
}
