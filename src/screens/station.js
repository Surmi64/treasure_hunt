import { stations } from 'virtual:content';
import { announce, h } from '../lib/dom.js';
import { st, t } from '../lib/i18n.js';
import { checkAnswer } from '../lib/answers.js';
import { addAttempt, isComplete, markSolved, showHint, state } from '../lib/store.js';
import { icon } from '../ui/icons.js';
import { stepsNav } from '../ui/steps.js';

const HINT_AFTER_ATTEMPTS = 2;

export function stationScreen(navigate, index) {
  const station = stations[index];
  const isLast = index === stations.length - 1;
  const solved = state.solved[index];

  const feedback = h('div', { 'aria-live': 'polite' });
  const hintSlot = h('div');

  const input = h('input.field__input', {
    id: 'answer',
    type: station.input === 'number' ? 'text' : 'text',
    inputmode: station.input === 'number' ? 'numeric' : 'text',
    autocomplete: 'off',
    autocapitalize: 'off',
    autocorrect: 'off',
    spellcheck: false,
    enterkeyhint: 'go',
    placeholder:
      station.input === 'number' ? t('answerPlaceholderNumber') : t('answerPlaceholderText'),
    disabled: solved,
    dataset: solved ? { state: 'correct' } : {},
    // clear the error the moment the visitor starts fixing it
    oninput: () => {
      if (input.dataset.state === 'wrong') {
        delete input.dataset.state;
        feedback.replaceChildren();
      }
    },
  });

  const submitBtn = h(
    'button.btn.btn--primary.btn--block',
    { type: 'submit', disabled: solved },
    icon('check', 'btn__icon'),
    t('check')
  );

  const nextBtn = h(
    'button.btn',
    {
      type: 'button',
      class: solved ? 'btn--primary' : 'btn--secondary',
      onclick: () => advance(),
    },
    isLast && isComplete() ? t('finishTitle') : t('next'),
    icon('arrowRight', 'btn__icon')
  );

  function advance() {
    if (isLast) {
      if (isComplete()) navigate('#/done');
      else navigate('#/s/1');
      return;
    }
    navigate(`#/s/${index + 2}`);
  }

  function renderHint() {
    hintSlot.replaceChildren(
      h('div.note.note--hint', icon('lamp'), h('span', h('b', `${t('hintLabel')}: `), st(station, 'hint')))
    );
  }

  function renderHintButton() {
    if (solved || state.hinted[index]) return;
    if ((state.attempts[index] ?? 0) < HINT_AFTER_ATTEMPTS) return;
    hintSlot.replaceChildren(
      h(
        'button.btn.btn--ghost.btn--block',
        {
          type: 'button',
          onclick: () => {
            showHint(index);
            renderHint();
          },
        },
        icon('lamp', 'btn__icon'),
        t('showHint')
      )
    );
  }

  if (solved) {
    // once the riddle is done there is nothing left to type or to hint at,
    // so the whole form collapses down to the reveal
    feedback.replaceChildren(revealNote());
  } else if (state.hinted[index]) {
    renderHint();
  } else {
    renderHintButton();
  }

  function revealNote() {
    return h(
      'div.note.note--ok',
      icon('check'),
      h('span', h('b', `${t('correct')} `), st(station, 'reveal'))
    );
  }

  async function onSubmit(event) {
    event.preventDefault();
    const value = input.value.trim();

    if (!value) {
      feedback.replaceChildren(h('div.note.note--err', icon('alert'), t('empty')));
      input.focus();
      return;
    }

    submitBtn.disabled = true;
    const ok = await checkAnswer(value, station.hashes);
    submitBtn.disabled = false;

    if (ok) {
      markSolved(index);
      input.disabled = true;
      input.dataset.state = 'correct';
      submitBtn.disabled = true;
      feedback.replaceChildren(revealNote());
      hintSlot.replaceChildren();
      announce(t('correct'));
      // re-render so the pager and the next button pick up the new state
      setTimeout(() => navigate(location.hash || `#/s/${index + 1}`, { force: true }), 900);
      return;
    }

    addAttempt(index);
    input.dataset.state = 'wrong';
    const many = (state.attempts[index] ?? 0) >= HINT_AFTER_ATTEMPTS;
    const message = many ? t('wrongAgain') : t('wrong');
    feedback.replaceChildren(h('div.note.note--err', icon('alert'), message));
    announce(message);
    renderHintButton();
    input.select();
  }

  return h(
    'section.view.station',
    h(
      'header.topbar',
      h(
        'button.iconbtn',
        { type: 'button', 'aria-label': t('prev'), onclick: () => navigate('#/intro') },
        icon('arrowLeft')
      ),
      h('span.topbar__title', t('siteName')),
      h(
        'button.iconbtn',
        { type: 'button', 'aria-label': t('map'), onclick: () => navigate('#/map') },
        icon('map')
      )
    ),

    stepsNav(navigate, index),

    h(
      'div.station__body',
      h(
        'div.station__head',
        h(
          'div.arch',
          { class: solved ? 'arch--solved' : '' },
          h('span.arch__num', String(index + 1))
        ),
        h(
          'div.station__titles',
          h('p.eyebrow', t('stationLabel', { n: index + 1 })),
          h('h1.display.station__title', st(station, 'title'))
        )
      ),

      station.image &&
        h('img.photo', {
          src: `photos/${station.image}`,
          alt: st(station, 'title'),
          loading: 'lazy',
          width: 800,
          height: 600,
        }),

      h('p.prose', st(station, 'story')),

      h('div.rule', h('span.rule__gem')),

      h('p.station__question', st(station, 'question')),

      h(
        'form.station__form',
        { onsubmit: onSubmit, novalidate: true },
        !solved &&
          h('div.field', h('label.field__label', { for: 'answer' }, t('answerLabel')), input),
        feedback,
        hintSlot,
        !solved && submitBtn
      )
    ),

    h(
      'nav.station__nav',
      h(
        'button.btn.btn--ghost',
        {
          type: 'button',
          disabled: index === 0,
          onclick: () => navigate(`#/s/${index}`),
        },
        icon('arrowLeft', 'btn__icon'),
        t('prev')
      ),
      nextBtn
    )
  );
}
