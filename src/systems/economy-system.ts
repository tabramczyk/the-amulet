import { HOUSING_OPTIONS } from '../data/housing';
import { FOOD_OPTIONS } from '../data/food';
import { CONTINUOUS_ACTIONS } from '../data/actions';

/**
 * Get the daily cost of housing. Returns 0 if no housing selected.
 */
export function getHousingDailyCost(housingId: string | null): number {
  if (!housingId) return 0;
  return HOUSING_OPTIONS[housingId]?.dailyCost ?? 0;
}

/**
 * Get the daily cost of food. Returns 0 if no food selected.
 */
export function getFoodDailyCost(foodId: string | null): number {
  if (!foodId) return 0;
  return FOOD_OPTIONS[foodId]?.dailyCost ?? 0;
}

/**
 * Get total daily expenses (housing + food).
 */
export function getDailyExpenses(housingId: string | null, foodId: string | null): number {
  return getHousingDailyCost(housingId) + getFoodDailyCost(foodId);
}

/**
 * Get daily earnings from active continuous actions' addMoney effects.
 * Sums earnings from both job and skill action slots.
 */
export function getDailyEarnings(
  activeJobActionId: string | null,
  activeSkillActionId: string | null,
): number {
  let total = 0;
  for (const actionId of [activeJobActionId, activeSkillActionId]) {
    if (!actionId) continue;
    const action = CONTINUOUS_ACTIONS[actionId];
    if (!action) continue;
    total += action.effects
      .filter((e) => e.type === 'addMoney')
      .reduce((sum, e) => sum + e.amount, 0);
  }
  return total;
}

/**
 * Get the lifestyle XP multiplier from housing + food bonuses.
 * Returns a multiplier (e.g. 1.13 for +5% housing and +8% food).
 */
export function getLifestyleXpMultiplier(
  housingId: string | null,
  foodId: string | null,
): number {
  const housingBonus = housingId
    ? (HOUSING_OPTIONS[housingId]?.xpBonusPercent ?? 0)
    : 0;
  const foodBonus = foodId
    ? (FOOD_OPTIONS[foodId]?.xpBonusPercent ?? 0)
    : 0;
  return 1 + (housingBonus + foodBonus) / 100;
}

/**
 * Get net daily income (earnings - expenses).
 */
export function getNetDailyIncome(
  activeJobActionId: string | null,
  activeSkillActionId: string | null,
  housingId: string | null,
  foodId: string | null,
): number {
  return getDailyEarnings(activeJobActionId, activeSkillActionId) - getDailyExpenses(housingId, foodId);
}
