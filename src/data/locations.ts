import type { Location } from '../../specs/schemas';

export const LOCATIONS: Record<string, Location> = {
  slums: {
    id: 'slums',
    name: 'The Slums',
    description: 'A grimy corner of the city. Where every life begins.',
    requirements: [],
    availableJobIds: ['beggar'],
    availableTrainingSkillIds: ['concentration', 'endurance'],
  },
  fields: {
    id: 'fields',
    name: 'The Fields',
    description: 'Vast farmlands stretching to the horizon. Hard but honest work.',
    requirements: [
      { type: 'job', jobId: 'beggar', level: 5 },
    ],
    availableJobIds: ['farmer'],
    availableTrainingSkillIds: ['strength', 'endurance'],
  },
  village: {
    id: 'village',
    name: 'The Village',
    description: 'A bustling settlement with opportunities for the strong and clever.',
    requirements: [
      { type: 'job', jobId: 'farmer', level: 5 },
    ],
    availableJobIds: ['laborer'],
    availableTrainingSkillIds: ['strength', 'intelligence'],
  },
  prison: {
    id: 'prison',
    name: 'The Prison',
    description: 'Cold stone walls and iron bars. You have time to reflect.',
    requirements: [],
    availableJobIds: [],
    availableTrainingSkillIds: ['concentration', 'strength'],
  },
  death_gate: {
    id: 'death_gate',
    name: 'The Death Gate',
    description: 'A place between worlds. The amulet pulses with otherworldly energy.',
    requirements: [],
    availableJobIds: [],
    availableTrainingSkillIds: [],
  },
  barracks: {
    id: 'barracks',
    name: 'The Barracks',
    description: 'Military quarters where soldiers train and prepare for duty.',
    requirements: [{ type: 'clan', clanId: 'army' }],
    availableJobIds: ['soldier'],
    availableTrainingSkillIds: ['strength'],
  },
  bandit_hideout: {
    id: 'bandit_hideout',
    name: 'The Bandit Hideout',
    description: 'A hidden camp deep in the forest. Only those trusted by the bandits know the way.',
    requirements: [{ type: 'clan', clanId: 'bandits' }],
    availableJobIds: ['robbery'],
    availableTrainingSkillIds: ['strength', 'endurance'],
  },
};
