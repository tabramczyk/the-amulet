import type {
  SkillState,
  JobState,
  SkillReincarnationBonus,
  JobReincarnationBonus,
  ReincarnationState,
} from '../../specs/schemas';

const REINCARNATION_BONUS_PER_LEVEL = 0.01;

/**
 * Calculate reincarnation bonus multiplier: 1 + (totalLevelsAllLives * 0.01)
 */
export function calculateReincarnationBonus(totalLevelsAllLives: number): number {
  return 1 + totalLevelsAllLives * REINCARNATION_BONUS_PER_LEVEL;
}

/**
 * Get the reincarnation bonus for a specific skill.
 */
export function getSkillReincarnationBonus(
  skillId: string,
  reincarnation: ReincarnationState,
): number {
  const sp = reincarnation.skillBonuses.find((p) => p.skillId === skillId);
  return calculateReincarnationBonus(sp?.totalLevelsAllLives ?? 0);
}

/**
 * Get the reincarnation bonus for a specific job.
 */
export function getJobReincarnationBonus(
  jobId: string,
  reincarnation: ReincarnationState,
): number {
  const jp = reincarnation.jobBonuses.find((p) => p.jobId === jobId);
  return calculateReincarnationBonus(jp?.totalLevelsAllLives ?? 0);
}

/**
 * Update reincarnation data with current life's skill levels.
 * Returns new skill reincarnation bonus array (pure function).
 */
export function accumulateSkillReincarnation(
  currentSkills: SkillState[],
  currentBonuses: SkillReincarnationBonus[],
): SkillReincarnationBonus[] {
  return currentBonuses.map((sp) => {
    const currentSkill = currentSkills.find((s) => s.skillId === sp.skillId);
    return {
      ...sp,
      totalLevelsAllLives: sp.totalLevelsAllLives + (currentSkill?.level ?? 0),
    };
  });
}

/**
 * Update reincarnation data with current life's job levels.
 * Returns new job reincarnation bonus array (pure function).
 */
export function accumulateJobReincarnation(
  currentJobs: JobState[],
  currentBonuses: JobReincarnationBonus[],
): JobReincarnationBonus[] {
  return currentBonuses.map((jp) => {
    const currentJob = currentJobs.find((j) => j.jobId === jp.jobId);
    return {
      ...jp,
      totalLevelsAllLives: jp.totalLevelsAllLives + (currentJob?.level ?? 0),
    };
  });
}
