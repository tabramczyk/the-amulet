import { describe, it, expect } from 'vitest';
import {
  calculateReincarnationBonus,
  getSkillReincarnationBonus,
  getJobReincarnationBonus,
  accumulateSkillReincarnation,
  accumulateJobReincarnation,
} from '../../../src/systems/reincarnation-system';
import type { ReincarnationState, SkillState, JobState } from '../../../specs/schemas';

const baseReincarnation: ReincarnationState = {
  livesLived: 0,
  totalDaysAllLives: 0,
  skillBonuses: [
    { skillId: 'concentration', totalLevelsAllLives: 0 },
    { skillId: 'strength', totalLevelsAllLives: 0 },
    { skillId: 'intelligence', totalLevelsAllLives: 0 },
    { skillId: 'endurance', totalLevelsAllLives: 0 },
  ],
  jobBonuses: [
    { jobId: 'beggar', totalLevelsAllLives: 0 },
    { jobId: 'farmer', totalLevelsAllLives: 0 },
    { jobId: 'laborer', totalLevelsAllLives: 0 },
  ],
};

describe('Reincarnation System', () => {
  describe('calculateReincarnationBonus', () => {
    it('should return 1.0 for 0 levels', () => {
      expect(calculateReincarnationBonus(0)).toBe(1);
    });

    it('should return 1.25 for 25 levels', () => {
      expect(calculateReincarnationBonus(25)).toBeCloseTo(1.25, 5);
    });

    it('should return 1.42 for 42 levels', () => {
      expect(calculateReincarnationBonus(42)).toBeCloseTo(1.42, 5);
    });
  });

  describe('getSkillReincarnationBonus', () => {
    it('should return 1.0 for skill with no reincarnation bonus', () => {
      expect(getSkillReincarnationBonus('strength', baseReincarnation)).toBe(1);
    });

    it('should return correct bonus for skill with reincarnation bonus', () => {
      const reincarnation: ReincarnationState = {
        ...baseReincarnation,
        skillBonuses: baseReincarnation.skillBonuses.map((sp) =>
          sp.skillId === 'strength' ? { ...sp, totalLevelsAllLives: 20 } : sp,
        ),
      };
      expect(getSkillReincarnationBonus('strength', reincarnation)).toBeCloseTo(1.2, 5);
    });

    it('should return 1.0 for unknown skill', () => {
      expect(getSkillReincarnationBonus('nonexistent', baseReincarnation)).toBe(1);
    });
  });

  describe('getJobReincarnationBonus', () => {
    it('should return 1.0 for job with no reincarnation bonus', () => {
      expect(getJobReincarnationBonus('beggar', baseReincarnation)).toBe(1);
    });

    it('should return correct bonus for job with reincarnation bonus', () => {
      const reincarnation: ReincarnationState = {
        ...baseReincarnation,
        jobBonuses: baseReincarnation.jobBonuses.map((jp) =>
          jp.jobId === 'beggar' ? { ...jp, totalLevelsAllLives: 15 } : jp,
        ),
      };
      expect(getJobReincarnationBonus('beggar', reincarnation)).toBeCloseTo(1.15, 5);
    });
  });

  describe('accumulateSkillReincarnation', () => {
    it('should add current skill levels to reincarnation totals', () => {
      const skills: SkillState[] = [
        { skillId: 'strength', level: 15, xp: 0, xpToNextLevel: 160 },
        { skillId: 'concentration', level: 10, xp: 0, xpToNextLevel: 110 },
      ];
      const result = accumulateSkillReincarnation(skills, baseReincarnation.skillBonuses);
      const strength = result.find((sp) => sp.skillId === 'strength');
      const concentration = result.find((sp) => sp.skillId === 'concentration');
      expect(strength?.totalLevelsAllLives).toBe(15);
      expect(concentration?.totalLevelsAllLives).toBe(10);
    });

    it('should stack with existing reincarnation bonuses', () => {
      const existing = baseReincarnation.skillBonuses.map((sp) =>
        sp.skillId === 'strength' ? { ...sp, totalLevelsAllLives: 10 } : sp,
      );
      const skills: SkillState[] = [
        { skillId: 'strength', level: 15, xp: 0, xpToNextLevel: 160 },
      ];
      const result = accumulateSkillReincarnation(skills, existing);
      const strength = result.find((sp) => sp.skillId === 'strength');
      expect(strength?.totalLevelsAllLives).toBe(25);
    });

    it('should not mutate input', () => {
      const original = [...baseReincarnation.skillBonuses.map((sp) => ({ ...sp }))];
      const skills: SkillState[] = [
        { skillId: 'strength', level: 15, xp: 0, xpToNextLevel: 160 },
      ];
      accumulateSkillReincarnation(skills, original);
      expect(original[0]?.totalLevelsAllLives).toBe(0);
    });
  });

  describe('accumulateJobReincarnation', () => {
    it('should add current job levels to reincarnation totals', () => {
      const jobs: JobState[] = [
        { jobId: 'beggar', level: 20, xp: 0, xpToNextLevel: 210 },
      ];
      const result = accumulateJobReincarnation(jobs, baseReincarnation.jobBonuses);
      const beggar = result.find((jp) => jp.jobId === 'beggar');
      expect(beggar?.totalLevelsAllLives).toBe(20);
    });

    it('should stack with existing reincarnation bonuses', () => {
      const existing = baseReincarnation.jobBonuses.map((jp) =>
        jp.jobId === 'beggar' ? { ...jp, totalLevelsAllLives: 10 } : jp,
      );
      const jobs: JobState[] = [
        { jobId: 'beggar', level: 20, xp: 0, xpToNextLevel: 210 },
      ];
      const result = accumulateJobReincarnation(jobs, existing);
      const beggar = result.find((jp) => jp.jobId === 'beggar');
      expect(beggar?.totalLevelsAllLives).toBe(30);
    });
  });
});
