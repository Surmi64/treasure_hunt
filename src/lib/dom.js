/**
 * Minimal hyperscript. Keeps screens declarative without pulling in a
 * framework — the whole game is a handful of static views.
 *
 *   h('button.btn.btn--primary', { onclick: go }, 'Indulás')
 *   h('p', 'plain text')
 */
export function h(spec, props, ...children) {
  const [tag, ...classes] = String(spec).split('.');
  const el = document.createElement(tag || 'div');
  if (classes.length) el.className = classes.join(' ');

  const isProps =
    props != null &&
    typeof props === 'object' &&
    !Array.isArray(props) &&
    !(props instanceof Node);

  if (isProps) {
    for (const [key, value] of Object.entries(props)) {
      if (value == null || value === false) continue;
      if (key === 'class') el.className = `${el.className} ${value}`.trim();
      else if (key === 'html') el.innerHTML = value;
      else if (key === 'dataset') Object.assign(el.dataset, value);
      else if (key.startsWith('on') && typeof value === 'function') {
        el.addEventListener(key.slice(2), value);
      } else if (key in el && key !== 'list' && key !== 'type') {
        el[key] = value;
      } else {
        el.setAttribute(key, value === true ? '' : value);
      }
    }
  } else if (props != null) {
    children.unshift(props);
  }

  append(el, children);
  return el;
}

function append(el, children) {
  for (const child of children) {
    if (child == null || child === false) continue;
    if (Array.isArray(child)) append(el, child);
    else el.append(child instanceof Node ? child : document.createTextNode(String(child)));
  }
}

/** Parses an SVG source string into a live element. */
export function svg(source) {
  const doc = new DOMParser().parseFromString(source.trim(), 'image/svg+xml');
  return document.importNode(doc.documentElement, true);
}

export function clear(el) {
  el.replaceChildren();
  return el;
}

/** Announces a message to screen readers without stealing focus. */
export function announce(message) {
  const live = document.getElementById('live');
  if (live) live.textContent = message;
}
