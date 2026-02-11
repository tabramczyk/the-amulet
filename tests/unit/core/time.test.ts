import { describe, it, expect } from 'vitest';
import {
  DAYS_PER_REAL_SECOND,
  TICK_INTERVAL_MS,
  MAX_TICKS_PER_FRAME,
  STARTING_AGE,
  DAYS_PER_YEAR,
  msToTicks,
  calculateAge,
  accumulateTicks,
  advanceTime,
  createInitialTimeState,
} from '../../../src/core/time';

describe('Time Constants', () => {
  it('should have ~4.46 days per real second', () => {
    expect(DAYS_PER_REAL_SECOND).toBeCloseTo(4.46, 2);
  });

  it('should have ~224ms tick interval', () => {
    expect(TICK_INTERVAL_MS).toBeCloseTo(224.2, 0);
  });

  it('should cap ticks per frame at 10', () => {
    expect(MAX_TICKS_PER_FRAME).toBe(10);
  });
});

describe('msToTicks', () => {
  it('should convert 1 second to ~4.46 ticks', () => {
    const ticks = msToTicks(1000);
    expect(ticks).toBeCloseTo(DAYS_PER_REAL_SECOND, 2);
  });

  it('should return 0 for 0ms', () => {
    expect(msToTicks(0)).toBe(0);
  });

  it('should return ~1 tick for one tick interval', () => {
    const ticks = msToTicks(TICK_INTERVAL_MS);
    expect(ticks).toBeCloseTo(1, 5);
  });

  it('should handle fractional results', () => {
    const ticks = msToTicks(100);
    expect(ticks).toBeGreaterThan(0);
    expect(ticks).toBeLessThan(1);
  });
});

describe('calculateAge', () => {
  it('should return starting age at day 0', () => {
    expect(calculateAge(0)).toBe(STARTING_AGE);
  });

  it('should return starting age + 1 after 365 days', () => {
    expect(calculateAge(365)).toBe(STARTING_AGE + 1);
  });

  it('should return starting age for day 364', () => {
    expect(calculateAge(364)).toBe(STARTING_AGE);
  });

  it('should return age 60 after 44 years', () => {
    expect(calculateAge(44 * DAYS_PER_YEAR)).toBe(60);
  });
});

describe('accumulateTicks', () => {
  it('should accumulate fractional ticks without producing whole ticks', () => {
    const result = accumulateTicks(0, 0.5);
    expect(result.wholeTicks).toBe(0);
    expect(result.newAccumulator).toBeCloseTo(0.5, 5);
  });

  it('should produce whole ticks when accumulator crosses threshold', () => {
    const result = accumulateTicks(0.7, 0.5);
    expect(result.wholeTicks).toBe(1);
    expect(result.newAccumulator).toBeCloseTo(0.2, 5);
  });

  it('should produce multiple whole ticks', () => {
    const result = accumulateTicks(0, 3.7);
    expect(result.wholeTicks).toBe(3);
    expect(result.newAccumulator).toBeCloseTo(0.7, 5);
  });

  it('should cap ticks at MAX_TICKS_PER_FRAME', () => {
    const result = accumulateTicks(0, 25);
    expect(result.wholeTicks).toBe(MAX_TICKS_PER_FRAME);
    // Remainder should be the leftover
    expect(result.newAccumulator).toBe(25 - MAX_TICKS_PER_FRAME);
  });

  it('should return 0 whole ticks for 0 delta', () => {
    const result = accumulateTicks(0, 0);
    expect(result.wholeTicks).toBe(0);
    expect(result.newAccumulator).toBe(0);
  });
});

describe('advanceTime', () => {
  it('should advance currentDay by the given number of days', () => {
    const initial = createInitialTimeState();
    const result = advanceTime(initial, 5);
    expect(result.currentDay).toBe(5);
  });

  it('should update currentAge when crossing year boundary', () => {
    const initial = createInitialTimeState();
    const result = advanceTime(initial, 365);
    expect(result.currentAge).toBe(STARTING_AGE + 1);
  });

  it('should not change age within the same year', () => {
    const initial = createInitialTimeState();
    const result = advanceTime(initial, 100);
    expect(result.currentAge).toBe(STARTING_AGE);
  });

  it('should preserve tickAccumulator', () => {
    const state = { currentDay: 0, currentAge: STARTING_AGE, tickAccumulator: 0.5 };
    const result = advanceTime(state, 1);
    expect(result.tickAccumulator).toBe(0.5);
  });

  it('should not mutate the original state', () => {
    const initial = createInitialTimeState();
    advanceTime(initial, 10);
    expect(initial.currentDay).toBe(0);
  });
});

describe('createInitialTimeState', () => {
  it('should start at day 0', () => {
    const state = createInitialTimeState();
    expect(state.currentDay).toBe(0);
  });

  it('should start at starting age', () => {
    const state = createInitialTimeState();
    expect(state.currentAge).toBe(STARTING_AGE);
  });

  it('should start with 0 tick accumulator', () => {
    const state = createInitialTimeState();
    expect(state.tickAccumulator).toBe(0);
  });
});
