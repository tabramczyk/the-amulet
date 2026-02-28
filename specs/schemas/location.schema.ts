import { z } from 'zod';
import { ActionEffectSchema } from './action.schema';

// --- Location Requirement ---

export const LocationRequirementSchema = z.discriminatedUnion('type', [
  z.object({
    type: z.literal('skill'),
    skillId: z.string().min(1),
    level: z.number().int().min(0),
  }),
  z.object({
    type: z.literal('job'),
    jobId: z.string().min(1),
    level: z.number().int().min(0),
  }),
  z.object({
    type: z.literal('clan'),
    clanId: z.string().min(1),
  }),
  z.object({
    type: z.literal('jobOneOf'),
    jobs: z.array(z.object({ jobId: z.string().min(1), level: z.number().int().min(0) })).min(1),
  }),
]);

export type LocationRequirement = z.infer<typeof LocationRequirementSchema>;

// --- Location Definition (content data) ---

export const LocationSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  description: z.string(),
  requirements: z.array(LocationRequirementSchema).default([]),
  availableJobIds: z.array(z.string().min(1)),
  availableTrainingSkillIds: z.array(z.string().min(1)),
  entryEffects: z.array(ActionEffectSchema).default([]),
});

export type Location = z.infer<typeof LocationSchema>;
