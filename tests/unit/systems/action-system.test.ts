import { describe, it, expect } from 'vitest';
import {
  isRequirementMet,
  areActionRequirementsMet,
  getAvailableClickActions,
  getAvailableContinuousActions,
  getContinuousAction,
  getClickAction,
  getActiveTickEffects,
  getClickActionEffects,
} from '../../../src/systems/action-system';
import type { SkillState, JobState, ActionRequirement } from '../../../specs/schemas';

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
  { jobId: 'soldier', level: 0, xp: 0, xpToNextLevel: 10 },
  { jobId: 'robbery', level: 0, xp: 0, xpToNextLevel: 10 },
];

const defaultFlags: Record<string, boolean> = {};

describe('Action System', () => {
  describe('isRequirementMet', () => {
    it('should check skill requirement (met)', () => {
      const skills = defaultSkills.map((s) =>
        s.skillId === 'strength' ? { ...s, level: 20 } : s,
      );
      const req: ActionRequirement = { type: 'skill', skillId: 'strength', level: 20 };
      expect(isRequirementMet(req, skills, defaultJobs, defaultFlags, 16)).toBe(true);
    });

    it('should check skill requirement (not met)', () => {
      const req: ActionRequirement = { type: 'skill', skillId: 'strength', level: 20 };
      expect(isRequirementMet(req, defaultSkills, defaultJobs, defaultFlags, 16)).toBe(false);
    });

    it('should check job requirement (met)', () => {
      const jobs = defaultJobs.map((j) =>
        j.jobId === 'beggar' ? { ...j, level: 5 } : j,
      );
      const req: ActionRequirement = { type: 'job', jobId: 'beggar', level: 5 };
      expect(isRequirementMet(req, defaultSkills, jobs, defaultFlags, 16)).toBe(true);
    });

    it('should check job requirement (not met)', () => {
      const req: ActionRequirement = { type: 'job', jobId: 'beggar', level: 5 };
      expect(isRequirementMet(req, defaultSkills, defaultJobs, defaultFlags, 16)).toBe(false);
    });

    it('should check storyFlag requirement (met)', () => {
      const flags = { amulet_glowing: true };
      const req: ActionRequirement = { type: 'storyFlag', flag: 'amulet_glowing', value: true };
      expect(isRequirementMet(req, defaultSkills, defaultJobs, flags, 16)).toBe(true);
    });

    it('should check storyFlag requirement (not set defaults to false)', () => {
      const req: ActionRequirement = { type: 'storyFlag', flag: 'amulet_glowing', value: true };
      expect(isRequirementMet(req, defaultSkills, defaultJobs, defaultFlags, 16)).toBe(false);
    });

    it('should check age requirement with minAge (met)', () => {
      const req: ActionRequirement = { type: 'age', minAge: 18 };
      expect(isRequirementMet(req, defaultSkills, defaultJobs, defaultFlags, 20)).toBe(true);
    });

    it('should check age requirement with minAge (not met)', () => {
      const req: ActionRequirement = { type: 'age', minAge: 18 };
      expect(isRequirementMet(req, defaultSkills, defaultJobs, defaultFlags, 16)).toBe(false);
    });

    it('should check age requirement with maxAge (met)', () => {
      const req: ActionRequirement = { type: 'age', maxAge: 50 };
      expect(isRequirementMet(req, defaultSkills, defaultJobs, defaultFlags, 30)).toBe(true);
    });

    it('should check age requirement with maxAge (not met)', () => {
      const req: ActionRequirement = { type: 'age', maxAge: 50 };
      expect(isRequirementMet(req, defaultSkills, defaultJobs, defaultFlags, 55)).toBe(false);
    });

    it('should check clan requirement (met)', () => {
      const req: ActionRequirement = { type: 'clan', clanId: 'army' };
      expect(isRequirementMet(req, defaultSkills, defaultJobs, defaultFlags, 16, ['army'])).toBe(true);
    });

    it('should check clan requirement (not met)', () => {
      const req: ActionRequirement = { type: 'clan', clanId: 'army' };
      expect(isRequirementMet(req, defaultSkills, defaultJobs, defaultFlags, 16, [])).toBe(false);
    });

    it('should check clan requirement (wrong clan)', () => {
      const req: ActionRequirement = { type: 'clan', clanId: 'army' };
      expect(isRequirementMet(req, defaultSkills, defaultJobs, defaultFlags, 16, ['bandits'])).toBe(false);
    });
  });

  describe('areActionRequirementsMet', () => {
    it('should return true for empty requirements', () => {
      expect(areActionRequirementsMet([], defaultSkills, defaultJobs, defaultFlags, 16)).toBe(true);
    });

    it('should return true when all requirements met', () => {
      const skills = defaultSkills.map((s) =>
        s.skillId === 'strength' ? { ...s, level: 20 } : s,
      );
      const reqs: ActionRequirement[] = [{ type: 'skill', skillId: 'strength', level: 20 }];
      expect(areActionRequirementsMet(reqs, skills, defaultJobs, defaultFlags, 16)).toBe(true);
    });

    it('should return false when any requirement not met', () => {
      const reqs: ActionRequirement[] = [
        { type: 'skill', skillId: 'strength', level: 20 },
        { type: 'job', jobId: 'beggar', level: 5 },
      ];
      expect(areActionRequirementsMet(reqs, defaultSkills, defaultJobs, defaultFlags, 16)).toBe(false);
    });
  });

  describe('getAvailableClickActions', () => {
    it('should return click actions for slums with no requirements met', () => {
      // take_amulet requires intro_complete flag
      // With defaultFlags (empty), take_amulet should be available (no requirements)
      // but travel_to_fields requires beggar 5 + intro_complete
      const actions = getAvailableClickActions('slums', defaultSkills, defaultJobs, defaultFlags, 16);
      // Only take_amulet should be available (it has no requirements)
      expect(actions.length).toBe(1);
    });

    it('should return travel_to_fields when beggar level 5', () => {
      const jobs = defaultJobs.map((j) =>
        j.jobId === 'beggar' ? { ...j, level: 5 } : j,
      );
      const flags = { intro_complete: true };
      const actions = getAvailableClickActions('slums', defaultSkills, jobs, flags, 16);
      const ids = actions.map((a) => a.id);
      expect(ids).toContain('travel_to_fields');
    });

    it('should return touch_amulet when amulet_glowing is set', () => {
      const flags = { amulet_glowing: true };
      const actions = getAvailableClickActions('death_gate', defaultSkills, defaultJobs, flags, 16);
      const ids = actions.map((a) => a.id);
      expect(ids).toContain('touch_amulet');
    });

    it('should only return actions for the current location', () => {
      // Fields has travel_to_village (requires strength 20) and travel_to_slums (no req)
      const actions = getAvailableClickActions('fields', defaultSkills, defaultJobs, defaultFlags, 16);
      for (const action of actions) {
        expect(action.locationId).toBe('fields');
      }
    });

    it('should return travel_to_barracks when in army clan', () => {
      const flags = { intro_complete: true };
      const actions = getAvailableClickActions('village', defaultSkills, defaultJobs, flags, 16, ['army']);
      const ids = actions.map((a) => a.id);
      expect(ids).toContain('travel_to_barracks');
    });

    it('should not return travel_to_barracks without army clan', () => {
      const flags = { intro_complete: true };
      const actions = getAvailableClickActions('village', defaultSkills, defaultJobs, flags, 16, []);
      const ids = actions.map((a) => a.id);
      expect(ids).not.toContain('travel_to_barracks');
    });
  });

  describe('getAvailableContinuousActions', () => {
    it('should return continuous actions for slums', () => {
      const flags = { intro_complete: true };
      const actions = getAvailableContinuousActions('slums', defaultSkills, defaultJobs, flags, 16);
      const ids = actions.map((a) => a.id);
      expect(ids).toContain('begging');
      expect(ids).toContain('train_concentration');
      expect(ids).toContain('train_endurance_slums');
    });

    it('should filter by requirements in fields', () => {
      // farming requires beggar level 10
      const flags = { intro_complete: true };
      const actions = getAvailableContinuousActions('fields', defaultSkills, defaultJobs, flags, 16);
      const ids = actions.map((a) => a.id);
      expect(ids).not.toContain('farming');
      expect(ids).toContain('train_strength_fields');
    });

    it('should show farming when beggar level 10', () => {
      const jobs = defaultJobs.map((j) =>
        j.jobId === 'beggar' ? { ...j, level: 10 } : j,
      );
      const flags = { intro_complete: true };
      const actions = getAvailableContinuousActions('fields', defaultSkills, jobs, flags, 16);
      const ids = actions.map((a) => a.id);
      expect(ids).toContain('farming');
    });

    it('should return barracks actions when at barracks', () => {
      const flags = { intro_complete: true };
      const actions = getAvailableContinuousActions('barracks', defaultSkills, defaultJobs, flags, 16);
      const ids = actions.map((a) => a.id);
      expect(ids).toContain('soldiering');
      expect(ids).toContain('train_strength_barracks');
    });

    it('should return bandit hideout actions when at hideout', () => {
      const flags = { intro_complete: true };
      const actions = getAvailableContinuousActions('bandit_hideout', defaultSkills, defaultJobs, flags, 16);
      const ids = actions.map((a) => a.id);
      expect(ids).toContain('robbing');
      expect(ids).toContain('train_strength_hideout');
      expect(ids).toContain('train_endurance_hideout');
    });
  });

  describe('getContinuousAction', () => {
    it('should return a continuous action by ID', () => {
      const action = getContinuousAction('begging');
      expect(action).toBeDefined();
      expect(action?.id).toBe('begging');
    });

    it('should return undefined for nonexistent ID', () => {
      expect(getContinuousAction('nonexistent')).toBeUndefined();
    });
  });

  describe('getClickAction', () => {
    it('should return a click action by ID', () => {
      const action = getClickAction('travel_to_fields');
      expect(action).toBeDefined();
      expect(action?.id).toBe('travel_to_fields');
    });

    it('should return undefined for nonexistent ID', () => {
      expect(getClickAction('nonexistent')).toBeUndefined();
    });
  });

  describe('getActiveTickEffects', () => {
    it('should return effects for active continuous action', () => {
      const effects = getActiveTickEffects('begging');
      expect(effects.length).toBeGreaterThan(0);
    });

    it('should return empty array for null action', () => {
      expect(getActiveTickEffects(null)).toEqual([]);
    });

    it('should return empty array for nonexistent action', () => {
      expect(getActiveTickEffects('nonexistent')).toEqual([]);
    });
  });

  describe('getClickActionEffects', () => {
    it('should return effects for a click action', () => {
      const effects = getClickActionEffects('travel_to_fields');
      expect(effects.length).toBeGreaterThan(0);
      expect(effects[0]).toEqual({ type: 'changeLocation', locationId: 'fields' });
    });

    it('should return empty array for nonexistent action', () => {
      expect(getClickActionEffects('nonexistent')).toEqual([]);
    });
  });
});
