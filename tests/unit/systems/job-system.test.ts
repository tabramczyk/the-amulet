import { describe, it, expect } from 'vitest';
import {
  jobXpToNextLevel,
  getJobReincarnationBonus,
  areJobRequirementsMet,
  processJobXpGain,
} from '../../../src/systems/job-system';
import type { JobState, SkillState } from '../../../specs/schemas';

describe('Job System', () => {
  describe('jobXpToNextLevel', () => {
    it('should require 10 XP for level 0 -> 1', () => {
      expect(jobXpToNextLevel(0)).toBe(10);
    });

    it('should require 20 XP for level 1 -> 2', () => {
      expect(jobXpToNextLevel(1)).toBe(20);
    });

    it('should scale linearly', () => {
      expect(jobXpToNextLevel(9)).toBe(100);
    });
  });

  describe('getJobReincarnationBonus', () => {
    it('should return 1.0 with 0 lifetime levels', () => {
      expect(getJobReincarnationBonus(0)).toBe(1);
    });

    it('should return 1.15 with 15 lifetime levels', () => {
      expect(getJobReincarnationBonus(15)).toBeCloseTo(1.15, 5);
    });
  });

  describe('areJobRequirementsMet', () => {
    const defaultSkills: SkillState[] = [
      { skillId: 'strength', level: 0, xp: 0, xpToNextLevel: 10 },
      { skillId: 'intelligence', level: 0, xp: 0, xpToNextLevel: 10 },
    ];

    const defaultJobs: JobState[] = [
      { jobId: 'beggar', level: 0, xp: 0, xpToNextLevel: 10 },
      { jobId: 'farmer', level: 0, xp: 0, xpToNextLevel: 10 },
      { jobId: 'laborer', level: 0, xp: 0, xpToNextLevel: 10 },
    ];

    it('should allow beggar in slums (no requirements)', () => {
      expect(areJobRequirementsMet('beggar', 'slums', defaultSkills, defaultJobs)).toBe(true);
    });

    it('should not allow beggar in fields (wrong location)', () => {
      expect(areJobRequirementsMet('beggar', 'fields', defaultSkills, defaultJobs)).toBe(false);
    });

    it('should not allow farmer without beggar level 10', () => {
      expect(areJobRequirementsMet('farmer', 'fields', defaultSkills, defaultJobs)).toBe(false);
    });

    it('should allow farmer with beggar level 10 in fields', () => {
      const jobs = defaultJobs.map((j) =>
        j.jobId === 'beggar' ? { ...j, level: 10 } : j,
      );
      expect(areJobRequirementsMet('farmer', 'fields', defaultSkills, jobs)).toBe(true);
    });

    it('should not allow laborer without strength 10 and farmer 10', () => {
      expect(areJobRequirementsMet('laborer', 'village', defaultSkills, defaultJobs)).toBe(false);
    });

    it('should allow laborer with strength 10 and farmer 10 in village', () => {
      const skills = defaultSkills.map((s) =>
        s.skillId === 'strength' ? { ...s, level: 10 } : s,
      );
      const jobs = defaultJobs.map((j) =>
        j.jobId === 'farmer' ? { ...j, level: 10 } : j,
      );
      expect(areJobRequirementsMet('laborer', 'village', skills, jobs)).toBe(true);
    });

    it('should return false for nonexistent job', () => {
      expect(areJobRequirementsMet('nonexistent', 'slums', defaultSkills, defaultJobs)).toBe(false);
    });
  });

  describe('processJobXpGain', () => {
    const baseJob: JobState = {
      jobId: 'beggar',
      level: 0,
      xp: 0,
      xpToNextLevel: 10,
    };

    it('should add XP to a job', () => {
      const result = processJobXpGain(baseJob, 5, undefined);
      expect(result.xp).toBe(5);
      expect(result.level).toBe(0);
    });

    it('should level up when XP reaches threshold', () => {
      const result = processJobXpGain(baseJob, 10, undefined);
      expect(result.level).toBe(1);
      expect(result.xp).toBe(0);
      expect(result.xpToNextLevel).toBe(20);
    });

    it('should carry over excess XP after leveling', () => {
      const result = processJobXpGain(baseJob, 12, undefined);
      expect(result.level).toBe(1);
      expect(result.xp).toBe(2);
    });

    it('should apply reincarnation bonus', () => {
      const reincarnationData = { jobId: 'beggar', totalLevelsAllLives: 15 };
      // 5 * 1.15 = 5.75
      const result = processJobXpGain(baseJob, 5, reincarnationData);
      expect(result.xp).toBeCloseTo(5.75, 5);
    });

    it('should handle multiple level ups', () => {
      // Level 0->1 needs 10, 1->2 needs 20, total 30
      const result = processJobXpGain(baseJob, 30, undefined);
      expect(result.level).toBe(2);
      expect(result.xp).toBe(0);
    });

    it('should not mutate input', () => {
      const original = { ...baseJob };
      processJobXpGain(baseJob, 5, undefined);
      expect(baseJob).toEqual(original);
    });

    it('should return unchanged for unknown jobId', () => {
      const unknown: JobState = {
        jobId: 'nonexistent',
        level: 0,
        xp: 0,
        xpToNextLevel: 10,
      };
      const result = processJobXpGain(unknown, 5, undefined);
      expect(result).toEqual(unknown);
    });
  });
});
