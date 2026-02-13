import { describe, it, expect, beforeEach } from 'vitest';
import { store, createInitialGameState } from '../../../src/state/store';
import { SKILLS } from '../../../src/data/skills';
import { JOBS } from '../../../src/data/jobs';
import { GameStateSchema } from '../../../specs/schemas';
import { STARTING_AGE } from '../../../src/core/time';

describe('Game Store', () => {
  beforeEach(() => {
    store.setState(createInitialGameState());
  });

  describe('Initial State', () => {
    it('should have valid initial state matching GameStateSchema', () => {
      const state = store.getState();
      const result = GameStateSchema.safeParse(state);
      expect(result.success).toBe(true);
    });

    it('should start at age 16', () => {
      const state = store.getState();
      expect(state.time.currentAge).toBe(STARTING_AGE);
    });

    it('should start at day 0', () => {
      const state = store.getState();
      expect(state.time.currentDay).toBe(0);
    });

    it('should start in slums', () => {
      const state = store.getState();
      expect(state.player.currentLocationId).toBe('slums');
    });

    it('should start with 0 money', () => {
      const state = store.getState();
      expect(state.player.money).toBe(0);
    });

    it('should start with no active job', () => {
      const state = store.getState();
      expect(state.player.activeJobId).toBeNull();
    });

    it('should start with no active job action', () => {
      const state = store.getState();
      expect(state.player.activeJobActionId).toBeNull();
    });

    it('should start with no active skill action', () => {
      const state = store.getState();
      expect(state.player.activeSkillActionId).toBeNull();
    });

    it('should start not running', () => {
      const state = store.getState();
      expect(state.isRunning).toBe(false);
    });

    it('should start alive', () => {
      const state = store.getState();
      expect(state.isAlive).toBe(true);
    });

    it('should have skill states for all defined skills', () => {
      const state = store.getState();
      const skillIds = Object.keys(SKILLS);
      expect(state.skills.length).toBe(skillIds.length);
      for (const id of skillIds) {
        expect(state.skills.find((s) => s.skillId === id)).toBeDefined();
      }
    });

    it('should have job states for all defined jobs', () => {
      const state = store.getState();
      const jobIds = Object.keys(JOBS);
      expect(state.jobs.length).toBe(jobIds.length);
      for (const id of jobIds) {
        expect(state.jobs.find((j) => j.jobId === id)).toBeDefined();
      }
    });

    it('should have all skills at level 0 with 0 XP', () => {
      const state = store.getState();
      for (const skill of state.skills) {
        expect(skill.level).toBe(0);
        expect(skill.xp).toBe(0);
      }
    });

    it('should have all jobs at level 0 with 0 XP', () => {
      const state = store.getState();
      for (const job of state.jobs) {
        expect(job.level).toBe(0);
        expect(job.xp).toBe(0);
      }
    });

    it('should have reincarnation initialized', () => {
      const state = store.getState();
      expect(state.reincarnation.livesLived).toBe(0);
      expect(state.reincarnation.totalDaysAllLives).toBe(0);
    });

    it('should start with empty clanIds', () => {
      const state = store.getState();
      expect(state.player.clanIds).toEqual([]);
    });
  });

  describe('updateTime', () => {
    it('should update time fields', () => {
      store.getState().updateTime({ currentDay: 10 });
      expect(store.getState().time.currentDay).toBe(10);
    });

    it('should not overwrite unrelated time fields', () => {
      store.getState().updateTime({ currentDay: 10 });
      expect(store.getState().time.currentAge).toBe(STARTING_AGE);
    });
  });

  describe('updatePlayer', () => {
    it('should update player fields', () => {
      store.getState().updatePlayer({ money: 100 });
      expect(store.getState().player.money).toBe(100);
    });

    it('should update location', () => {
      store.getState().updatePlayer({ currentLocationId: 'fields' });
      expect(store.getState().player.currentLocationId).toBe('fields');
    });

    it('should update active job action', () => {
      store.getState().updatePlayer({ activeJobActionId: 'begging' });
      expect(store.getState().player.activeJobActionId).toBe('begging');
    });

    it('should update active skill action', () => {
      store.getState().updatePlayer({ activeSkillActionId: 'train_concentration' });
      expect(store.getState().player.activeSkillActionId).toBe('train_concentration');
    });
  });

  describe('updateSkill', () => {
    it('should update a specific skill', () => {
      store.getState().updateSkill('concentration', { level: 5, xp: 20 });
      const skill = store.getState().skills.find((s) => s.skillId === 'concentration');
      expect(skill?.level).toBe(5);
      expect(skill?.xp).toBe(20);
    });

    it('should not affect other skills', () => {
      store.getState().updateSkill('concentration', { level: 5 });
      const strength = store.getState().skills.find((s) => s.skillId === 'strength');
      expect(strength?.level).toBe(0);
    });
  });

  describe('updateJob', () => {
    it('should update a specific job', () => {
      store.getState().updateJob('beggar', { level: 3, xp: 15 });
      const job = store.getState().jobs.find((j) => j.jobId === 'beggar');
      expect(job?.level).toBe(3);
      expect(job?.xp).toBe(15);
    });

    it('should not affect other jobs', () => {
      store.getState().updateJob('beggar', { level: 3 });
      const farmer = store.getState().jobs.find((j) => j.jobId === 'farmer');
      expect(farmer?.level).toBe(0);
    });
  });

  describe('advanceDays', () => {
    it('should advance the current day', () => {
      store.getState().advanceDays(5);
      expect(store.getState().time.currentDay).toBe(5);
    });

    it('should update age when crossing year boundary', () => {
      store.getState().advanceDays(365);
      expect(store.getState().time.currentAge).toBe(STARTING_AGE + 1);
    });

    it('should accumulate days across multiple calls', () => {
      store.getState().advanceDays(100);
      store.getState().advanceDays(100);
      expect(store.getState().time.currentDay).toBe(200);
    });
  });

  describe('setRunning', () => {
    it('should set running to true', () => {
      store.getState().setRunning(true);
      expect(store.getState().isRunning).toBe(true);
    });

    it('should set running to false', () => {
      store.getState().setRunning(true);
      store.getState().setRunning(false);
      expect(store.getState().isRunning).toBe(false);
    });
  });

  describe('resetForReincarnation', () => {
    it('should reset time to initial', () => {
      store.getState().advanceDays(1000);
      store.getState().resetForReincarnation();
      expect(store.getState().time.currentDay).toBe(0);
      expect(store.getState().time.currentAge).toBe(STARTING_AGE);
    });

    it('should reset player to initial state', () => {
      store.getState().updatePlayer({ money: 500, currentLocationId: 'village' });
      store.getState().resetForReincarnation();
      expect(store.getState().player.money).toBe(0);
      expect(store.getState().player.currentLocationId).toBe('slums');
    });

    it('should reset all skill levels and XP', () => {
      store.getState().updateSkill('concentration', { level: 10, xp: 50 });
      store.getState().resetForReincarnation();
      const skill = store.getState().skills.find((s) => s.skillId === 'concentration');
      expect(skill?.level).toBe(0);
      expect(skill?.xp).toBe(0);
    });

    it('should reset all job levels and XP', () => {
      store.getState().updateJob('beggar', { level: 20, xp: 100 });
      store.getState().resetForReincarnation();
      const job = store.getState().jobs.find((j) => j.jobId === 'beggar');
      expect(job?.level).toBe(0);
      expect(job?.xp).toBe(0);
    });

    it('should increment lives lived', () => {
      store.getState().resetForReincarnation();
      expect(store.getState().reincarnation.livesLived).toBe(1);
    });

    it('should accumulate total days across lives', () => {
      store.getState().advanceDays(1000);
      store.getState().resetForReincarnation();
      expect(store.getState().reincarnation.totalDaysAllLives).toBe(1000);
    });

    it('should accumulate skill levels into reincarnation bonuses', () => {
      store.getState().updateSkill('concentration', { level: 10 });
      store.getState().resetForReincarnation();
      const reincarnationBonus = store.getState().reincarnation.skillBonuses.find(
        (sp) => sp.skillId === 'concentration',
      );
      expect(reincarnationBonus?.totalLevelsAllLives).toBe(10);
    });

    it('should accumulate job levels into reincarnation bonuses', () => {
      store.getState().updateJob('beggar', { level: 20 });
      store.getState().resetForReincarnation();
      const reincarnationBonus = store.getState().reincarnation.jobBonuses.find(
        (jp) => jp.jobId === 'beggar',
      );
      expect(reincarnationBonus?.totalLevelsAllLives).toBe(20);
    });

    it('should stack reincarnation bonuses across multiple lives', () => {
      // Life 1
      store.getState().updateSkill('strength', { level: 15 });
      store.getState().advanceDays(500);
      store.getState().resetForReincarnation();

      // Life 2
      store.getState().updateSkill('strength', { level: 12 });
      store.getState().advanceDays(300);
      store.getState().resetForReincarnation();

      const reincarnationBonus = store.getState().reincarnation.skillBonuses.find(
        (sp) => sp.skillId === 'strength',
      );
      expect(reincarnationBonus?.totalLevelsAllLives).toBe(27);
      expect(store.getState().reincarnation.livesLived).toBe(2);
      expect(store.getState().reincarnation.totalDaysAllLives).toBe(800);
    });

    it('should produce valid state after reincarnation', () => {
      store.getState().updateSkill('concentration', { level: 10 });
      store.getState().updateJob('beggar', { level: 20 });
      store.getState().advanceDays(1000);
      store.getState().resetForReincarnation();

      const result = GameStateSchema.safeParse(store.getState());
      expect(result.success).toBe(true);
    });

    it('should reset clanIds on reincarnation', () => {
      store.getState().updatePlayer({ clanIds: ['army', 'bandits'] });
      store.getState().resetForReincarnation();
      expect(store.getState().player.clanIds).toEqual([]);
    });
  });

  describe('resetGame', () => {
    it('should reset everything including reincarnation bonuses', () => {
      store.getState().updateSkill('concentration', { level: 10 });
      store.getState().resetForReincarnation();
      store.getState().resetGame();

      expect(store.getState().reincarnation.livesLived).toBe(0);
      expect(store.getState().reincarnation.totalDaysAllLives).toBe(0);
    });
  });

  describe('Persistence validation', () => {
    it('createInitialGameState should produce valid GameState', () => {
      const state = createInitialGameState();
      const result = GameStateSchema.safeParse(state);
      expect(result.success).toBe(true);
    });
  });
});
