import { ui } from 'virtual:content';
import { h } from '../lib/dom.js';
import { state } from '../lib/store.js';
import { flag } from './marks.js';
import { t } from '../lib/i18n.js';

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

/**
 * "Change who is playing". Sits beside the language chip on the intro, so
 * a family swapping the phone between a child and an adult can retarget the
 * game without starting over — progress is kept.
 */
export function trackButton(navigate) {
  const track = state.track ?? 'adults';
  return h(
    'button.langchip.langchip--track',
    {
      type: 'button',
      'aria-label': `${t(track === 'kids' ? 'trackKids' : 'trackAdults')} — ${t('chooseTrack')}`,
      onclick: () => navigate('#/track'),
    },
    h('span.langchip__swatch', { 'aria-hidden': 'true' }),
    h('span', t(track === 'kids' ? 'trackKids' : 'trackAdults'))
  );
}
