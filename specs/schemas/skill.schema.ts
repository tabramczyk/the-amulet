import { z } from 'zod';

// --- Skill Definition (content data) ---

export const SkillTypeSchema = z.enum(['meta', 'attribute']);

export const SkillSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  type: SkillTypeSchema,
  description: z.string(),
  softCap: z.number().int().positive(),
  xpPerTick: z.number().positive(),
});

export type Skill = z.infer<typeof SkillSchema>;
export type SkillType = z.infer<typeof SkillTypeSchema>;

// --- Skill Runtime State ---

export const SkillStateSchema = z.object({
  skillId: z.string().min(1),
  level: z.number().int().min(0),
  xp: z.number().min(0),
  xpToNextLevel: z.number().positive(),
});

export type SkillState = z.infer<typeof SkillStateSchema>;

// --- Skill Reincarnation Bonus Data ---

export const SkillReincarnationBonusSchema = z.object({
  skillId: z.string().min(1),
  totalLevelsAllLives: z.number().int().min(0),
});

export type SkillReincarnationBonus = z.infer<typeof SkillReincarnationBonusSchema>;
