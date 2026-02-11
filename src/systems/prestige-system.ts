import type {
  SkillState,
  JobState,
  SkillPrestige,
  JobPrestige,
  PrestigeState,
} from '../../specs/schemas';

const PRESTIGE_BONUS_PER_LEVEL = 0.01;

/**
 * Calculate prestige bonus multiplier: 1 + (totalLevelsAllLives * 0.01)
 */
export function calculatePrestigeBonus(totalLevelsAllLives: number): number {
  return 1 + totalLevelsAllLives * PRESTIGE_BONUS_PER_LEVEL;
}

/**
 * Get the prestige bonus for a specific skill.
 */
export function getSkillPrestigeBonus(
  skillId: string,
  prestige: PrestigeState,
): number {
  const sp = prestige.skillPrestige.find((p) => p.skillId === skillId);
  return calculatePrestigeBonus(sp?.totalLevelsAllLives ?? 0);
}

/**
 * Get the prestige bonus for a specific job.
 */
export function getJobPrestigeBonus(
  jobId: string,
  prestige: PrestigeState,
): number {
  const jp = prestige.jobPrestige.find((p) => p.jobId === jobId);
  return calculatePrestigeBonus(jp?.totalLevelsAllLives ?? 0);
}

/**
 * Update prestige data with current life's skill levels.
 * Returns new skill prestige array (pure function).
 */
export function accumulateSkillPrestige(
  currentSkills: SkillState[],
  currentPrestige: SkillPrestige[],
): SkillPrestige[] {
  return currentPrestige.map((sp) => {
    const currentSkill = currentSkills.find((s) => s.skillId === sp.skillId);
    return {
      ...sp,
      totalLevelsAllLives: sp.totalLevelsAllLives + (currentSkill?.level ?? 0),
    };
  });
}

/**
 * Update prestige data with current life's job levels.
 * Returns new job prestige array (pure function).
 */
export function accumulateJobPrestige(
  currentJobs: JobState[],
  currentPrestige: JobPrestige[],
): JobPrestige[] {
  return currentPrestige.map((jp) => {
    const currentJob = currentJobs.find((j) => j.jobId === jp.jobId);
    return {
      ...jp,
      totalLevelsAllLives: jp.totalLevelsAllLives + (currentJob?.level ?? 0),
    };
  });
}
