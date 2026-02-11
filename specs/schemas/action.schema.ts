import { z } from 'zod';

// --- Action Requirements ---

export const ActionRequirementSchema = z.discriminatedUnion('type', [
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
    type: z.literal('storyFlag'),
    flag: z.string().min(1),
    value: z.boolean(),
  }),
  z.object({
    type: z.literal('age'),
    minAge: z.number().int().min(16).optional(),
    maxAge: z.number().int().optional(),
  }),
]);

export type ActionRequirement = z.infer<typeof ActionRequirementSchema>;

// --- Action Effects ---

export const ActionEffectSchema = z.discriminatedUnion('type', [
  z.object({ type: z.literal('setStoryFlag'), flag: z.string(), value: z.boolean() }),
  z.object({ type: z.literal('changeLocation'), locationId: z.string() }),
  z.object({ type: z.literal('addMoney'), amount: z.number() }),
  z.object({ type: z.literal('addSkillXp'), skillId: z.string(), amount: z.number() }),
  z.object({ type: z.literal('triggerReincarnation') }),
  z.object({ type: z.literal('showMessage'), message: z.string() }),
]);

export type ActionEffect = z.infer<typeof ActionEffectSchema>;

// --- Tick Effects (for continuous actions) ---

export const TickEffectSchema = z.discriminatedUnion('type', [
  z.object({ type: z.literal('addMoney'), amount: z.number() }),
  z.object({ type: z.literal('addSkillXp'), skillId: z.string(), amount: z.number() }),
  z.object({ type: z.literal('addJobXp'), jobId: z.string(), amount: z.number() }),
]);

export type TickEffect = z.infer<typeof TickEffectSchema>;

// --- Click Action ---

export const ClickActionSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  description: z.string(),
  type: z.literal('click'),
  timeCostDays: z.number().int().min(0),
  locationId: z.string().min(1),
  requirements: z.array(ActionRequirementSchema).default([]),
  effects: z.array(ActionEffectSchema).default([]),
});

export type ClickAction = z.infer<typeof ClickActionSchema>;

// --- Continuous Action Category ---

export const ContinuousActionCategorySchema = z.enum(['job', 'skill']);

export type ContinuousActionCategory = z.infer<typeof ContinuousActionCategorySchema>;

// --- Continuous Action ---

export const ContinuousActionSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  description: z.string(),
  type: z.literal('continuous'),
  category: ContinuousActionCategorySchema,
  locationId: z.string().min(1),
  requirements: z.array(ActionRequirementSchema).default([]),
  effects: z.array(TickEffectSchema),
});

export type ContinuousAction = z.infer<typeof ContinuousActionSchema>;

// --- Union Action ---

export const ActionSchema = z.discriminatedUnion('type', [
  ClickActionSchema,
  ContinuousActionSchema,
]);

export type Action = z.infer<typeof ActionSchema>;
