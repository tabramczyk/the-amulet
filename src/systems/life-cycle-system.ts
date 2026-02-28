import type { GameState, TickEffect, ActionEffect } from '../../specs/schemas';
import { advanceTime } from '../core/time';
import { processSkillXpGain, getConcentrationLevel } from './skill-system';
import { processJobXpGain } from './job-system';
import { getActiveTickEffects, getJobIdFromAction } from './action-system';
import { getDailyExpenses, getLifestyleXpMultiplier } from './economy-system';
import { JOBS } from '../data/jobs';
import { LOCATIONS } from '../data/locations';
import { evaluateTriggeredEvents } from './event-system';

/**
 * Process a single tick for the game state. Returns new game state.
 * Pure function.
 */
export function processSingleTick(state: GameState): GameState {
  if (!state.isAlive) return state;
  if (!state.player.activeJobActionId && !state.player.activeSkillActionId) return state;

  // Advance time by 1 day
  const newTime = advanceTime(state.time, 1);

  // Check for pending relocation (e.g., prison release)
  if (state.player.pendingRelocation) {
    const pr = state.player.pendingRelocation;
    if (newTime.currentDay >= pr.targetDay) {
      const messageLog = pr.message
        ? [...state.player.messageLog, pr.message]
        : state.player.messageLog;
      return {
        ...state,
        time: newTime,
        isRunning: false,
        player: {
          ...state.player,
          currentLocationId: pr.targetLocationId,
          pendingRelocation: null,
          activeJobActionId: null,
          activeSkillActionId: null,
          currentFoodId: null,
          currentHousingId: null,
          messageLog,
        },
      };
    }
  }

  // Evaluate data-driven triggered events.
  // Use isRunning: true as a baseline so blocking events reliably signal via isRunning: false.
  let eventState: GameState = { ...state, time: newTime, isRunning: true };
  eventState = evaluateTriggeredEvents(eventState);
  if (!eventState.isRunning) {
    // A blocking event fired — return immediately with game paused
    return eventState;
  }
  // No blocking event — continue with tick processing
  state = eventState;

  // Get tick effects from both active continuous actions
  const jobEffects = getActiveTickEffects(state.player.activeJobActionId);
  const skillEffects = getActiveTickEffects(state.player.activeSkillActionId);

  // Apply tick effects
  let newState: GameState = { ...state, time: newTime };

  // Process job effects with money scaling based on job level
  // Use the job level at the START of the tick (from original state, not mid-tick updates)
  const jobId = getJobIdFromAction(state.player.activeJobActionId);
  const jobLevel = jobId ? (state.jobs.find((j) => j.jobId === jobId)?.level ?? 0) : 0;
  for (const effect of jobEffects) {
    if (effect.type === 'addMoney') {
      newState = applyTickEffect(newState, {
        ...effect,
        amount: effect.amount + Math.floor(jobLevel / 5),
      });
    } else {
      newState = applyTickEffect(newState, effect);
    }
  }

  // Apply wage bonus from skills
  if (jobId) {
    const jobDef = JOBS[jobId];
    if (jobDef?.wageBonusSkills) {
      for (const bonus of jobDef.wageBonusSkills) {
        const skillState = newState.skills.find((s) => s.skillId === bonus.skillId);
        if (skillState && skillState.level > 0) {
          const bonusMoney = Math.floor(skillState.level * bonus.bonusPerLevel);
          if (bonusMoney > 0) {
            newState = {
              ...newState,
              player: {
                ...newState.player,
                money: newState.player.money + bonusMoney,
              },
            };
          }
        }
      }
    }
  }

  // Process skill effects normally
  for (const effect of skillEffects) {
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
    // Stop processing if any blocking event halted the game
    if (!current.isRunning) {
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
      const reincarnationData = state.reincarnation.skillBonuses.find(
        (sp) => sp.skillId === effect.skillId,
      );
      return {
        ...state,
        skills: state.skills.map((s) =>
          s.skillId === effect.skillId
            ? processSkillXpGain(s, effect.amount * lifestyleMultiplier, concentrationLevel, reincarnationData)
            : s,
        ),
      };
    }

    case 'addJobXp': {
      const reincarnationData = state.reincarnation.jobBonuses.find(
        (jp) => jp.jobId === effect.jobId,
      );
      return {
        ...state,
        jobs: state.jobs.map((j) =>
          j.jobId === effect.jobId
            ? processJobXpGain(j, effect.amount * lifestyleMultiplier, reincarnationData)
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

export function applySingleClickEffect(state: GameState, effect: ActionEffect): GameState {
  switch (effect.type) {
    case 'setStoryFlag':
      return {
        ...state,
        player: {
          ...state.player,
          storyFlags: { ...state.player.storyFlags, [effect.flag]: effect.value },
        },
      };

    case 'changeLocation': {
      let newState: GameState = {
        ...state,
        isRunning: false,
        player: {
          ...state.player,
          currentLocationId: effect.locationId,
          activeJobActionId: null,
          activeSkillActionId: null,
        },
      };
      // Apply location entry effects (data-driven, replaces hardcoded location setup)
      const location = LOCATIONS[effect.locationId];
      if (location?.entryEffects) {
        for (const entryEffect of location.entryEffects) {
          newState = applySingleClickEffect(newState, entryEffect);
        }
      }
      return newState;
    }

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
      const reincarnationData = state.reincarnation.skillBonuses.find(
        (sp) => sp.skillId === effect.skillId,
      );
      return {
        ...state,
        skills: state.skills.map((s) =>
          s.skillId === effect.skillId
            ? processSkillXpGain(s, effect.amount, concentrationLevel, reincarnationData)
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
      return {
        ...state,
        player: {
          ...state.player,
          messageLog: [...state.player.messageLog, effect.message],
        },
      };

    case 'joinClan':
      return {
        ...state,
        player: {
          ...state.player,
          clanIds: state.player.clanIds.includes(effect.clanId)
            ? state.player.clanIds
            : [...state.player.clanIds, effect.clanId],
        },
      };

    case 'clearPendingRelocation':
      return {
        ...state,
        player: {
          ...state.player,
          pendingRelocation: null,
        },
      };

    case 'setFoodId':
      return {
        ...state,
        player: {
          ...state.player,
          currentFoodId: effect.foodId,
        },
      };

    case 'setHousingId':
      return {
        ...state,
        player: {
          ...state.player,
          currentHousingId: effect.housingId,
        },
      };

    case 'setPendingRelocation':
      return {
        ...state,
        player: {
          ...state.player,
          pendingRelocation: {
            targetDay: state.time.currentDay + effect.durationDays,
            targetLocationId: effect.targetLocationId,
            ...(effect.message ? { message: effect.message } : {}),
            ...(effect.trackEntryDay ? { entryDay: state.time.currentDay } : {}),
          },
        },
      };
  }
}
