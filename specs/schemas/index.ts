// Schemas barrel export - single source of truth for all game types

export {
  SkillSchema,
  SkillTypeSchema,
  SkillStateSchema,
  SkillReincarnationBonusSchema,
  type Skill,
  type SkillType,
  type SkillState,
  type SkillReincarnationBonus,
} from './skill.schema';

export {
  JobSchema,
  JobRequirementsSchema,
  SkillRequirementSchema,
  JobRequirementSchema,
  JobStateSchema,
  JobReincarnationBonusSchema,
  type Job,
  type JobRequirements,
  type SkillRequirement,
  type JobRequirement,
  type JobState,
  type JobReincarnationBonus,
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
  ReincarnationStateSchema,
  type GameState,
  type TimeState,
  type PlayerState,
  type ReincarnationState,
} from './game-state.schema';

export {
  HousingOptionSchema,
  type HousingOption,
} from './housing.schema';

export {
  FoodOptionSchema,
  type FoodOption,
} from './food.schema';

export {
  ClanSchema,
  type Clan,
} from './clan.schema';

export {
  ClickActionCategorySchema,
  type ClickActionCategory,
} from './action.schema';
