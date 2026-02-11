import type { GameState, TickEffect, ActionEffect } from '../../specs/schemas';
import { advanceTime, DEATH_THRESHOLD_AGE } from '../core/time';
import { processSkillXpGain, getConcentrationLevel } from './skill-system';
import { processJobXpGain } from './job-system';
import { getActiveTickEffects } from './action-system';
import { getDailyExpenses, getLifestyleXpMultiplier } from './economy-system';

/**
 * Process a single tick for the game state. Returns new game state.
 * Pure function.
 */
export function processSingleTick(state: GameState): GameState {
  if (!state.isAlive) return state;
  if (!state.player.activeJobActionId && !state.player.activeSkillActionId) return state;

  // Advance time by 1 day
  const newTime = advanceTime(state.time, 1);

  // Check for death
  if (newTime.currentAge >= DEATH_THRESHOLD_AGE) {
    return {
      ...state,
      time: newTime,
      isRunning: false,
      player: {
        ...state.player,
        activeJobActionId: null,
        activeSkillActionId: null,
        storyFlags: { ...state.player.storyFlags, amulet_glowing: true },
      },
    };
  }

  // Get tick effects from both active continuous actions
  const tickEffects = [
    ...getActiveTickEffects(state.player.activeJobActionId),
    ...getActiveTickEffects(state.player.activeSkillActionId),
  ];

  // Apply tick effects
  let newState: GameState = { ...state, time: newTime };
  for (const effect of tickEffects) {
    newState = applyTickEffect(newState, effect);
  }

  // Deduct daily expenses (housing + food)
  const dailyExpenses = getDailyExpenses(
    newState.player.currentHousingId,
    newState.player.currentFoodId,
  );
  if (dailyExpenses > 0) {
    const newMoney = newState.player.money - dailyExpenses;
    if (newMoney < 0) {
      // Can't afford - evict from housing and food
      newState = {
        ...newState,
        player: {
          ...newState.player,
          money: 0,
          currentHousingId: null,
          currentFoodId: null,
        },
      };
    } else {
      newState = {
        ...newState,
        player: {
          ...newState.player,
          money: newMoney,
        },
      };
    }
  }

  return newState;
}

/**
 * Process multiple ticks.
 */
export function processMultipleTicks(state: GameState, ticks: number): GameState {
  let current = state;
  for (let i = 0; i < ticks; i++) {
    current = processSingleTick(current);
    // Stop processing if the player died
    if (!current.isRunning && current.player.storyFlags['amulet_glowing']) {
      break;
    }
  }
  return current;
}

/**
 * Apply a single tick effect to the game state.
 */
function applyTickEffect(state: GameState, effect: TickEffect): GameState {
  const concentrationLevel = getConcentrationLevel(state.skills);
  const lifestyleMultiplier = getLifestyleXpMultiplier(
    state.player.currentHousingId,
    state.player.currentFoodId,
  );

  switch (effect.type) {
    case 'addMoney':
      return {
        ...state,
        player: {
          ...state.player,
          money: state.player.money + effect.amount,
        },
      };

    case 'addSkillXp': {
      const prestigeData = state.prestige.skillPrestige.find(
        (sp) => sp.skillId === effect.skillId,
      );
      return {
        ...state,
        skills: state.skills.map((s) =>
          s.skillId === effect.skillId
            ? processSkillXpGain(s, effect.amount * lifestyleMultiplier, concentrationLevel, prestigeData)
            : s,
        ),
      };
    }

    case 'addJobXp': {
      const prestigeData = state.prestige.jobPrestige.find(
        (jp) => jp.jobId === effect.jobId,
      );
      return {
        ...state,
        jobs: state.jobs.map((j) =>
          j.jobId === effect.jobId
            ? processJobXpGain(j, effect.amount * lifestyleMultiplier, prestigeData)
            : j,
        ),
      };
    }
  }
}

/**
 * Apply click action effects to game state.
 */
export function applyClickActionEffects(
  state: GameState,
  effects: ActionEffect[],
  timeCostDays: number,
): GameState {
  // Advance time for the click action cost
  let newState = {
    ...state,
    time: advanceTime(state.time, timeCostDays),
  };

  for (const effect of effects) {
    newState = applySingleClickEffect(newState, effect);
  }

  return newState;
}

function applySingleClickEffect(state: GameState, effect: ActionEffect): GameState {
  switch (effect.type) {
    case 'setStoryFlag':
      return {
        ...state,
        player: {
          ...state.player,
          storyFlags: { ...state.player.storyFlags, [effect.flag]: effect.value },
        },
      };

    case 'changeLocation':
      return {
        ...state,
        player: {
          ...state.player,
          currentLocationId: effect.locationId,
        },
      };

    case 'addMoney':
      return {
        ...state,
        player: {
          ...state.player,
          money: state.player.money + effect.amount,
        },
      };

    case 'addSkillXp': {
      const concentrationLevel = getConcentrationLevel(state.skills);
      const prestigeData = state.prestige.skillPrestige.find(
        (sp) => sp.skillId === effect.skillId,
      );
      return {
        ...state,
        skills: state.skills.map((s) =>
          s.skillId === effect.skillId
            ? processSkillXpGain(s, effect.amount, concentrationLevel, prestigeData)
            : s,
        ),
      };
    }

    case 'triggerReincarnation':
      // Reincarnation is handled by the store's resetForReincarnation
      // This just marks that it should happen
      return {
        ...state,
        isAlive: false,
      };

    case 'showMessage':
      // UI concern - just return state unchanged
      return state;
  }
}
