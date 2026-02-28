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
  { jobId: 'errand_runner', level: 0, xp: 0, xpToNextLevel: 10 },
  { jobId: 'fisherman', level: 0, xp: 0, xpToNextLevel: 10 },
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

    it('should return true for pendingRelocationLastDay on last day', () => {
      const req = { type: 'pendingRelocationLastDay' as const };
      const pendingRelocation = { targetDay: 100 };
      expect(isRequirementMet(req, defaultSkills, defaultJobs, defaultFlags, 16, [], 99, pendingRelocation)).toBe(true);
    });

    it('should return false for pendingRelocationLastDay before last day', () => {
      const req = { type: 'pendingRelocationLastDay' as const };
      const pendingRelocation = { targetDay: 100 };
      expect(isRequirementMet(req, defaultSkills, defaultJobs, defaultFlags, 16, [], 50, pendingRelocation)).toBe(false);
    });

    it('should return false for pendingRelocationLastDay with no pending relocation', () => {
      const req = { type: 'pendingRelocationLastDay' as const };
      expect(isRequirementMet(req, defaultSkills, defaultJobs, defaultFlags, 16, [], 99, null)).toBe(false);
    });

    // --- New requirement types (Phase 2 — Red phase, implementation pending) ---

    describe('location requirement', () => {
      it('should return true when currentLocationId matches', () => {
        const req: ActionRequirement = { type: 'location', locationId: 'prison' };
        expect(
          isRequirementMet(req, defaultSkills, defaultJobs, defaultFlags, 16, [], 0, null, 'prison'),
        ).toBe(true);
      });

      it('should return false when currentLocationId does not match', () => {
        const req: ActionRequirement = { type: 'location', locationId: 'prison' };
        expect(
          isRequirementMet(req, defaultSkills, defaultJobs, defaultFlags, 16, [], 0, null, 'slums'),
        ).toBe(false);
      });

      it('should return false when currentLocationId is undefined', () => {
        const req: ActionRequirement = { type: 'location', locationId: 'prison' };
        expect(
          isRequirementMet(req, defaultSkills, defaultJobs, defaultFlags, 16, [], 0, null, undefined),
        ).toBe(false);
      });
    });

    describe('relocationDay requirement', () => {
      const pendingWithEntryDay = { targetDay: 400, targetLocationId: 'slums', entryDay: 10 };

      it('should return true when elapsed days >= minDay', () => {
        const req: ActionRequirement = { type: 'relocationDay', minDay: 30 };
        // currentDay=40, entryDay=10 => elapsed=30, 30 >= 30 is true
        expect(
          isRequirementMet(req, defaultSkills, defaultJobs, defaultFlags, 16, [], 40, pendingWithEntryDay, 'prison'),
        ).toBe(true);
      });

      it('should return false when elapsed days < minDay', () => {
        const req: ActionRequirement = { type: 'relocationDay', minDay: 30 };
        // currentDay=39, entryDay=10 => elapsed=29, 29 >= 30 is false
        expect(
          isRequirementMet(req, defaultSkills, defaultJobs, defaultFlags, 16, [], 39, pendingWithEntryDay, 'prison'),
        ).toBe(false);
      });

      it('should return true when elapsed days <= maxDay', () => {
        const req: ActionRequirement = { type: 'relocationDay', maxDay: 50 };
        // currentDay=40, entryDay=10 => elapsed=30, 30 <= 50 is true
        expect(
          isRequirementMet(req, defaultSkills, defaultJobs, defaultFlags, 16, [], 40, pendingWithEntryDay, 'prison'),
        ).toBe(true);
      });

      it('should return false when elapsed days > maxDay', () => {
        const req: ActionRequirement = { type: 'relocationDay', maxDay: 20 };
        // currentDay=40, entryDay=10 => elapsed=30, 30 <= 20 is false
        expect(
          isRequirementMet(req, defaultSkills, defaultJobs, defaultFlags, 16, [], 40, pendingWithEntryDay, 'prison'),
        ).toBe(false);
      });

      it('should return true when elapsed days satisfies both minDay and maxDay', () => {
        const req: ActionRequirement = { type: 'relocationDay', minDay: 20, maxDay: 40 };
        // currentDay=40, entryDay=10 => elapsed=30, 20 <= 30 <= 40 is true
        expect(
          isRequirementMet(req, defaultSkills, defaultJobs, defaultFlags, 16, [], 40, pendingWithEntryDay, 'prison'),
        ).toBe(true);
      });

      it('should return false when no pendingRelocation exists', () => {
        const req: ActionRequirement = { type: 'relocationDay', minDay: 30 };
        expect(
          isRequirementMet(req, defaultSkills, defaultJobs, defaultFlags, 16, [], 40, null, 'prison'),
        ).toBe(false);
      });

      it('should return false when pendingRelocation has no entryDay', () => {
        const req: ActionRequirement = { type: 'relocationDay', minDay: 30 };
        const pendingNoEntryDay = { targetDay: 400, targetLocationId: 'slums' };
        expect(
          isRequirementMet(req, defaultSkills, defaultJobs, defaultFlags, 16, [], 40, pendingNoEntryDay, 'prison'),
        ).toBe(false);
      });
    });

    describe('hasPendingRelocation requirement', () => {
      const somePendingRelocation = { targetDay: 400, targetLocationId: 'slums' };

      it('should return true when value=true and pendingRelocation exists', () => {
        const req: ActionRequirement = { type: 'hasPendingRelocation', value: true };
        expect(
          isRequirementMet(req, defaultSkills, defaultJobs, defaultFlags, 16, [], 0, somePendingRelocation, 'prison'),
        ).toBe(true);
      });

      it('should return false when value=true and pendingRelocation is null', () => {
        const req: ActionRequirement = { type: 'hasPendingRelocation', value: true };
        expect(
          isRequirementMet(req, defaultSkills, defaultJobs, defaultFlags, 16, [], 0, null, 'prison'),
        ).toBe(false);
      });

      it('should return true when value=false and pendingRelocation is null', () => {
        const req: ActionRequirement = { type: 'hasPendingRelocation', value: false };
        expect(
          isRequirementMet(req, defaultSkills, defaultJobs, defaultFlags, 16, [], 0, null, 'prison'),
        ).toBe(true);
      });

      it('should return false when value=false and pendingRelocation exists', () => {
        const req: ActionRequirement = { type: 'hasPendingRelocation', value: false };
        expect(
          isRequirementMet(req, defaultSkills, defaultJobs, defaultFlags, 16, [], 0, somePendingRelocation, 'prison'),
        ).toBe(false);
      });
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

    it('should return travel_to_fields when errand_runner level 10', () => {
      const jobs = defaultJobs.map((j) =>
        j.jobId === 'errand_runner' ? { ...j, level: 10 } : j,
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

    it('should show bandit_give_up when bandit_proposal_active flag is set', () => {
      const flags = { intro_complete: true, bandit_proposal_active: true };
      const actions = getAvailableClickActions('prison', defaultSkills, defaultJobs, flags, 16);
      expect(actions.find(a => a.id === 'bandit_give_up')).toBeDefined();
    });

    it('should not show bandit_give_up without bandit_proposal_active flag', () => {
      const flags = { intro_complete: true };
      const actions = getAvailableClickActions('prison', defaultSkills, defaultJobs, flags, 16);
      expect(actions.find(a => a.id === 'bandit_give_up')).toBeUndefined();
    });

    it('should show bandit_lift_stone when bandit_proposal_active and strength >= 8', () => {
      const flags = { intro_complete: true, bandit_proposal_active: true };
      const skills = defaultSkills.map((s) =>
        s.skillId === 'strength' ? { ...s, level: 8 } : s,
      );
      const actions = getAvailableClickActions('prison', skills, defaultJobs, flags, 16);
      expect(actions.find(a => a.id === 'bandit_lift_stone')).toBeDefined();
    });

    it('should not show bandit_lift_stone without bandit_proposal_active flag', () => {
      const flags = { intro_complete: true };
      const skills = defaultSkills.map((s) =>
        s.skillId === 'strength' ? { ...s, level: 8 } : s,
      );
      const actions = getAvailableClickActions('prison', skills, defaultJobs, flags, 16);
      expect(actions.find(a => a.id === 'bandit_lift_stone')).toBeUndefined();
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

    it('should show farming when fisherman level 5 and strength 5', () => {
      const skills = defaultSkills.map((s) =>
        s.skillId === 'strength' ? { ...s, level: 5 } : s,
      );
      const jobs = defaultJobs.map((j) =>
        j.jobId === 'fisherman' ? { ...j, level: 5 } : j,
      );
      const flags = { intro_complete: true };
      const actions = getAvailableContinuousActions('fields', skills, jobs, flags, 16);
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
