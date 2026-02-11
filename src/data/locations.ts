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
      { type: 'skill', skillId: 'strength', level: 20 },
    ],
    availableJobIds: ['laborer'],
    availableTrainingSkillIds: ['strength', 'intelligence'],
  },
};
