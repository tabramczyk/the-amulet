import { z } from 'zod';
import { SkillStateSchema, SkillPrestigeSchema } from './skill.schema';
import { JobStateSchema, JobPrestigeSchema } from './job.schema';

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
});

export type PlayerState = z.infer<typeof PlayerStateSchema>;

// --- Prestige State ---

export const PrestigeStateSchema = z.object({
  livesLived: z.number().int().min(0),
  totalDaysAllLives: z.number().int().min(0),
  skillPrestige: z.array(SkillPrestigeSchema),
  jobPrestige: z.array(JobPrestigeSchema),
});

export type PrestigeState = z.infer<typeof PrestigeStateSchema>;

// --- Full Game State ---

export const GameStateSchema = z.object({
  version: z.string(),
  time: TimeStateSchema,
  player: PlayerStateSchema,
  skills: z.array(SkillStateSchema),
  jobs: z.array(JobStateSchema),
  prestige: PrestigeStateSchema,
  isRunning: z.boolean(),
  isAlive: z.boolean(),
});

export type GameState = z.infer<typeof GameStateSchema>;
