import { msToTicks, accumulateTicks } from './time';

export type TickCallback = (ticks: number) => void;

interface GameLoopState {
  running: boolean;
  lastTimestamp: number | null;
  rafId: number | null;
  onTick: TickCallback | null;
  tickAccumulator: number;
}

const loopState: GameLoopState = {
  running: false,
  lastTimestamp: null,
  rafId: null,
  onTick: null,
  tickAccumulator: 0,
};

function frame(timestamp: number): void {
  if (!loopState.running) return;

  if (loopState.lastTimestamp !== null) {
    const deltaMs = timestamp - loopState.lastTimestamp;
    const deltaTicks = msToTicks(deltaMs);
    const { wholeTicks, newAccumulator } = accumulateTicks(
      loopState.tickAccumulator,
      deltaTicks,
    );
    loopState.tickAccumulator = newAccumulator;

    if (wholeTicks > 0 && loopState.onTick) {
      loopState.onTick(wholeTicks);
    }
  }

  loopState.lastTimestamp = timestamp;
  loopState.rafId = requestAnimationFrame(frame);
}

/**
 * Start the game loop. Calls onTick with the number of whole ticks
 * to process each frame.
 */
export function startGameLoop(onTick: TickCallback): void {
  if (loopState.running) return;
  loopState.running = true;
  loopState.lastTimestamp = null;
  loopState.tickAccumulator = 0;
  loopState.onTick = onTick;
  loopState.rafId = requestAnimationFrame(frame);
}

/**
 * Stop the game loop.
 */
export function stopGameLoop(): void {
  loopState.running = false;
  if (loopState.rafId !== null) {
    cancelAnimationFrame(loopState.rafId);
    loopState.rafId = null;
  }
  loopState.lastTimestamp = null;
  loopState.onTick = null;
}

/**
 * Check if the game loop is currently running.
 */
export function isGameLoopRunning(): boolean {
  return loopState.running;
}

/**
 * Process a single tick outside the loop (for testing / click actions).
 * This directly invokes the callback with the given number of ticks.
 */
export function processTick(onTick: TickCallback, ticks: number): void {
  onTick(ticks);
}
