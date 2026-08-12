import './styles/fonts.css';
import './styles/tokens.css';
import './styles/themes.css';
import './styles/base.css';
import './styles/components.css';
import './styles/screens.css';

import { stations } from 'virtual:content';
import { cheatEnabled, cheatRedirect } from './lib/cheat.js';
import { applyTrack, goTo, isComplete, state } from './lib/store.js';
import { languageScreen } from './screens/language.js';
import { introScreen } from './screens/intro.js';
import { storyScreen, taskScreen } from './screens/station.js';
import { trackScreen } from './screens/track.js';
import { mapScreen } from './screens/map.js';
import { finishScreen } from './screens/finish.js';

const app = document.getElementById('app');

/**
 * Hash routing keeps every screen deep-linkable and makes the phone's back
 * button behave the way visitors expect.
 *
 *   #/lang  #/track  #/intro  #/s/1 … #/s/7  #/s/N/q  #/map  #/done
 *
 * A station is two steps: #/s/3 is its story, #/s/3/q its riddle.
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
  const [head, arg, sub] = raw.split('/');

  // both pickers stay reachable afterwards, so a visitor who tapped the wrong
  // flag — or the wrong age — can go back and change it
  if (head === 'lang' || !state.lang) return { name: 'lang' };
  if (head === 'track' || !state.track) return { name: 'track' };

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
      return { name: sub === 'q' ? 'task' : 'story', index: n - 1 };
    }
    default:
      return { name: 'intro' };
  }
}

function render() {
  // the test hashes do their work and hand over; harmless in a release build,
  // where cheatRedirect is compiled down to a function that always returns null
  const jump = cheatRedirect(location.hash);
  if (jump) {
    navigate(jump, { replace: true });
    return;
  }

  const target = route();

  let view;
  switch (target.name) {
    case 'lang':
      view = languageScreen(navigate);
      break;
    case 'intro':
      view = introScreen(navigate);
      break;
    case 'track':
      view = trackScreen(navigate);
      break;
    case 'story':
      goTo(target.index);
      view = storyScreen(navigate, target.index);
      break;
    case 'task':
      goTo(target.index);
      view = taskScreen(navigate, target.index);
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
// a corner marker, so a test build is never mistaken for the real one
if (cheatEnabled) document.documentElement.dataset.cheat = 'on';
applyTrack();
if (!location.hash) {
  history.replaceState(null, '', state.lang && state.track ? '#/intro' : '#/lang');
}
render();
