import { describe, it, expect } from 'vitest';
import {
  areLocationRequirementsMet,
  getAvailableJobIds,
  getAvailableTrainingSkillIds,
} from '../../../src/systems/location-system';
import type { SkillState, JobState } from '../../../specs/schemas';

const defaultSkills: SkillState[] = [
  { skillId: 'concentration', level: 0, xp: 0, xpToNextLevel: 10 },
  { skillId: 'strength', level: 0, xp: 0, xpToNextLevel: 10 },
  { skillId: 'intelligence', level: 0, xp: 0, xpToNextLevel: 10 },
  { skillId: 'endurance', level: 0, xp: 0, xpToNextLevel: 10 },
];

const defaultJobs: JobState[] = [
  { jobId: 'beggar', level: 0, xp: 0, xpToNextLevel: 10 },
  { jobId: 'farmer', level: 0, xp: 0, xpToNextLevel: 10 },
  { jobId: 'laborer', level: 0, xp: 0, xpToNextLevel: 10 },
];

describe('Location System', () => {
  describe('areLocationRequirementsMet', () => {
    it('should allow slums with no requirements', () => {
      expect(areLocationRequirementsMet('slums', defaultSkills, defaultJobs)).toBe(true);
    });

    it('should not allow fields without beggar level 5', () => {
      expect(areLocationRequirementsMet('fields', defaultSkills, defaultJobs)).toBe(false);
    });

    it('should allow fields with beggar level 5', () => {
      const jobs = defaultJobs.map((j) =>
        j.jobId === 'beggar' ? { ...j, level: 5 } : j,
      );
      expect(areLocationRequirementsMet('fields', defaultSkills, jobs)).toBe(true);
    });

    it('should not allow village without strength 20', () => {
      expect(areLocationRequirementsMet('village', defaultSkills, defaultJobs)).toBe(false);
    });

    it('should allow village with strength 20', () => {
      const skills = defaultSkills.map((s) =>
        s.skillId === 'strength' ? { ...s, level: 20 } : s,
      );
      expect(areLocationRequirementsMet('village', skills, defaultJobs)).toBe(true);
    });

    it('should return false for nonexistent location', () => {
      expect(areLocationRequirementsMet('nonexistent', defaultSkills, defaultJobs)).toBe(false);
    });
  });

  describe('getAvailableJobIds', () => {
    it('should return beggar for slums', () => {
      expect(getAvailableJobIds('slums')).toEqual(['beggar']);
    });

    it('should return farmer for fields', () => {
      expect(getAvailableJobIds('fields')).toEqual(['farmer']);
    });

    it('should return laborer for village', () => {
      expect(getAvailableJobIds('village')).toEqual(['laborer']);
    });

    it('should return empty array for nonexistent location', () => {
      expect(getAvailableJobIds('nonexistent')).toEqual([]);
    });
  });

  describe('getAvailableTrainingSkillIds', () => {
    it('should return concentration and endurance for slums', () => {
      expect(getAvailableTrainingSkillIds('slums')).toEqual(['concentration', 'endurance']);
    });

    it('should return strength and endurance for fields', () => {
      expect(getAvailableTrainingSkillIds('fields')).toEqual(['strength', 'endurance']);
    });

    it('should return strength and intelligence for village', () => {
      expect(getAvailableTrainingSkillIds('village')).toEqual(['strength', 'intelligence']);
    });

    it('should return empty array for nonexistent location', () => {
      expect(getAvailableTrainingSkillIds('nonexistent')).toEqual([]);
    });
  });
});
