import { z } from 'zod';
import { SkillStateSchema, SkillReincarnationBonusSchema } from './skill.schema';
import { JobStateSchema, JobReincarnationBonusSchema } from './job.schema';

// --- Time State ---

export const TimeStateSchema = z.object({
  currentDay: z.number().int().min(0),
  currentAge: z.number().int().min(16),
  tickAccumulator: z.number().min(0),
});

export type TimeState = z.infer<typeof TimeStateSchema>;

// --- Player State ---

export const PlayerStateSchema = z.object({
  money: z.number().min(0),
  currentLocationId: z.string().min(1),
  activeJobId: z.string().nullable(),
  activeJobActionId: z.string().nullable(),
  activeSkillActionId: z.string().nullable(),
  currentHousingId: z.string().nullable(),
  currentFoodId: z.string().nullable(),
  storyFlags: z.record(z.string(), z.boolean()),
  clanIds: z.array(z.string()).default([]),
  messageLog: z.array(z.string()).default([]),
  pendingRelocation: z.object({
    targetDay: z.number().int().min(0),
    targetLocationId: z.string().min(1),
    message: z.string().optional(),
  }).nullable().default(null),
});

export type PlayerState = z.infer<typeof PlayerStateSchema>;

// --- Reincarnation State ---

export const ReincarnationStateSchema = z.object({
  livesLived: z.number().int().min(0),
  totalDaysAllLives: z.number().int().min(0),
  skillBonuses: z.array(SkillReincarnationBonusSchema),
  jobBonuses: z.array(JobReincarnationBonusSchema),
});

export type ReincarnationState = z.infer<typeof ReincarnationStateSchema>;

// --- Full Game State ---

export const GameStateSchema = z.object({
  version: z.string(),
  time: TimeStateSchema,
  player: PlayerStateSchema,
  skills: z.array(SkillStateSchema),
  jobs: z.array(JobStateSchema),
  reincarnation: ReincarnationStateSchema,
  isRunning: z.boolean(),
  isAlive: z.boolean(),
});

export type GameState = z.infer<typeof GameStateSchema>;
