import type {
  ClickAction,
  ContinuousAction,
  ActionRequirement,
  ActionEffect,
  TickEffect,
  SkillState,
  JobState,
} from '../../specs/schemas';
import { CONTINUOUS_ACTIONS, CLICK_ACTIONS } from '../data/actions';

/**
 * Check if a single action requirement is met.
 */
export function isRequirementMet(
  req: ActionRequirement,
  skills: SkillState[],
  jobs: JobState[],
  storyFlags: Record<string, boolean>,
  currentAge: number,
  clanIds: string[] = [],
): boolean {
  switch (req.type) {
    case 'skill': {
      const skill = skills.find((s) => s.skillId === req.skillId);
      return skill !== undefined && skill.level >= req.level;
    }
    case 'job': {
      const job = jobs.find((j) => j.jobId === req.jobId);
      return job !== undefined && job.level >= req.level;
    }
    case 'storyFlag':
      return (storyFlags[req.flag] ?? false) === req.value;
    case 'age': {
      if (req.minAge !== undefined && currentAge < req.minAge) return false;
      if (req.maxAge !== undefined && currentAge > req.maxAge) return false;
      return true;
    }
    case 'clan':
      return clanIds.includes(req.clanId);
  }
}

/**
 * Check if all requirements for an action are met.
 */
export function areActionRequirementsMet(
  requirements: ActionRequirement[],
  skills: SkillState[],
  jobs: JobState[],
  storyFlags: Record<string, boolean>,
  currentAge: number,
  clanIds: string[] = [],
): boolean {
  return requirements.every((req) =>
    isRequirementMet(req, skills, jobs, storyFlags, currentAge, clanIds),
  );
}

/**
 * Get available click actions for the current location, filtered by requirements.
 */
export function getAvailableClickActions(
  currentLocationId: string,
  skills: SkillState[],
  jobs: JobState[],
  storyFlags: Record<string, boolean>,
  currentAge: number,
  clanIds: string[] = [],
): ClickAction[] {
  return Object.values(CLICK_ACTIONS).filter(
    (action) =>
      action.locationId === currentLocationId &&
      areActionRequirementsMet(action.requirements, skills, jobs, storyFlags, currentAge, clanIds),
  );
}

/**
 * Get available continuous actions for the current location, filtered by requirements.
 */
export function getAvailableContinuousActions(
  currentLocationId: string,
  skills: SkillState[],
  jobs: JobState[],
  storyFlags: Record<string, boolean>,
  currentAge: number,
  clanIds: string[] = [],
): ContinuousAction[] {
  return Object.values(CONTINUOUS_ACTIONS).filter(
    (action) =>
      action.locationId === currentLocationId &&
      areActionRequirementsMet(action.requirements, skills, jobs, storyFlags, currentAge, clanIds),
  );
}

/**
 * Get a continuous action by ID.
 */
export function getContinuousAction(actionId: string): ContinuousAction | undefined {
  return CONTINUOUS_ACTIONS[actionId];
}

/**
 * Get a click action by ID.
 */
export function getClickAction(actionId: string): ClickAction | undefined {
  return CLICK_ACTIONS[actionId];
}

/**
 * Get tick effects for the currently active continuous action.
 * Returns empty array if no action is active.
 */
export function getActiveTickEffects(
  actionId: string | null,
): TickEffect[] {
  if (!actionId) return [];
  const action = CONTINUOUS_ACTIONS[actionId];
  if (!action) return [];
  return action.effects;
}

/**
 * Get the effects of a click action.
 */
export function getClickActionEffects(actionId: string): ActionEffect[] {
  const action = CLICK_ACTIONS[actionId];
  if (!action) return [];
  return action.effects;
}

/**
 * Get the jobId associated with a continuous action's addJobXp effect.
 * Returns null if no action or no addJobXp effect found.
 */
export function getJobIdFromAction(actionId: string | null): string | null {
  if (!actionId) return null;
  const action = CONTINUOUS_ACTIONS[actionId];
  if (!action) return null;
  const jobEffect = action.effects.find((e) => e.type === 'addJobXp');
  if (!jobEffect || jobEffect.type !== 'addJobXp') return null;
  return jobEffect.jobId;
}
