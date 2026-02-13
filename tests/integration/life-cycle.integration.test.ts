import { describe, it, expect, beforeEach } from 'vitest';
import { store, createInitialGameState } from '../../src/state/store';
import {
  processMultipleTicks,
  applyClickActionEffects,
} from '../../src/systems/life-cycle-system';
import {
  processSkillXpGain,
  getConcentrationLevel,
  calculateEffectiveXp,
} from '../../src/systems/skill-system';
import { processJobXpGain, areJobRequirementsMet } from '../../src/systems/job-system';
import { areLocationRequirementsMet } from '../../src/systems/location-system';
import {
  getAvailableClickActions,
  getAvailableContinuousActions,
} from '../../src/systems/action-system';
import { STARTING_AGE, DEATH_THRESHOLD_AGE, DAYS_PER_YEAR } from '../../src/core/time';
import { SKILLS } from '../../src/data/skills';
import { CLICK_ACTIONS } from '../../src/data/actions';
import { GameStateSchema, type GameState } from '../../specs/schemas';

function getInitialState(): GameState {
  return createInitialGameState();
}

describe('Life Cycle Integration', () => {
  beforeEach(() => {
    store.setState(createInitialGameState());
  });

  describe('New game initial state', () => {
    it('should start at age 16', () => {
      const state = getInitialState();
      expect(state.time.currentAge).toBe(STARTING_AGE);
    });

    it('should start in slums', () => {
      const state = getInitialState();
      expect(state.player.currentLocationId).toBe('slums');
    });

    it('should start alive', () => {
      const state = getInitialState();
      expect(state.isAlive).toBe(true);
    });

    it('should start with 0 lives lived', () => {
      const state = getInitialState();
      expect(state.reincarnation.livesLived).toBe(0);
    });

    it('should have all skills at level 0', () => {
      const state = getInitialState();
      for (const skill of state.skills) {
        expect(skill.level).toBe(0);
        expect(skill.xp).toBe(0);
      }
    });

    it('should have all jobs at level 0', () => {
      const state = getInitialState();
      for (const job of state.jobs) {
        expect(job.level).toBe(0);
        expect(job.xp).toBe(0);
      }
    });

    it('should produce valid GameState', () => {
      const state = getInitialState();
      const result = GameStateSchema.safeParse(state);
      expect(result.success).toBe(true);
    });
  });

  describe('Skill XP with bonuses integration', () => {
    it('should apply concentration bonus to skill XP gain', () => {
      const state = getInitialState();
      const conc = state.skills.find((s) => s.skillId === 'concentration');
      expect(conc).toBeDefined();

      // Simulate having concentration at level 10
      const skills = state.skills.map((s) =>
        s.skillId === 'concentration' ? { ...s, level: 10 } : s,
      );

      const concentrationLevel = getConcentrationLevel(skills);
      expect(concentrationLevel).toBe(10);

      // Train strength with concentration bonus
      const strengthState = skills.find((s) => s.skillId === 'strength');
      expect(strengthState).toBeDefined();
      const result = processSkillXpGain(strengthState ?? { skillId: 'strength', level: 0, xp: 0, xpToNextLevel: 10 }, 1, concentrationLevel, undefined);

      // 1 base * 1.10 concentration = 1.1
      expect(result.xp).toBeCloseTo(1.1, 5);
    });

    it('should apply reincarnation bonus to skill XP gain', () => {
      const state = getInitialState();
      const strengthState = state.skills.find((s) => s.skillId === 'strength');
      expect(strengthState).toBeDefined();

      const reincarnationData = { skillId: 'strength', totalLevelsAllLives: 20 };
      const result = processSkillXpGain(strengthState ?? { skillId: 'strength', level: 0, xp: 0, xpToNextLevel: 10 }, 1, 0, reincarnationData);

      // 1 base * 1.0 conc * 1.20 reincarnation = 1.2
      expect(result.xp).toBeCloseTo(1.2, 5);
    });

    it('should apply both concentration and reincarnation bonuses', () => {
      const strengthDef = SKILLS['strength'];
      expect(strengthDef).toBeDefined();
      if (!strengthDef) return;
      const softCap = strengthDef.softCap;
      const effective = calculateEffectiveXp(1, 0, softCap, 10, 20);

      // 1 * 1.10 * 1.20 = 1.32
      expect(effective).toBeCloseTo(1.32, 5);
    });

    it('should apply soft cap when skill is at/above soft cap level', () => {
      const strengthDef = SKILLS['strength'];
      expect(strengthDef).toBeDefined();
      if (!strengthDef) return;
      const softCap = strengthDef.softCap; // 50
      const effective = calculateEffectiveXp(1, softCap, softCap, 0, 0);

      // 1 * 0.1 (soft cap) = 0.1
      expect(effective).toBeCloseTo(0.1, 5);
    });

    it('should level up skills through continuous training', () => {
      let state: GameState = {
        ...getInitialState(),
        player: {
          ...getInitialState().player,
          activeSkillActionId: 'train_concentration',
        },
        isRunning: true,
        isAlive: true,
      };

      // Process many ticks to accumulate XP and level up
      // Concentration gives 0.5 XP/tick, needs 10 XP for level 1
      // So after 20 ticks we should have 10 XP = level 1
      state = processMultipleTicks(state, 20);

      const conc = state.skills.find((s) => s.skillId === 'concentration');
      expect(conc).toBeDefined();
      expect(conc?.level).toBeGreaterThanOrEqual(1);
    });
  });

  describe('Job XP with bonuses integration', () => {
    it('should apply reincarnation bonus to job XP gain', () => {
      const state = getInitialState();
      const beggarState = state.jobs.find((j) => j.jobId === 'beggar');
      expect(beggarState).toBeDefined();

      const reincarnationData = { jobId: 'beggar', totalLevelsAllLives: 15 };
      const result = processJobXpGain(beggarState ?? { jobId: 'beggar', level: 0, xp: 0, xpToNextLevel: 10 }, 1, reincarnationData);

      // 1 * 1.15 = 1.15
      expect(result.xp).toBeCloseTo(1.15, 5);
    });

    it('should level up jobs through continuous working', () => {
      let state: GameState = {
        ...getInitialState(),
        player: {
          ...getInitialState().player,
          activeJobActionId: 'begging',
        },
        isRunning: true,
        isAlive: true,
      };

      // begging gives 1 job XP per tick. Level 1 needs 10 XP.
      state = processMultipleTicks(state, 10);

      const beggar = state.jobs.find((j) => j.jobId === 'beggar');
      expect(beggar).toBeDefined();
      expect(beggar?.level).toBeGreaterThanOrEqual(1);
    });
  });

  describe('Job and location requirements integration', () => {
    it('should block farmer without beggar level 10', () => {
      const state = getInitialState();
      expect(
        areJobRequirementsMet('farmer', 'fields', state.skills, state.jobs),
      ).toBe(false);
    });

    it('should allow farmer with beggar level 10 in fields', () => {
      const state = getInitialState();
      const jobs = state.jobs.map((j) =>
        j.jobId === 'beggar' ? { ...j, level: 10 } : j,
      );
      expect(areJobRequirementsMet('farmer', 'fields', state.skills, jobs)).toBe(true);
    });

    it('should block laborer without strength 10 and farmer 10', () => {
      const state = getInitialState();
      expect(
        areJobRequirementsMet('laborer', 'village', state.skills, state.jobs),
      ).toBe(false);
    });

    it('should allow laborer with strength 10 and farmer 10 in village', () => {
      const state = getInitialState();
      const skills = state.skills.map((s) =>
        s.skillId === 'strength' ? { ...s, level: 10 } : s,
      );
      const jobs = state.jobs.map((j) =>
        j.jobId === 'farmer' ? { ...j, level: 10 } : j,
      );
      expect(areJobRequirementsMet('laborer', 'village', skills, jobs)).toBe(true);
    });

    it('should block fields without beggar level 5', () => {
      const state = getInitialState();
      expect(
        areLocationRequirementsMet('fields', state.skills, state.jobs),
      ).toBe(false);
    });

    it('should allow fields with beggar level 5', () => {
      const state = getInitialState();
      const jobs = state.jobs.map((j) =>
        j.jobId === 'beggar' ? { ...j, level: 5 } : j,
      );
      expect(areLocationRequirementsMet('fields', state.skills, jobs)).toBe(true);
    });

    it('should block village without farmer level 5', () => {
      const state = getInitialState();
      expect(
        areLocationRequirementsMet('village', state.skills, state.jobs),
      ).toBe(false);
    });

    it('should allow village with farmer level 5', () => {
      const state = getInitialState();
      const jobs = state.jobs.map((j) =>
        j.jobId === 'farmer' ? { ...j, level: 5 } : j,
      );
      expect(areLocationRequirementsMet('village', state.skills, jobs)).toBe(true);
    });
  });

  describe('Action availability integration', () => {
    it('should show begging and training actions in slums', () => {
      const state = getInitialState();
      const stateWithIntro = {
        ...state,
        player: {
          ...state.player,
          storyFlags: { intro_complete: true },
        },
      };
      const actions = getAvailableContinuousActions(
        'slums',
        stateWithIntro.skills,
        stateWithIntro.jobs,
        stateWithIntro.player.storyFlags,
        stateWithIntro.time.currentAge,
      );
      const actionIds = actions.map((a) => a.id);
      expect(actionIds).toContain('begging');
      expect(actionIds).toContain('train_concentration');
      expect(actionIds).toContain('train_endurance_slums');
    });

    it('should not show touch_amulet without amulet_glowing flag', () => {
      const state = getInitialState();
      const actions = getAvailableClickActions(
        'slums',
        state.skills,
        state.jobs,
        state.player.storyFlags,
        state.time.currentAge,
      );
      const actionIds = actions.map((a) => a.id);
      expect(actionIds).not.toContain('touch_amulet');
    });

    it('should show touch_amulet with amulet_glowing flag', () => {
      const state = getInitialState();
      const flags = { ...state.player.storyFlags, amulet_glowing: true };
      const actions = getAvailableClickActions(
        'death_gate',
        state.skills,
        state.jobs,
        flags,
        state.time.currentAge,
      );
      const actionIds = actions.map((a) => a.id);
      expect(actionIds).toContain('touch_amulet');
    });

    it('should not show travel to fields without beggar level 5', () => {
      const state = getInitialState();
      const actions = getAvailableClickActions(
        'slums',
        state.skills,
        state.jobs,
        state.player.storyFlags,
        state.time.currentAge,
      );
      const actionIds = actions.map((a) => a.id);
      expect(actionIds).not.toContain('travel_to_fields');
    });

    it('should show travel to fields with beggar level 5', () => {
      const state = getInitialState();
      const jobs = state.jobs.map((j) =>
        j.jobId === 'beggar' ? { ...j, level: 5 } : j,
      );
      const storyFlags = { intro_complete: true };
      const actions = getAvailableClickActions(
        'slums',
        state.skills,
        jobs,
        storyFlags,
        state.time.currentAge,
      );
      const actionIds = actions.map((a) => a.id);
      expect(actionIds).toContain('travel_to_fields');
    });
  });

  describe('Click action effects integration', () => {
    it('should change location on travel click action', () => {
      const state = getInitialState();
      const travelAction = CLICK_ACTIONS['travel_to_fields'];
      expect(travelAction).toBeDefined();
      if (!travelAction) return;
      const result = applyClickActionEffects(
        state,
        travelAction.effects,
        travelAction.timeCostDays,
      );

      expect(result.player.currentLocationId).toBe('fields');
      expect(result.time.currentDay).toBe(3); // travel_to_fields costs 3 days
    });

    it('should clear active actions on location change', () => {
      const state: GameState = {
        ...getInitialState(),
        player: {
          ...getInitialState().player,
          activeJobActionId: 'begging',
          activeSkillActionId: 'train_concentration',
        },
      };

      const travelAction = CLICK_ACTIONS['travel_to_fields'];
      expect(travelAction).toBeDefined();
      if (!travelAction) return;
      const result = applyClickActionEffects(
        state,
        travelAction.effects,
        travelAction.timeCostDays,
      );

      expect(result.player.activeJobActionId).toBeNull();
      expect(result.player.activeSkillActionId).toBeNull();
      expect(result.isRunning).toBe(false);
    });

    it('should trigger reincarnation flag via touch_amulet', () => {
      const state: GameState = {
        ...getInitialState(),
        player: {
          ...getInitialState().player,
          storyFlags: { amulet_glowing: true },
        },
      };

      const touchAction = CLICK_ACTIONS['touch_amulet'];
      expect(touchAction).toBeDefined();
      if (!touchAction) return;
      const result = applyClickActionEffects(
        state,
        touchAction.effects,
        touchAction.timeCostDays,
      );

      expect(result.isAlive).toBe(false);
    });
  });

  describe('Economy and daily expenses integration', () => {
    it('should deduct daily expenses per tick', () => {
      let state: GameState = {
        ...getInitialState(),
        player: {
          ...getInitialState().player,
          activeJobActionId: 'begging',
          currentHousingId: 'tent',
          currentFoodId: null,
          money: 50,
        },
        isRunning: true,
        isAlive: true,
      };

      // begging earns 1/tick, tent costs 2/tick => net -1/tick
      state = processMultipleTicks(state, 10);
      expect(state.player.money).toBe(40); // 50 + 10 - 20 = 40
    });

    it('should evict when player cannot afford expenses', () => {
      let state: GameState = {
        ...getInitialState(),
        player: {
          ...getInitialState().player,
          activeSkillActionId: 'train_concentration',
          currentHousingId: 'room',
          currentFoodId: 'bread',
          money: 3,
        },
        isRunning: true,
        isAlive: true,
      };

      // train_concentration earns 0, room costs 3, bread costs 2 => -5/tick
      // After tick 1: money = 3 + 0 - 5 = -2 => evict, money = 0
      state = processMultipleTicks(state, 1);
      expect(state.player.money).toBe(0);
      expect(state.player.currentHousingId).toBeNull();
      expect(state.player.currentFoodId).toBeNull();
    });

    it('should preserve housing and food on location change via click action', () => {
      const state: GameState = {
        ...getInitialState(),
        player: {
          ...getInitialState().player,
          currentHousingId: 'tent',
          currentFoodId: 'scraps',
        },
      };

      const travelAction = CLICK_ACTIONS['travel_to_fields'];
      expect(travelAction).toBeDefined();
      if (!travelAction) return;
      const result = applyClickActionEffects(
        state,
        travelAction.effects,
        travelAction.timeCostDays,
      );

      expect(result.player.currentLocationId).toBe('fields');
      expect(result.player.currentHousingId).toBe('tent');
      expect(result.player.currentFoodId).toBe('scraps');
    });
  });

  describe('Reincarnation and bonuses integration', () => {
    it('should preserve reincarnation bonuses after reincarnation', () => {
      // Setup: player has gained some levels
      store.getState().updateSkill('concentration', { level: 10 });
      store.getState().updateSkill('strength', { level: 15 });
      store.getState().updateJob('beggar', { level: 20 });
      store.getState().advanceDays(1000);

      // Reincarnate
      store.getState().resetForReincarnation();

      const state = store.getState();

      // Reincarnation bonuses should be accumulated
      const concBonus = state.reincarnation.skillBonuses.find(
        (sp) => sp.skillId === 'concentration',
      );
      expect(concBonus).toBeDefined();
      expect(concBonus?.totalLevelsAllLives).toBe(10);

      const strBonus = state.reincarnation.skillBonuses.find(
        (sp) => sp.skillId === 'strength',
      );
      expect(strBonus).toBeDefined();
      expect(strBonus?.totalLevelsAllLives).toBe(15);

      const begBonus = state.reincarnation.jobBonuses.find(
        (jp) => jp.jobId === 'beggar',
      );
      expect(begBonus).toBeDefined();
      expect(begBonus?.totalLevelsAllLives).toBe(20);

      // State should be reset
      expect(state.time.currentDay).toBe(0);
      expect(state.time.currentAge).toBe(STARTING_AGE);
      expect(state.player.money).toBe(0);
      expect(state.player.currentLocationId).toBe('slums');
      expect(state.reincarnation.livesLived).toBe(1);

      // All levels should be 0
      for (const skill of state.skills) {
        expect(skill.level).toBe(0);
        expect(skill.xp).toBe(0);
      }
      for (const job of state.jobs) {
        expect(job.level).toBe(0);
        expect(job.xp).toBe(0);
      }
    });

    it('should stack reincarnation bonuses across multiple lives', () => {
      // Life 1
      store.getState().updateSkill('strength', { level: 15 });
      store.getState().resetForReincarnation();

      // Life 2
      store.getState().updateSkill('strength', { level: 12 });
      store.getState().resetForReincarnation();

      const state = store.getState();
      const strBonus = state.reincarnation.skillBonuses.find(
        (sp) => sp.skillId === 'strength',
      );
      expect(strBonus).toBeDefined();
      expect(strBonus?.totalLevelsAllLives).toBe(27);
      expect(state.reincarnation.livesLived).toBe(2);
    });

    it('should give XP bonus in new life after reincarnation', () => {
      // Life 1: gain some strength levels
      store.getState().updateSkill('strength', { level: 20 });
      store.getState().resetForReincarnation();

      const stateAfterReinc = store.getState();
      const strBonus = stateAfterReinc.reincarnation.skillBonuses.find(
        (sp) => sp.skillId === 'strength',
      );

      // Now training strength should give bonus XP
      const strengthState = stateAfterReinc.skills.find((s) => s.skillId === 'strength');
      expect(strengthState).toBeDefined();
      const result = processSkillXpGain(
        strengthState ?? { skillId: 'strength', level: 0, xp: 0, xpToNextLevel: 10 },
        1, // base XP
        0, // no concentration
        strBonus,
      );

      // 1 base * 1.0 conc * 1.20 reincarnation = 1.2
      expect(result.xp).toBeCloseTo(1.2, 5);
    });

    it('should produce valid GameState after reincarnation', () => {
      store.getState().updateSkill('concentration', { level: 10 });
      store.getState().updateJob('beggar', { level: 20 });
      store.getState().advanceDays(1000);
      store.getState().resetForReincarnation();

      const result = GameStateSchema.safeParse(store.getState());
      expect(result.success).toBe(true);
    });
  });

  describe('Full life cycle simulation', () => {
    it('should complete a full life: start -> train -> age -> die -> reincarnate', () => {
      // Start: age 16, in slums
      let state: GameState = {
        ...getInitialState(),
        player: {
          ...getInitialState().player,
          activeJobActionId: 'begging',
        },
        isRunning: true,
        isAlive: true,
      };

      // Live an entire life (42 years = 42 * 365 = 15330 days)
      const daysInLife = (DEATH_THRESHOLD_AGE - STARTING_AGE) * DAYS_PER_YEAR;
      state = processMultipleTicks(state, daysInLife + 100);

      // Should be at death threshold
      expect(state.player.storyFlags['amulet_glowing']).toBe(true);
      expect(state.isRunning).toBe(false);
      expect(state.player.activeJobActionId).toBeNull();

      // Player should have earned XP and money from begging
      const beggarJob = state.jobs.find((j) => j.jobId === 'beggar');
      expect(beggarJob).toBeDefined();
      expect(beggarJob?.level).toBeGreaterThan(0);
      expect(state.player.money).toBeGreaterThan(0);

      // Now simulate reincarnation using the store
      store.setState(state);
      store.getState().resetForReincarnation();

      const afterReinc = store.getState();

      // State should be reset
      expect(afterReinc.time.currentAge).toBe(STARTING_AGE);
      expect(afterReinc.player.currentLocationId).toBe('slums');
      expect(afterReinc.player.money).toBe(0);
      expect(afterReinc.reincarnation.livesLived).toBe(1);

      // Reincarnation bonuses should be accumulated from the life
      const begBonus = afterReinc.reincarnation.jobBonuses.find(
        (jp) => jp.jobId === 'beggar',
      );
      expect(begBonus).toBeDefined();
      expect(begBonus?.totalLevelsAllLives).toBeGreaterThan(0);

      // Should be valid state
      const result = GameStateSchema.safeParse(afterReinc);
      expect(result.success).toBe(true);
    });
  });
});
