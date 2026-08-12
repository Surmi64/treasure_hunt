import { LANGS, ui } from 'virtual:content';
import { h } from '../lib/dom.js';
import { setLang, state } from '../lib/store.js';
import { icon } from '../ui/icons.js';
import { flag, logoMark } from '../ui/marks.js';

/**
 * The game opens here. Picking a flag only selects it — a separate button
 * starts the game, so the first tap is never also a commitment.
 *
 * The language is applied to the store the moment it is picked, though, not
 * when the button is pressed: that is what lets the button label itself switch
 * into the chosen language, which is the clearest possible confirmation that
 * the tap registered.
 */
export function languageScreen(navigate) {
  // reopened from the intro rather than shown on arrival
  const returning = Boolean(state.lang);

  let picked = state.lang;

  const startLabel = h('span', ui[picked ?? 'hu'].start);
  const startBtn = h(
    'button.btn.btn--primary.btn--block.lang__start',
    {
      type: 'button',
      disabled: !picked,
      onclick: () => {
        if (!picked) return;
        // first run continues to the age picker; a returning visitor only
        // wanted to change the language
        navigate(state.track ? '#/intro' : '#/track');
      },
    },
    startLabel,
    icon('arrowRight', 'btn__icon')
  );

  const rows = LANGS.map((lang) => {
    const go = h('span.lang__go');
    const btn = h(
      'button.lang__btn',
      { type: 'button', lang, onclick: () => select(lang) },
      h('span.lang__flag', flag(lang)),
      h('span.lang__name', ui[lang].langName),
      go
    );
    return { lang, btn, go };
  });

  function paint() {
    for (const row of rows) {
      const active = picked === row.lang;
      row.btn.classList.toggle('lang__btn--active', active);
      if (active) row.btn.setAttribute('aria-current', 'true');
      else row.btn.removeAttribute('aria-current');
      row.go.replaceChildren(icon(active ? 'check' : 'arrowRight'));
    }
    startLabel.textContent = ui[picked ?? 'hu'].start;
    startBtn.disabled = !picked;
  }

  function select(lang) {
    picked = lang;
    setLang(lang);
    paint();
  }

  paint();

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
      h('div.lang__list', rows.map((row) => row.btn)),
      startBtn
    )
  );
}
