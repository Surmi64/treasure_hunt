import { h } from '../lib/dom.js';
import { t } from '../lib/i18n.js';
import { state } from '../lib/store.js';
import { icon } from '../ui/icons.js';
import { sealMark } from '../ui/marks.js';
import { resetAndRestart } from '../lib/flow.js';

export function finishScreen(navigate) {
  return h(
    'section.view.finish',
    h(
      'header',
      sealMark('finish__seal'),
      h('p.eyebrow', { style: 'margin-top: var(--s5)' }, t('finishLead')),
      h('h1.display.finish__title', t('finishTitle'))
    ),

    h('div.rule', h('span.rule__gem')),

    h(
      'div.card',
      h('p.prose', t('finishBody')),
      h('p.field__label', { style: 'margin-top: var(--s5)' }, t('codeLabel')),
      h('p', h('span.finish__code', state.code ?? '——'))
    ),

    h('p.muted', t('finishFooter')),

    h(
      'button.btn.btn--secondary.btn--block',
      { type: 'button', onclick: () => resetAndRestart(navigate) },
      icon('rotate', 'btn__icon'),
      t('playAgain')
    )
  );
}
