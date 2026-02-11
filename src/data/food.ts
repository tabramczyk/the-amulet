import type { FoodOption } from '../../specs/schemas';

export const FOOD_OPTIONS: Record<string, FoodOption> = {
  scraps: {
    id: 'scraps',
    name: 'Street Scraps',
    description: 'Whatever you can scrounge up. Not great, but fills the belly.',
    dailyCost: 1,
    xpBonusPercent: 3,
  },
  bread: {
    id: 'bread',
    name: 'Bread & Water',
    description: 'Simple but honest fare. A daily loaf and clean water.',
    dailyCost: 2,
    xpBonusPercent: 8,
  },
};
