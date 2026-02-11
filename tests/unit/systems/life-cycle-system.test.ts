import { describe, it, expect } from 'vitest';
import {
  processSingleTick,
  processMultipleTicks,
  applyClickActionEffects,
} from '../../../src/systems/life-cycle-system';
import { createInitialGameState } from '../../../src/state/store';
import { STARTING_AGE, DEATH_THRESHOLD_AGE } from '../../../src/core/time';
import type { GameState, ActionEffect } from '../../../specs/schemas';

function makeState(overrides?: Partial<GameState>): GameState {
  return { ...createInitialGameState(), ...overrides };
}

describe('Life Cycle System', () => {
  describe('processSingleTick', () => {
    it('should not advance time when no continuous action is active', () => {
      const state = makeState();
      const result = processSingleTick(state);
      expect(result.time.currentDay).toBe(0);
    });

    it('should advance time by 1 day when job action is active', () => {
      const state = makeState({
        player: {
          ...createInitialGameState().player,
          activeJobActionId: 'begging',
        },
      });
      const result = processSingleTick(state);
      expect(result.time.currentDay).toBe(1);
    });

    it('should advance time by 1 day when skill action is active', () => {
      const state = makeState({
        player: {
          ...createInitialGameState().player,
          activeSkillActionId: 'train_concentration',
        },
      });
      const result = processSingleTick(state);
      expect(result.time.currentDay).toBe(1);
    });

    it('should apply tick effects from job action', () => {
      const state = makeState({
        player: {
          ...createInitialGameState().player,
          activeJobActionId: 'begging',
        },
      });
      // begging gives: addJobXp beggar 1, addMoney 1
      const result = processSingleTick(state);
      expect(result.player.money).toBe(1);
      const beggar = result.jobs.find((j) => j.jobId === 'beggar');
      expect(beggar?.xp).toBeGreaterThan(0);
    });

    it('should apply tick effects from both job and skill actions', () => {
      const state = makeState({
        player: {
          ...createInitialGameState().player,
          activeJobActionId: 'begging',
          activeSkillActionId: 'train_concentration',
        },
      });
      const result = processSingleTick(state);
      // begging: addMoney 1, addJobXp beggar 1
      expect(result.player.money).toBe(1);
      const beggar = result.jobs.find((j) => j.jobId === 'beggar');
      expect(beggar?.xp).toBeGreaterThan(0);
      // train_concentration: addSkillXp concentration 0.5
      const conc = result.skills.find((s) => s.skillId === 'concentration');
      expect(conc?.xp).toBeGreaterThan(0);
    });

    it('should not process when not alive', () => {
      const state = makeState({
        isAlive: false,
        player: {
          ...createInitialGameState().player,
          activeJobActionId: 'begging',
        },
      });
      const result = processSingleTick(state);
      expect(result.time.currentDay).toBe(0);
    });

    it('should trigger death when reaching death threshold age', () => {
      // Age 58 = 42 years = 42 * 365 = 15330 days
      const deathDay = (DEATH_THRESHOLD_AGE - STARTING_AGE) * 365 - 1;
      const state = makeState({
        time: {
          currentDay: deathDay,
          currentAge: DEATH_THRESHOLD_AGE - 1,
          tickAccumulator: 0,
        },
        player: {
          ...createInitialGameState().player,
          activeJobActionId: 'begging',
          activeSkillActionId: 'train_concentration',
        },
      });
      const result = processSingleTick(state);
      expect(result.player.storyFlags['amulet_glowing']).toBe(true);
      expect(result.isRunning).toBe(false);
      expect(result.player.activeJobActionId).toBeNull();
      expect(result.player.activeSkillActionId).toBeNull();
    });
  });

  describe('processMultipleTicks', () => {
    it('should process the specified number of ticks', () => {
      const state = makeState({
        player: {
          ...createInitialGameState().player,
          activeJobActionId: 'begging',
        },
      });
      const result = processMultipleTicks(state, 10);
      expect(result.time.currentDay).toBe(10);
      expect(result.player.money).toBe(10);
    });

    it('should stop processing on death', () => {
      const deathDay = (DEATH_THRESHOLD_AGE - STARTING_AGE) * 365 - 5;
      const state = makeState({
        time: {
          currentDay: deathDay,
          currentAge: DEATH_THRESHOLD_AGE - 1,
          tickAccumulator: 0,
        },
        player: {
          ...createInitialGameState().player,
          activeJobActionId: 'begging',
        },
      });
      // Ask for 100 ticks but should stop after death
      const result = processMultipleTicks(state, 100);
      expect(result.player.storyFlags['amulet_glowing']).toBe(true);
      // Should not have processed all 100 ticks
      expect(result.time.currentDay).toBeLessThan(deathDay + 100);
    });
  });

  describe('daily expenses in processSingleTick', () => {
    it('should deduct daily expenses for housing and food', () => {
      const state = makeState({
        player: {
          ...createInitialGameState().player,
          activeJobActionId: 'begging',
          currentHousingId: 'tent',
          currentFoodId: 'scraps',
          money: 100,
        },
      });
      // begging earns 1 money, tent costs 1, scraps costs 1
      // net: 100 + 1 (earn) - 2 (expenses) = 99
      const result = processSingleTick(state);
      expect(result.player.money).toBe(99);
    });

    it('should evict when money runs out', () => {
      const state = makeState({
        player: {
          ...createInitialGameState().player,
          activeJobActionId: 'begging',
          currentHousingId: 'room',
          currentFoodId: 'bread',
          money: 0,
        },
      });
      // begging earns 1, room costs 3, bread costs 2 => total expenses 5
      // money after earning: 1, after expenses: 1 - 5 = -4 => evict
      const result = processSingleTick(state);
      expect(result.player.money).toBe(0);
      expect(result.player.currentHousingId).toBeNull();
      expect(result.player.currentFoodId).toBeNull();
    });

    it('should not deduct expenses when no housing or food selected', () => {
      const state = makeState({
        player: {
          ...createInitialGameState().player,
          activeJobActionId: 'begging',
          money: 10,
        },
      });
      // begging earns 1, no expenses => 11
      const result = processSingleTick(state);
      expect(result.player.money).toBe(11);
    });
  });

  describe('applyClickActionEffects', () => {
    it('should advance time by timeCostDays', () => {
      const state = makeState();
      const result = applyClickActionEffects(state, [], 5);
      expect(result.time.currentDay).toBe(5);
    });

    it('should not advance time for instant actions', () => {
      const state = makeState();
      const result = applyClickActionEffects(state, [], 0);
      expect(result.time.currentDay).toBe(0);
    });

    it('should apply changeLocation effect', () => {
      const state = makeState();
      const effects: ActionEffect[] = [
        { type: 'changeLocation', locationId: 'fields' },
      ];
      const result = applyClickActionEffects(state, effects, 3);
      expect(result.player.currentLocationId).toBe('fields');
    });

    it('should preserve active actions on location change', () => {
      const state = makeState({
        player: {
          ...createInitialGameState().player,
          activeJobActionId: 'begging',
          activeSkillActionId: 'train_concentration',
        },
      });
      const effects: ActionEffect[] = [
        { type: 'changeLocation', locationId: 'fields' },
      ];
      const result = applyClickActionEffects(state, effects, 3);
      expect(result.player.activeJobActionId).toBe('begging');
      expect(result.player.activeSkillActionId).toBe('train_concentration');
    });

    it('should preserve housing on location change', () => {
      const state = makeState({
        player: {
          ...createInitialGameState().player,
          currentHousingId: 'tent',
        },
      });
      const effects: ActionEffect[] = [
        { type: 'changeLocation', locationId: 'fields' },
      ];
      const result = applyClickActionEffects(state, effects, 3);
      expect(result.player.currentHousingId).toBe('tent');
    });

    it('should apply setStoryFlag effect', () => {
      const state = makeState();
      const effects: ActionEffect[] = [
        { type: 'setStoryFlag', flag: 'test_flag', value: true },
      ];
      const result = applyClickActionEffects(state, effects, 0);
      expect(result.player.storyFlags['test_flag']).toBe(true);
    });

    it('should apply addMoney effect', () => {
      const state = makeState();
      const effects: ActionEffect[] = [
        { type: 'addMoney', amount: 50 },
      ];
      const result = applyClickActionEffects(state, effects, 0);
      expect(result.player.money).toBe(50);
    });

    it('should apply triggerReincarnation effect', () => {
      const state = makeState();
      const effects: ActionEffect[] = [
        { type: 'triggerReincarnation' },
      ];
      const result = applyClickActionEffects(state, effects, 0);
      expect(result.isAlive).toBe(false);
    });

    it('should apply multiple effects in order', () => {
      const state = makeState();
      const effects: ActionEffect[] = [
        { type: 'addMoney', amount: 25 },
        { type: 'setStoryFlag', flag: 'test', value: true },
      ];
      const result = applyClickActionEffects(state, effects, 1);
      expect(result.player.money).toBe(25);
      expect(result.player.storyFlags['test']).toBe(true);
      expect(result.time.currentDay).toBe(1);
    });
  });
});
