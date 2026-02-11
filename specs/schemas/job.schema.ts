import { z } from 'zod';

// --- Job Requirement ---

export const SkillRequirementSchema = z.object({
  skillId: z.string().min(1),
  level: z.number().int().min(0),
});

export const JobRequirementSchema = z.object({
  jobId: z.string().min(1),
  level: z.number().int().min(0),
});

export const JobRequirementsSchema = z.object({
  skills: z.array(SkillRequirementSchema).default([]),
  jobs: z.array(JobRequirementSchema).default([]),
});

// --- Job Definition (content data) ---

export const JobSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  description: z.string(),
  locationId: z.string().min(1),
  requirements: JobRequirementsSchema,
  xpPerTick: z.number().positive(),
  moneyPerTick: z.number().min(0),
});

export type Job = z.infer<typeof JobSchema>;
export type JobRequirements = z.infer<typeof JobRequirementsSchema>;
export type SkillRequirement = z.infer<typeof SkillRequirementSchema>;
export type JobRequirement = z.infer<typeof JobRequirementSchema>;

// --- Job Runtime State ---

export const JobStateSchema = z.object({
  jobId: z.string().min(1),
  level: z.number().int().min(0),
  xp: z.number().min(0),
  xpToNextLevel: z.number().positive(),
});

export type JobState = z.infer<typeof JobStateSchema>;

// --- Job Prestige Data ---

export const JobPrestigeSchema = z.object({
  jobId: z.string().min(1),
  totalLevelsAllLives: z.number().int().min(0),
});

export type JobPrestige = z.infer<typeof JobPrestigeSchema>;
