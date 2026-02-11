import type { Skill } from '../../specs/schemas';

export const SKILLS: Record<string, Skill> = {
  concentration: {
    id: 'concentration',
    name: 'Concentration',
    type: 'meta',
    description: 'Increases XP gain from all sources by 1% per level.',
    softCap: 30,
    xpPerTick: 0.5,
  },
  strength: {
    id: 'strength',
    name: 'Strength',
    type: 'attribute',
    description: 'Physical power. Required for labor-intensive jobs.',
    softCap: 50,
    xpPerTick: 1,
  },
  intelligence: {
    id: 'intelligence',
    name: 'Intelligence',
    type: 'attribute',
    description: 'Mental acuity. Required for scholarly pursuits.',
    softCap: 50,
    xpPerTick: 1,
  },
  endurance: {
    id: 'endurance',
    name: 'Endurance',
    type: 'attribute',
    description: 'Physical resilience. May affect lifespan in future updates.',
    softCap: 50,
    xpPerTick: 1,
  },
};
