import { z } from 'zod';

export const ClanSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  description: z.string(),
});

export type Clan = z.infer<typeof ClanSchema>;
