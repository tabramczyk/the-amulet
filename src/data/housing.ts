import type { HousingOption } from '../../specs/schemas';

export const HOUSING_OPTIONS: Record<string, HousingOption> = {
  tent: {
    id: 'tent',
    name: 'Ragged Tent',
    description: 'A patched-up tent in a back alley. Better than nothing.',
    locationId: 'slums',
    dailyCost: 2,
    xpBonusPercent: 5,
  },
  lean_to: {
    id: 'lean_to',
    name: 'Lean-to Shelter',
    description: 'A rough wooden shelter at the edge of the farmlands.',
    locationId: 'fields',
    dailyCost: 3,
    xpBonusPercent: 10,
  },
  room: {
    id: 'room',
    name: 'Rented Room',
    description: 'A small but clean room above the village tavern.',
    locationId: 'village',
    dailyCost: 5,
    xpBonusPercent: 15,
  },
  prison_cell: {
    id: 'prison_cell',
    name: 'Prison Cell',
    description: 'A cold stone cell with a thin mattress. At least you have a roof.',
    locationId: 'prison',
    dailyCost: 0,
    xpBonusPercent: 3,
  },
};
