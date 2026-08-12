import { LANGS, ui } from 'virtual:content';
import { h } from '../lib/dom.js';
import { setLang, state } from '../lib/store.js';
import { icon } from '../ui/icons.js';
import { flag, logoMark } from '../ui/marks.js';

export function languageScreen(navigate) {
  // reopened from the intro rather than shown on arrival
  const returning = Boolean(state.lang);

  return h(
    'section.view.lang',
    { class: returning ? 'lang--returning' : '' },

    returning &&
      h(
        'header.topbar',
        h(
          'button.iconbtn',
          {
            type: 'button',
            'aria-label': ui[state.lang].cancel,
            onclick: () => navigate('#/intro'),
          },
          icon('arrowLeft')
        ),
        h('span.topbar__title', ui[state.lang].chooseLanguage),
        h('span', { style: 'width:44px' })
      ),

    !returning &&
      h(
        'header',
        logoMark('lang__mark'),
        h('h1.display.lang__title', ui.hu.gameTitle),
        h('p.lang__sub', ui.hu.siteName)
      ),

    !returning && h('div.rule', h('span.rule__gem')),

    h(
      'div.stack',
      { style: 'gap: var(--s4)' },
      // on the splash this trilingual line is the only prompt; when reopened
      // the top bar already says it in the visitor's own language
      !returning && h('p.eyebrow', ui.en.chooseLanguage),
      h(
        'div.lang__list',
        LANGS.map((lang) => {
          const active = state.lang === lang;
          return h(
            'button.lang__btn',
            {
              type: 'button',
              lang,
              class: active ? 'lang__btn--active' : '',
              'aria-current': active ? 'true' : null,
              onclick: () => {
                setLang(lang);
                navigate('#/intro');
              },
            },
            h('span.lang__flag', flag(lang)),
            h('span.lang__name', ui[lang].langName),
            active ? icon('check', 'lang__go') : icon('arrowRight', 'lang__go')
          );
        })
      )
    )
  );
}
