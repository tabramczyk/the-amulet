import { describe, it, expect } from 'vitest';
import {
  getHousingDailyCost,
  getFoodDailyCost,
  getDailyExpenses,
  getDailyEarnings,
  getNetDailyIncome,
  getLifestyleXpMultiplier,
} from '../../../src/systems/economy-system';

describe('Economy System', () => {
  describe('getHousingDailyCost', () => {
    it('should return 0 for null housing', () => {
      expect(getHousingDailyCost(null)).toBe(0);
    });

    it('should return cost for valid housing ID', () => {
      expect(getHousingDailyCost('tent')).toBe(1);
      expect(getHousingDailyCost('lean_to')).toBe(2);
      expect(getHousingDailyCost('room')).toBe(3);
    });

    it('should return 0 for invalid housing ID', () => {
      expect(getHousingDailyCost('nonexistent')).toBe(0);
    });
  });

  describe('getFoodDailyCost', () => {
    it('should return 0 for null food', () => {
      expect(getFoodDailyCost(null)).toBe(0);
    });

    it('should return cost for valid food ID', () => {
      expect(getFoodDailyCost('scraps')).toBe(1);
      expect(getFoodDailyCost('bread')).toBe(2);
    });

    it('should return 0 for invalid food ID', () => {
      expect(getFoodDailyCost('nonexistent')).toBe(0);
    });
  });

  describe('getDailyExpenses', () => {
    it('should return 0 when both are null', () => {
      expect(getDailyExpenses(null, null)).toBe(0);
    });

    it('should return housing cost only when food is null', () => {
      expect(getDailyExpenses('tent', null)).toBe(1);
    });

    it('should return food cost only when housing is null', () => {
      expect(getDailyExpenses(null, 'scraps')).toBe(1);
    });

    it('should return combined cost when both are set', () => {
      expect(getDailyExpenses('room', 'bread')).toBe(5); // 3 + 2
    });
  });

  describe('getDailyEarnings', () => {
    it('should return 0 for null actions', () => {
      expect(getDailyEarnings(null, null)).toBe(0);
    });

    it('should return 1 for begging as job action', () => {
      expect(getDailyEarnings('begging', null)).toBe(1);
    });

    it('should return 0 for skill action without money effect', () => {
      expect(getDailyEarnings(null, 'train_concentration')).toBe(0);
    });

    it('should return 0 for invalid action IDs', () => {
      expect(getDailyEarnings('nonexistent', null)).toBe(0);
    });

    it('should return money amount for farming', () => {
      expect(getDailyEarnings('farming', null)).toBe(3);
    });

    it('should return money amount for laboring', () => {
      expect(getDailyEarnings('laboring', null)).toBe(5);
    });

    it('should sum earnings from both job and skill actions', () => {
      // begging earns 1, train_concentration earns 0 => total 1
      expect(getDailyEarnings('begging', 'train_concentration')).toBe(1);
    });

    it('should sum earnings from both when both earn money', () => {
      // begging earns 1 (this is a job action but we can pass it in either slot for summing)
      // farming earns 3
      expect(getDailyEarnings('begging', 'farming')).toBe(4);
    });
  });

  describe('getNetDailyIncome', () => {
    it('should return 0 with no actions and no expenses', () => {
      expect(getNetDailyIncome(null, null, null, null)).toBe(0);
    });

    it('should return positive income when earnings exceed expenses', () => {
      // laboring earns 5, tent costs 1, scraps costs 1 => net 3
      expect(getNetDailyIncome('laboring', null, 'tent', 'scraps')).toBe(3);
    });

    it('should return zero when earnings equal expenses', () => {
      // begging earns 1, tent costs 1 => net 0
      expect(getNetDailyIncome('begging', null, 'tent', null)).toBe(0);
    });

    it('should return negative when expenses exceed earnings', () => {
      // begging earns 1, room costs 3, bread costs 2 => net -4
      expect(getNetDailyIncome('begging', null, 'room', 'bread')).toBe(-4);
    });

    it('should return negative expenses with no actions', () => {
      // no earnings, tent costs 1 => net -1
      expect(getNetDailyIncome(null, null, 'tent', null)).toBe(-1);
    });

    it('should include earnings from both job and skill actions', () => {
      // begging earns 1, train_concentration earns 0, tent costs 1 => net 0
      expect(getNetDailyIncome('begging', 'train_concentration', 'tent', null)).toBe(0);
    });
  });

  describe('getLifestyleXpMultiplier', () => {
    it('should return 1.0 with no housing or food', () => {
      expect(getLifestyleXpMultiplier(null, null)).toBe(1);
    });

    it('should return housing bonus only when food is null', () => {
      // tent = 5% bonus => 1.05
      expect(getLifestyleXpMultiplier('tent', null)).toBeCloseTo(1.05);
    });

    it('should return food bonus only when housing is null', () => {
      // scraps = 3% bonus => 1.03
      expect(getLifestyleXpMultiplier(null, 'scraps')).toBeCloseTo(1.03);
    });

    it('should stack housing and food bonuses', () => {
      // tent 5% + bread 8% = 13% => 1.13
      expect(getLifestyleXpMultiplier('tent', 'bread')).toBeCloseTo(1.13);
    });

    it('should return best bonus with room + bread', () => {
      // room 15% + bread 8% = 23% => 1.23
      expect(getLifestyleXpMultiplier('room', 'bread')).toBeCloseTo(1.23);
    });

    it('should return 1.0 for invalid IDs', () => {
      expect(getLifestyleXpMultiplier('nonexistent', 'nonexistent')).toBe(1);
    });
  });
});
