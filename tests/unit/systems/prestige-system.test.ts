import { describe, it, expect } from 'vitest';
import {
  calculatePrestigeBonus,
  getSkillPrestigeBonus,
  getJobPrestigeBonus,
  accumulateSkillPrestige,
  accumulateJobPrestige,
} from '../../../src/systems/prestige-system';
import type { PrestigeState, SkillState, JobState } from '../../../specs/schemas';

const basePrestige: PrestigeState = {
  livesLived: 0,
  totalDaysAllLives: 0,
  skillPrestige: [
    { skillId: 'concentration', totalLevelsAllLives: 0 },
    { skillId: 'strength', totalLevelsAllLives: 0 },
    { skillId: 'intelligence', totalLevelsAllLives: 0 },
    { skillId: 'endurance', totalLevelsAllLives: 0 },
  ],
  jobPrestige: [
    { jobId: 'beggar', totalLevelsAllLives: 0 },
    { jobId: 'farmer', totalLevelsAllLives: 0 },
    { jobId: 'laborer', totalLevelsAllLives: 0 },
  ],
};

describe('Prestige System', () => {
  describe('calculatePrestigeBonus', () => {
    it('should return 1.0 for 0 levels', () => {
      expect(calculatePrestigeBonus(0)).toBe(1);
    });

    it('should return 1.25 for 25 levels', () => {
      expect(calculatePrestigeBonus(25)).toBeCloseTo(1.25, 5);
    });

    it('should return 1.42 for 42 levels', () => {
      expect(calculatePrestigeBonus(42)).toBeCloseTo(1.42, 5);
    });
  });

  describe('getSkillPrestigeBonus', () => {
    it('should return 1.0 for skill with no prestige', () => {
      expect(getSkillPrestigeBonus('strength', basePrestige)).toBe(1);
    });

    it('should return correct bonus for skill with prestige', () => {
      const prestige: PrestigeState = {
        ...basePrestige,
        skillPrestige: basePrestige.skillPrestige.map((sp) =>
          sp.skillId === 'strength' ? { ...sp, totalLevelsAllLives: 20 } : sp,
        ),
      };
      expect(getSkillPrestigeBonus('strength', prestige)).toBeCloseTo(1.2, 5);
    });

    it('should return 1.0 for unknown skill', () => {
      expect(getSkillPrestigeBonus('nonexistent', basePrestige)).toBe(1);
    });
  });

  describe('getJobPrestigeBonus', () => {
    it('should return 1.0 for job with no prestige', () => {
      expect(getJobPrestigeBonus('beggar', basePrestige)).toBe(1);
    });

    it('should return correct bonus for job with prestige', () => {
      const prestige: PrestigeState = {
        ...basePrestige,
        jobPrestige: basePrestige.jobPrestige.map((jp) =>
          jp.jobId === 'beggar' ? { ...jp, totalLevelsAllLives: 15 } : jp,
        ),
      };
      expect(getJobPrestigeBonus('beggar', prestige)).toBeCloseTo(1.15, 5);
    });
  });

  describe('accumulateSkillPrestige', () => {
    it('should add current skill levels to prestige totals', () => {
      const skills: SkillState[] = [
        { skillId: 'strength', level: 15, xp: 0, xpToNextLevel: 160 },
        { skillId: 'concentration', level: 10, xp: 0, xpToNextLevel: 110 },
      ];
      const result = accumulateSkillPrestige(skills, basePrestige.skillPrestige);
      const strength = result.find((sp) => sp.skillId === 'strength');
      const concentration = result.find((sp) => sp.skillId === 'concentration');
      expect(strength?.totalLevelsAllLives).toBe(15);
      expect(concentration?.totalLevelsAllLives).toBe(10);
    });

    it('should stack with existing prestige', () => {
      const existing = basePrestige.skillPrestige.map((sp) =>
        sp.skillId === 'strength' ? { ...sp, totalLevelsAllLives: 10 } : sp,
      );
      const skills: SkillState[] = [
        { skillId: 'strength', level: 15, xp: 0, xpToNextLevel: 160 },
      ];
      const result = accumulateSkillPrestige(skills, existing);
      const strength = result.find((sp) => sp.skillId === 'strength');
      expect(strength?.totalLevelsAllLives).toBe(25);
    });

    it('should not mutate input', () => {
      const original = [...basePrestige.skillPrestige.map((sp) => ({ ...sp }))];
      const skills: SkillState[] = [
        { skillId: 'strength', level: 15, xp: 0, xpToNextLevel: 160 },
      ];
      accumulateSkillPrestige(skills, original);
      expect(original[0]?.totalLevelsAllLives).toBe(0);
    });
  });

  describe('accumulateJobPrestige', () => {
    it('should add current job levels to prestige totals', () => {
      const jobs: JobState[] = [
        { jobId: 'beggar', level: 20, xp: 0, xpToNextLevel: 210 },
      ];
      const result = accumulateJobPrestige(jobs, basePrestige.jobPrestige);
      const beggar = result.find((jp) => jp.jobId === 'beggar');
      expect(beggar?.totalLevelsAllLives).toBe(20);
    });

    it('should stack with existing prestige', () => {
      const existing = basePrestige.jobPrestige.map((jp) =>
        jp.jobId === 'beggar' ? { ...jp, totalLevelsAllLives: 10 } : jp,
      );
      const jobs: JobState[] = [
        { jobId: 'beggar', level: 20, xp: 0, xpToNextLevel: 210 },
      ];
      const result = accumulateJobPrestige(jobs, existing);
      const beggar = result.find((jp) => jp.jobId === 'beggar');
      expect(beggar?.totalLevelsAllLives).toBe(30);
    });
  });
});
