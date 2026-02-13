import { describe, it, expect, beforeEach } from 'vitest';
import { store, createInitialGameState } from '../../../src/state/store';
import { applyClickActionEffects } from '../../../src/systems/life-cycle-system';

describe('Message Log', () => {
  describe('Initial state', () => {
    it('should include the initial amulet message on game start', () => {
      const initialState = createInitialGameState();
      expect(initialState.player.messageLog).toHaveLength(1);
      expect(initialState.player.messageLog[0]).toBe(
        "You've been walking the Slums when you found a strange looking amulet.",
      );
    });
  });

  describe('addMessage action', () => {
    beforeEach(() => {
      store.getState().resetGame();
    });

    it('should add a message to the log', () => {
      const initialLength = store.getState().player.messageLog.length;
      store.getState().addMessage('Test message');

      const messages = store.getState().player.messageLog;
      expect(messages).toHaveLength(initialLength + 1);
      expect(messages[messages.length - 1]).toBe('Test message');
    });

    it('should preserve previous messages when adding new ones', () => {
      const firstMessage = 'First test message';
      const secondMessage = 'Second test message';

      store.getState().addMessage(firstMessage);
      store.getState().addMessage(secondMessage);

      const messages = store.getState().player.messageLog;
      expect(messages).toContain(firstMessage);
      expect(messages).toContain(secondMessage);
      expect(messages[messages.length - 2]).toBe(firstMessage);
      expect(messages[messages.length - 1]).toBe(secondMessage);
    });
  });

  describe('showMessage effect in life-cycle-system', () => {
    it('should add message to log when showMessage effect is applied', () => {
      const initialState = createInitialGameState();
      const testMessage = 'A mysterious event occurred!';

      const newState = applyClickActionEffects(
        initialState,
        [{ type: 'showMessage', message: testMessage }],
        0,
      );

      expect(newState.player.messageLog).toContain(testMessage);
      expect(newState.player.messageLog[newState.player.messageLog.length - 1]).toBe(testMessage);
    });

    it('should preserve existing messages when adding via showMessage effect', () => {
      const initialState = createInitialGameState();
      const message1 = 'First event';
      const message2 = 'Second event';

      let state = applyClickActionEffects(
        initialState,
        [{ type: 'showMessage', message: message1 }],
        0,
      );

      state = applyClickActionEffects(
        state,
        [{ type: 'showMessage', message: message2 }],
        0,
      );

      expect(state.player.messageLog).toContain(message1);
      expect(state.player.messageLog).toContain(message2);
      // Should also still have the initial message
      expect(state.player.messageLog[0]).toBe(
        "You've been walking the Slums when you found a strange looking amulet.",
      );
    });
  });

  describe('Reincarnation', () => {
    beforeEach(() => {
      store.getState().resetGame();
    });

    it('should reset message log to initial message on reincarnation', () => {
      // Add some messages during the life
      store.getState().addMessage('You lived a full life');
      store.getState().addMessage('Many things happened');

      expect(store.getState().player.messageLog.length).toBeGreaterThan(1);

      // Reincarnate
      store.getState().resetForReincarnation();

      // Should only have the initial message
      const messages = store.getState().player.messageLog;
      expect(messages).toHaveLength(1);
      expect(messages[0]).toBe(
        "You've been walking the Slums when you found a strange looking amulet.",
      );
    });
  });
});
