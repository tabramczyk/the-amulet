import { z } from 'zod';

// --- Housing Option (content data) ---

export const HousingOptionSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  description: z.string(),
  locationId: z.string().min(1),
  dailyCost: z.number().min(0),
  xpBonusPercent: z.number().min(0),
});

export type HousingOption = z.infer<typeof HousingOptionSchema>;
