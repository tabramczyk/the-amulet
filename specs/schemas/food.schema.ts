import { z } from 'zod';

// --- Food Option (content data) ---

export const FoodOptionSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  description: z.string(),
  dailyCost: z.number().min(0),
  xpBonusPercent: z.number().min(0),
});

export type FoodOption = z.infer<typeof FoodOptionSchema>;
