import { stations } from 'virtual:content';
import { h } from '../lib/dom.js';
import { t } from '../lib/i18n.js';
import { firstUnsolved, hasProgress, solvedCount } from '../lib/store.js';
import { icon } from '../ui/icons.js';
import { logoMark } from '../ui/marks.js';
import { confirmDialog } from '../ui/dialog.js';
import { resetAndRestart } from '../lib/flow.js';

export function introScreen(navigate) {
  const resuming = hasProgress();

  return h(
    'section.view.intro',
    h(
      'header.intro__head',
      logoMark('lang__mark'),
      h('h1.display.intro__title', t('gameTitle')),
      h('p.muted', { style: 'margin-top: var(--s2)' }, t('gameSubtitle'))
    ),

    h('div.rule', h('span.rule__gem')),

    h(
      'div',
      h('p.lead', t('introLead')),
      h('p.prose', { style: 'margin-top: var(--s4)' }, t('introBody'))
    ),

    h(
      'div.chiprow',
      h('span.chip', icon('clock'), t('metaDuration')),
      h('span.chip', icon('flag'), t('metaStations')),
      h('span.chip', icon('gift'), t('metaFree'))
    ),

    h(
      'div.intro__actions',
      h(
        'button.btn.btn--primary.btn--block',
        {
          type: 'button',
          onclick: () => navigate(`#/s/${firstUnsolved() + 1}`),
        },
        resuming ? t('resume') : t('start'),
        icon('arrowRight', 'btn__icon')
      ),

      resuming &&
        h(
          'p.muted',
          { style: 'text-align:center' },
          `${solvedCount()} / ${stations.length} ${t('solved')}`
        ),

      resuming &&
        h(
          'button.btn.btn--ghost.btn--block',
          {
            type: 'button',
            onclick: () =>
              confirmDialog({
                message: t('restartConfirm'),
                confirmLabel: t('restart'),
                cancelLabel: t('cancel'),
                onConfirm: () => resetAndRestart(navigate),
              }),
          },
          icon('rotate', 'btn__icon'),
          t('restart')
        )
    )
  );
}
