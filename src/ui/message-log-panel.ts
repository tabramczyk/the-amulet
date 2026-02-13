import { store } from '../state/store';
import { el, clearChildren } from './dom-helpers';

let panel: HTMLElement;
let messagesContainer: HTMLElement;

/**
 * Create the message log panel UI.
 */
export function createMessageLogPanel(): HTMLElement {
  panel = el('div', { className: 'panel message-log' });

  const title = el('h3', {
    className: 'panel__title',
    text: 'Story'
  });

  messagesContainer = el('div', { className: 'message-log__messages' });

  panel.appendChild(title);
  panel.appendChild(messagesContainer);

  return panel;
}

/**
 * Update the message log panel with current messages.
 */
export function updateMessageLogPanel(): void {
  const state = store.getState();
  const messages = state.player.messageLog;

  clearChildren(messagesContainer);

  if (messages.length === 0) {
    const emptyMsg = el('div', {
      className: 'message-log__entry message-log__entry--empty',
      text: 'Your story begins...'
    });
    messagesContainer.appendChild(emptyMsg);
    return;
  }

  // Display all messages - older ones grayed out, newest stands out
  const total = messages.length;
  for (let i = 0; i < total; i++) {
    const message = messages[i];
    if (!message) continue; // Skip undefined entries (shouldn't happen)

    const entry = el('div', { className: 'message-log__entry' });
    entry.textContent = message;
    // Newest message is full brightness, older ones fade
    if (i < total - 1) {
      const age = total - 1 - i; // how many messages ago
      const opacity = Math.max(0.35, 1 - age * 0.15);
      entry.style.opacity = opacity.toString();
    }
    messagesContainer.appendChild(entry);
  }
}
