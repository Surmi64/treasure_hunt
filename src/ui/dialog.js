import { h } from '../lib/dom.js';

/**
 * Small confirm sheet. Native confirm() is avoided on purpose: it looks
 * foreign on mobile and, per the browser-automation notes, modal dialogs
 * block everything behind them.
 */
export function confirmDialog({ message, confirmLabel, cancelLabel, onConfirm }) {
  const previouslyFocused = document.activeElement;

  const close = () => {
    overlay.remove();
    document.removeEventListener('keydown', onKey);
    previouslyFocused?.focus?.();
  };

  const onKey = (event) => {
    if (event.key === 'Escape') close();
  };

  const cancelBtn = h(
    'button.btn.btn--ghost.btn--block',
    { type: 'button', onclick: close },
    cancelLabel
  );

  const overlay = h(
    'div.dialog',
    {
      role: 'dialog',
      'aria-modal': 'true',
      onclick: (event) => {
        if (event.target === overlay) close();
      },
    },
    h(
      'div.dialog__panel',
      h('p.prose', message),
      h(
        'div.dialog__actions',
        h(
          'button.btn.btn--primary.btn--block',
          {
            type: 'button',
            onclick: () => {
              close();
              onConfirm();
            },
          },
          confirmLabel
        ),
        cancelBtn
      )
    )
  );

  document.addEventListener('keydown', onKey);
  document.body.append(overlay);
  cancelBtn.focus();
}
