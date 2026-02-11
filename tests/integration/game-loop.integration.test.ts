import { describe, it, expect, beforeEach } from 'vitest';
import { store, createInitialGameState } from '../../src/state/store';
import {
  processSingleTick,
  processMultipleTicks,
} from '../../src/systems/life-cycle-system';
import {
  advanceTime,
  DAYS_PER_YEAR,
  STARTING_AGE,
  DEATH_THRESHOLD_AGE,
} from '../../src/core/time';
import type { GameState } from '../../specs/schemas';

function getInitialState(): GameState {
  return createInitialGameState();
}

describe('Game Loop Integration', () => {
  beforeEach(() => {
    store.setState(createInitialGameState());
  });

  describe('Time advancement with continuous actions', () => {
    it('should advance time by 1 day per tick when continuous action is active', () => {
      const state: GameState = {
        ...getInitialState(),
        player: {
          ...getInitialState().player,
          activeJobActionId: 'begging',
        },
        isRunning: true,
        isAlive: true,
      };

      const result = processSingleTick(state);
      expect(result.time.currentDay).toBe(1);
    });

    it('should NOT advance time when no continuous action is active', () => {
      const state: GameState = {
        ...getInitialState(),
        player: {
          ...getInitialState().player,
          activeJobActionId: null,
          activeSkillActionId: null,
        },
        isRunning: true,
        isAlive: true,
      };

      const result = processSingleTick(state);
      expect(result.time.currentDay).toBe(0);
    });

    it('should NOT advance time when player is dead', () => {
      const state: GameState = {
        ...getInitialState(),
        player: {
          ...getInitialState().player,
          activeJobActionId: 'begging',
        },
        isRunning: true,
        isAlive: false,
      };

      const result = processSingleTick(state);
      expect(result.time.currentDay).toBe(0);
    });

    it('should process multiple ticks correctly', () => {
      const state: GameState = {
        ...getInitialState(),
        player: {
          ...getInitialState().player,
          activeJobActionId: 'begging',
        },
        isRunning: true,
        isAlive: true,
      };

      const result = processMultipleTicks(state, 10);
      expect(result.time.currentDay).toBe(10);
    });

    it('should age the player after 365 ticks', () => {
      const state: GameState = {
        ...getInitialState(),
        player: {
          ...getInitialState().player,
          activeJobActionId: 'begging',
        },
        isRunning: true,
        isAlive: true,
      };

      const result = processMultipleTicks(state, DAYS_PER_YEAR);
      expect(result.time.currentAge).toBe(STARTING_AGE + 1);
    });
  });

  describe('Tick effects with continuous actions', () => {
    it('should earn money from begging action per tick', () => {
      const state: GameState = {
        ...getInitialState(),
        player: {
          ...getInitialState().player,
          activeJobActionId: 'begging',
        },
        isRunning: true,
        isAlive: true,
      };

      const result = processSingleTick(state);
      expect(result.player.money).toBe(1); // begging gives 1 money per tick
    });

    it('should accumulate money over multiple ticks', () => {
      const state: GameState = {
        ...getInitialState(),
        player: {
          ...getInitialState().player,
          activeJobActionId: 'begging',
        },
        isRunning: true,
        isAlive: true,
      };

      const result = processMultipleTicks(state, 50);
      expect(result.player.money).toBe(50);
    });

    it('should earn job XP from begging action per tick', () => {
      const state: GameState = {
        ...getInitialState(),
        player: {
          ...getInitialState().player,
          activeJobActionId: 'begging',
        },
        isRunning: true,
        isAlive: true,
      };

      const result = processSingleTick(state);
      const beggarJob = result.jobs.find((j) => j.jobId === 'beggar');
      expect(beggarJob).toBeDefined();
      expect(beggarJob?.xp).toBeGreaterThan(0);
    });

    it('should earn skill XP from training actions per tick', () => {
      const state: GameState = {
        ...getInitialState(),
        player: {
          ...getInitialState().player,
          activeSkillActionId: 'train_concentration',
        },
        isRunning: true,
        isAlive: true,
      };

      const result = processSingleTick(state);
      const conc = result.skills.find((s) => s.skillId === 'concentration');
      expect(conc).toBeDefined();
      expect(conc?.xp).toBeGreaterThan(0);
    });
  });

  describe('Death threshold detection', () => {
    it('should set amulet_glowing when player reaches death threshold age', () => {
      const daysToReachDeath = (DEATH_THRESHOLD_AGE - STARTING_AGE) * DAYS_PER_YEAR;
      const state: GameState = {
        ...getInitialState(),
        time: {
          ...getInitialState().time,
          currentDay: daysToReachDeath - 1,
          currentAge: DEATH_THRESHOLD_AGE - 1,
        },
        player: {
          ...getInitialState().player,
          activeJobActionId: 'begging',
        },
        isRunning: true,
        isAlive: true,
      };

      // Advance to exactly the death day
      const result = processMultipleTicks(state, DAYS_PER_YEAR);
      expect(result.player.storyFlags['amulet_glowing']).toBe(true);
    });

    it('should stop processing ticks after death', () => {
      const daysToReachDeath = (DEATH_THRESHOLD_AGE - STARTING_AGE) * DAYS_PER_YEAR;
      const state: GameState = {
        ...getInitialState(),
        time: {
          ...getInitialState().time,
          currentDay: daysToReachDeath - 5,
          currentAge: DEATH_THRESHOLD_AGE - 1,
        },
        player: {
          ...getInitialState().player,
          activeJobActionId: 'begging',
        },
        isRunning: true,
        isAlive: true,
      };

      // Try to process 100 ticks but should stop at death
      const result = processMultipleTicks(state, 100);
      expect(result.player.storyFlags['amulet_glowing']).toBe(true);
      expect(result.isRunning).toBe(false);
      expect(result.player.activeJobActionId).toBeNull();
    });

    it('should disable continuous action at death', () => {
      const daysToReachDeath = (DEATH_THRESHOLD_AGE - STARTING_AGE) * DAYS_PER_YEAR;
      const state: GameState = {
        ...getInitialState(),
        time: {
          ...getInitialState().time,
          currentDay: daysToReachDeath - 1,
          currentAge: DEATH_THRESHOLD_AGE - 1,
        },
        player: {
          ...getInitialState().player,
          activeJobActionId: 'begging',
        },
        isRunning: true,
        isAlive: true,
      };

      const result = processMultipleTicks(state, 10);
      expect(result.player.activeJobActionId).toBeNull();
    });
  });

  describe('Click action time cost', () => {
    it('should consume days from click action time cost via advanceTime', () => {
      const state = getInitialState();
      const result = advanceTime(state.time, 5);
      expect(result.currentDay).toBe(5);
    });

    it('should not advance time for 0-cost click actions', () => {
      const state = getInitialState();
      const result = advanceTime(state.time, 0);
      expect(result.currentDay).toBe(0);
    });
  });
});
