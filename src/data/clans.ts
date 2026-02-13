import type { Clan } from '../../specs/schemas';

export const CLANS: Record<string, Clan> = {
  army: {
    id: 'army',
    name: 'The Army',
    description: 'The kingdom\'s military force. Discipline, strength, and honor.',
  },
  bandits: {
    id: 'bandits',
    name: 'The Bandits',
    description: 'An outlaw band operating from the shadows. Freedom at any cost.',
  },
};
