import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  startGameLoop,
  stopGameLoop,
  isGameLoopRunning,
  processTick,
} from '../../../src/core/game-loop';

// Mock requestAnimationFrame and cancelAnimationFrame
beforeEach(() => {
  vi.stubGlobal('requestAnimationFrame', vi.fn((_cb: FrameRequestCallback) => {
    return 1;
  }));
  vi.stubGlobal('cancelAnimationFrame', vi.fn());
});

afterEach(() => {
  stopGameLoop();
  vi.unstubAllGlobals();
});

describe('startGameLoop', () => {
  it('should start the loop', () => {
    const onTick = vi.fn();
    startGameLoop(onTick);
    expect(isGameLoopRunning()).toBe(true);
    expect(requestAnimationFrame).toHaveBeenCalled();
  });

  it('should not start twice if already running', () => {
    const onTick = vi.fn();
    startGameLoop(onTick);
    startGameLoop(onTick);
    expect(requestAnimationFrame).toHaveBeenCalledTimes(1);
  });
});

describe('stopGameLoop', () => {
  it('should stop the loop', () => {
    const onTick = vi.fn();
    startGameLoop(onTick);
    stopGameLoop();
    expect(isGameLoopRunning()).toBe(false);
    expect(cancelAnimationFrame).toHaveBeenCalled();
  });

  it('should be safe to call when not running', () => {
    expect(() => stopGameLoop()).not.toThrow();
  });
});

describe('isGameLoopRunning', () => {
  it('should return false initially', () => {
    expect(isGameLoopRunning()).toBe(false);
  });

  it('should return true after start', () => {
    startGameLoop(vi.fn());
    expect(isGameLoopRunning()).toBe(true);
  });

  it('should return false after stop', () => {
    startGameLoop(vi.fn());
    stopGameLoop();
    expect(isGameLoopRunning()).toBe(false);
  });
});

describe('processTick', () => {
  it('should call onTick with the given number of ticks', () => {
    const onTick = vi.fn();
    processTick(onTick, 3);
    expect(onTick).toHaveBeenCalledWith(3);
  });

  it('should call onTick with 1 tick', () => {
    const onTick = vi.fn();
    processTick(onTick, 1);
    expect(onTick).toHaveBeenCalledWith(1);
  });
});
