import type { SkillState, JobState } from '../../specs/schemas';
import { LOCATIONS } from '../data/locations';

/**
 * Check if a location's requirements are met.
 */
export function areLocationRequirementsMet(
  locationId: string,
  skills: SkillState[],
  jobs: JobState[],
): boolean {
  const location = LOCATIONS[locationId];
  if (!location) return false;

  // No requirements = always accessible
  if (location.requirements.length === 0) return true;

  // ALL requirements must be met
  for (const req of location.requirements) {
    if (req.type === 'skill') {
      const skill = skills.find((s) => s.skillId === req.skillId);
      if (!skill || skill.level < req.level) return false;
    } else if (req.type === 'job') {
      const job = jobs.find((j) => j.jobId === req.jobId);
      if (!job || job.level < req.level) return false;
    }
  }

  return true;
}

/**
 * Get available job IDs for a location.
 */
export function getAvailableJobIds(locationId: string): string[] {
  const location = LOCATIONS[locationId];
  if (!location) return [];
  return location.availableJobIds;
}

/**
 * Get available training skill IDs for a location.
 */
export function getAvailableTrainingSkillIds(locationId: string): string[] {
  const location = LOCATIONS[locationId];
  if (!location) return [];
  return location.availableTrainingSkillIds;
}
