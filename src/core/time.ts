import type { TimeState } from '../../specs/schemas';

// Constants
export const DAYS_PER_REAL_SECOND = 4.46;
export const TICK_INTERVAL_MS = 1000 / DAYS_PER_REAL_SECOND; // ~224ms
export const MAX_TICKS_PER_FRAME = 10; // Cap to prevent spiral of death
export const DAYS_PER_YEAR = 365;
export const STARTING_AGE = 16;
export const DEATH_THRESHOLD_AGE = 58;

/**
 * Convert real elapsed milliseconds to game day ticks.
 */
export function msToTicks(elapsedMs: number): number {
  return elapsedMs / TICK_INTERVAL_MS;
}

/**
 * Calculate the player's age from current day.
 */
export function calculateAge(currentDay: number): number {
  return STARTING_AGE + Math.floor(currentDay / DAYS_PER_YEAR);
}

/**
 * Process accumulated time: add elapsed ticks to accumulator,
 * return how many whole ticks to process and the new accumulator remainder.
 */
export function accumulateTicks(
  accumulator: number,
  deltaTicks: number,
): { wholeTicks: number; newAccumulator: number } {
  const total = accumulator + deltaTicks;
  const wholeTicks = Math.min(Math.floor(total), MAX_TICKS_PER_FRAME);
  const newAccumulator = total - wholeTicks;
  return { wholeTicks, newAccumulator };
}

/**
 * Advance time state by a number of days (whole ticks).
 * Returns a new TimeState (pure function).
 */
export function advanceTime(time: TimeState, days: number): TimeState {
  const newDay = time.currentDay + days;
  return {
    ...time,
    currentDay: newDay,
    currentAge: calculateAge(newDay),
  };
}

/**
 * Create the initial time state.
 */
export function createInitialTimeState(): TimeState {
  return {
    currentDay: 0,
    currentAge: STARTING_AGE,
    tickAccumulator: 0,
  };
}
