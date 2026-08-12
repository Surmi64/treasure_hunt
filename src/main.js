import './styles/fonts.css';
import './styles/tokens.css';
import './styles/base.css';
import './styles/components.css';
import './styles/screens.css';

import { stations } from 'virtual:content';
import { goTo, isComplete, state } from './lib/store.js';
import { languageScreen } from './screens/language.js';
import { introScreen } from './screens/intro.js';
import { stationScreen } from './screens/station.js';
import { mapScreen } from './screens/map.js';
import { finishScreen } from './screens/finish.js';

const app = document.getElementById('app');

/**
 * Hash routing keeps every screen deep-linkable and makes the phone's back
 * button behave the way visitors expect.
 *
 *   #/lang  #/intro  #/s/1 … #/s/7  #/map  #/done
 */
function navigate(hash, { force = false, replace = false } = {}) {
  if (location.hash === hash && !force) {
    render();
    return;
  }
  if (replace) {
    history.replaceState(null, '', hash);
    render();
  } else {
    location.hash = hash;
  }
}

function route() {
  const raw = location.hash.replace(/^#\/?/, '');
  const [head, arg] = raw.split('/');

  // #/lang stays reachable after a language has been picked, so a visitor
  // who tapped the wrong flag can go back and change it
  if (head === 'lang' || !state.lang) return { name: 'lang' };

  switch (head) {
    case 'intro':
      return { name: 'intro' };
    case 'map':
      return { name: 'map' };
    case 'done':
      return isComplete() ? { name: 'done' } : { name: 'station', index: 0 };
    case 's': {
      const n = Number.parseInt(arg, 10);
      if (Number.isNaN(n) || n < 1 || n > stations.length) return { name: 'intro' };
      return { name: 'station', index: n - 1 };
    }
    default:
      return { name: 'intro' };
  }
}

function render() {
  const target = route();

  let view;
  switch (target.name) {
    case 'lang':
      view = languageScreen(navigate);
      break;
    case 'intro':
      view = introScreen(navigate);
      break;
    case 'station':
      goTo(target.index);
      view = stationScreen(navigate, target.index);
      break;
    case 'map':
      view = mapScreen(navigate);
      break;
    case 'done':
      view = finishScreen(navigate);
      break;
  }

  app.replaceChildren(view);
  window.scrollTo({ top: 0, behavior: 'instant' });
}

window.addEventListener('hashchange', render);

if (state.lang) document.documentElement.lang = state.lang;
if (!location.hash) history.replaceState(null, '', state.lang ? '#/intro' : '#/lang');
render();
