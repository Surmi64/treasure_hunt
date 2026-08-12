import { TRACKS } from 'virtual:content';
import { h } from '../lib/dom.js';
import { t } from '../lib/i18n.js';
import { setTrack, state } from '../lib/store.js';
import { icon } from '../ui/icons.js';

/**
 * Kids or adults. Asked once, right after the language, because it decides
 * both the wording of every riddle and which theme the game wears.
 *
 * The card spells out the age range and what actually differs — a visitor
 * should never have to guess what they are choosing between.
 */
const CARDS = {
  kids: { name: 'trackKids', age: 'trackKidsAge', what: 'trackKidsWhat' },
  adults: { name: 'trackAdults', age: 'trackAdultsAge', what: 'trackAdultsWhat' },
};

export function trackScreen(navigate) {
  const returning = Boolean(state.track);

  return h(
    'section.view.track',
    { class: returning ? 'track--returning' : '' },

    returning &&
      h(
        'header.topbar',
        h(
          'button.iconbtn',
          { type: 'button', 'aria-label': t('cancel'), onclick: () => navigate('#/intro') },
          icon('arrowLeft')
        ),
        h('span.topbar__title', t('chooseTrack')),
        h('span', { style: 'width:44px' })
      ),

    h(
      'header.track__head',
      h('h1.display.track__title', t('chooseTrack')),
      h('p.muted', { style: 'margin-top: var(--s2)' }, t('chooseTrackSub'))
    ),

    h(
      'div.track__list',
      TRACKS.map((track) => {
        const card = CARDS[track];
        const active = state.track === track;
        return h(
          'button.track__card',
          {
            type: 'button',
            class: [`track__card--${track}`, active && 'track__card--active']
              .filter(Boolean)
              .join(' '),
            'aria-current': active ? 'true' : null,
            onclick: () => {
              setTrack(track);
              navigate('#/intro');
            },
          },
          h('span.track__swatch', { 'aria-hidden': 'true' }),
          h(
            'span.track__body',
            h(
              'span.track__name',
              t(card.name),
              h('span.track__age', t(card.age))
            ),
            h('span.track__what', t(card.what))
          ),
          active ? icon('check', 'track__go') : icon('arrowRight', 'track__go')
        );
      })
    ),

    h('p.muted.track__note', t('trackNote'))
  );
}
