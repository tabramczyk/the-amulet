import type { TriggeredEvent } from '../../specs/schemas';
import { DEATH_THRESHOLD_AGE } from '../core/time';

export const TRIGGERED_EVENTS: TriggeredEvent[] = [
  {
    id: 'prison_meal_theft',
    name: 'Meal Theft',
    description: 'Other prisoners steal your meals after 30 days.',
    conditions: [
      { type: 'location', locationId: 'prison' },
      { type: 'hasPendingRelocation', value: true },
      { type: 'relocationDay', minDay: 30 },
      { type: 'storyFlag', flag: 'prison_meals_stolen', value: false },
    ],
    effects: [
      { type: 'setFoodId', foodId: null },
      { type: 'setStoryFlag', flag: 'prison_meals_stolen', value: true },
      { type: 'showMessage', message: 'The other prisoners have started stealing your meals. You go hungry now.' },
    ],
    blocking: false,
    priority: 0,
  },
  {
    id: 'bandit_proposal',
    name: 'Bandit Proposal',
    description: 'The bandit leader offers you a way out after 100 days in prison.',
    conditions: [
      { type: 'location', locationId: 'prison' },
      { type: 'hasPendingRelocation', value: true },
      { type: 'relocationDay', minDay: 100 },
      { type: 'storyFlag', flag: 'bandit_proposal_shown', value: false },
    ],
    effects: [
      { type: 'setStoryFlag', flag: 'bandit_proposal_active', value: true },
      { type: 'setStoryFlag', flag: 'bandit_proposal_shown', value: true },
      { type: 'showMessage', message: 'The bandit leader approached you: "Hey boy, we need hands for a job with quick profit, if you know what I mean. Lift this stone and you\'re in."' },
    ],
    blocking: true,
    priority: 10,
  },
  {
    id: 'amulet_awakening',
    name: 'Amulet Awakening',
    description: 'The amulet reveals its power at age 30.',
    conditions: [
      { type: 'age', minAge: 30 },
      { type: 'storyFlag', flag: 'amulet_awakening', value: false },
    ],
    effects: [
      { type: 'setStoryFlag', flag: 'amulet_awakening', value: true },
      { type: 'showMessage', message: 'The Amulet begins to glow faintly. You feel a strange power emanating from it... the cold, inevitable touch of death itself. It whispers of rebirth.' },
    ],
    blocking: false,
    priority: 0,
  },
  {
    id: 'death_gate',
    name: 'Death Gate',
    description: 'The player reaches the end of their life and must touch the amulet.',
    conditions: [
      { type: 'age', minAge: DEATH_THRESHOLD_AGE },
    ],
    effects: [
      { type: 'changeLocation', locationId: 'death_gate' },
      { type: 'setStoryFlag', flag: 'amulet_glowing', value: true },
    ],
    blocking: true,
    priority: 100,
  },
];
