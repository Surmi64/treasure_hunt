import { stations } from 'virtual:content';
import { h } from '../lib/dom.js';
import { t } from '../lib/i18n.js';
import { state } from '../lib/store.js';
import { icon } from './icons.js';

/** The 1..7 pager. Tapping a dot jumps straight to that riddle. */
export function stepsNav(navigate, currentIndex) {
  return h(
    'nav.steps',
    { 'aria-label': t('progress', { n: currentIndex + 1, total: stations.length }) },
    stations.map((station, index) => {
      const solved = state.solved[index];
      const current = index === currentIndex;

      return h(
        'button.step',
        {
          type: 'button',
          class: [solved && 'step--solved', current && 'step--current'].filter(Boolean).join(' '),
          'aria-current': current ? 'step' : null,
          'aria-label': `${t('stationLabel', { n: index + 1 })}${solved ? ` — ${t('solved')}` : ''}`,
          onclick: () => navigate(`#/s/${index + 1}`),
        },
        solved ? icon('check', 'step__check') : String(index + 1)
      );
    })
  );
}
