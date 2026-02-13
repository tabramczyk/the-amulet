import { describe, it, expect } from 'vitest';
import {
  xpToNextLevel,
  getConcentrationBonus,
  getReincarnationBonus,
  calculateEffectiveXp,
  processSkillXpGain,
  getConcentrationLevel,
} from '../../../src/systems/skill-system';
import type { SkillState, SkillReincarnationBonus } from '../../../specs/schemas';

describe('Skill System', () => {
  describe('xpToNextLevel', () => {
    it('should require 10 XP for level 0 -> 1', () => {
      expect(xpToNextLevel(0)).toBe(10);
    });

    it('should require 20 XP for level 1 -> 2', () => {
      expect(xpToNextLevel(1)).toBe(20);
    });

    it('should require 50 XP for level 4 -> 5', () => {
      expect(xpToNextLevel(4)).toBe(50);
    });

    it('should scale linearly', () => {
      expect(xpToNextLevel(9)).toBe(100);
    });
  });

  describe('getConcentrationBonus', () => {
    it('should return 1.0 at level 0', () => {
      expect(getConcentrationBonus(0)).toBe(1);
    });

    it('should return 1.10 at level 10', () => {
      expect(getConcentrationBonus(10)).toBeCloseTo(1.1, 5);
    });

    it('should return 1.30 at level 30', () => {
      expect(getConcentrationBonus(30)).toBeCloseTo(1.3, 5);
    });
  });

  describe('getReincarnationBonus', () => {
    it('should return 1.0 with 0 lifetime levels', () => {
      expect(getReincarnationBonus(0)).toBe(1);
    });

    it('should return 1.20 with 20 lifetime levels', () => {
      expect(getReincarnationBonus(20)).toBeCloseTo(1.2, 5);
    });

    it('should return 1.15 with 15 lifetime levels', () => {
      expect(getReincarnationBonus(15)).toBeCloseTo(1.15, 5);
    });
  });

  describe('calculateEffectiveXp', () => {
    it('should return base XP with no bonuses and below soft cap', () => {
      expect(calculateEffectiveXp(1, 0, 50, 0, 0)).toBe(1);
    });

    it('should apply concentration bonus', () => {
      // 1 base * 1.10 concentration * 1.0 reincarnation = 1.1
      expect(calculateEffectiveXp(1, 0, 50, 10, 0)).toBeCloseTo(1.1, 5);
    });

    it('should apply reincarnation bonus', () => {
      // 1 base * 1.0 concentration * 1.20 reincarnation = 1.2
      expect(calculateEffectiveXp(1, 0, 50, 0, 20)).toBeCloseTo(1.2, 5);
    });

    it('should apply both bonuses', () => {
      // 1 base * 1.10 concentration * 1.20 reincarnation = 1.32
      expect(calculateEffectiveXp(1, 0, 50, 10, 20)).toBeCloseTo(1.32, 5);
    });

    it('should apply soft cap reduction at cap', () => {
      // 1 base * 1.0 * 1.0 * 0.1 = 0.1
      expect(calculateEffectiveXp(1, 50, 50, 0, 0)).toBeCloseTo(0.1, 5);
    });

    it('should apply soft cap with bonuses', () => {
      // 1 base * 1.10 concentration * 1.20 reincarnation * 0.1 soft cap = 0.132
      expect(calculateEffectiveXp(1, 50, 50, 10, 20)).toBeCloseTo(0.132, 5);
    });

    it('should not apply soft cap below cap', () => {
      expect(calculateEffectiveXp(1, 49, 50, 0, 0)).toBe(1);
    });
  });

  describe('processSkillXpGain', () => {
    const baseSkill: SkillState = {
      skillId: 'strength',
      level: 0,
      xp: 0,
      xpToNextLevel: 10,
    };

    it('should add XP to a skill', () => {
      const result = processSkillXpGain(baseSkill, 5, 0, undefined);
      expect(result.xp).toBe(5);
      expect(result.level).toBe(0);
    });

    it('should level up when XP reaches threshold', () => {
      const result = processSkillXpGain(baseSkill, 10, 0, undefined);
      expect(result.level).toBe(1);
      expect(result.xp).toBe(0);
      expect(result.xpToNextLevel).toBe(20);
    });

    it('should carry over excess XP after leveling', () => {
      const result = processSkillXpGain(baseSkill, 12, 0, undefined);
      expect(result.level).toBe(1);
      expect(result.xp).toBe(2);
    });

    it('should handle multiple level ups in one tick', () => {
      // Level 0->1 needs 10, level 1->2 needs 20. Total = 30
      const result = processSkillXpGain(baseSkill, 30, 0, undefined);
      expect(result.level).toBe(2);
      expect(result.xp).toBe(0);
      expect(result.xpToNextLevel).toBe(30);
    });

    it('should apply concentration bonus', () => {
      // Base 5 * 1.10 = 5.5
      const result = processSkillXpGain(baseSkill, 5, 10, undefined);
      expect(result.xp).toBeCloseTo(5.5, 5);
    });

    it('should apply reincarnation bonus', () => {
      const reincarnationData: SkillReincarnationBonus = {
        skillId: 'strength',
        totalLevelsAllLives: 20,
      };
      // Base 1 * 1.0 conc * 1.20 reincarnation = 1.2
      const result = processSkillXpGain(baseSkill, 1, 0, reincarnationData);
      expect(result.xp).toBeCloseTo(1.2, 5);
    });

    it('should apply soft cap when at cap level', () => {
      const atCap: SkillState = {
        skillId: 'strength',
        level: 50,
        xp: 0,
        xpToNextLevel: 510,
      };
      // Base 1 * 0.1 soft cap = 0.1
      const result = processSkillXpGain(atCap, 1, 0, undefined);
      expect(result.xp).toBeCloseTo(0.1, 5);
    });

    it('should not mutate the input skill state', () => {
      const original = { ...baseSkill };
      processSkillXpGain(baseSkill, 5, 0, undefined);
      expect(baseSkill).toEqual(original);
    });

    it('should return unchanged skill for unknown skillId', () => {
      const unknown: SkillState = {
        skillId: 'nonexistent',
        level: 0,
        xp: 0,
        xpToNextLevel: 10,
      };
      const result = processSkillXpGain(unknown, 5, 0, undefined);
      expect(result).toEqual(unknown);
    });
  });

  describe('getConcentrationLevel', () => {
    it('should return 0 when concentration not found', () => {
      expect(getConcentrationLevel([])).toBe(0);
    });

    it('should return concentration level', () => {
      const skills: SkillState[] = [
        { skillId: 'concentration', level: 15, xp: 0, xpToNextLevel: 160 },
        { skillId: 'strength', level: 5, xp: 0, xpToNextLevel: 60 },
      ];
      expect(getConcentrationLevel(skills)).toBe(15);
    });
  });
});
