import type { ClickAction, ContinuousAction } from '../../specs/schemas';

// --- Continuous Actions (Right Column) ---

export const CONTINUOUS_ACTIONS: Record<string, ContinuousAction> = {
  // Slums
  begging: {
    id: 'begging',
    name: 'Begging',
    description: 'Beg for coins on the street corners.',
    type: 'continuous',
    category: 'job',
    locationId: 'slums',
    requirements: [],
    effects: [
      { type: 'addJobXp', jobId: 'beggar', amount: 1 },
      { type: 'addMoney', amount: 1 },
    ],
  },
  train_concentration: {
    id: 'train_concentration',
    name: 'Meditate',
    description: 'Focus your mind to improve concentration.',
    type: 'continuous',
    category: 'skill',
    locationId: 'slums',
    requirements: [],
    effects: [
      { type: 'addSkillXp', skillId: 'concentration', amount: 0.5 },
    ],
  },
  train_endurance_slums: {
    id: 'train_endurance_slums',
    name: 'Endurance Training',
    description: 'Survive the harsh conditions of the slums.',
    type: 'continuous',
    category: 'skill',
    locationId: 'slums',
    requirements: [],
    effects: [
      { type: 'addSkillXp', skillId: 'endurance', amount: 1 },
    ],
  },

  // Fields
  farming: {
    id: 'farming',
    name: 'Farming',
    description: 'Work the fields from dawn to dusk.',
    type: 'continuous',
    category: 'job',
    locationId: 'fields',
    requirements: [
      { type: 'job', jobId: 'beggar', level: 10 },
    ],
    effects: [
      { type: 'addJobXp', jobId: 'farmer', amount: 2 },
      { type: 'addMoney', amount: 3 },
    ],
  },
  train_strength_fields: {
    id: 'train_strength_fields',
    name: 'Heavy Lifting',
    description: 'Carry heavy loads to build strength.',
    type: 'continuous',
    category: 'skill',
    locationId: 'fields',
    requirements: [],
    effects: [
      { type: 'addSkillXp', skillId: 'strength', amount: 1 },
    ],
  },

  // Village
  laboring: {
    id: 'laboring',
    name: 'Laboring',
    description: 'Perform heavy manual work for the village.',
    type: 'continuous',
    category: 'job',
    locationId: 'village',
    requirements: [
      { type: 'skill', skillId: 'strength', level: 40 },
    ],
    effects: [
      { type: 'addJobXp', jobId: 'laborer', amount: 3 },
      { type: 'addMoney', amount: 5 },
    ],
  },
  train_intelligence: {
    id: 'train_intelligence',
    name: 'Study',
    description: 'Study books and scrolls at the village library.',
    type: 'continuous',
    category: 'skill',
    locationId: 'village',
    requirements: [],
    effects: [
      { type: 'addSkillXp', skillId: 'intelligence', amount: 1 },
    ],
  },
};

// --- Click Actions (Left Column) ---

export const CLICK_ACTIONS: Record<string, ClickAction> = {
  // Travel actions
  travel_to_fields: {
    id: 'travel_to_fields',
    name: 'Travel to the Fields',
    description: 'Leave the slums and head for the farmlands.',
    type: 'click',
    timeCostDays: 3,
    locationId: 'slums',
    requirements: [
      { type: 'job', jobId: 'beggar', level: 5 },
    ],
    effects: [
      { type: 'changeLocation', locationId: 'fields' },
    ],
  },
  travel_to_village: {
    id: 'travel_to_village',
    name: 'Travel to the Village',
    description: 'Head to the village for better opportunities.',
    type: 'click',
    timeCostDays: 5,
    locationId: 'fields',
    requirements: [
      { type: 'skill', skillId: 'strength', level: 20 },
    ],
    effects: [
      { type: 'changeLocation', locationId: 'village' },
    ],
  },
  travel_to_slums: {
    id: 'travel_to_slums',
    name: 'Return to the Slums',
    description: 'Go back to where it all started.',
    type: 'click',
    timeCostDays: 2,
    locationId: 'fields',
    requirements: [],
    effects: [
      { type: 'changeLocation', locationId: 'slums' },
    ],
  },
  travel_to_slums_from_village: {
    id: 'travel_to_slums_from_village',
    name: 'Return to the Slums',
    description: 'Go back to the slums.',
    type: 'click',
    timeCostDays: 4,
    locationId: 'village',
    requirements: [],
    effects: [
      { type: 'changeLocation', locationId: 'slums' },
    ],
  },
  travel_to_fields_from_village: {
    id: 'travel_to_fields_from_village',
    name: 'Travel to the Fields',
    description: 'Head out to the farmlands.',
    type: 'click',
    timeCostDays: 3,
    locationId: 'village',
    requirements: [],
    effects: [
      { type: 'changeLocation', locationId: 'fields' },
    ],
  },

  // Story actions
  touch_amulet: {
    id: 'touch_amulet',
    name: 'Touch the Amulet',
    description: 'The amulet pulses with an otherworldly glow. Reach out and touch it...',
    type: 'click',
    timeCostDays: 0,
    locationId: 'slums',
    requirements: [
      { type: 'storyFlag', flag: 'amulet_glowing', value: true },
    ],
    effects: [
      { type: 'triggerReincarnation' },
    ],
  },
};
