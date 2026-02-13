import type { JobState, JobReincarnationBonus, SkillState } from '../../specs/schemas';
import { JOBS } from '../data/jobs';

const BASE_XP_PER_LEVEL = 10;
const REINCARNATION_BONUS_PER_LEVEL = 0.01;

/**
 * Calculate XP required for the next job level.
 */
export function jobXpToNextLevel(currentLevel: number): number {
  return BASE_XP_PER_LEVEL * (currentLevel + 1);
}

/**
 * Calculate the reincarnation bonus multiplier for a job.
 */
export function getJobReincarnationBonus(totalLevelsAllLives: number): number {
  return 1 + totalLevelsAllLives * REINCARNATION_BONUS_PER_LEVEL;
}

/**
 * Check if a job's requirements are met.
 */
export function areJobRequirementsMet(
  jobId: string,
  currentLocationId: string,
  skills: SkillState[],
  jobs: JobState[],
): boolean {
  const job = JOBS[jobId];
  if (!job) return false;

  // Must be in the correct location
  if (job.locationId !== currentLocationId) return false;

  // Check skill requirements
  for (const req of job.requirements.skills) {
    const skill = skills.find((s) => s.skillId === req.skillId);
    if (!skill || skill.level < req.level) return false;
  }

  // Check job requirements
  for (const req of job.requirements.jobs) {
    const jobState = jobs.find((j) => j.jobId === req.jobId);
    if (!jobState || jobState.level < req.level) return false;
  }

  return true;
}

/**
 * Process job XP gain for one tick. Returns updated job state.
 * Pure function - does not mutate input.
 */
export function processJobXpGain(
  job: JobState,
  xpAmount: number,
  reincarnationData: JobReincarnationBonus | undefined,
): JobState {
  const jobDef = JOBS[job.jobId];
  if (!jobDef) return job;

  const totalReincarnationLevels = reincarnationData?.totalLevelsAllLives ?? 0;
  const reincarnationBonus = getJobReincarnationBonus(totalReincarnationLevels);
  const effectiveXp = xpAmount * reincarnationBonus;

  let newXp = job.xp + effectiveXp;
  let newLevel = job.level;
  let newXpToNext = job.xpToNextLevel;

  // Level up loop
  while (newXp >= newXpToNext) {
    newXp -= newXpToNext;
    newLevel += 1;
    newXpToNext = jobXpToNextLevel(newLevel);
  }

  return {
    jobId: job.jobId,
    level: newLevel,
    xp: newXp,
    xpToNextLevel: newXpToNext,
  };
}
