import { store } from '../state/store';
import { stopGameLoop } from '../core/game-loop';
import { el, button } from './dom-helpers';

let panel: HTMLElement;

export function createSettingsPanel(): HTMLElement {
  panel = el('div', { className: 'panel settings-panel' });
  panel.appendChild(el('h2', { className: 'panel__title', text: 'Settings' }));

  const desc = el('p', {
    className: 'settings-panel__desc',
    text: 'Manage your game data.',
  });
  panel.appendChild(desc);

  const resetBtn = button('Hard Reset', showResetConfirmation, {
    className: 'settings-panel__reset-btn',
  });
  panel.appendChild(resetBtn);

  return panel;
}

function showResetConfirmation(): void {
  const overlay = el('div', { className: 'reset-overlay' });

  const title = el('h2', { className: 'reset-overlay__title', text: 'Reset Game?' });
  const message = el('p', {
    className: 'reset-overlay__message',
    text: 'This will permanently delete all save data and start a brand new game. This cannot be undone.',
  });

  const buttons = el('div', { className: 'reset-overlay__buttons' });

  const confirmBtn = button('Yes, Reset Everything', () => {
    stopGameLoop();
    store.getState().resetGame();
    overlay.remove();
  }, {
    className: 'reset-overlay__btn reset-overlay__btn--confirm',
  });

  const cancelBtn = button('Cancel', () => {
    overlay.remove();
  }, {
    className: 'reset-overlay__btn reset-overlay__btn--cancel',
  });

  buttons.appendChild(confirmBtn);
  buttons.appendChild(cancelBtn);
  overlay.appendChild(title);
  overlay.appendChild(message);
  overlay.appendChild(buttons);

  document.body.appendChild(overlay);
}

export function updateSettingsPanel(): void {
  // Settings panel is static - no dynamic updates needed
}
