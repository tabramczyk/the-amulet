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
    requirements: [
      { type: 'storyFlag', flag: 'intro_complete', value: true },
    ],
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
    requirements: [
      { type: 'storyFlag', flag: 'intro_complete', value: true },
    ],
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
    requirements: [
      { type: 'storyFlag', flag: 'intro_complete', value: true },
    ],
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
      { type: 'storyFlag', flag: 'intro_complete', value: true },
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
    requirements: [
      { type: 'storyFlag', flag: 'intro_complete', value: true },
    ],
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
      { type: 'storyFlag', flag: 'intro_complete', value: true },
      { type: 'skill', skillId: 'strength', level: 10 },
      { type: 'job', jobId: 'farmer', level: 10 },
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
    requirements: [
      { type: 'storyFlag', flag: 'intro_complete', value: true },
    ],
    effects: [
      { type: 'addSkillXp', skillId: 'intelligence', amount: 1 },
    ],
  },

  // Prison
  prison_meditate: {
    id: 'prison_meditate',
    name: 'Meditate',
    description: 'Clear your mind in the silence of your cell.',
    type: 'continuous',
    category: 'skill',
    locationId: 'prison',
    requirements: [],
    effects: [
      { type: 'addSkillXp', skillId: 'concentration', amount: 0.6 },
    ],
  },
  prison_train_strength: {
    id: 'prison_train_strength',
    name: 'Train Strength',
    description: 'Push-ups, pull-ups. The cell is small but your will is strong.',
    type: 'continuous',
    category: 'skill',
    locationId: 'prison',
    requirements: [],
    effects: [
      { type: 'addSkillXp', skillId: 'strength', amount: 1.2 },
    ],
  },

  // Barracks
  soldiering: {
    id: 'soldiering',
    name: 'Soldiering',
    description: 'Patrol, drill, and serve. A soldier\'s daily duty.',
    type: 'continuous',
    category: 'job',
    locationId: 'barracks',
    requirements: [
      { type: 'storyFlag', flag: 'intro_complete', value: true },
    ],
    effects: [
      { type: 'addJobXp', jobId: 'soldier', amount: 3 },
      { type: 'addMoney', amount: 4 },
    ],
  },
  train_strength_barracks: {
    id: 'train_strength_barracks',
    name: 'Military Training',
    description: 'Rigorous military drills to build raw strength.',
    type: 'continuous',
    category: 'skill',
    locationId: 'barracks',
    requirements: [
      { type: 'storyFlag', flag: 'intro_complete', value: true },
    ],
    effects: [
      { type: 'addSkillXp', skillId: 'strength', amount: 1.5 },
    ],
  },

  // Bandit Hideout
  robbing: {
    id: 'robbing',
    name: 'Robbing',
    description: 'Ambush travelers on the road. High risk, high reward.',
    type: 'continuous',
    category: 'job',
    locationId: 'bandit_hideout',
    requirements: [
      { type: 'storyFlag', flag: 'intro_complete', value: true },
    ],
    effects: [
      { type: 'addJobXp', jobId: 'robbery', amount: 3 },
      { type: 'addMoney', amount: 4 },
    ],
  },
  train_strength_hideout: {
    id: 'train_strength_hideout',
    name: 'Bandit Combat Training',
    description: 'Spar with fellow bandits to hone your fighting skills.',
    type: 'continuous',
    category: 'skill',
    locationId: 'bandit_hideout',
    requirements: [
      { type: 'storyFlag', flag: 'intro_complete', value: true },
    ],
    effects: [
      { type: 'addSkillXp', skillId: 'strength', amount: 1.3 },
    ],
  },
  train_endurance_hideout: {
    id: 'train_endurance_hideout',
    name: 'Survival Training',
    description: 'Living rough in the forest builds endurance.',
    type: 'continuous',
    category: 'skill',
    locationId: 'bandit_hideout',
    requirements: [
      { type: 'storyFlag', flag: 'intro_complete', value: true },
    ],
    effects: [
      { type: 'addSkillXp', skillId: 'endurance', amount: 1.2 },
    ],
  },
};

// --- Click Actions (Left Column) ---

export const CLICK_ACTIONS: Record<string, ClickAction> = {
  // Story intro actions
  take_amulet: {
    id: 'take_amulet',
    name: 'Take the Amulet',
    description: 'Pick up the strange looking amulet.',
    type: 'click',
    category: 'story',
    timeCostDays: 0,
    locationId: 'slums',
    requirements: [
      { type: 'storyFlag', flag: 'took_amulet', value: false },
      { type: 'storyFlag', flag: 'intro_complete', value: false },
    ],
    effects: [
      { type: 'setStoryFlag', flag: 'took_amulet', value: true },
      { type: 'showMessage', message: "It didn't look expensive but you chose to keep it for yourself. But you haven't eaten anything for a while. You need to find food. You notice a food stall nearby." },
    ],
  },
  try_steal_bread: {
    id: 'try_steal_bread',
    name: 'Try to Steal Bread',
    description: 'You are desperate. Maybe you can grab some bread without being noticed.',
    type: 'click',
    category: 'story',
    timeCostDays: 0,
    locationId: 'slums',
    requirements: [
      { type: 'storyFlag', flag: 'took_amulet', value: true },
      { type: 'storyFlag', flag: 'intro_complete', value: false },
    ],
    effects: [
      { type: 'showMessage', message: 'You were caught and sentenced for 100 days in prison. Maybe this will teach you your place.' },
      { type: 'setStoryFlag', flag: 'intro_complete', value: true },
      { type: 'setStoryFlag', flag: 'in_prison', value: true },
      { type: 'changeLocation', locationId: 'prison' },
    ],
  },
  walk_away: {
    id: 'walk_away',
    name: 'Walk Away',
    description: 'Better not to risk it. You walk away from the food stall.',
    type: 'click',
    category: 'story',
    timeCostDays: 0,
    locationId: 'slums',
    requirements: [
      { type: 'storyFlag', flag: 'took_amulet', value: true },
      { type: 'storyFlag', flag: 'intro_complete', value: false },
    ],
    effects: [
      { type: 'showMessage', message: "I have no other option. I need to beg for money if I want to fill my stomach." },
      { type: 'setStoryFlag', flag: 'intro_complete', value: true },
    ],
  },

  // Travel actions
  travel_to_fields: {
    id: 'travel_to_fields',
    name: 'Travel to the Fields',
    description: 'Leave the slums and head for the farmlands.',
    type: 'click',
    category: 'action',
    timeCostDays: 3,
    locationId: 'slums',
    requirements: [
      { type: 'storyFlag', flag: 'intro_complete', value: true },
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
    category: 'action',
    timeCostDays: 5,
    locationId: 'fields',
    requirements: [
      { type: 'storyFlag', flag: 'intro_complete', value: true },
      { type: 'job', jobId: 'farmer', level: 5 },
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
    category: 'action',
    timeCostDays: 3,
    locationId: 'fields',
    requirements: [
      { type: 'storyFlag', flag: 'intro_complete', value: true },
    ],
    effects: [
      { type: 'changeLocation', locationId: 'slums' },
    ],
  },
  travel_to_slums_from_village: {
    id: 'travel_to_slums_from_village',
    name: 'Return to the Slums',
    description: 'Go back to the slums.',
    type: 'click',
    category: 'action',
    timeCostDays: 4,
    locationId: 'village',
    requirements: [
      { type: 'storyFlag', flag: 'intro_complete', value: true },
    ],
    effects: [
      { type: 'changeLocation', locationId: 'slums' },
    ],
  },
  travel_to_fields_from_village: {
    id: 'travel_to_fields_from_village',
    name: 'Travel to the Fields',
    description: 'Head out to the farmlands.',
    type: 'click',
    category: 'action',
    timeCostDays: 5,
    locationId: 'village',
    requirements: [
      { type: 'storyFlag', flag: 'intro_complete', value: true },
    ],
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
    category: 'story',
    timeCostDays: 0,
    locationId: 'death_gate',
    requirements: [
      { type: 'storyFlag', flag: 'amulet_glowing', value: true },
    ],
    effects: [
      { type: 'triggerReincarnation' },
    ],
  },

  // Story: Join the Army (village)
  join_army: {
    id: 'join_army',
    name: 'Join the Army',
    description: 'Enlist in the royal army. Requires youth and strength.',
    type: 'click',
    category: 'story',
    timeCostDays: 0,
    locationId: 'village',
    requirements: [
      { type: 'storyFlag', flag: 'intro_complete', value: true },
      { type: 'skill', skillId: 'strength', level: 50 },
      { type: 'age', maxAge: 24 },
    ],
    effects: [
      { type: 'showMessage', message: "You're in the army now. Report to the barracks for duty." },
      { type: 'joinClan', clanId: 'army' },
    ],
  },

  // Travel: Village to Barracks
  travel_to_barracks: {
    id: 'travel_to_barracks',
    name: 'Travel to the Barracks',
    description: 'March to the military barracks.',
    type: 'click',
    category: 'action',
    timeCostDays: 2,
    locationId: 'village',
    requirements: [
      { type: 'storyFlag', flag: 'intro_complete', value: true },
      { type: 'clan', clanId: 'army' },
    ],
    effects: [
      { type: 'changeLocation', locationId: 'barracks' },
    ],
  },

  // Travel: Barracks to Village
  travel_to_village_from_barracks: {
    id: 'travel_to_village_from_barracks',
    name: 'Return to the Village',
    description: 'Head back to the village.',
    type: 'click',
    category: 'action',
    timeCostDays: 2,
    locationId: 'barracks',
    requirements: [
      { type: 'storyFlag', flag: 'intro_complete', value: true },
    ],
    effects: [
      { type: 'changeLocation', locationId: 'village' },
    ],
  },

  // Story: Prison bandit recruitment - lift stone
  bandit_lift_stone: {
    id: 'bandit_lift_stone',
    name: 'Lift the Loose Stone',
    description: 'A fellow prisoner whispers about a loose stone in the wall. Are you strong enough?',
    type: 'click',
    category: 'story',
    timeCostDays: 0,
    locationId: 'prison',
    requirements: [
      { type: 'storyFlag', flag: 'intro_complete', value: true },
      { type: 'skill', skillId: 'strength', level: 8 },
    ],
    effects: [
      { type: 'showMessage', message: "You pry the stone free and crawl through the tunnel. A group of bandits greets you on the other side. 'Welcome to the family,' their leader grins." },
      { type: 'joinClan', clanId: 'bandits' },
      { type: 'clearPendingRelocation' },
      { type: 'changeLocation', locationId: 'slums' },
    ],
  },

  // Story: Prison - give up waiting
  bandit_give_up: {
    id: 'bandit_give_up',
    name: 'Serve Your Time',
    description: "Wait patiently for release. You're not strong enough for other options.",
    type: 'click',
    category: 'story',
    timeCostDays: 0,
    locationId: 'prison',
    requirements: [
      { type: 'storyFlag', flag: 'intro_complete', value: true },
    ],
    effects: [
      { type: 'showMessage', message: "You resign yourself to waiting. The days blur together..." },
      { type: 'clearPendingRelocation' },
      { type: 'changeLocation', locationId: 'slums' },
    ],
  },

  // Travel: Slums to Bandit Hideout
  travel_to_bandit_hideout: {
    id: 'travel_to_bandit_hideout',
    name: 'Sneak to the Hideout',
    description: 'Follow the hidden trail to the bandit hideout.',
    type: 'click',
    category: 'action',
    timeCostDays: 3,
    locationId: 'slums',
    requirements: [
      { type: 'storyFlag', flag: 'intro_complete', value: true },
      { type: 'clan', clanId: 'bandits' },
    ],
    effects: [
      { type: 'changeLocation', locationId: 'bandit_hideout' },
    ],
  },

  // Travel: Bandit Hideout to Slums
  travel_to_slums_from_hideout: {
    id: 'travel_to_slums_from_hideout',
    name: 'Return to the Slums',
    description: 'Sneak back to the slums.',
    type: 'click',
    category: 'action',
    timeCostDays: 3,
    locationId: 'bandit_hideout',
    requirements: [
      { type: 'storyFlag', flag: 'intro_complete', value: true },
    ],
    effects: [
      { type: 'changeLocation', locationId: 'slums' },
    ],
  },
};
