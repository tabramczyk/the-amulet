import { z } from 'zod';
import { ActionRequirementSchema } from './action.schema';
import { ActionEffectSchema } from './action.schema';

export const TriggeredEventSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  description: z.string(),
  conditions: z.array(ActionRequirementSchema).min(1),
  effects: z.array(ActionEffectSchema).min(1),
  blocking: z.boolean().default(false),
  priority: z.number().int().default(0),
});

export type TriggeredEvent = z.infer<typeof TriggeredEventSchema>;
