import type { GameState, TriggeredEvent } from '../../specs/schemas';
import { isRequirementMet } from './action-system';
import { applySingleClickEffect } from './life-cycle-system';
import { TRIGGERED_EVENTS } from '../data/events';

/**
 * Evaluate all triggered events against the current game state.
 * Events are sorted by priority (highest first).
 * Blocking events pause the game, clear active actions, and stop processing.
 * Non-blocking events apply effects and continue to the next event.
 */
export function evaluateTriggeredEvents(
  state: GameState,
  events: TriggeredEvent[] = TRIGGERED_EVENTS,
): GameState {
  // Sort by priority descending
  const sorted = [...events].sort((a, b) => (b.priority ?? 0) - (a.priority ?? 0));

  let current = state;

  for (const event of sorted) {
    // Check all conditions (AND logic)
    const allConditionsMet = event.conditions.every((condition) =>
      isRequirementMet(
        condition,
        current.skills,
        current.jobs,
        current.player.storyFlags,
        current.time.currentAge,
        current.player.clanIds,
        current.time.currentDay,
        current.player.pendingRelocation,
        current.player.currentLocationId,
      ),
    );

    if (!allConditionsMet) continue;

    // Apply all effects
    for (const effect of event.effects) {
      current = applySingleClickEffect(current, effect);
    }

    // If blocking, pause game, clear actions, and stop processing
    if (event.blocking) {
      current = {
        ...current,
        isRunning: false,
        player: {
          ...current.player,
          activeJobActionId: null,
          activeSkillActionId: null,
        },
      };
      return current;
    }
  }

  return current;
}
