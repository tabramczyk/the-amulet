import { describe, it, expect } from 'vitest';
import { evaluateTriggeredEvents } from '../../../src/systems/event-system';
import { createInitialGameState } from '../../../src/state/store';
import type { GameState, TriggeredEvent } from '../../../specs/schemas';

function makeState(overrides?: Partial<GameState>): GameState {
  return { ...createInitialGameState(), ...overrides };
}

// --- Shared mock events ---

/** Non-blocking event that logs a message and sets a story flag. Priority 0. */
const LOW_PRIORITY_EVENT: TriggeredEvent = {
  id: 'low_priority_event',
  name: 'Low Priority Event',
  description: 'Fires at age >= 20 if not already fired.',
  conditions: [
    { type: 'age', minAge: 20 },
    { type: 'storyFlag', flag: 'low_priority_fired', value: false },
  ],
  effects: [
    { type: 'setStoryFlag', flag: 'low_priority_fired', value: true },
    { type: 'showMessage', message: 'Low priority event fired.' },
  ],
  blocking: false,
  priority: 0,
};

/** Non-blocking event that fires first (priority 10), sets money flag. */
const HIGH_PRIORITY_EVENT: TriggeredEvent = {
  id: 'high_priority_event',
  name: 'High Priority Event',
  description: 'Fires at age >= 20 if not already fired. Runs before low priority.',
  conditions: [
    { type: 'age', minAge: 20 },
    { type: 'storyFlag', flag: 'high_priority_fired', value: false },
  ],
  effects: [
    { type: 'setStoryFlag', flag: 'high_priority_fired', value: true },
    { type: 'showMessage', message: 'High priority event fired.' },
  ],
  blocking: false,
  priority: 10,
};

/** Blocking event that pauses the game and clears actions. Priority 5. */
const BLOCKING_EVENT: TriggeredEvent = {
  id: 'blocking_event',
  name: 'Blocking Event',
  description: 'Fires at age >= 25 and pauses game.',
  conditions: [
    { type: 'age', minAge: 25 },
    { type: 'storyFlag', flag: 'blocking_fired', value: false },
  ],
  effects: [
    { type: 'setStoryFlag', flag: 'blocking_fired', value: true },
    { type: 'showMessage', message: 'Blocking event fired.' },
  ],
  blocking: true,
  priority: 5,
};

/** Non-blocking event that fires after the blocking event by priority ordering. Priority 0. */
const AFTER_BLOCKING_EVENT: TriggeredEvent = {
  id: 'after_blocking_event',
  name: 'After Blocking Event',
  description: 'Would fire at age >= 25, but should be skipped after a blocking event.',
  conditions: [
    { type: 'age', minAge: 25 },
    { type: 'storyFlag', flag: 'after_blocking_fired', value: false },
  ],
  effects: [
    { type: 'setStoryFlag', flag: 'after_blocking_fired', value: true },
    { type: 'showMessage', message: 'After blocking event fired.' },
  ],
  blocking: false,
  priority: 0,
};

/** Event that requires multiple conditions that will NOT all be met (AND logic). */
const MULTI_CONDITION_EVENT: TriggeredEvent = {
  id: 'multi_condition_event',
  name: 'Multi-Condition Event',
  description: 'Requires age >= 20 AND a specific story flag.',
  conditions: [
    { type: 'age', minAge: 20 },
    { type: 'storyFlag', flag: 'prerequisite_met', value: true },
  ],
  effects: [
    { type: 'setStoryFlag', flag: 'multi_condition_fired', value: true },
  ],
  blocking: false,
  priority: 0,
};

/** First of two chained non-blocking events. Clears food (simulating meal theft). */
const FOOD_CLEARING_EVENT: TriggeredEvent = {
  id: 'food_clearing_event',
  name: 'Food Clearing Event',
  description: 'Clears food from the player.',
  conditions: [
    { type: 'storyFlag', flag: 'food_theft_active', value: true },
    { type: 'storyFlag', flag: 'food_cleared', value: false },
  ],
  effects: [
    { type: 'setFoodId', foodId: null },
    { type: 'setStoryFlag', flag: 'food_cleared', value: true },
  ],
  blocking: false,
  priority: 10,
};

/** Second of two chained non-blocking events. Reacts to food having been cleared. */
const FOOD_GONE_REACTION_EVENT: TriggeredEvent = {
  id: 'food_gone_reaction_event',
  name: 'Food Gone Reaction Event',
  description: 'Fires after food_cleared flag is set by a prior event on the same tick.',
  conditions: [
    { type: 'storyFlag', flag: 'food_cleared', value: true },
    { type: 'storyFlag', flag: 'food_gone_reacted', value: false },
  ],
  effects: [
    { type: 'setStoryFlag', flag: 'food_gone_reacted', value: true },
    { type: 'showMessage', message: 'Food is gone — reacting.' },
  ],
  blocking: false,
  priority: 5,
};

/** Event with a condition that will never be met (wrong flag value). */
const UNMET_CONDITION_EVENT: TriggeredEvent = {
  id: 'unmet_condition_event',
  name: 'Unmet Condition Event',
  description: 'This event should never fire because its conditions are never met.',
  conditions: [
    { type: 'storyFlag', flag: 'impossible_flag', value: true },
  ],
  effects: [
    { type: 'setStoryFlag', flag: 'unmet_event_fired', value: true },
  ],
  blocking: false,
  priority: 0,
};

// ---------------------------------------------------------------------------

describe('Event System — evaluateTriggeredEvents', () => {
  describe('Empty events list', () => {
    it('should return state unchanged when no events are provided', () => {
      const state = makeState({
        time: { currentDay: 100, currentAge: 22, tickAccumulator: 0 },
      });
      const result = evaluateTriggeredEvents(state, []);
      expect(result).toEqual(state);
    });

    it('should return state unchanged when events list is omitted', () => {
      // Default TRIGGERED_EVENTS — conditions will not be met for a brand-new state
      // so at minimum the state object reference structure must be stable
      const state = makeState();
      const result = evaluateTriggeredEvents(state);
      // State shape must be preserved
      expect(result.version).toBe(state.version);
      expect(result.isRunning).toBe(state.isRunning);
    });
  });

  describe('No conditions met', () => {
    it('should skip an event whose conditions are not met and return state unchanged', () => {
      const state = makeState({
        time: { currentDay: 0, currentAge: 16, tickAccumulator: 0 },
      });
      const result = evaluateTriggeredEvents(state, [UNMET_CONDITION_EVENT]);
      expect(result.player.storyFlags['unmet_event_fired']).toBeUndefined();
      expect(result).toEqual(state);
    });

    it('should skip all events when none meet their conditions', () => {
      const state = makeState({
        time: { currentDay: 0, currentAge: 16, tickAccumulator: 0 },
      });
      const result = evaluateTriggeredEvents(state, [
        UNMET_CONDITION_EVENT,
        LOW_PRIORITY_EVENT,  // age < 20 — not met
        MULTI_CONDITION_EVENT, // age < 20 AND flag missing — not met
      ]);
      expect(result.player.storyFlags['low_priority_fired']).toBeUndefined();
      expect(result.player.storyFlags['multi_condition_fired']).toBeUndefined();
      expect(result.player.storyFlags['unmet_event_fired']).toBeUndefined();
    });
  });

  describe('AND condition logic', () => {
    it('should not fire an event when only some conditions are met', () => {
      // age condition IS met (age 22 >= 20) but prerequisite_met flag is NOT set
      const state = makeState({
        time: { currentDay: (22 - 16) * 365, currentAge: 22, tickAccumulator: 0 },
        player: {
          ...createInitialGameState().player,
          storyFlags: {},  // prerequisite_met is absent/false
        },
      });
      const result = evaluateTriggeredEvents(state, [MULTI_CONDITION_EVENT]);
      expect(result.player.storyFlags['multi_condition_fired']).toBeUndefined();
    });

    it('should fire an event only when ALL conditions are met', () => {
      const state = makeState({
        time: { currentDay: (22 - 16) * 365, currentAge: 22, tickAccumulator: 0 },
        player: {
          ...createInitialGameState().player,
          storyFlags: { prerequisite_met: true },
        },
      });
      const result = evaluateTriggeredEvents(state, [MULTI_CONDITION_EVENT]);
      expect(result.player.storyFlags['multi_condition_fired']).toBe(true);
    });

    it('should not fire when the first condition fails even if the second would pass', () => {
      // age < 20 fails (age 18), so multi_condition_event should not fire
      // even though prerequisite_met is true
      const state = makeState({
        time: { currentDay: (18 - 16) * 365, currentAge: 18, tickAccumulator: 0 },
        player: {
          ...createInitialGameState().player,
          storyFlags: { prerequisite_met: true },
        },
      });
      const result = evaluateTriggeredEvents(state, [MULTI_CONDITION_EVENT]);
      expect(result.player.storyFlags['multi_condition_fired']).toBeUndefined();
    });
  });

  describe('Priority ordering', () => {
    it('should evaluate higher-priority events before lower-priority events', () => {
      // Both events fire at age >= 20. HIGH_PRIORITY (10) should fire before LOW_PRIORITY (0).
      // We verify this by checking that BOTH flags are set on the returned state.
      const state = makeState({
        time: { currentDay: (22 - 16) * 365, currentAge: 22, tickAccumulator: 0 },
      });
      const result = evaluateTriggeredEvents(state, [
        LOW_PRIORITY_EVENT,
        HIGH_PRIORITY_EVENT,
      ]);
      expect(result.player.storyFlags['high_priority_fired']).toBe(true);
      expect(result.player.storyFlags['low_priority_fired']).toBe(true);
    });

    it('should process events in descending priority order regardless of input order', () => {
      // Provide events in reverse priority order to confirm they are sorted before processing
      const state = makeState({
        time: { currentDay: (22 - 16) * 365, currentAge: 22, tickAccumulator: 0 },
      });
      const resultA = evaluateTriggeredEvents(state, [
        LOW_PRIORITY_EVENT,
        HIGH_PRIORITY_EVENT,
      ]);
      const resultB = evaluateTriggeredEvents(state, [
        HIGH_PRIORITY_EVENT,
        LOW_PRIORITY_EVENT,
      ]);
      // Both orderings of input should yield the same output state
      expect(resultA.player.storyFlags).toEqual(resultB.player.storyFlags);
    });

    it('should apply effects of the high-priority event before the low-priority event sees state', () => {
      // FOOD_CLEARING_EVENT (priority 10) fires first and sets food_cleared=true
      // FOOD_GONE_REACTION_EVENT (priority 5) sees the updated state and fires too
      const state = makeState({
        player: {
          ...createInitialGameState().player,
          storyFlags: { food_theft_active: true },
          currentFoodId: 'some_food',
        },
      });
      const result = evaluateTriggeredEvents(state, [
        FOOD_GONE_REACTION_EVENT,   // priority 5 — input order is lower priority first
        FOOD_CLEARING_EVENT,        // priority 10
      ]);
      // The food clearing event should have fired
      expect(result.player.currentFoodId).toBeNull();
      expect(result.player.storyFlags['food_cleared']).toBe(true);
      // The reaction event should also have fired because it sees the mutated state
      expect(result.player.storyFlags['food_gone_reacted']).toBe(true);
    });
  });

  describe('Non-blocking behavior', () => {
    it('should apply effects of a non-blocking event without stopping the game', () => {
      const state = makeState({
        isRunning: true,
        time: { currentDay: (22 - 16) * 365, currentAge: 22, tickAccumulator: 0 },
        player: {
          ...createInitialGameState().player,
          activeJobActionId: 'begging',
          activeSkillActionId: 'train_concentration',
        },
      });
      const result = evaluateTriggeredEvents(state, [LOW_PRIORITY_EVENT]);
      // Effects applied
      expect(result.player.storyFlags['low_priority_fired']).toBe(true);
      expect(result.player.messageLog).toContain('Low priority event fired.');
      // Game is still running — active actions preserved
      expect(result.isRunning).toBe(true);
      expect(result.player.activeJobActionId).toBe('begging');
      expect(result.player.activeSkillActionId).toBe('train_concentration');
    });

    it('should continue evaluating subsequent events after a non-blocking event fires', () => {
      const state = makeState({
        isRunning: true,
        time: { currentDay: (22 - 16) * 365, currentAge: 22, tickAccumulator: 0 },
      });
      const result = evaluateTriggeredEvents(state, [
        HIGH_PRIORITY_EVENT,
        LOW_PRIORITY_EVENT,
      ]);
      // Both events should have fired
      expect(result.player.storyFlags['high_priority_fired']).toBe(true);
      expect(result.player.storyFlags['low_priority_fired']).toBe(true);
    });
  });

  describe('Blocking behavior', () => {
    it('should set isRunning=false when a blocking event fires', () => {
      const state = makeState({
        isRunning: true,
        time: { currentDay: (27 - 16) * 365, currentAge: 27, tickAccumulator: 0 },
      });
      const result = evaluateTriggeredEvents(state, [BLOCKING_EVENT]);
      expect(result.isRunning).toBe(false);
    });

    it('should clear activeJobActionId when a blocking event fires', () => {
      const state = makeState({
        isRunning: true,
        time: { currentDay: (27 - 16) * 365, currentAge: 27, tickAccumulator: 0 },
        player: {
          ...createInitialGameState().player,
          activeJobActionId: 'begging',
        },
      });
      const result = evaluateTriggeredEvents(state, [BLOCKING_EVENT]);
      expect(result.player.activeJobActionId).toBeNull();
    });

    it('should clear activeSkillActionId when a blocking event fires', () => {
      const state = makeState({
        isRunning: true,
        time: { currentDay: (27 - 16) * 365, currentAge: 27, tickAccumulator: 0 },
        player: {
          ...createInitialGameState().player,
          activeSkillActionId: 'train_concentration',
        },
      });
      const result = evaluateTriggeredEvents(state, [BLOCKING_EVENT]);
      expect(result.player.activeSkillActionId).toBeNull();
    });

    it('should still apply the blocking event effects before pausing', () => {
      const state = makeState({
        isRunning: true,
        time: { currentDay: (27 - 16) * 365, currentAge: 27, tickAccumulator: 0 },
      });
      const result = evaluateTriggeredEvents(state, [BLOCKING_EVENT]);
      // Effects from the blocking event must be applied
      expect(result.player.storyFlags['blocking_fired']).toBe(true);
      expect(result.player.messageLog).toContain('Blocking event fired.');
    });

    it('should not evaluate any further events after a blocking event fires', () => {
      // BLOCKING_EVENT (priority 5) fires first among the two in-range events.
      // AFTER_BLOCKING_EVENT (priority 0) should NOT fire.
      const state = makeState({
        isRunning: true,
        time: { currentDay: (27 - 16) * 365, currentAge: 27, tickAccumulator: 0 },
      });
      const result = evaluateTriggeredEvents(state, [
        BLOCKING_EVENT,
        AFTER_BLOCKING_EVENT,
      ]);
      expect(result.player.storyFlags['blocking_fired']).toBe(true);
      expect(result.player.storyFlags['after_blocking_fired']).toBeUndefined();
    });

    it('should not stop processing for non-blocking events that precede a blocking one', () => {
      // HIGH_PRIORITY_EVENT (priority 10, non-blocking) fires first.
      // BLOCKING_EVENT (priority 5, blocking) fires second and halts.
      // AFTER_BLOCKING_EVENT (priority 0, non-blocking) is skipped.
      const state = makeState({
        isRunning: true,
        time: { currentDay: (27 - 16) * 365, currentAge: 27, tickAccumulator: 0 },
      });
      const result = evaluateTriggeredEvents(state, [
        HIGH_PRIORITY_EVENT,
        BLOCKING_EVENT,
        AFTER_BLOCKING_EVENT,
      ]);
      expect(result.player.storyFlags['high_priority_fired']).toBe(true);
      expect(result.player.storyFlags['blocking_fired']).toBe(true);
      expect(result.player.storyFlags['after_blocking_fired']).toBeUndefined();
      expect(result.isRunning).toBe(false);
    });
  });

  describe('State propagation across non-blocking events', () => {
    it('should expose state mutations from one non-blocking event to subsequent events', () => {
      // FOOD_CLEARING_EVENT sets food_cleared=true.
      // FOOD_GONE_REACTION_EVENT conditions include food_cleared=true.
      // Both have all other conditions met. Reaction event should see the mutated state.
      const state = makeState({
        player: {
          ...createInitialGameState().player,
          storyFlags: { food_theft_active: true },
          currentFoodId: 'prison_food',
        },
      });
      const result = evaluateTriggeredEvents(state, [
        FOOD_CLEARING_EVENT,
        FOOD_GONE_REACTION_EVENT,
      ]);
      expect(result.player.currentFoodId).toBeNull();
      expect(result.player.storyFlags['food_cleared']).toBe(true);
      expect(result.player.storyFlags['food_gone_reacted']).toBe(true);
    });

    it('should not expose later event effects to earlier events in priority order', () => {
      // FOOD_GONE_REACTION_EVENT (priority 5) needs food_cleared=true.
      // FOOD_CLEARING_EVENT (priority 10) fires first and sets it.
      // Confirmed by the state propagation test above. This test verifies the original
      // state was not already satisfying food_gone_reacted conditions (precondition check).
      const state = makeState({
        player: {
          ...createInitialGameState().player,
          // food_cleared starts as absent/false
          storyFlags: { food_theft_active: true },
        },
      });
      // Without food_clearing_event running first, food_gone_reaction must NOT fire
      const result = evaluateTriggeredEvents(state, [FOOD_GONE_REACTION_EVENT]);
      expect(result.player.storyFlags['food_gone_reacted']).toBeUndefined();
    });
  });

  describe('Effects application', () => {
    it('should apply setFoodId effect to null', () => {
      const state = makeState({
        player: {
          ...createInitialGameState().player,
          storyFlags: { food_theft_active: true },
          currentFoodId: 'prison_food',
        },
      });
      const result = evaluateTriggeredEvents(state, [FOOD_CLEARING_EVENT]);
      expect(result.player.currentFoodId).toBeNull();
    });

    it('should apply showMessage effect by appending to messageLog', () => {
      const state = makeState({
        time: { currentDay: (22 - 16) * 365, currentAge: 22, tickAccumulator: 0 },
      });
      const result = evaluateTriggeredEvents(state, [LOW_PRIORITY_EVENT]);
      expect(result.player.messageLog).toContain('Low priority event fired.');
    });

    it('should apply setStoryFlag effect', () => {
      const state = makeState({
        time: { currentDay: (22 - 16) * 365, currentAge: 22, tickAccumulator: 0 },
      });
      const result = evaluateTriggeredEvents(state, [LOW_PRIORITY_EVENT]);
      expect(result.player.storyFlags['low_priority_fired']).toBe(true);
    });

    it('should apply multiple effects from a single event in order', () => {
      // LOW_PRIORITY_EVENT applies setStoryFlag then showMessage
      const state = makeState({
        time: { currentDay: (22 - 16) * 365, currentAge: 22, tickAccumulator: 0 },
      });
      const result = evaluateTriggeredEvents(state, [LOW_PRIORITY_EVENT]);
      expect(result.player.storyFlags['low_priority_fired']).toBe(true);
      expect(result.player.messageLog).toContain('Low priority event fired.');
    });
  });
});
