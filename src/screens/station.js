import { stations } from 'virtual:content';
import { announce, h } from '../lib/dom.js';
import { st, t } from '../lib/i18n.js';
import { checkAnswer } from '../lib/answers.js';
import { isCheatCode } from '../lib/cheat.js';
import { addAttempt, isComplete, markSolved, showHint, state, trackOf } from '../lib/store.js';
import { icon } from '../ui/icons.js';
import { stepsNav } from '../ui/steps.js';
import { doorBadge } from '../ui/marks.js';
import { MAP_ENABLED } from '../lib/flow.js';
import { playDoorOpening } from '../ui/doorburst.js';

const HINT_AFTER_ATTEMPTS = 2;

/**
 * Every station is two steps: the story of the place, then the riddle.
 *
 * The story comes first so visitors learn where they are standing before they
 * are asked anything — that is the point of the whole game. It is never a
 * gate, though: the riddle is one tap away and reachable directly by URL.
 */

/* ------------------------------ shared chrome ------------------------------ */

function chrome(navigate, index, step) {
  const station = stations[index];

  const tab = (name, hash, label) =>
    h(
      'button.substep',
      {
        type: 'button',
        class: step === name ? 'substep--current' : '',
        'aria-current': step === name ? 'step' : null,
        onclick: () => navigate(hash),
      },
      label
    );

  return [
    h(
      'header.topbar',
      h(
        'button.iconbtn',
        { type: 'button', 'aria-label': t('prev'), onclick: () => navigate('#/intro') },
        icon('arrowLeft')
      ),
      h('span.topbar__title', t('siteName')),
      MAP_ENABLED
        ? h(
            'button.iconbtn',
            { type: 'button', 'aria-label': t('map'), onclick: () => navigate('#/map') },
            icon('map')
          )
        : // a spacer, not nothing: the title is flex:1 and would sit off-centre
          h('span', { style: 'width:44px' })
    ),

    stepsNav(navigate, index),

    h(
      'div.station__head',
      doorBadge(String(index + 1), { solved: state.solved[index] }),
      h(
        'div.station__titles',
        h('p.eyebrow', t('stationLabel', { n: index + 1 })),
        h('h1.display.station__title', st(station, 'title'))
      )
    ),

    h(
      'nav.substeps',
      { 'aria-label': t('stationLabel', { n: index + 1 }) },
      tab('story', `#/s/${index + 1}`, t('storyStep')),
      tab('task', `#/s/${index + 1}/q`, t('taskStep'))
    ),
  ];
}

function stationNav(navigate, index, extra) {
  return h(
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
    extra
  );
}

/* -------------------------------- step one -------------------------------- */

export function storyScreen(navigate, index) {
  const station = stations[index];
  const image = trackOf(station).image;

  return h(
    'section.view.station',
    chrome(navigate, index, 'story'),

    h(
      'div.station__body',
      image &&
        h('img.photo', {
          src: `photos/${image}`,
          alt: st(station, 'title'),
          loading: 'lazy',
          width: 800,
          height: 600,
        }),

      h('p.prose.station__story', st(station, 'story')),

      h('div.rule', h('span.rule__gem')),

      h('p.muted', { style: 'text-align:center' }, t('readFirst')),

      h(
        'button.btn.btn--primary.btn--block',
        { type: 'button', onclick: () => navigate(`#/s/${index + 1}/q`) },
        t('toTask'),
        icon('arrowRight', 'btn__icon')
      )
    ),

    stationNav(
      navigate,
      index,
      h(
        'button.btn.btn--secondary',
        {
          type: 'button',
          onclick: () =>
            navigate(index === stations.length - 1 ? '#/s/1' : `#/s/${index + 2}`),
        },
        t('next'),
        icon('arrowRight', 'btn__icon')
      )
    )
  );
}

/* -------------------------------- step two -------------------------------- */

export function taskScreen(navigate, index) {
  const station = stations[index];
  const task = trackOf(station);
  const isLast = index === stations.length - 1;
  const solved = state.solved[index];

  const feedback = h('div', { 'aria-live': 'polite' });
  const hintSlot = h('div');

  const input = h('input.field__input', {
    id: 'answer',
    type: 'text',
    inputmode: task.input === 'number' ? 'numeric' : 'text',
    autocomplete: 'off',
    autocapitalize: 'off',
    autocorrect: 'off',
    spellcheck: false,
    enterkeyhint: 'go',
    placeholder:
      task.input === 'number' ? t('answerPlaceholderNumber') : t('answerPlaceholderText'),
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
    { type: 'submit' },
    icon('check', 'btn__icon'),
    t('check')
  );

  function revealNote() {
    return h(
      'div.note.note--ok',
      icon('check'),
      h('span', h('b', `${t('correct')} `), st(station, 'reveal'))
    );
  }

  function renderHint() {
    hintSlot.replaceChildren(
      h(
        'div.note.note--hint',
        icon('lamp'),
        h('span', h('b', `${t('hintLabel')}: `), st(station, 'hint'))
      )
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
    // nothing left to type or to hint at; the form collapses to the reveal
    feedback.replaceChildren(revealNote());
  } else if (state.hinted[index]) {
    renderHint();
  } else {
    renderHintButton();
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
    const ok = isCheatCode(value) || (await checkAnswer(value, task.hashes));
    submitBtn.disabled = false;

    if (ok) {
      markSolved(index);
      input.disabled = true;
      input.dataset.state = 'correct';
      submitBtn.disabled = true;
      feedback.replaceChildren(revealNote());
      hintSlot.replaceChildren();
      announce(t('correct'));

      // the answer that completes the run earns the door, not a page swap
      if (isComplete()) {
        setTimeout(async () => {
          const door = playDoorOpening();
          await door.finished;
          // route first, dismiss second: the overlay has to keep covering this
          // station until the finish screen is on the page behind it
          navigate('#/done');
          door.dismiss();
        }, 700);
        return;
      }

      // re-render so the pager and the next button pick up the new state
      setTimeout(() => navigate(`#/s/${index + 1}/q`, { force: true }), 900);
      return;
    }

    addAttempt(index);
    input.dataset.state = 'wrong';
    const message = (state.attempts[index] ?? 0) >= HINT_AFTER_ATTEMPTS ? t('wrongAgain') : t('wrong');
    feedback.replaceChildren(h('div.note.note--err', icon('alert'), message));
    announce(message);
    renderHintButton();
    input.select();
  }

  const advance = () => {
    if (!isLast) return navigate(`#/s/${index + 2}`);
    navigate(isComplete() ? '#/done' : '#/s/1');
  };

  return h(
    'section.view.station',
    chrome(navigate, index, 'task'),

    h(
      'div.station__body',
      h('p.station__question', st(station, 'question')),

      h(
        'form.station__form',
        { onsubmit: onSubmit, novalidate: true },
        !solved &&
          h('div.field', h('label.field__label', { for: 'answer' }, t('answerLabel')), input),
        feedback,
        hintSlot,
        !solved && submitBtn
      ),

      h(
        'button.btn.btn--ghost.btn--block',
        { type: 'button', onclick: () => navigate(`#/s/${index + 1}`) },
        icon('arrowLeft', 'btn__icon'),
        t('backToStory')
      )
    ),

    stationNav(
      navigate,
      index,
      h(
        'button.btn',
        {
          type: 'button',
          class: solved ? 'btn--primary' : 'btn--secondary',
          onclick: advance,
        },
        isLast && isComplete() ? t('finishTitle') : t('next'),
        icon('arrowRight', 'btn__icon')
      )
    )
  );
}
