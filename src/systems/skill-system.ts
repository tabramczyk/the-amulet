import type { SkillState, SkillReincarnationBonus } from '../../specs/schemas';
import { SKILLS } from '../data/skills';

const BASE_XP_PER_LEVEL = 10;
const SOFT_CAP_MULTIPLIER = 0.1;
const CONCENTRATION_BONUS_PER_LEVEL = 0.01;
const REINCARNATION_BONUS_PER_LEVEL = 0.01;

/**
 * Calculate XP required for the next level.
 */
export function xpToNextLevel(currentLevel: number): number {
  return BASE_XP_PER_LEVEL * (currentLevel + 1);
}

/**
 * Calculate the concentration bonus multiplier.
 * Concentration gives +1% XP gain per level to all skills.
 */
export function getConcentrationBonus(concentrationLevel: number): number {
  return 1 + concentrationLevel * CONCENTRATION_BONUS_PER_LEVEL;
}

/**
 * Calculate the reincarnation bonus multiplier for a skill.
 */
export function getReincarnationBonus(totalLevelsAllLives: number): number {
  return 1 + totalLevelsAllLives * REINCARNATION_BONUS_PER_LEVEL;
}

/**
 * Calculate effective XP gain for a skill, applying concentration, reincarnation bonus, and soft cap.
 */
export function calculateEffectiveXp(
  baseXp: number,
  currentLevel: number,
  softCap: number,
  concentrationLevel: number,
  totalReincarnationLevels: number,
): number {
  let effective = baseXp;
  effective *= getConcentrationBonus(concentrationLevel);
  effective *= getReincarnationBonus(totalReincarnationLevels);
  if (currentLevel >= softCap) {
    effective *= SOFT_CAP_MULTIPLIER;
  }
  return effective;
}

/**
 * Process skill XP gain for one tick. Returns updated skill state.
 * Pure function - does not mutate input.
 */
export function processSkillXpGain(
  skill: SkillState,
  xpAmount: number,
  concentrationLevel: number,
  reincarnationData: SkillReincarnationBonus | undefined,
): SkillState {
  const skillDef = SKILLS[skill.skillId];
  if (!skillDef) return skill;

  const totalReincarnationLevels = reincarnationData?.totalLevelsAllLives ?? 0;
  const effectiveXp = calculateEffectiveXp(
    xpAmount,
    skill.level,
    skillDef.softCap,
    concentrationLevel,
    totalReincarnationLevels,
  );

  let newXp = skill.xp + effectiveXp;
  let newLevel = skill.level;
  let newXpToNext = skill.xpToNextLevel;

  // Level up loop
  while (newXp >= newXpToNext) {
    newXp -= newXpToNext;
    newLevel += 1;
    newXpToNext = xpToNextLevel(newLevel);
  }

  return {
    skillId: skill.skillId,
    level: newLevel,
    xp: newXp,
    xpToNextLevel: newXpToNext,
  };
}

/**
 * Get the concentration level from skill states array.
 */
export function getConcentrationLevel(skills: SkillState[]): number {
  const concentration = skills.find((s) => s.skillId === 'concentration');
  return concentration?.level ?? 0;
}
