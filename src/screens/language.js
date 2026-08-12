import { LANGS, ui } from 'virtual:content';
import { h } from '../lib/dom.js';
import { setLang } from '../lib/store.js';
import { icon } from '../ui/icons.js';
import { flag, logoMark } from '../ui/marks.js';

export function languageScreen(navigate) {
  return h(
    'section.view.lang',
    h(
      'header',
      logoMark('lang__mark'),
      h('h1.display.lang__title', ui.hu.gameTitle),
      h('p.lang__sub', ui.hu.siteName)
    ),

    h('div.rule', h('span.rule__gem')),

    h(
      'div.stack',
      { style: 'gap: var(--s4)' },
      h('p.eyebrow', ui.en.chooseLanguage),
      h(
        'div.lang__list',
        LANGS.map((lang) =>
          h(
            'button.lang__btn',
            {
              type: 'button',
              lang,
              onclick: () => {
                setLang(lang);
                navigate('#/intro');
              },
            },
            h('span.lang__flag', flag(lang)),
            h('span.lang__name', ui[lang].langName),
            icon('arrowRight', 'lang__go')
          )
        )
      )
    )
  );
}
