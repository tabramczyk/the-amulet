import { describe, it, expect } from 'vitest';
import { createInitialGameState } from '../../src/state/store';
import { GameStateSchema } from '../../specs/schemas';

describe('Save/Load Integration', () => {
  describe('Zod validation of save data', () => {
    it('should validate a correct initial game state', () => {
      const state = createInitialGameState();
      const result = GameStateSchema.safeParse(state);
      expect(result.success).toBe(true);
    });

    it('should validate a game state with progress', () => {
      const state = createInitialGameState();
      // Simulate some progress
      state.time.currentDay = 500;
      state.time.currentAge = 17;
      state.player.money = 250;
      state.player.currentLocationId = 'fields';
      state.player.activeJobActionId = 'farming';
      state.player.storyFlags = { amulet_found: true };
      state.skills = state.skills.map((s) =>
        s.skillId === 'strength' ? { ...s, level: 10, xp: 5 } : s,
      );
      state.jobs = state.jobs.map((j) =>
        j.jobId === 'beggar' ? { ...j, level: 15, xp: 20 } : j,
      );
      state.prestige.livesLived = 2;
      state.prestige.totalDaysAllLives = 30000;
      state.prestige.skillPrestige = state.prestige.skillPrestige.map((sp) =>
        sp.skillId === 'strength'
          ? { ...sp, totalLevelsAllLives: 25 }
          : sp,
      );

      const result = GameStateSchema.safeParse(state);
      expect(result.success).toBe(true);
    });

    it('should reject state with negative money', () => {
      const state = createInitialGameState();
      // Tamper with money to be negative
      const tampered = { ...state, player: { ...state.player, money: -100 } };
      const result = GameStateSchema.safeParse(tampered);
      expect(result.success).toBe(false);
    });

    it('should reject state with invalid age (below 16)', () => {
      const state = createInitialGameState();
      const tampered = {
        ...state,
        time: { ...state.time, currentAge: 5 },
      };
      const result = GameStateSchema.safeParse(tampered);
      expect(result.success).toBe(false);
    });

    it('should reject state with negative day count', () => {
      const state = createInitialGameState();
      const tampered = {
        ...state,
        time: { ...state.time, currentDay: -1 },
      };
      const result = GameStateSchema.safeParse(tampered);
      expect(result.success).toBe(false);
    });

    it('should reject state with missing required fields', () => {
      const partial = { version: '0.1.0' };
      const result = GameStateSchema.safeParse(partial);
      expect(result.success).toBe(false);
    });

    it('should reject state with wrong types', () => {
      const tampered = {
        ...createInitialGameState(),
        time: 'not an object',
      };
      const result = GameStateSchema.safeParse(tampered);
      expect(result.success).toBe(false);
    });

    it('should reject state with empty string for location', () => {
      const state = createInitialGameState();
      const tampered = {
        ...state,
        player: { ...state.player, currentLocationId: '' },
      };
      const result = GameStateSchema.safeParse(tampered);
      expect(result.success).toBe(false);
    });

    it('should reject null as game state', () => {
      const result = GameStateSchema.safeParse(null);
      expect(result.success).toBe(false);
    });

    it('should reject undefined as game state', () => {
      const result = GameStateSchema.safeParse(undefined);
      expect(result.success).toBe(false);
    });

    it('should reject completely random data', () => {
      const result = GameStateSchema.safeParse({
        foo: 'bar',
        count: 42,
        nested: { a: 1 },
      });
      expect(result.success).toBe(false);
    });
  });

  describe('Save data serialization round-trip', () => {
    it('should survive JSON serialization and deserialization', () => {
      const state = createInitialGameState();
      const serialized = JSON.stringify(state);
      const deserialized = JSON.parse(serialized);
      const result = GameStateSchema.safeParse(deserialized);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.version).toBe(state.version);
        expect(result.data.time.currentDay).toBe(state.time.currentDay);
        expect(result.data.time.currentAge).toBe(state.time.currentAge);
        expect(result.data.player.money).toBe(state.player.money);
        expect(result.data.player.currentLocationId).toBe(state.player.currentLocationId);
        expect(result.data.skills.length).toBe(state.skills.length);
        expect(result.data.jobs.length).toBe(state.jobs.length);
        expect(result.data.prestige.livesLived).toBe(state.prestige.livesLived);
      }
    });

    it('should survive round-trip with progress state', () => {
      const state = createInitialGameState();
      state.time.currentDay = 5000;
      state.time.currentAge = 29;
      state.player.money = 1500;
      state.prestige.livesLived = 5;

      const serialized = JSON.stringify(state);
      const deserialized = JSON.parse(serialized);
      const result = GameStateSchema.safeParse(deserialized);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.time.currentDay).toBe(5000);
        expect(result.data.player.money).toBe(1500);
        expect(result.data.prestige.livesLived).toBe(5);
      }
    });
  });

  describe('Corrupt save data handling', () => {
    it('should fail validation on corrupted JSON structure', () => {
      // Simulate what happens if save data is partially corrupted
      const state = createInitialGameState();
      const serialized = JSON.stringify(state);
      // Corrupt by removing the last character (makes invalid JSON, but
      // we test post-parse corruption)
      const corrupted = JSON.parse(serialized);
      delete corrupted.time;

      const result = GameStateSchema.safeParse(corrupted);
      expect(result.success).toBe(false);
    });

    it('should fail validation when skill state has negative XP', () => {
      const state = createInitialGameState();
      state.skills = state.skills.map((s, i) =>
        i === 0 ? { ...s, xp: -10 } : s,
      );
      const result = GameStateSchema.safeParse(state);
      expect(result.success).toBe(false);
    });

    it('should fail validation when skill state has negative level', () => {
      const state = createInitialGameState();
      state.skills = state.skills.map((s, i) =>
        i === 0 ? { ...s, level: -1 } : s,
      );
      const result = GameStateSchema.safeParse(state);
      expect(result.success).toBe(false);
    });

    it('should fail validation when job state has zero xpToNextLevel', () => {
      const state = createInitialGameState();
      state.jobs = state.jobs.map((j, i) =>
        i === 0 ? { ...j, xpToNextLevel: 0 } : j,
      );
      const result = GameStateSchema.safeParse(state);
      expect(result.success).toBe(false);
    });

    it('should fail validation when prestige has negative lives', () => {
      const state = createInitialGameState();
      state.prestige.livesLived = -1;
      const result = GameStateSchema.safeParse(state);
      expect(result.success).toBe(false);
    });
  });

  describe('Store persistence merge function', () => {
    it('should accept valid persisted state', () => {
      const state = createInitialGameState();
      const result = GameStateSchema.safeParse(state);
      expect(result.success).toBe(true);
    });

    it('should reject invalid persisted state', () => {
      const result = GameStateSchema.safeParse({ garbage: true });
      expect(result.success).toBe(false);
    });

    it('should reject persisted state with extra invalid fields but missing required ones', () => {
      const partial = {
        version: '0.1.0',
        isRunning: false,
        extraField: 'should be ignored',
      };
      const result = GameStateSchema.safeParse(partial);
      expect(result.success).toBe(false);
    });
  });
});
