import type { HousingOption } from '../../specs/schemas';

export const HOUSING_OPTIONS: Record<string, HousingOption> = {
  tent: {
    id: 'tent',
    name: 'Ragged Tent',
    description: 'A patched-up tent in a back alley. Better than nothing.',
    locationId: 'slums',
    dailyCost: 1,
    xpBonusPercent: 5,
  },
  lean_to: {
    id: 'lean_to',
    name: 'Lean-to Shelter',
    description: 'A rough wooden shelter at the edge of the farmlands.',
    locationId: 'fields',
    dailyCost: 2,
    xpBonusPercent: 10,
  },
  room: {
    id: 'room',
    name: 'Rented Room',
    description: 'A small but clean room above the village tavern.',
    locationId: 'village',
    dailyCost: 3,
    xpBonusPercent: 15,
  },
};
