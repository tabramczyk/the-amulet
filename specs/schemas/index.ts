// Schemas barrel export - single source of truth for all game types

export {
  SkillSchema,
  SkillTypeSchema,
  SkillStateSchema,
  SkillPrestigeSchema,
  type Skill,
  type SkillType,
  type SkillState,
  type SkillPrestige,
} from './skill.schema';

export {
  JobSchema,
  JobRequirementsSchema,
  SkillRequirementSchema,
  JobRequirementSchema,
  JobStateSchema,
  JobPrestigeSchema,
  type Job,
  type JobRequirements,
  type SkillRequirement,
  type JobRequirement,
  type JobState,
  type JobPrestige,
} from './job.schema';

export {
  LocationSchema,
  LocationRequirementSchema,
  type Location,
  type LocationRequirement,
} from './location.schema';

export {
  ActionSchema,
  ClickActionSchema,
  ContinuousActionSchema,
  ContinuousActionCategorySchema,
  ActionRequirementSchema,
  ActionEffectSchema,
  TickEffectSchema,
  type Action,
  type ClickAction,
  type ContinuousAction,
  type ContinuousActionCategory,
  type ActionRequirement,
  type ActionEffect,
  type TickEffect,
} from './action.schema';

export {
  GameStateSchema,
  TimeStateSchema,
  PlayerStateSchema,
  PrestigeStateSchema,
  type GameState,
  type TimeState,
  type PlayerState,
  type PrestigeState,
} from './game-state.schema';

export {
  HousingOptionSchema,
  type HousingOption,
} from './housing.schema';

export {
  FoodOptionSchema,
  type FoodOption,
} from './food.schema';
