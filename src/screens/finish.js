import { site } from 'virtual:content';
import { h } from '../lib/dom.js';
import { t } from '../lib/i18n.js';
import { state } from '../lib/store.js';
import { icon } from '../ui/icons.js';
import { hajnalhozoMark } from '../ui/brand.js';
import { resetAndRestart } from '../lib/flow.js';

/**
 * The mark at the top is the same one the door opened onto — it stays put
 * where the animation left it, so the screen reads as the other side of that
 * doorway rather than a new page.
 */
export function finishScreen(navigate) {
  const mapSlot = h('div.finish__maps');

  function showMap() {
    mapSlot.replaceChildren(
      h(
        'a.btn.btn--primary.btn--block',
        { href: site.mapsUrl, target: '_blank', rel: 'noopener' },
        icon('map', 'btn__icon'),
        t('finishMapCta')
      )
    );
  }

  mapSlot.replaceChildren(
    h(
      'button.btn.btn--ghost.btn--block',
      { type: 'button', onclick: showMap },
      icon('map', 'btn__icon'),
      t('finishRevealMap')
    )
  );

  return h(
    'section.view.finish',
    h(
      'header',
      hajnalhozoMark('finish__mark'),
      h('p.eyebrow', { style: 'margin-top: var(--s5)' }, t('finishLead')),
      h('h1.display.finish__title', t('finishTitle'))
    ),

    h('div.rule', h('span.rule__gem')),

    h(
      'div.card',
      h('p.prose', t('finishBody')),

      // the map stays behind a tap: looking for the mark along the row is the
      // last little hunt, and handing over the pin immediately removes it
      site.mapsUrl && mapSlot,

      h('p.field__label', { style: 'margin-top: var(--s5)' }, t('codeLabel')),
      h('p', h('span.finish__code', state.code ?? '——'))
    ),

    // the consolation is the point of the whole game, so it gets its own line
    h('p.prose.finish__keep', t('finishClosed')),

    h('p.muted', t('finishFooter')),

    h(
      'button.btn.btn--secondary.btn--block',
      { type: 'button', onclick: () => resetAndRestart(navigate) },
      icon('rotate', 'btn__icon'),
      t('playAgain')
    )
  );
}
