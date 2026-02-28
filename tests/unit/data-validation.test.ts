import { describe, it, expect } from 'vitest';
import {
  SkillSchema,
  JobSchema,
  LocationSchema,
  ContinuousActionSchema,
  ClickActionSchema,
  HousingOptionSchema,
  FoodOptionSchema,
  ClanSchema,
  TriggeredEventSchema,
} from '../../specs/schemas';
import { SKILLS } from '../../src/data/skills';
import { JOBS } from '../../src/data/jobs';
import { LOCATIONS } from '../../src/data/locations';
import { CONTINUOUS_ACTIONS, CLICK_ACTIONS } from '../../src/data/actions';
import { HOUSING_OPTIONS } from '../../src/data/housing';
import { FOOD_OPTIONS } from '../../src/data/food';
import { CLANS } from '../../src/data/clans';
import { TRIGGERED_EVENTS } from '../../src/data/events';

describe('Data Validation', () => {
  describe('Skills', () => {
    it('should have at least 1 skill defined', () => {
      expect(Object.keys(SKILLS).length).toBeGreaterThan(0);
    });

    it.each(Object.entries(SKILLS))('skill "%s" should match SkillSchema', (_id, skill) => {
      const result = SkillSchema.safeParse(skill);
      expect(result.success).toBe(true);
    });

    it('should have all MVP skills', () => {
      expect(SKILLS['concentration']).toBeDefined();
      expect(SKILLS['strength']).toBeDefined();
      expect(SKILLS['intelligence']).toBeDefined();
      expect(SKILLS['endurance']).toBeDefined();
    });
  });

  describe('Jobs', () => {
    it('should have at least 1 job defined', () => {
      expect(Object.keys(JOBS).length).toBeGreaterThan(0);
    });

    it.each(Object.entries(JOBS))('job "%s" should match JobSchema', (_id, job) => {
      const result = JobSchema.safeParse(job);
      expect(result.success).toBe(true);
    });

    it('should have all MVP jobs', () => {
      expect(JOBS['beggar']).toBeDefined();
      expect(JOBS['farmer']).toBeDefined();
      expect(JOBS['laborer']).toBeDefined();
    });

    it('should have soldier and robbery jobs', () => {
      expect(JOBS['soldier']).toBeDefined();
      expect(JOBS['robbery']).toBeDefined();
    });

    it('should reference valid locations', () => {
      for (const job of Object.values(JOBS)) {
        expect(LOCATIONS[job.locationId]).toBeDefined();
      }
    });

    it('should reference valid skills in requirements', () => {
      for (const job of Object.values(JOBS)) {
        for (const req of job.requirements.skills) {
          expect(SKILLS[req.skillId]).toBeDefined();
        }
      }
    });
  });

  describe('Locations', () => {
    it('should have at least 1 location defined', () => {
      expect(Object.keys(LOCATIONS).length).toBeGreaterThan(0);
    });

    it.each(Object.entries(LOCATIONS))(
      'location "%s" should match LocationSchema',
      (_id, location) => {
        const result = LocationSchema.safeParse(location);
        expect(result.success).toBe(true);
      },
    );

    it('should have all MVP locations', () => {
      expect(LOCATIONS['slums']).toBeDefined();
      expect(LOCATIONS['fields']).toBeDefined();
      expect(LOCATIONS['village']).toBeDefined();
      expect(LOCATIONS['death_gate']).toBeDefined();
    });

    it('should have barracks and bandit_hideout locations', () => {
      expect(LOCATIONS['barracks']).toBeDefined();
      expect(LOCATIONS['bandit_hideout']).toBeDefined();
    });

    it('should reference valid jobs', () => {
      for (const location of Object.values(LOCATIONS)) {
        for (const jobId of location.availableJobIds) {
          expect(JOBS[jobId]).toBeDefined();
        }
      }
    });

    it('should reference valid training skills', () => {
      for (const location of Object.values(LOCATIONS)) {
        for (const skillId of location.availableTrainingSkillIds) {
          expect(SKILLS[skillId]).toBeDefined();
        }
      }
    });
  });

  describe('Continuous Actions', () => {
    it.each(Object.entries(CONTINUOUS_ACTIONS))(
      'continuous action "%s" should match schema',
      (_id, action) => {
        const result = ContinuousActionSchema.safeParse(action);
        expect(result.success).toBe(true);
      },
    );

    it('should reference valid locations', () => {
      for (const action of Object.values(CONTINUOUS_ACTIONS)) {
        expect(LOCATIONS[action.locationId]).toBeDefined();
      }
    });
  });

  describe('Click Actions', () => {
    it.each(Object.entries(CLICK_ACTIONS))(
      'click action "%s" should match schema',
      (_id, action) => {
        const result = ClickActionSchema.safeParse(action);
        expect(result.success).toBe(true);
      },
    );

    it('should reference valid locations', () => {
      for (const action of Object.values(CLICK_ACTIONS)) {
        if (action.locationId === 'any') continue; // global action, not location-specific
        expect(LOCATIONS[action.locationId]).toBeDefined();
      }
    });
  });

  describe('Housing Options', () => {
    it('should have at least 1 housing option defined', () => {
      expect(Object.keys(HOUSING_OPTIONS).length).toBeGreaterThan(0);
    });

    it.each(Object.entries(HOUSING_OPTIONS))(
      'housing option "%s" should match HousingOptionSchema',
      (_id, housing) => {
        const result = HousingOptionSchema.safeParse(housing);
        expect(result.success).toBe(true);
      },
    );

    it('should reference valid locations', () => {
      for (const housing of Object.values(HOUSING_OPTIONS)) {
        expect(LOCATIONS[housing.locationId]).toBeDefined();
      }
    });

    it('should have prison_cell', () => {
      expect(HOUSING_OPTIONS['prison_cell']).toBeDefined();
    });
  });

  describe('Food Options', () => {
    it('should have at least 1 food option defined', () => {
      expect(Object.keys(FOOD_OPTIONS).length).toBeGreaterThan(0);
    });

    it.each(Object.entries(FOOD_OPTIONS))(
      'food option "%s" should match FoodOptionSchema',
      (_id, food) => {
        const result = FoodOptionSchema.safeParse(food);
        expect(result.success).toBe(true);
      },
    );

    it('should have prison_food', () => {
      expect(FOOD_OPTIONS['prison_food']).toBeDefined();
    });

    it('should reference valid locations for location-specific food', () => {
      for (const food of Object.values(FOOD_OPTIONS)) {
        if (food.locationId) {
          expect(LOCATIONS[food.locationId]).toBeDefined();
        }
      }
    });
  });

  describe('Clans', () => {
    it('should have at least 1 clan defined', () => {
      expect(Object.keys(CLANS).length).toBeGreaterThan(0);
    });

    it.each(Object.entries(CLANS))('clan "%s" should match ClanSchema', (_id, clan) => {
      const result = ClanSchema.safeParse(clan);
      expect(result.success).toBe(true);
    });

    it('should have army and bandits clans', () => {
      expect(CLANS['army']).toBeDefined();
      expect(CLANS['bandits']).toBeDefined();
    });
  });

  describe('Triggered Events', () => {
    it('should have at least 1 triggered event defined', () => {
      expect(TRIGGERED_EVENTS.length).toBeGreaterThan(0);
    });

    it.each(TRIGGERED_EVENTS.map((e) => [e.id, e] as [string, typeof e]))(
      'triggered event "%s" should match TriggeredEventSchema',
      (_id, event) => {
        const result = TriggeredEventSchema.safeParse(event);
        expect(result.success).toBe(true);
      },
    );

    it('should have all 4 core triggered events', () => {
      const ids = TRIGGERED_EVENTS.map((e) => e.id);
      expect(ids).toContain('prison_meal_theft');
      expect(ids).toContain('bandit_proposal');
      expect(ids).toContain('amulet_awakening');
      expect(ids).toContain('death_gate');
    });

    it('death_gate event should have the highest priority', () => {
      const deathGate = TRIGGERED_EVENTS.find((e) => e.id === 'death_gate');
      const maxPriority = Math.max(...TRIGGERED_EVENTS.map((e) => e.priority));
      expect(deathGate?.priority).toBe(maxPriority);
    });

    it('blocking events should have priority > 0', () => {
      for (const event of TRIGGERED_EVENTS) {
        if (event.blocking) {
          expect(event.priority).toBeGreaterThan(0);
        }
      }
    });
  });
});
