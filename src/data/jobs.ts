import type { Job } from '../../specs/schemas';

export const JOBS: Record<string, Job> = {
  beggar: {
    id: 'beggar',
    name: 'Beggar',
    description: 'Beg for coins on the streets. No requirements.',
    locationId: 'slums',
    requirements: { skills: [], jobs: [] },
    xpPerTick: 1,
    moneyPerTick: 1,
  },
  farmer: {
    id: 'farmer',
    name: 'Farmer',
    description: 'Work the fields for a modest living. Requires Beggar experience.',
    locationId: 'fields',
    requirements: {
      skills: [],
      jobs: [{ jobId: 'beggar', level: 10 }],
    },
    xpPerTick: 2,
    moneyPerTick: 3,
  },
  laborer: {
    id: 'laborer',
    name: 'Laborer',
    description: 'Heavy manual work in the village. Requires great strength.',
    locationId: 'village',
    requirements: {
      skills: [{ skillId: 'strength', level: 40 }],
      jobs: [],
    },
    xpPerTick: 3,
    moneyPerTick: 5,
  },
};
